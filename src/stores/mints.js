import { defineStore } from 'pinia'
import { useLocalStorage } from "@vueuse/core"
import { useWorkersStore } from "./workers";
import {axios} from "boot/axios";
import { notifyApiError, notifyError, notifySuccess } from "src/js/notify";

export const useMintsStore = defineStore('mints', {
  state: () => {
    return {
      activeMintUrl: useLocalStorage('cashu.activeMintUrl', ''),
      activeProofs: [],
      keys: useLocalStorage('cashu.keys', ''),
      keysets: useLocalStorage('cashu.keysets', []),
      mintToAdd: 'https://8333.space:3338',
      mints:  useLocalStorage('cashu.mints', []),
      proofs: useLocalStorage('cashu.proofs', []),
      showAddMintDialog: false,
    }
  },
  getters: {},
  actions: {
    setShowAddMintDialog(show) {
      this.showAddMintDialog = show
    },
    setMintToAdd(mint) {
      this.mintToAdd = mint
    },
    setProofs(proofs) {
      this.proofs = proofs;
      if (this.keysets) {
        this.activeProofs = this.proofs.filter((p) =>
          this.keysets.includes(p.id)
        );
      }
    },
    setActiveProofs(proofs) {
      this.activeProofs = proofs;
    },
    addMint: async function (url, verbose = false) {
      try {
        // we have no mints at all
        if (this.mints.length === 0) {
          this.mints = [{ url: url, balance: 0 }];
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
    activateMint: async function (url, verbose = false) {
      const workers = useWorkersStore()
      if (url === this.activeMintUrl) {
        return;
      }
      // we need to stop workers because they will reset the activeMint again
      workers.clearAllWorkers();
      // temporarily store the objects that get overwritten if all goes well
      // so we can restore it if it doesn't go well
      let previousUrl = this.activeMintUrl;
      let previousKeys = this.keys;
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
      } catch (error) {
        // restore previous values because the activation errored
        this.activeMintUrl = previousUrl;
        this.keys = previousKeys;
        this.keysets = previousKeysets;

        let err_msg = "Could not connect to mint.";
        if (error.message.length) {
          err_msg = err_msg + ` ${error.message}.`;
        }
        await notifyError(err_msg, "Mint activation");
        throw error;
      }
    },
    fetchMintKeys: async function () {
      // attention: this function overwrites this.keys
      // later, it calles fetchMintKeysets which overwrites this.keysets
      try {
        console.log("### GET", `${this.activeMintUrl}/keys`);
        const { data } = await axios.get(`${this.activeMintUrl}/keys`, {
          timeout: 6000,
        });
        const keys = data;
        this.assertMintError(keys);
        this.keys = keys;

        const keysets = await this.fetchMintKeysets();
        // save keys to mints in local storage
        if (this.mints.filter((m) => m.url === this.activeMintUrl).length) {
          this.mints.filter((m) => m.url === this.activeMintUrl)[0].keys = keys;
          this.mints.filter((m) => m.url === this.activeMintUrl)[0].keysets =
            keysets;
        }

        return keys;
      } catch (error) {
        console.error(error);
        try {
          notifyApiError(error);
        } catch {}
        throw error;
      }
    },
    fetchMintKeysets: async function () {
      // attention: this function overwrites this.keysets
      try {
        const { data } = await axios.get(`${this.activeMintUrl}/keysets`, {
          timeout: 6000,
        });
        this.assertMintError(data);
        this.keysets = data.keysets;

        return data.keysets;
      } catch (error) {
        console.error(error);
        try {
          notifyApiError(error);
        } catch {}
        throw error;
      }
    },
    removeMint: async function (url) {
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
    assertMintError: function (response, verbose = true) {
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
    }
  },
})
