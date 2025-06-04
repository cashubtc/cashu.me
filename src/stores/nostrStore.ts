import { defineStore } from 'pinia';
import {
  nip19,
  generateSecretKey,
  getPublicKey,
  finalizeEvent,
  nip04,
  Event as NostrToolsEvent,
  Relay as NostrToolsRelay,
  Subscription as NostrToolsSubscription,
  relayInit
} from 'nostr-tools';
import { NostrRelay, SignerInfo, NostrEvent } from './types';
import { useDmChatsStore } from './dmChatsStore';

// Helper to convert Uint8Array to hex
const toHex = (bytes: Uint8Array): string => Buffer.from(bytes).toString('hex');
// Helper to convert hex to Uint8Array
const fromHex = (hexString: string): Uint8Array => Buffer.from(hexString, 'hex');

export const useNostrStore = defineStore('nostr', {
  state: () => ({
    sk: null as Uint8Array | null,
    pk: null as string | null, // hex format
    nsec: '' as string,
    npub: '' as string,
    isSignerMode: false,
    signerInfo: {} as SignerInfo,
    relays: [] as NostrRelay[],
    // displayedEventIds: new Set<string>(), // To prevent processing duplicate events if handled here
  }),

  getters: {
    isAuthenticated: (state) => !!state.pk,
    canSignLocally: (state) => !!state.sk && !state.isSignerMode,
    connectedRelays: (state) => state.relays.filter(r => r.status === 'connected'),
    globalRelayStatusText(state): string {
      const total = state.relays.length;
      if (total === 0 && !this.areAnyRelaysConnectedOrConnecting) return 'No relays specified';
      const connectedCount = this.connectedRelays.length;
      if (connectedCount === total && total > 0) return `Connected (${connectedCount}/${total} relays)`;
      if (connectedCount > 0 && connectedCount < total) return `Partially Connected (${connectedCount}/${total})`;
      if (connectedCount === 0 && total > 0) return `Disconnected (0/${total} relays)`;
      if (state.relays.some(r => r.status === 'connecting')) return 'Connecting...';
      return 'Disconnected';
    },
    globalRelayStatusType(state): 'none' | 'disconnected' | 'partial' | 'connected' | 'connecting' {
      const total = state.relays.length;
       if (total === 0 && !this.areAnyRelaysConnectedOrConnecting) return 'none';
      const connectedCount = this.connectedRelays.length;
      if (state.relays.some(r => r.status === 'connecting')) return 'connecting';
      if (connectedCount === total && total > 0) return 'connected';
      if (connectedCount > 0 && connectedCount < total) return 'partial';
      return 'disconnected';
    },
    areAnyRelaysConnectedOrConnecting: (state) => state.relays.some(r => r.status === 'connected' || r.status === 'connecting'),
    getRelayUrlsForDisplay: (state) => state.relays.map(r => r.url),
  },

  actions: {
    async generateIdentity() {
      try {
        this.sk = generateSecretKey();
        this.pk = getPublicKey(this.sk); // This is hex with nostr-tools v2+
        this.nsec = nip19.nsecEncode(this.sk);
        this.npub = nip19.npubEncode(this.pk);
        this.isSignerMode = false;
        this.signerInfo = {};
        // console.log('Generated Identity:', { npub: this.npub, nsec: this.nsec });
        // Optionally persist keys securely if your app does this
        await this.disconnectFromRelays(); // Disconnect old relays if identity changes
      } catch (error) {
        console.error('Error generating identity:', error);
        throw error;
      }
    },

    async loadIdentity(identityStr: string) {
      await this.disconnectFromRelays(); // Disconnect relays before changing identity
      this.relays = []; // Clear relay list for new identity
      // this.displayedEventIds.clear();

      try {
        if (identityStr.startsWith('nsec1')) {
          const decoded = nip19.decode(identityStr);
          if (decoded.type === 'nsec') {
            this.sk = decoded.data as Uint8Array;
            this.pk = getPublicKey(this.sk); // hex
            this.nsec = identityStr;
            this.npub = nip19.npubEncode(this.pk);
            this.isSignerMode = false;
            this.signerInfo = {};
            // console.log('Loaded nsec Identity:', { npub: this.npub });
          } else {
            throw new Error('Invalid nsec format.');
          }
        } else if (identityStr.startsWith('bunker://') || identityStr.startsWith('nostrconnect://')) {
          // Basic NIP-46 URI parsing for POC parity (pubkey extraction only)
          const url = new URL(identityStr);
          const remoteSignerPubkeyHex = url.pathname.startsWith('//') ? url.pathname.substring(2) : url.pathname.substring(1);

          if (!/^[0-9a-fA-F]{64}$/.test(remoteSignerPubkeyHex)) {
            throw new Error('Invalid pubkey in signer URI.');
          }
          // For POC, assume this remoteSignerPubkeyHex is the user's effective pubkey.
          // A full NIP-46 client would call 'get_public_key' on the signer.
          this.pk = remoteSignerPubkeyHex;
          this.npub = nip19.npubEncode(this.pk);
          this.sk = null;
          this.nsec = '';
          this.isSignerMode = true;
          const relaysFromUri = Array.from(url.searchParams.getAll('relay'));
          this.signerInfo = {
            remoteSignerPubkey: remoteSignerPubkeyHex,
            relays: relaysFromUri,
            secret: url.searchParams.get('secret') || undefined,
            canSign: false, // For POC parity, actual signing not implemented here
            canDecrypt: false, // For POC parity
          };
          // console.log('Loaded Signer Mode Identity:', { npub: this.npub, signerInfo: this.signerInfo });
          // Optionally, auto-populate and connect to relays from bunker URI
          if (relaysFromUri.length > 0) {
            // This could auto-trigger connectToRelays or just update the UI input
            // For now, we'll let RelayManager.vue handle the UI update from getRelayUrlsForDisplay
          }
        } else {
          throw new Error('Invalid input. Must be an nsec or bunker:// or nostrconnect:// URI.');
        }
      } catch (error) {
        console.error('Error loading identity:', error);
        this.sk = null; this.pk = null; this.nsec = ''; this.npub = ''; this.isSignerMode = false; this.signerInfo = {};
        throw error;
      }
    },

    async connectToRelays(urls: string[]) {
      if (!this.pk) {
        console.warn('Cannot connect to relays: User public key (pk) is not set.');
        return;
      }
      await this.disconnectFromRelays(); // Disconnect existing before new connections
      // this.displayedEventIds.clear(); // Clear for new subscriptions

      const dmChatsStore = useDmChatsStore(); // Get fresh instance

      this.relays = urls.map(url => ({
        url,
        socket: null,
        status: 'idle',
        subscriptionId: `dm-sub-${this.pk?.substring(0, 6)}-${Math.random().toString(16).substring(2, 8)}`,
        sub: null,
        eoseReceived: false,
      }));

      this.relays.forEach(async (relayConfig) => {
        try {
          const relay = relayInit(relayConfig.url);
          relayConfig.socket = relay.ws; // Access underlying WebSocket for direct status if needed
          relayConfig.status = 'connecting';

          relay.on('connect', () => {
            relayConfig.status = 'connected';
            console.log(`Connected to ${relayConfig.url}`);
            // Subscribe to DMs for our public key (pk)
            // Kind 4 events where our pk is in a 'p' tag
            const filters = [{ kinds: [4], '#p': [this.pk!], since: Math.floor(Date.now() / 1000) - (60 * 60 * 24 * 7) }]; // 7 days back
            // Also subscribe to DMs sent *by* us, to catch echos or messages from other clients
            // This might lead to duplicates if the relay echoes our own sent messages and we also add them optimistically.
            // Consider if `displayedEventIds` is better managed in dmChatsStore or here.
            // filters.push({ kinds: [4], authors: [this.pk!] });

            relayConfig.sub = relay.sub(filters, { id: relayConfig.subscriptionId });

            relayConfig.sub.on('event', (event: NostrToolsEvent) => {
              // console.log(`Event from ${relayConfig.url}:`, event);
              // Basic duplicate check for this session, can be enhanced
              // if (this.displayedEventIds.has(event.id!)) return;
              // this.displayedEventIds.add(event.id!);

              this.handleReceivedNostrEvent(event as NostrEvent, relayConfig);
            });
            relayConfig.sub.on('eose', () => {
              relayConfig.eoseReceived = true;
              console.log(`EOSE received from ${relayConfig.url} for sub ${relayConfig.subscriptionId}`);
            });
          });

          relay.on('disconnect', () => {
            relayConfig.status = 'disconnected';
            console.log(`Disconnected from ${relayConfig.url}`);
            if (relayConfig.sub) {
              // nostr-tools might handle unsubscription on disconnect, but explicit can be good.
              // relayConfig.sub.unsub();
            }
          });

          relay.on('error', (errMessage?: any) => {
            relayConfig.status = 'error';
            relayConfig.error = errMessage?.toString() || 'Unknown relay error';
            console.error(`Error with relay ${relayConfig.url}:`, relayConfig.error);
          });
          
          relay.on('notice', (noticeMsg: string) => {
            relayConfig.notice = noticeMsg;
            console.warn(`Notice from ${relayConfig.url}: ${noticeMsg}`);
            // Optionally notify user via Quasar notify
          });

          await relay.connect();
        } catch (error) {
          console.error(`Failed to initialize or connect to relay ${relayConfig.url}:`, error);
          relayConfig.status = 'error';
          relayConfig.error = (error as Error).message;
        }
      });
    },

    async disconnectFromRelays() {
      // console.log('Disconnecting from relays...');
      this.relays.forEach(relayConfig => {
        if (relayConfig.sub) {
          try {
            relayConfig.sub.unsub();
          } catch (e) { console.warn(`Error unsubscribing from ${relayConfig.url}`, e); }
          relayConfig.sub = undefined;
        }
        if (relayConfig.socket && (relayConfig.socket.readyState === WebSocket.OPEN || relayConfig.socket.readyState === WebSocket.CONNECTING)) {
          try {
            // nostr-tools relay object should handle closing
            const nostrToolsRelay = relayInit(relayConfig.url); // Get a temporary handle to call close
            if (nostrToolsRelay.status === NostrToolsRelay.Status.OPEN || nostrToolsRelay.status === NostrToolsRelay.Status.CONNECTING) {
                 // relayConfig.socket.close(); // This might be too abrupt if nostr-tools relay.close() is better
                 // Using the relay object from nostr-tools to close is preferred
                 const r = this.relays.find(r => r.url === relayConfig.url)?.socket?.['relay']; // Access the relay instance if stored
                 if (r && typeof r.close === 'function') {
                     r.close();
                 } else if (relayConfig.socket) {
                     relayConfig.socket.close(); // Fallback
                 }
            }
          } catch (e) { console.warn(`Error closing socket for ${relayConfig.url}`, e); }
        }
        relayConfig.status = 'disconnected';
      });
      // this.relays = []; // Or mark as disconnected to allow reconnect attempt
    },

    async handleReceivedNostrEvent(event: NostrEvent, relayConfig: NostrRelay) {
      const dmChatsStore = useDmChatsStore();
      if (dmChatsStore.hasProcessedEvent(event.id!)) return;


      if (event.kind === 4 && this.pk) {
        const pTagValue = event.tags.find(tag => tag[0] === 'p')?.[1];
        const isToUs = pTagValue === this.pk;
        const isFromUs = event.pubkey === this.pk;
        let otherPartyPkHex: string | undefined;

        if (isToUs) {
          otherPartyPkHex = event.pubkey;
        } else if (isFromUs && pTagValue) {
          otherPartyPkHex = pTagValue;
        }

        if (!otherPartyPkHex || otherPartyPkHex === this.pk && !isFromUs) { // Avoid self-DMs not originated by us
          // console.log(`Ignoring Kind 4 event ${event.id?.substring(0,8)}: Not a direct DM to/from a distinct party.`);
          return;
        }

        if (this.isSignerMode) {
          // TODO: Implement NIP-46 nip04_decrypt call if full NIP-46 is desired.
          // For POC parity, we cannot decrypt. We could show an encrypted placeholder.
          console.warn(`Signer Mode: Received encrypted DM ${event.id}. Decryption via remote signer not implemented for POC parity.`);
          // dmChatsStore.addEncryptedMessagePlaceholder(event, otherPartyPkHex); // Optional
          dmChatsStore.markEventAsProcessed(event.id!);
          return;
        }

        if (!this.sk) {
          console.error(`Cannot decrypt DM ${event.id}: No private key (sk) available.`);
          dmChatsStore.markEventAsProcessed(event.id!);
          return;
        }

        try {
          const decryptedContent = await nip04.decrypt(this.sk, otherPartyPkHex, event.content);
          dmChatsStore.addReceivedMessage({
            nostrEvent: event,
            decryptedContent: decryptedContent,
            otherPartyPkHex: otherPartyPkHex,
            isEchoOfSent: isFromUs, // helps dmChatsStore decide if it's a new incoming or echo
          });
        } catch (e) {
          console.error(`Failed to decrypt DM (ID: ${event.id?.substring(0,8)}) from ${nip19.npubEncode(otherPartyPkHex).substring(0,12)}...: ${(e as Error).message}. Content: ${event.content.substring(0,30)}...`);
          // Optionally add a placeholder for undecryptable message
           dmChatsStore.addEncryptedMessagePlaceholder(event, otherPartyPkHex, `Error decrypting: ${(e as Error).message}`);
        }
        dmChatsStore.markEventAsProcessed(event.id!);
      }
    },

    async sendDm(payload: { recipientPkHex: string; content: string }): Promise<boolean> {
      const { recipientPkHex, content } = payload;
      if (!this.pk) throw new Error('User identity (pk) not set.');

      if (this.isSignerMode) {
        // TODO: Implement NIP-46 sign_event call if full NIP-46 is desired.
        console.warn('Signer Mode: Sending DMs via remote signer not implemented for POC parity.');
        // For POC parity, this should fail or be disabled in UI.
        throw new Error('Sending DMs in signer mode is not supported in this POC-style implementation.');
      }

      if (!this.sk) throw new Error('Cannot send DM: No private key (sk) available.');

      try {
        const encryptedContent = await nip04.encrypt(this.sk, recipientPkHex, content);
        const unsignedEvent: NostrToolsEvent = {
          kind: 4,
          pubkey: this.pk,
          created_at: Math.floor(Date.now() / 1000),
          tags: [['p', recipientPkHex]],
          content: encryptedContent,
          // id and sig will be added by finalizeEvent
        } as NostrToolsEvent; // Cast to NostrToolsEvent which expects id/sig to be optional before finalization

        const signedEvent = finalizeEvent(unsignedEvent, this.sk);
        // console.log('Sending DM event:', signedEvent);

        let sentToAtLeastOneRelay = false;
        const connectedRelayInstances = this.connectedRelays
          .map(rc => rc.socket && rc.socket.['relay']) // Access the nostr-tools Relay instance
          .filter(Boolean) as NostrToolsRelay[];


        if (connectedRelayInstances.length === 0) {
            console.warn('No connected relays to publish DM to.');
            return false;
        }
        
        // Publish to all connected relays
        const publishPromises = connectedRelayInstances.map(relayInstance => {
            return relayInstance.publish(signedEvent)
                .then(() => {
                    console.log(`DM ${signedEvent.id.substring(0,8)} published to ${relayInstance.url}`);
                    sentToAtLeastOneRelay = true;
                })
                .catch(err => console.error(`Failed to publish DM to ${relayInstance.url}`, err));
        });

        await Promise.all(publishPromises);

        if (sentToAtLeastOneRelay) {
          // The dmChatsStore.addOptimisticSentMessage should be called by the component
          // Or, this action could return the signedEvent for the component to pass to dmChatsStore
          return true;
        }
        return false;

      } catch (error) {
        console.error('Error preparing/sending DM:', error);
        throw error;
      }
    },
  },
});
