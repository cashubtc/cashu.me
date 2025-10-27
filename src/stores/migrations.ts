import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import { useMintsStore } from "./mints";
import { notifySuccess } from "../js/notify";
import { useUiStore } from "./ui";
import { useSettingsStore } from "./settings";
import { useNostrMintBackupStore } from "./nostrMintBackup";

// Define the migration version type
export type Migration = {
  version: number;
  name: string;
  description: string;
  execute: () => Promise<void>;
};

export const useMigrationsStore = defineStore("migrations", {
  state: () => ({
    currentVersion: useLocalStorage<number>("cashu.migrations.version", 0),
    migrations: [] as Migration[],
  }),
  actions: {
    registerMigration(migration: Migration) {
      // Add migration if it doesn't already exist
      if (!this.migrations.some((m) => m.version === migration.version)) {
        this.migrations.push(migration);
        // Sort migrations by version
        this.migrations.sort((a, b) => a.version - b.version);
      }
    },

    async runMigrations() {
      // Get migrations that need to be run (newer than current version)
      const pendingMigrations = this.migrations.filter(
        (m) => m.version > this.currentVersion
      );

      if (pendingMigrations.length === 0) {
        console.log("No migrations to run");
        return;
      }

      console.log(`Running ${pendingMigrations.length} migrations...`);

      // Run each migration in order
      const uIStore = useUiStore();
      await uIStore.lockMutex();
      try {
        for (const migration of pendingMigrations) {
          console.log(
            `Running migration ${migration.version}: ${migration.name}`
          );
          try {
            await migration.execute();
            // Update the current version after successful migration
            this.currentVersion = migration.version;
            console.log(
              `Migration ${migration.version} completed successfully`
            );
          } catch (error) {
            console.error(`Migration ${migration.version} failed:`, error);
            // Stop running migrations if one fails
            break;
          }
        }
      } finally {
        await uIStore.unlockMutex();
      }
    },

    // First migration: Update mint URL from stablenuts.cash to umint.cash
    async migrateStablenutsToCash() {
      const mintStore = useMintsStore();
      let updated = false;

      for (let i = 0; i < mintStore.mints.length; i++) {
        if (mintStore.mints[i].url === "https://stablenut.umint.cash") {
          console.log("Updating mint URL from stablenuts.cash to umint.cash");
          mintStore.mints[i].url = "https://stablenut.cashu.network";

          // If this was the active mint, update the active mint URL as well
          if (mintStore.activeMintUrl === "https://stablenut.umint.cash") {
            mintStore.activeMintUrl = "https://stablenut.cashu.network";
          }

          updated = true;
        }
      }

      if (updated) {
        console.log("Successfully updated mint URL");
      } else {
        console.log("No stablenuts.cash mint found to update");
      }
    },

    // Migration v2: add "wss://relay.primal.net " relay, enable nostrMintBackup, clear mint recs cache
    async migrateAddPrimalRelayAndEnableBackupAndClearMintRecs() {
      const settings = useSettingsStore();

      // 1) Add relay string with leading '@' and trailing space if not present
      const relayToAdd = "wss://relay.primal.net ";
      try {
        const relays = Array.isArray(settings.defaultNostrRelays)
          ? settings.defaultNostrRelays
          : [];
        if (!relays.includes(relayToAdd)) {
          relays.push(relayToAdd);
          settings.defaultNostrRelays = relays;
          console.log(`Added relay to defaultNostrRelays: ${relayToAdd}`);
        } else {
          console.log(
            `Relay already present in defaultNostrRelays: ${relayToAdd}`
          );
        }
      } catch (e) {
        console.error(
          "Failed to update defaultNostrRelays during migration v2",
          e
        );
      }

      // 2) Ensure nostrMintBackupEnabled is true
      try {
        if (!settings.nostrMintBackupEnabled) {
          settings.nostrMintBackupEnabled = true;
          console.log("Enabled nostrMintBackupEnabled setting");
          // kick off a backup
          useNostrMintBackupStore().forceBackup();
        } else {
          console.log("nostrMintBackupEnabled already true");
        }
      } catch (e) {
        console.error(
          "Failed to enable nostrMintBackupEnabled during migration v2",
          e
        );
      }

      // 3) Clear cached mint recommendations
      try {
        localStorage.removeItem("cashu.ndk.mintRecommendations");
        console.log("Cleared localStorage key: cashu.ndk.mintRecommendations");
      } catch (e) {
        console.error(
          "Failed to clear cashu.ndk.mintRecommendations during migration v2",
          e
        );
      }
    },

    // Initialize migrations
    initMigrations() {
      // Register the first migration
      this.registerMigration({
        version: 1,
        name: "Migrate stablenuts.cash to umint.cash",
        description:
          "Updates mint URL from https://stablenut.umint.cash to https://stablenut.cashu.network",
        execute: async () => await this.migrateStablenutsToCash(),
      });

      // Register migration v2
      this.registerMigration({
        version: 2,
        name: "Add wss://relay.primal.net relay; enable mint backup; clear recs",
        description:
          "Adds 'wss://relay.primal.net ' to defaultNostrRelays, enables nostrMintBackupEnabled, clears cashu.ndk.mintRecommendations",
        execute: async () =>
          await this.migrateAddPrimalRelayAndEnableBackupAndClearMintRecs(),
      });

      // Add more migrations here in the future
    },
  },
});
