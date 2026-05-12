import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import { generateSecretKey, getPublicKey } from "nostr-tools";
import { bytesToHex } from "@noble/hashes/utils"; // already an installed dependency
import { useWalletStore } from "./wallet";
import { Mint, Wallet, CheckStateEnum, Proof } from "@cashu/cashu-ts";
import { useMintsStore } from "./mints";
import { notify, notifyError, notifySuccess } from "src/js/notify";
import { useUiStore } from "./ui";
import { useProofsStore } from "./proofs";
import { i18n } from "../boot/i18n";

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
        notifyError(
          i18n.global.t("restore.restore_mint_error_text", { error })
        );
      } finally {
        this.restoringState = false;
        this.restoringMint = "";
        this.restoreProgress = 0;
      }
    },
    _restoreMint: async function (url: string) {
      if (this.mnemonicToRestore.length === 0) {
        notifyError(i18n.global.t("restore.mnemonic_error_text"));
        return;
      }
      this.restoreProgress = 0;
      const walletStore = useWalletStore();
      const proofsStore = useProofsStore();
      const mintStore = useMintsStore();
      await mintStore.activateMintUrl(url);

      const mnemonic = this.mnemonicToRestore;
      this.restoreStatus = i18n.global.t("restore.prepare_info_text");
      const mint = new Mint(url);
      const keysets = (await mint.getKeySets()).keysets;
      let restoredSomething = false;

      // Calculate total steps for progress calculation
      let totalSteps = keysets.length * MAX_GAP;
      let currentStep = 0;

      for (const keyset of keysets) {
        console.log(`Restoring keyset ${keyset.id} with unit ${keyset.unit}`);
        const bip39Seed = walletStore.mnemonicToSeedSync(mnemonic);
        const wallet = new Wallet(mint, {
          bip39seed: bip39Seed,
          unit: keyset.unit,
        });
        await wallet.loadMint();
        let start = 0;
        let emptyBatchCount = 0;
        let maxLastCounterWithSignature = -1;
        let restoreProofs: Proof[] = [];

        while (emptyBatchCount < MAX_GAP) {
          console.log(`Restoring proofs ${start} to ${start + BATCH_SIZE}`);
          let proofs: Proof[] = [];
          let lastCounterWithSignature: number | undefined;
          try {
            ({ proofs, lastCounterWithSignature } = await wallet.restore(
              start,
              BATCH_SIZE,
              { keysetId: keyset.id }
            ));
          } catch (error) {
            console.error(`Error restoring proofs: ${error}`);
            proofs = [];
          }
          if (proofs.length === 0) {
            console.log(`No proofs found for keyset ${keyset.id}`);
            emptyBatchCount++;
          } else {
            const restoredBatchAmount = proofsStore.sumProofs(proofs);
            console.log(
              `> Restored ${proofs.length} proofs with sum ${restoredBatchAmount}`
            );
            restoreProofs = restoreProofs.concat(proofs);
            emptyBatchCount = 0;
            if (
              lastCounterWithSignature !== undefined &&
              lastCounterWithSignature > maxLastCounterWithSignature
            ) {
              maxLastCounterWithSignature = lastCounterWithSignature;
            }
            this.restoreCounter += proofs.length;
            totalSteps += 1;
          }
          this.restoreStatus = i18n.global.t(
            "restore.restored_proofs_for_keyset_info_text",
            {
              restoreCounter: this.restoreCounter,
              keysetId: keyset.id,
            }
          );
          start += BATCH_SIZE;

          currentStep++;
          this.restoreProgress = currentStep / totalSteps;
        }

        // Advance the keyset counter past the highest index that returned a
        // signature so a subsequent deterministic op cannot collide with an
        // already-signed output, even when restored proofs are sparse.
        if (maxLastCounterWithSignature >= 0) {
          const nextCounter = maxLastCounterWithSignature + 1;
          if (nextCounter > walletStore.keysetCounter(keyset.id)) {
            walletStore
              .getOrCreateCounterSource()
              .advanceToAtLeast(keyset.id, nextCounter);
            walletStore.syncCounterToStorage(keyset.id, nextCounter);
          }
        }

        let restoredProofs: Proof[] = [];
        for (let i = 0; i < restoreProofs.length; i += BATCH_SIZE) {
          this.restoreStatus = i18n.global.t(
            "restore.checking_proofs_for_keyset_info_text",
            {
              startIndex: i,
              endIndex: i + BATCH_SIZE,
              keysetId: keyset.id,
            }
          );
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
            const unspentAmount = proofsStore.sumProofs(unspentProofs);
            console.log(
              `Found ${unspentProofs.length} unspent proofs with sum ${unspentAmount}`
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
        const restoredAmount = proofsStore.sumProofs(restoredProofs);
        const restoredAmountStr = useUiStore().formatCurrency(
          restoredAmount,
          keyset.unit
        );
        if (restoredAmount > 0) {
          notifySuccess(
            i18n.global.t("restore.restored_amount_success_text", {
              amount: restoredAmountStr,
            })
          );
          restoredSomething = true;
        }
      }
      if (!restoredSomething) {
        notify(i18n.global.t("restore.no_proofs_info_text"));
      }
    },
  },
});
