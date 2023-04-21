import { defineStore } from "pinia";

export const useMintsStore = defineStore("mints", {
  state: () => ({
    /** @type {{url: string, balance: number}[]} */
    mints: [],
    /** @type {string | null} */
    activeMint: null,
  }),
  actions: {
    /**
     * Adds a mint to the store
     * @param {string} url
     * @param {number} balance
     */
    addMint(url, balance) {
      this.mints.push({ url, balance });
    },
    /**
     * Sets the mints in the store
     * @param {{url: string, balance: number}[]} mints
     */
    setMints(mints) {
      this.mints = mints;
    },
    /**
     * Removes a mint from the store
     * @param {string} url
     */
    removeMint(url) {
      this.mints = this.mints.filter((mint) => mint.url !== url);
    },
  },
});
