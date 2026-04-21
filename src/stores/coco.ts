import { defineStore } from "pinia";
import { initializeCoco, Manager } from "@cashu/coco-core";
import { IndexedDbRepositories } from "@cashu/coco-indexeddb";
import { useWalletStore } from "./wallet";
import { mnemonicToSeedSync } from "@scure/bip39";
import { migrateToCoco } from "../js/migrate-to-coco";
import { markRaw } from "vue";

export const useCocoStore = defineStore("coco", {
  state: () => ({
    manager: null as any,
    repos: null as IndexedDbRepositories | null,
    isInitialized: false,
    balances: {
      total: 0,
      spendable: 0,
      reserved: 0
    } as any,
    balancesByMint: {} as any,
  }),
  actions: {
    async initialize() {
      if (this.isInitialized) return;

      const walletStore = useWalletStore();
      
      const seedGetter = async () => {
        const mnemonic = walletStore.mnemonic;
        return mnemonicToSeedSync(mnemonic);
      };

      const repos = new IndexedDbRepositories({});
      await repos.init();
      
      this.repos = markRaw(repos);
      
      this.manager = markRaw(await initializeCoco({
        repo: this.repos,
        seedGetter,
      }));
      
      // Run Migration
      await migrateToCoco(this.manager, this.repos);

      this.isInitialized = true;
      
      // Setup watchers
      await this.manager.enableMintOperationWatcher({ watchExistingPendingOnStart: true });
      await this.manager.enableMintOperationProcessor();
      await this.manager.enableProofStateWatcher();
      
      // Set up reactivity
      this.setupListeners();
      await this.updateBalances();
    },
    
    setupListeners() {
      if (!this.manager) return;
      
      this.manager.on('proofs:saved', () => this.updateBalances());
      this.manager.on('proofs:deleted', () => this.updateBalances());
      this.manager.on('proofs:reserved', () => this.updateBalances());
      this.manager.on('proofs:released', () => this.updateBalances());
      this.manager.on('proofs:state-changed', () => this.updateBalances());
      this.manager.on('mint:added', () => this.updateBalances());
    },
    
    async updateBalances() {
      if (!this.manager) return;
      this.balances = await this.manager.wallet.balances.total();
      this.balancesByMint = await this.manager.wallet.balances.byMint();
    }
  }
});
