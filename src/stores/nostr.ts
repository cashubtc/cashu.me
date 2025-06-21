// src/stores/nostr.ts
import { defineStore } from "pinia";
import NDK, { NDKSigner, NDKNip07Signer, NDKPrivateKeySigner, NDKEvent, NostrEvent } from "@nostr-dev-kit/ndk";
import { useSettingsStore } from "./settings";
import { useLocalStorage } from "@vueuse/core";
import { getPublicKey, nip19 } from "nostr-tools";
import { hexToBytes, bytesToHex } from "@noble/hashes/utils";
import { debug, notifyError } from "src/js/logger";
import { useWalletStore } from "./wallet";
import { useP2PKStore } from "./p2pk";
import { ensureCompressed } from "src/utils/ecash";

export enum SignerType {
  NIP07 = "NIP07",
  PRIVATEKEY = "PRIVATEKEY",
  SEED = "SEED",
}

export const useNostrStore = defineStore("nostr", {
  state: () => ({
    connected: false,
    pubkey: useLocalStorage<string>("cashu.ndk.pubkey", ""),
    relays: useSettingsStore().defaultNostrRelays,
    ndk: undefined as NDK | undefined,
    signerType: useLocalStorage<SignerType>("cashu.ndk.signerType", SignerType.SEED),
    signer: undefined as NDKSigner | undefined,
    initialized: false,
    privateKeySignerPrivateKey: useLocalStorage<string>("cashu.ndk.privateKeySignerPrivateKey", ""),
    seedSignerPrivateKey: useLocalStorage<string>("cashu.ndk.seedSignerPrivateKey", ""),
    seedSignerPublicKey: useLocalStorage<string>("cashu.ndk.seedSignerPublicKey", ""),
  }),
  getters: {
    privKeyHex: (state) => {
      switch (state.signerType) {
        case SignerType.PRIVATEKEY: return state.privateKeySignerPrivateKey;
        case SignerType.SEED: return state.seedSignerPrivateKey;
        default: return "";
      }
    },
  },
  actions: {
    async connect(relays?: string[]) {
      if (relays) this.relays = relays;
      this.disconnect();
      const opts: any = { explicitRelayUrls: this.relays };
      if (this.signer) {
        opts.signer = this.signer;
      }
      this.ndk = new NDK(opts);
      try {
        await this.ndk.connect();
        this.connected = true;
        debug("NDK connected successfully.");
      } catch (error) {
        console.error("Failed to connect NDK:", error);
        this.connected = false;
      }
    },

    disconnect() {
      this.ndk?.pool.relays.forEach(relay => relay.disconnect());
      this.ndk = undefined;
      this.signer = undefined;
      this.connected = false;
    },

    async setSigner(signer: NDKSigner) {
      this.signer = signer;
      await this.connect(); // Re-connect with the new signer.
    },

    async initNip07Signer() {
      try {
        const signer = new NDKNip07Signer();
        await signer.blockUntilReady();
        const user = await signer.user();
        if (user?.npub) {
          this.signerType = SignerType.NIP07;
          this.setPubkey(user.pubkey);
          await this.setSigner(signer);
        } else {
            notifyError("Could not get user from NIP-07 extension.");
        }
      } catch (e) {
        console.error("Failed to init NIP-07 signer:", e);
        notifyError("NIP-07 extension not available or permission denied.");
      }
    },

    async initPrivateKeySigner(nsec?: string) {
      let key = nsec || this.privateKeySignerPrivateKey;
      if (!key) {
        key = prompt("Enter your nsec private key");
      }
      if (!key) return;

      try {
        const privateKeyBytes = key.startsWith('nsec') ? (nip19.decode(key).data as Uint8Array) : hexToBytes(key);
        const privateKeyHex = bytesToHex(privateKeyBytes);
        const signer = new NDKPrivateKeySigner(privateKeyHex);

        this.privateKeySignerPrivateKey = privateKeyHex;
        this.signerType = SignerType.PRIVATEKEY;
        this.setPubkey(getPublicKey(privateKeyBytes));
        await this.setSigner(signer);
      } catch (e) {
        console.error("Failed to init private key signer:", e);
        notifyError("Invalid private key provided.");
      }
    },

    async walletSeedGenerateKeyPair() {
      const walletStore = useWalletStore();
      const sk = walletStore.seed.slice(0, 32);
      this.seedSignerPrivateKey = bytesToHex(sk);
      this.seedSignerPublicKey = getPublicKey(sk);
    },

    async initWalletSeedPrivateKeySigner() {
      await this.walletSeedGenerateKeyPair();
      const signer = new NDKPrivateKeySigner(this.seedSignerPrivateKey);
      this.signerType = SignerType.SEED;
      this.setPubkey(this.seedSignerPublicKey);
      await this.setSigner(signer);
    },

    async initSigner() {
      if (this.initialized) return;
      debug(`Initializing signer with type: ${this.signerType}`);
      if (this.signerType === SignerType.NIP07) await this.initNip07Signer();
      else if (this.signerType === SignerType.PRIVATEKEY) await this.initPrivateKeySigner();
      else await this.initWalletSeedPrivateKeySigner();
      this.initialized = true;
    },

    setPubkey(pubkey: string) {
        debug("Setting pubkey to", pubkey);
        this.pubkey = pubkey;
    },
  },
});
