import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import { generateSecretKey, getPublicKey } from 'nostr-tools'
import { bytesToHex } from '@noble/hashes/utils' // already an installed dependency
import { useWalletStore } from "./wallet";
import { CashuMint, CashuWallet, Proof } from "@cashu/cashu-ts";
import { useMintsStore } from "./mints";
import { notify, notifyError, notifySuccess } from "src/js/notify";
import { useUiStore } from "./ui";

const BATCH_SIZE = 50;
const MAX_GAP = 3;

export const useRestoreStore = defineStore("restore", {
  state: () => ({
    showRestoreDialog: useLocalStorage<boolean>("cashu.restore.showRestoreDialog", false),
    restoringState: false,
    restoringMint: "",
    mnemonicToRestore: useLocalStorage<string>("cashu.restore.mnemonicToRestore", ""),
  }),
  getters: {

  },
  actions: {
    restoreMint: async function (url: string) {
      this.restoringState = true;
      this.restoringMint = url;
      try {
        await this._restoreMint(url);
      } catch (error) {
        notifyError(`Error restoring mint: ${error}`);
      } finally {
        this.restoringState = false;
        this.restoringMint = "";
      }
    },
    _restoreMint: async function (url: string) {
      if (this.mnemonicToRestore.length === 0) {
        notifyError("Please enter a mnemonic");
        return;
      }
      const mintStore = useMintsStore();
      await mintStore.activateMintUrl(url);

      const mnemonic = useWalletStore().mnemonic;
      const mint = new CashuMint(url);
      const keysets = (await mint.getKeySets()).keysets;
      let restoredSomething = false;
      for (const keyset of keysets) {
        console.log(`Restoring keyset ${keyset.id} with unit ${keyset.unit}`);
        const wallet = new CashuWallet(mint, { mnemonicOrSeed: mnemonic, unit: keyset.unit });
        let start = 0;
        let emptyBatchCount = 0;
        let restoreProofs: Proof[] = [];

        while (emptyBatchCount < MAX_GAP - 1) {
          console.log(`Restoring proofs ${start} to ${start + BATCH_SIZE}`);
          const proofs = (await wallet.restore(start, BATCH_SIZE, { keysetId: keyset.id })).proofs;
          if (proofs.length === 0) {
            console.log(`No proofs found for keyset ${keyset.id}`);
            emptyBatchCount++;
          } else {
            console.log(`> Restored ${proofs.length} proofs with sum ${proofs.reduce((s, p) => s + p.amount, 0)}`);
            restoreProofs = restoreProofs.concat(proofs);
            emptyBatchCount = 0;
          }
          start += BATCH_SIZE;
        }

        let restoredProofs: Proof[] = [];
        for (let i = 0; i < restoreProofs.length; i += BATCH_SIZE) {
          const checkRestoreProofs = restoreProofs.slice(0, i + BATCH_SIZE);
          const spentProofs = await wallet.checkProofsSpent(checkRestoreProofs);
          const spentProofsSecrets = spentProofs.map((p) => p.secret);
          const unspentProofs = restoreProofs.filter((p) => !spentProofsSecrets.includes(p.secret));
          if (unspentProofs.length > 0) {
            console.log(`Found ${unspentProofs.length} unspent proofs with sum ${unspentProofs.reduce((s, p) => s + p.amount, 0)}`);
          }
          const newProofs = unspentProofs.filter((p) => !mintStore.proofs.some((pr) => pr.secret === p.secret));
          mintStore.addProofs(newProofs);
          restoredProofs = restoredProofs.concat(newProofs);
        }
        const restoredAmount = restoredProofs.reduce((s, p) => s + p.amount, 0);
        const restoredAmountStr = useUiStore().formatCurrency(restoredAmount, keyset.unit);
        if (restoredAmount > 0) {
          notifySuccess(`Restored ${restoredAmountStr}`);
          restoredSomething = true;
        }
      }
      if (!restoredSomething) {
        notify("No proofs found to restore");
      }
    },
  },
});
