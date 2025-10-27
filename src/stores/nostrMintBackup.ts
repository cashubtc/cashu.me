import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import { bytesToHex } from "@noble/hashes/utils";
import { sha256 } from "@noble/hashes/sha256";
import { getPublicKey } from "nostr-tools";
import { mnemonicToSeedSync } from "@scure/bip39";
import NDK, {
  NDKEvent,
  NDKFilter,
  NDKPrivateKeySigner,
} from "@nostr-dev-kit/ndk";
import { nip44 } from "nostr-tools";
import { useWalletStore } from "./wallet";
import { useMintsStore } from "./mints";
import { useNostrStore } from "./nostr";
import { notify, notifyError, notifySuccess } from "../js/notify";
import { useSettingsStore } from "./settings";

// NIP kind for mint backup events
const MINT_BACKUP_KIND = 30078;

type MintBackupData = {
  mints: string[];
  timestamp: number;
};

type DiscoveredMint = {
  url: string;
  timestamp: number;
  selected: boolean;
};

export const useNostrMintBackupStore = defineStore("nostrMintBackup", {
  state: () => ({
    // Last backup timestamp
    lastBackupTimestamp: useLocalStorage<number>(
      "cashu.nostrMintBackup.lastBackupTimestamp",
      0
    ),

    // Discovered mints from nostr
    discoveredMints: [] as DiscoveredMint[],

    // Loading states
    backupInProgress: false,
    searchInProgress: false,

    // Derived private key for mint backups
    mintBackupPrivateKey: "",
    mintBackupPublicKey: "",
  }),

  getters: {
    // Get enabled state from settings store
    enabled: (): boolean => {
      const settingsStore = useSettingsStore();
      return settingsStore.nostrMintBackupEnabled;
    },

    // Get the current mint URLs
    currentMintUrls: (): string[] => {
      const mintsStore = useMintsStore();
      return mintsStore.mints.map((mint) => mint.url);
    },

    // Check if backup is needed (mints have changed since last backup)
    needsBackup: (state): boolean => {
      const settingsStore = useSettingsStore();
      if (!settingsStore.nostrMintBackupEnabled) return false;

      const mintsStore = useMintsStore();
      const currentMints = mintsStore.mints.map((mint) => mint.url).sort();

      // If no mints, no backup needed
      if (currentMints.length === 0) return false;

      // If never backed up, need backup
      if (state.lastBackupTimestamp === 0) return true;

      // Check if mints have changed (this is a simple check, you might want to store the last backed up mints)
      return true; // For now, always allow backup
    },

    // Get conversation key for encryption
    conversationKey: (state): Uint8Array | null => {
      if (!state.mintBackupPrivateKey || !state.mintBackupPublicKey)
        return null;
      return nip44.v2.utils.getConversationKey(
        state.mintBackupPrivateKey,
        state.mintBackupPublicKey
      );
    },
  },

  actions: {
    // Initialize backup keys from wallet seed
    async initializeBackupKeys(): Promise<void> {
      const walletStore = useWalletStore();
      // Derive a deterministic private key from wallet seed for mint backup
      const { privateKeyHex, publicKeyHex } =
        await this.initializeBackupKeysFromMnemonic(walletStore.mnemonic);
      this.mintBackupPrivateKey = privateKeyHex;
      this.mintBackupPublicKey = publicKeyHex;
    },

    // Initialize backup keys from custom mnemonic (for restore)
    async initializeBackupKeysFromMnemonic(
      mnemonic: string
    ): Promise<{ privateKeyHex: string; publicKeyHex: string }> {
      // Derive seed from mnemonic
      const seed: Uint8Array = mnemonicToSeedSync(mnemonic);
      const domainSeparator = new TextEncoder().encode("cashu-mint-backup");
      const combinedData = new Uint8Array(seed.length + domainSeparator.length);
      combinedData.set(seed);
      combinedData.set(domainSeparator, seed.length);

      // Use sha256 of combined data as private key
      const privateKeyBytes = sha256(combinedData);
      const privateKeyHex = bytesToHex(privateKeyBytes);
      const publicKeyHex = getPublicKey(privateKeyBytes);

      return { privateKeyHex, publicKeyHex };
    },

    // Create and publish mint backup event
    async backupMintsToNostr(verbose: boolean = false): Promise<void> {
      const settingsStore = useSettingsStore();
      if (!settingsStore.nostrMintBackupEnabled) {
        console.log("Nostr mint backup is disabled");
        return;
      }

      if (this.backupInProgress) {
        console.log("Backup already in progress");
        return;
      }

      this.backupInProgress = true;

      try {
        // Initialize keys if not already done
        if (!this.mintBackupPrivateKey) {
          await this.initializeBackupKeys();
        }

        const settingsStore = useSettingsStore();
        const mintsStore = useMintsStore();

        const currentMints = mintsStore.mints.map((mint) => mint.url);

        if (currentMints.length === 0) {
          console.log("No mints to backup");
          return;
        }

        // Create backup data
        const backupData: MintBackupData = {
          mints: currentMints,
          timestamp: Math.floor(Date.now() / 1000),
        };

        // Encrypt the backup data
        const conversationKey = nip44.v2.utils.getConversationKey(
          this.mintBackupPrivateKey,
          this.mintBackupPublicKey
        );
        const encryptedContent = nip44.v2.encrypt(
          JSON.stringify(backupData),
          conversationKey
        );

        // Create NDK instance
        const ndk = new NDK({
          explicitRelayUrls: settingsStore.defaultNostrRelays,
          signer: new NDKPrivateKeySigner(this.mintBackupPrivateKey),
        });

        await ndk.connect();

        // Create the event
        const event = new NDKEvent(ndk);
        event.kind = MINT_BACKUP_KIND;
        event.content = encryptedContent;
        event.tags = [
          ["d", "mint-list"], // replaceable event identifier
          ["client", "cashu.me"],
        ];
        event.created_at = backupData.timestamp;
        event.pubkey = this.mintBackupPublicKey;

        // Sign and publish
        await event.sign();
        await event.publish();

        this.lastBackupTimestamp = backupData.timestamp;
        if (verbose) {
          notifySuccess("Mint list backed up to Nostr successfully");
        }

        console.log("Mint backup published to Nostr:", event.id);
      } catch (error) {
        console.error("Failed to backup mints to Nostr:", error);
        notifyError(
          "Failed to backup mint list to Nostr: " + (error as Error).message
        );
        throw error;
      } finally {
        this.backupInProgress = false;
      }
    },

    // Search for mint backups on Nostr
    async searchMintsOnNostr(mnemonic: string): Promise<DiscoveredMint[]> {
      this.searchInProgress = true;
      this.discoveredMints = [];

      try {
        const settingsStore = useSettingsStore();

        // Derive keys from provided mnemonic
        const { publicKeyHex } = await this.initializeBackupKeysFromMnemonic(
          mnemonic
        );

        // Create read-only NDK instance
        const ndk = new NDK({
          explicitRelayUrls: settingsStore.defaultNostrRelays,
        });

        await ndk.connect();

        // Search for mint backup events from this pubkey
        const filter: NDKFilter = {
          kinds: [MINT_BACKUP_KIND],
          authors: [publicKeyHex],
          "#d": ["mint-list"],
          limit: 10,
        };

        const events = await ndk.fetchEvents(filter);
        console.log(`Found ${events.size} mint backup events`);

        const allDiscoveredMints: DiscoveredMint[] = [];

        for (const event of events) {
          try {
            // Decrypt event content
            const { privateKeyHex } =
              await this.initializeBackupKeysFromMnemonic(mnemonic);
            const conversationKey = nip44.v2.utils.getConversationKey(
              privateKeyHex,
              publicKeyHex
            );
            const decryptedContent = nip44.v2.decrypt(
              event.content,
              conversationKey
            );

            const backupData: MintBackupData = JSON.parse(decryptedContent);

            // Add discovered mints
            for (const mintUrl of backupData.mints) {
              const existingMint = allDiscoveredMints.find(
                (m) => m.url === mintUrl
              );
              if (!existingMint) {
                allDiscoveredMints.push({
                  url: mintUrl,
                  timestamp: backupData.timestamp,
                  selected: false,
                });
              } else if (backupData.timestamp > existingMint.timestamp) {
                existingMint.timestamp = backupData.timestamp;
              }
            }
          } catch (decryptError) {
            console.error("Failed to decrypt backup event:", decryptError);
          }
        }

        // Sort by timestamp (newest first)
        allDiscoveredMints.sort((a, b) => b.timestamp - a.timestamp);

        this.discoveredMints = allDiscoveredMints;

        if (allDiscoveredMints.length > 0) {
          notify(`Found ${allDiscoveredMints.length} mint(s) in Nostr backups`);
        } else {
          notify("No mint backups found on Nostr for this seed phrase");
        }

        return allDiscoveredMints;
      } catch (error) {
        console.error("Failed to search mints on Nostr:", error);
        notifyError(
          "Failed to search for mint backups: " + (error as Error).message
        );
        throw error;
      } finally {
        this.searchInProgress = false;
      }
    },

    // Add selected mints to the wallet
    async addSelectedMintsToWallet(
      selectedMints: DiscoveredMint[]
    ): Promise<void> {
      const mintsStore = useMintsStore();

      try {
        let addedCount = 0;

        for (const mint of selectedMints) {
          if (!mint.selected) continue;

          try {
            // Check if mint already exists
            const existing = mintsStore.mints.find((m) => m.url === mint.url);
            if (existing) {
              console.log(`Mint ${mint.url} already exists, skipping`);
              continue;
            }

            // Add the mint
            await mintsStore.addMint({ url: mint.url }, false);
            addedCount++;
          } catch (error) {
            console.error(`Failed to add mint ${mint.url}:`, error);
            notifyError(
              `Failed to add mint ${mint.url}: ${(error as Error).message}`
            );
          }
        }

        if (addedCount > 0) {
          notifySuccess(`Added ${addedCount} mint(s) to your wallet`);
        } else {
          notify("No new mints were added");
        }
      } catch (error) {
        console.error("Failed to add selected mints:", error);
        notifyError(
          "Failed to add selected mints: " + (error as Error).message
        );
        throw error;
      }
    },

    // Toggle selection of a discovered mint
    toggleMintSelection(mintUrl: string): void {
      const mint = this.discoveredMints.find((m) => m.url === mintUrl);
      if (mint) {
        mint.selected = !mint.selected;
      }
    },

    // Select all discovered mints
    selectAllMints(): void {
      this.discoveredMints.forEach((mint) => {
        mint.selected = true;
      });
    },

    // Deselect all discovered mints
    deselectAllMints(): void {
      this.discoveredMints.forEach((mint) => {
        mint.selected = false;
      });
    },

    // Enable the backup feature
    async enableBackup(): Promise<void> {
      const settingsStore = useSettingsStore();
      settingsStore.nostrMintBackupEnabled = true;

      // Initialize backup keys
      await this.initializeBackupKeys();

      // Perform initial backup if needed
      if (this.needsBackup) {
        await this.backupMintsToNostr(true);
      }
    },

    // Disable the backup feature
    disableBackup(): void {
      const settingsStore = useSettingsStore();
      settingsStore.nostrMintBackupEnabled = false;
    },

    // Force backup (regardless of whether it's needed)
    async forceBackup(): Promise<void> {
      const settingsStore = useSettingsStore();
      const wasEnabled = settingsStore.nostrMintBackupEnabled;
      settingsStore.nostrMintBackupEnabled = true;

      try {
        await this.backupMintsToNostr(true);
      } finally {
        settingsStore.nostrMintBackupEnabled = wasEnabled;
      }
    },

    // Clear discovered mints
    clearDiscoveredMints(): void {
      this.discoveredMints = [];
    },
  },
});
