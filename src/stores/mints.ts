import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import { useWorkersStore } from "./workers";
import { notifyApiError, notifyError, notifySuccess } from "src/js/notify";
import { CashuMint, MintKeys, MintAllKeysets, Proof, SerializedBlindedSignature, MintKeyset } from "@cashu/cashu-ts";

export type Mint = {
  url: string;
  keys: MintKeys[];
  keysets: MintKeyset[];
  nickname?: string;
  // initialize api: new CashuMint(url) on activation
};

export class MintClass {
  mint: Mint;
  constructor(mint: Mint) {
    this.mint = mint;
  }
  get api() {
    return new CashuMint(this.mint.url);
  }
  get proofs() {
    const mintStore = useMintsStore();
    return mintStore.proofs.filter((p) => this.mint.keysets.map((k) => k.id).includes(p.id));
  }
  // get balance() {
  //   const proofs = this.proofs;
  //   return proofs.reduce((sum, p) => sum + p.amount, 0);
  // }

  get allBalances() {
    // return an object with all balances for each unit
    const balances: Record<string, number> = {};
    this.units.forEach((unit) => {
      balances[unit] = this.unitBalance(unit);
    });
    return balances;
  }

  get keysets() {
    return this.mint.keysets.filter((k) => k.active);
  }

  get units() {
    return this.mint.keysets.map((k) => k.unit).filter((value, index, self) => self.indexOf(value) === index);
  }

  unitKeysets(unit: string): MintKeyset[] {
    return this.mint.keysets.filter((k) => k.unit === unit && k.active);
  }

  unitProofs(unit: string) {
    const unitKeysets = this.unitKeysets(unit);
    return this.proofs.filter((p) => unitKeysets.map((k) => k.id).includes(p.id));
  }

  unitBalance(unit: string) {
    const proofs = this.unitProofs(unit);
    return proofs.reduce((sum, p) => sum + p.amount, 0);
  }
}

// type that extends type Proof with reserved boolean
export type WalletProof = Proof & { reserved: boolean };

