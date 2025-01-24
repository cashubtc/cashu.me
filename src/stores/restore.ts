import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import { generateSecretKey, getPublicKey } from "nostr-tools";
import { bytesToHex } from "@noble/hashes/utils"; // already an installed dependency
import { useWalletStore } from "./wallet";
import { CashuMint, CashuWallet, CheckStateEnum, Proof } from "@cashu/cashu-ts";
import { useMintsStore } from "./mints";
import { notify, notifyError, notifySuccess } from "src/js/notify";
import { useUiStore } from "./ui";
import { useProofsStore } from "./proofs";

const BATCH_SIZE = 200;
const MAX_GAP = 2;

export const useRestoreStore = defineStore("restore", {
  state: () => ({
    showRestoreDialog: useLocalStorage<boolean>(
      "cashu.restore.showRestoreDialog",
      false
    ),
    restoringState: false,
    restoringMint: "",
    mnemonicToRestore: useLocalStorage<string>(
      "cashu.restore.mnemonicToRestore",
      ""
    ),
    restoreProgress: 0,
    restoreCounter: 0,
    restoreStatus: "",
  }),
  getters: {},
  actions: {
    restoreMint: async function (url: string) {
      this.restoringState = true;
      this.restoringMint = url;
      this.restoreProgress = 0;
      this.restoreCounter = 0;
      this.restoreStatus = "";
      try {
        await this._restoreMint(url);
      } catch (error) {
        notifyError(`Error restoring mint: ${error}`);
      } finally {
        this.restoringState = false;
        this.restoringMint = "";
        this.restoreProgress = 0;
      }
    },
    _restoreMint: async function (url: string) {
      if (this.mnemonicToRestore.length === 0) {
        notifyError("Please enter a mnemonic");
        return;
      }
      this.restoreProgress = 0;
      const walletStore = useWalletStore();
      const proofsStore = useProofsStore();
      const mintStore = useMintsStore();
      await mintStore.activateMintUrl(url);

      const mnemonic = this.mnemonicToRestore;
      this.restoreStatus = `Preparing restore process...`;
      const mint = new CashuMint(url);
      const keysets = (await mint.getKeySets()).keysets;
      let restoredSomething = false;

      // Calculate total steps for progress calculation
      let totalSteps = keysets.length * MAX_GAP;
      let currentStep = 0;

      for (const keyset of keysets) {
        console.log(`Restoring keyset ${keyset.id} with unit ${keyset.unit}`);
        const bip39Seed = walletStore.mnemonicToSeedSync(mnemonic);
        const wallet = new CashuWallet(mint, {
          bip39seed: bip39Seed,
          unit: keyset.unit,
        });
        let start = 0;
        let emptyBatchCount = 0;
        let restoreProofs: Proof[] = [];

        while (emptyBatchCount < MAX_GAP) {
          console.log(`Restoring proofs ${start} to ${start + BATCH_SIZE}`);
          const proofs = (
            await wallet.restore(start, BATCH_SIZE, { keysetId: keyset.id })
          ).proofs;
          if (proofs.length === 0) {
            console.log(`No proofs found for keyset ${keyset.id}`);
            emptyBatchCount++;
          } else {
            console.log(
              `> Restored ${proofs.length} proofs with sum ${proofs.reduce(
                (s, p) => s + p.amount,
                0
              )}`
            );
            restoreProofs = restoreProofs.concat(proofs);
            emptyBatchCount = 0;
            this.restoreCounter += proofs.length;
            totalSteps += 1;
          }
          this.restoreStatus = `Restored ${this.restoreCounter} proofs for keyset ${keyset.id}`;
          start += BATCH_SIZE;

          currentStep++;
          this.restoreProgress = currentStep / totalSteps;
        }

        let restoredProofs: Proof[] = [];
        for (let i = 0; i < restoreProofs.length; i += BATCH_SIZE) {
          this.restoreStatus = `Checking proofs ${i} to ${
            i + BATCH_SIZE
          } for keyset ${keyset.id}`;
          const checkRestoreProofs = restoreProofs.slice(i, i + BATCH_SIZE);
          const proofStates = await wallet.checkProofsStates(
            checkRestoreProofs
          );
          const spentProofs = checkRestoreProofs.filter(
            (p, i) => proofStates[i].state === CheckStateEnum.SPENT
          );
          const spentProofsSecrets = spentProofs.map((p) => p.secret);
          const unspentProofs = checkRestoreProofs.filter(
            (p) => !spentProofsSecrets.includes(p.secret)
          );
          if (unspentProofs.length > 0) {
            console.log(
              `Found ${
                unspentProofs.length
              } unspent proofs with sum ${unspentProofs.reduce(
                (s, p) => s + p.amount,
                0
              )}`
            );
          }
          const newProofs = unspentProofs.filter(
            (p) => !proofsStore.proofs.some((pr) => pr.secret === p.secret)
          );
          await useProofsStore().addProofs(newProofs);
          restoredProofs = restoredProofs.concat(newProofs);
          currentStep++;
          this.restoreProgress = currentStep / totalSteps;
        }
        const restoredAmount = restoredProofs.reduce((s, p) => s + p.amount, 0);
        const restoredAmountStr = useUiStore().formatCurrency(
          restoredAmount,
          keyset.unit
        );
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
