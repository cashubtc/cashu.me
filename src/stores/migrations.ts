import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import { useMintsStore } from "./mints";
import { notifySuccess } from "../js/notify";
import { useUiStore } from "./ui";

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

      // Add more migrations here in the future
    },
  },
});