export type Balances = {
  [unit: string]: number;
};


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
      activeUnit: useLocalStorage<string>("cashu.activeUnit", "sat"),
      activeMintUrl: useLocalStorage<string>("cashu.activeMintUrl", ""),
      addMintData: {
        url: "",
        nickname: "",
      },
      mints: useLocalStorage("cashu.mints", [] as Mint[]),
      proofs: useLocalStorage("cashu.proofs", [] as WalletProof[]),
      spentProofs: useLocalStorage("cashu.spentProofs", [] as WalletProof[]),
      blindSignatures: useLocalStorage("cashu.blindSignatures", [] as BlindSignatureAudit[]),
      // balances: useLocalStorage("cashu.balances", {} as Balances),
      showAddMintDialog: false,
      showRemoveMintDialog: false,
    };
  },
  getters: {
    activeProofs({ activeMintUrl, activeUnit }): WalletProof[] {
      const unitKeysets = this.mints.find((m) => m.url === activeMintUrl)?.keysets?.filter((k) => k.unit === activeUnit);
      if (!unitKeysets) {
        return [];
      }
      return this.proofs.filter((p) =>
        unitKeysets.map((k) => k.id).includes(p.id)
      );
    },
    activeBalance({ activeUnit }): number {
      const allUnitKeysets = this.mints.map((m) => m.keysets).flat().filter((k) => k.unit === activeUnit);
      const balance = this.proofs.filter((p) =>
        allUnitKeysets.map((k) => k.id).includes(p.id)
      ).reduce((sum, p) => sum + p.amount, 0);
      return balance
    },
  },
  actions: {
    activeMint() {
      const mint = this.mints.find((m) => m.url === this.activeMintUrl);
      if (mint) {
        return new MintClass(mint);
      } else {
        throw new Error("No active mint");
      }
    },
    toggleUnit: function () {
      const units = this.activeMint().units;
      this.activeUnit =
        units[(units.indexOf(this.activeUnit) + 1) % units.length];
      return this.activeUnit;
    },
    proofsToWalletProofs(proofs: Proof[]): WalletProof[] {
      return proofs.map((p) => {
        return {
          amount: p.amount,
          secret: p.secret,
          C: p.C,
          reserved: false,
          id: p.id,
        };
      });
    },
    // setMintToAdd(mint: string) {
    //   this.mintToAdd = mint;
    // },
    // setMintToRemove(mint: string) {
    //   this.mintToRemove = mint;
    // },
    // updateMintBalances() {
    //   this.mints.forEach((m) => {
    //     const mintClass = new MintClass(m);
    //     m.balance = mintClass.allBalances
    //   });
    // },
    addProofs(proofs: Proof[]) {
      const walletProofs = this.proofsToWalletProofs(proofs);
      this.proofs = this.proofs.concat(walletProofs);
      // this.updateMintBalances();
      console.log("### addProofs", this.proofs, "length", this.proofs.length);
    },
    removeProofs(proofs: Proof[]) {
      const walletProofs = this.proofsToWalletProofs(proofs);
      // remove walletProofs with the same secret from this.proofs
      this.proofs = this.proofs.filter((p) => {
        return !walletProofs.some((wp) => {
          return wp.secret === p.secret;
        });
      });
      console.log("### removeProofs", this.proofs, "length", this.proofs.length);
      this.spentProofs = this.spentProofs.concat(walletProofs);
      // this.updateMintBalances();
      console.log("### spentProofs", this.spentProofs, "length", this.spentProofs.length);
    },
    appendBlindSignatures(signature: SerializedBlindedSignature, amount: number, secret: Uint8Array, r: Uint8Array) {
      const audit: BlindSignatureAudit = {
        signature: signature,
        amount: amount,
        secret: secret,
        id: signature.id,
        r: Buffer.from(r).toString("hex"),
      };
      this.blindSignatures.push(audit);
    },
    toggleActiveUnitForMint(mint: Mint) {
      // method to set the active unit to one that is supported by `mint`
      const mintClass = new MintClass(mint);
      if (!this.activeUnit || mintClass.allBalances[this.activeUnit] == undefined) {
        this.activeUnit = mintClass.units[0]
      }
    },
    updateMint(oldMint: Mint, newMint: Mint) {
      const index = this.mints.findIndex((m) => m.url === oldMint.url);
      this.mints[index] = newMint;
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
    addMint: async function (addMintData: { url: string, nickname: string }, verbose = false) {
      let url = addMintData.url;
      try {
        // sanitize url
        const sanitizeUrl = (url: string): string => {
          let cleanedUrl = url.trim().replace(/\/+$/, '')
          if (!/^[a-z]+:\/\//.test(cleanedUrl)) {  // Check for any protocol followed by "://"
            cleanedUrl = 'https://' + cleanedUrl;
          }
          return cleanedUrl;
        };
        url = sanitizeUrl(url);

        const mintToAdd: Mint = { url: url, keys: [], keysets: [], nickname: addMintData.nickname };

        // we have no mints at all
        if (this.mints.length === 0) {
          this.mints = [mintToAdd];
        } else if (this.mints.filter((m) => m.url === url).length === 0) {
          // we don't have this mint yet
          // add mint to this.mints so it can be activated in
          this.mints.push(mintToAdd);
        } else {
          // we already have this mint
          if (verbose) {
            notifySuccess("Mint already added");
          }
          return;
        }
        await this.activateMint(mintToAdd, false);
        if (verbose) {
          await notifySuccess("Mint added");
        }
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
      let previousUrl = this.activeMintUrl;


      try {
        this.activeMintUrl = mint.url;

        console.log("### this.activeMintUrl", this.activeMintUrl);
        mint = await this.fetchMintKeys(mint);
        this.toggleActiveUnitForMint(mint);
        if (verbose) {
          await notifySuccess("Mint activated.");
        }
        console.log(
          "### activateMint: Mint activated: ",
          this.activeMintUrl,
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
        const mintClass = new MintClass(mint);
        const keysets = await this.fetchMintKeysets(mint);
        if (keysets.length > 0) {
          // store keysets in mint and update local storage
          // TODO: do not overwrite anykeyset, but append new keysets and update existing ones
          this.mints.filter((m) => m.url === mint.url)[0].keysets = keysets;
        }

        const keys = await mintClass.api.getKeys();
        // store keys in mint and update local storage
        // TODO: Do not overwrite existing keysets, only add new ones
        this.mints.filter((m) => m.url === mint.url)[0].keys = keys.keysets;

        // return the mint with keys set
        return this.mints.filter((m) => m.url === mint.url)[0]
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
        const mintClass = new MintClass(mint);
        const data = await mintClass.api.getKeySets();
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
    assertMintError: function (response: { error?: any }, verbose = true) {
      if (response.error != null) {
        if (verbose) {
          notifyError(response.error, "Mint error");
        }
        throw new Error(`Mint error: ${response.error}`);
      }
    },
    // getBalance: function () {
    //   const mint = this.mints.find((m) => m.url === this.activeMintUrl);
    //   if (mint) {
    //     return mint.balance;
    //   }
    //   return null
    // }
  }
});
