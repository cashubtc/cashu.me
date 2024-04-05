import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import { useWorkersStore } from "./workers";
import { notifyApiError, notifyError, notifySuccess } from "src/js/notify";
import { CashuMint, MintKeys, MintAllKeysets, Proof, SerializedBlindedSignature, MintKeyset } from "@cashu/cashu-ts";

export type Mint = {
  url: string;
  api: CashuMint;
  balance: number;
  keys?: MintKeys[];
  keysets?: MintKeyset[];
  // initialize api: new CashuMint(url) on activation
};

// type that extends type Proof with reserved boolean
export type WalletProof = Proof & { reserved: boolean };

type BlindSignatureAudit = {
  signature: SerializedBlindedSignature;
  amount: number;
  secret: Uint8Array;
  id: string;
  r: string;
};

export const useMintsStore = defineStore("mints", {
  state: () => {
    return {
      activeMintUrl: useLocalStorage<string>("cashu.activeMintUrl", ""),
      // activeProofs: useLocalStorage("cashu.activeProofs", [] as WalletProof[]),
      // keys: useLocalStorage("cashu.keys", {} as MintKeys),
      // keysets: useLocalStorage("cashu.keysets", [] as string[]),
      // allKeysets: useLocalStorage("cashu.allKeysets", [] as MintKeys[]),
      mintToAdd: "https://8333.space:3338",
      mintToRemove: "",
      mints: useLocalStorage("cashu.mints", [] as Mint[]),
      proofs: useLocalStorage("cashu.proofs", [] as WalletProof[]),
      spentProofs: useLocalStorage("cashu.spentProofs", [] as WalletProof[]),
      blindSignatures: useLocalStorage("cashu.blindSignatures", [] as BlindSignatureAudit[]),
      showAddMintDialog: false,
      showRemoveMintDialog: false,
    };
  },
  getters: {
    // activeMint({ activeMintUrl }) {
    //   return this.mints.find((m) => m.url === activeMintUrl);
    // },
    activeProofs({ activeMintUrl }) {
      return this.proofs.filter((p) =>
        this.mints.find((m) => m.url === activeMintUrl)?.keysets?.map((k) => k.id).includes(p.id)
      );
    }
  },
  actions: {
    activeMint() {
      const mint = this.mints.find((m) => m.url === this.activeMintUrl);
      if (mint) {
        // set api
        mint.api = new CashuMint(mint.url);
        return mint;
      } else {
        throw new Error("No active mint");
      }
    },
    setShowAddMintDialog(show: boolean) {
      this.showAddMintDialog = show;
    },
    setShowRemoveMintDialog(show: boolean) {
      this.showRemoveMintDialog = show;
    },
    setMintToAdd(mint: string) {
      this.mintToAdd = mint;
    },
    setMintToRemove(mint: string) {
      this.mintToRemove = mint;
    },
    addProofs(proofs: Proof[]) {
      const walletProofs = proofs.map((p) => {
        return {
          amount: p.amount,
          secret: p.secret,
          C: p.C,
          reserved: false,
          id: p.id,
        };
      });
      this.proofs = this.proofs.concat(walletProofs);
    },
    removeProofs(proofs: Proof[]) {
      const walletProofs = proofs.map((p) => {
        return {
          amount: p.amount,
          secret: p.secret,
          C: p.C,
          reserved: false,
          id: p.id,
        };
      });
      this.proofs = this.proofs.filter((p) => !walletProofs.includes(p));
      this.spentProofs = this.spentProofs.concat(walletProofs);
    },
    appendBlindSignatures(signature: SerializedBlindedSignature, amount: number, secret: Uint8Array, r: string) {
      const audit: BlindSignatureAudit = {
        signature: signature,
        amount: amount,
        secret: secret,
        id: signature.id,
        r: r,
      };
      this.blindSignatures.push(audit);
    },
    // setActiveProofs(proofs: Proof[]) {
    //   this.activeProofs = proofs;
    // },
    updateActiveMintBalance() {
      if (this.activeMintUrl) {
        let thisMint = this.mints.filter((m) => m.url === this.activeMintUrl);
        if (thisMint.length > 0) {
          thisMint[0].balance = this.getBalance();
        }
      }
    },
    getKeysForKeyset: async function (keyset_id: string): Promise<MintKeys> {
      const mint = this.mints.find((m) => m.url === this.activeMintUrl);
      if (mint) {
        const keys = mint.keys?.find((k) => k.id === keyset_id);
        if (keys) {
          return keys;
        } else {
          throw new Error("Keys not found");
        }
      } else {
        throw new Error("Mint not found");
      }
    },
    addMint: async function (url: string, verbose = false) {
      try {
        // we have no mints at all
        const mintToAdd: Mint = { url: url, balance: 0, api: new CashuMint(url) };
        if (this.mints.length === 0) {
          this.mints = [mintToAdd];
        } else if (this.mints.filter((m) => m.url === url).length === 0) {
          // we don't have this mint yet
          this.mints.push(mintToAdd);
        } else {
          // we already have this mint
          if (verbose) {
            notifySuccess("Mint already added");
          }
          return;
        }
        await this.activateMint(mintToAdd, verbose);
      } catch (error) {
        // activation failed, we remove the mint again from local storage
        this.mints = this.mints.filter((m) => m.url !== url);
        throw error;
      } finally {
        this.showAddMintDialog = false;
      }
    },
    activateMintUrl: async function (url: string, verbose = false, force = false) {
      const mint = this.mints.filter((m) => m.url === url)[0];
      if (mint) {

        await this.activateMint(mint, verbose, force);
      } else {
        notifyError("Mint not found", "Mint activation failed");
      }
    },
    activateMint: async function (mint: Mint, verbose = false, force = false) {
      const workers = useWorkersStore();
      if (mint.url === this.activeMintUrl && !force) {
        // return here because this function is called repeatedly by the
        // invoice check and token spendable check workers and would otherwise
        // run until cleaAllWorkers and kill the woerkers
        return;
      }
      // we need to stop workers because they will reset the activeMint again
      workers.clearAllWorkers();

      // create new mint.api instance because we can't store it in local storage
      mint.api = new CashuMint(mint.url);
      let previousUrl = this.activeMintUrl;
      try {
        this.activeMintUrl = mint.url;
        console.log("### this.activeMintUrl", this.activeMintUrl);
        await this.fetchMintKeys(mint);
        if (verbose) {
          await notifySuccess("Mint added");
        }
        // update balance using updateActiveMintBalance
        this.updateActiveMintBalance();

        console.log(
          "### activateMint: Mint activated: ",
          this.activeMintUrl,
          "balance",
          this.getBalance()
        );
      } catch (error: any) {
        // restore previous values because the activation errored
        this.activeMintUrl = previousUrl;
        let err_msg = "Could not connect to mint.";
        if (error.message.length) {
          err_msg = err_msg + ` ${error.message}.`;
        }
        await notifyError(err_msg, "Mint activation failed");
        throw error;
      }
    },
    fetchMintKeys: async function (mint: Mint) {
      try {
        mint.api = new CashuMint(mint.url);
        const keysets = await this.fetchMintKeysets(mint);
        // store keysets in mint and update local storage
        this.mints.filter((m) => m.url === mint.url)[0].keysets = keysets;

        const keys = await mint.api.getKeys();
        // store keys in mint and update local storage
        this.mints.filter((m) => m.url === mint.url)[0].keys = keys.keysets;
        return
      } catch (error: any) {
        console.error(error);
        try {
          notifyApiError(error, "Could not get mint keys");
        } catch { }
        throw error;
      }
    },
    fetchMintKeysets: async function (mint: Mint) {
      // attention: this function overwrites this.keysets
      try {
        mint.api = new CashuMint(mint.url);
        const data = await mint.api.getKeySets();
        return data.keysets;
      } catch (error: any) {
        console.error(error);
        try {
          notifyApiError(error, "Could not get mint keysets");
        } catch { }
        throw error;
      }
    },
    removeMint: async function (url: string) {
      this.mints = this.mints.filter((m) => m.url !== url);
      if (url === this.activeMintUrl) {
        this.activeMintUrl = "";
      }
      // todo: we always reset to the first mint, improve this
      if (this.mints.length > 0) {
        await this.activateMint(this.mints[0], false);
      }
      notifySuccess("Mint removed");
    },
    restoreFromBackup: function (backup: any) {
      if (!backup || !backup["cashu.welcomeDialogSeen"]) {
        notifyError("Unrecognized Backup Format!");
      } else {
        localStorage.setItem(
          "cashu.welcomeDialogSeen",
          backup["cashu.welcomeDialogSeen"]
        );
        localStorage.setItem("cashu.theme", backup["cashu.theme"]);
        localStorage.setItem("cashu.mints", backup["cashu.mints"]);
        localStorage.setItem("cashu.proofs", backup["cashu.proofs"]);
        localStorage.setItem("cashu.spentProofs", backup["cashu.spentProofs"]);
        localStorage.setItem(
          "cashu.blindSignatures",
          backup["cashu.blindSignatures"]
        );
        localStorage.setItem(
          "cashu.historyTokens",
          backup["cashu.historyTokens"]
        );
        localStorage.setItem(
          "cashu.activeMintUrl",
          backup["cashu.activeMintUrl"]
        );
        notifySuccess("Backup restored");
      }
    },
    assertMintError: function (response: { error: any }, verbose = true) {
      if (response.error != null) {
        if (verbose) {
          notifyError(response.error, "Mint error");
        }
        throw new Error(`Mint error: ${response.error}`);
      }
    },
    getBalance: function () {
      const mint = this.mints.find((m) => m.url === this.activeMintUrl);
      if (mint) {
        return mint.balance;
      } else {
        return 0;
      }
    }
  },
});
