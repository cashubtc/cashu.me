import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import { useWorkersStore } from "./workers";
import { notifyApiError, notifyError, notifySuccess } from "src/js/notify";
import { CashuMint, MintKeys, Proof } from "@cashu/cashu-ts";

type Mint = {
  url: string;
  balance: number;
  keys?: MintKeys;
  keysets?: string[];
};

type Keyset = {
  id: string;
  url: string;
  keys: MintKeys
};

export const useMintsStore = defineStore("mints", {
  state: () => {
    return {
      activeMintUrl: useLocalStorage<string>("cashu.activeMintUrl", ""),
      activeProofs: useLocalStorage("cashu.activeProofs", [] as Proof[]),
      keys: useLocalStorage("cashu.keys", {} as MintKeys),
      keysets: useLocalStorage("cashu.keysets", [] as string[]),
      allKeysets: useLocalStorage("cashu.allKeysets", [] as Keyset[]),
      mintToAdd: "https://8333.space:3338",
      mintToRemove: "",
      mints: useLocalStorage("cashu.mints", [] as Mint[]),
      proofs: useLocalStorage("cashu.proofs", [] as Proof[]),
      showAddMintDialog: false,
      showRemoveMintDialog: false,
    };
  },
  getters: {
    activeMint({ activeMintUrl }) {
      return new CashuMint(activeMintUrl);
    },
  },
  actions: {
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
    setProofs(proofs: Proof[]) {
      this.proofs = proofs;
      if (this.keysets) {
        this.activeProofs = this.proofs.filter((p) =>
          this.keysets.includes(p.id)
        );
      }
    },
    setActiveProofs(proofs: Proof[]) {
      this.activeProofs = proofs;
    },
    getKeysForKeyset: async function (keyset_id: string) {
      let keys = this.allKeysets
        .filter((m) => m.id == keyset_id)
        .map((m) => m.keys)
      if (keys.length) {
        return keys[0];
      } else {
        await this.activateMint(this.activeMintUrl, false, true);
        let keys = this.allKeysets
          .filter((m) => m.id == keyset_id)
          .map((m) => m.keys);
        if (keys.length) {
          return keys[0];
        } else {
          throw new Error("Could not get keys for keyset");
        }
      }
    },
    addMint: async function (url: string, verbose = false) {
      try {
        // we have no mints at all
        if (this.mints.length === 0) {
          this.mints = [{ url, balance: 0 }];
        } else if (this.mints.filter((m) => m.url === url).length === 0) {
          // we don't have this mint yet
          this.mints.push({ url: url, balance: 0 });
        }

        await this.activateMint(url, verbose);
      } catch (error) {
        // activation failed, we remove the mint again from local storage
        this.mints = this.mints.filter((m) => m.url !== url);
        throw error;
      } finally {
        this.showAddMintDialog = false;
      }
    },
    activateMint: async function (url: string, verbose = false, force = false) {
      const workers = useWorkersStore();
      if (url === this.activeMintUrl && !force) {
        // return here because this function is called repeatedly by the
        // invoice check and token spendable check workers and would otherwise
        // run until cleaAllWorkers and kill the woerkers
        return;
      }
      // we need to stop workers because they will reset the activeMint again
      workers.clearAllWorkers();
      // temporarily store the objects that get overwritten if all goes well
      // so we can restore it if it doesn't go well
      let previousUrl = this.activeMintUrl;
      let previousKeysets = this.keysets;

      try {
        this.activeMintUrl = url;
        console.log("### this.activeMintUrl", this.activeMintUrl);
        await this.fetchMintKeys();
        // load proofs
        this.activeProofs = this.proofs.filter((p) =>
          this.keysets.includes(p.id)
        );
        if (verbose) {
          await notifySuccess("Mint added.");
        }
        // update balance of active mint in this.mints
        if (this.mints.length > 0 && this.activeMintUrl) {
          let thisMint = this.mints.filter((m) => m.url === this.activeMintUrl);
          if (thisMint.length > 0) {
            thisMint[0].balance = this.getBalance();
          }
        }

        console.log(
          "### activateMint: Mint activated: ",
          this.activeMintUrl,
          "balance",
          this.getBalance()
        );
      } catch (error: any) {
        // restore previous values because the activation errored
        this.activeMintUrl = previousUrl;
        this.keysets = previousKeysets;

        let err_msg = "Could not connect to mint.";
        if (error.message.length) {
          err_msg = err_msg + ` ${error.message}.`;
        }
        await notifyError(err_msg, "Mint activation failed");
        throw error;
      }
    },
    fetchMintKeys: async function () {
      // attention: this function overwrites this.keys
      // later, it calles fetchMintKeysets which overwrites this.keysets
      try {
        console.log("### GET", `${this.activeMintUrl}/keys`);
        const data = await this.activeMint.getKeys();
        const keys = data;

        const keysets = await this.fetchMintKeysets();

        // get keys from all keyset and store them in allKeysets local storage
        for (let keyset of keysets) {
          // skip if we already have the keyset
          if (this.allKeysets.filter((m) => m.id == keyset).length) {
            continue;
          }
          let keyset_keys = await this.activeMint.getKeys(keyset);
          let keyset_struct: Keyset = {
            id: keyset,
            url: this.activeMintUrl,
            keys: keyset_keys,
          }
          this.allKeysets.push(
            keyset_struct
          )
        }

        // save keys to mints in local storage
        if (this.mints.filter((m) => m.url === this.activeMintUrl).length) {
          this.mints.filter((m) => m.url === this.activeMintUrl)[0].keys = keys;
          this.mints.filter((m) => m.url === this.activeMintUrl)[0].keysets =
            keysets;
        }

        return keys;
      } catch (error: any) {
        console.error(error);
        try {
          notifyApiError(error, "Could not get mint keys");
        } catch { }
        throw error;
      }
    },
    fetchMintKeysets: async function () {
      // attention: this function overwrites this.keysets
      try {
        const data = await this.activeMint.getKeySets();
        this.keysets = data.keysets;

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
        await this.activateMint(this.mints[0].url);
      }
      notifySuccess("Mint removed.");
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
        localStorage.setItem("cashu.keysets", backup["cashu.keysets"]);
        localStorage.setItem("cashu.keys", backup["cashu.keys"]);
        localStorage.setItem("cashu.proofs", backup["cashu.proofs"]);
        localStorage.setItem(
          "cashu.historyTokens",
          backup["cashu.historyTokens"]
        );
        localStorage.setItem(
          "cashu.activeMintUrl",
          backup["cashu.activeMintUrl"]
        );
        localStorage.setItem(
          "cashu.activeProofs",
          backup["cashu.activeProofs"]
        );

        notifySuccess("Backup successfully restored!");
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
      return this.activeProofs
        .map((t) => t)
        .flat()
        .reduce((sum, el) => (sum += el.amount), 0);
    },
  },
});
