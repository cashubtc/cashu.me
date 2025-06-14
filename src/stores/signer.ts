import { defineStore } from "pinia";

export type SignerMethod = "local" | "nip07" | "nip46" | null;

export const useSignerStore = defineStore("signer", {
  state: () => ({
    method: null as SignerMethod,
    nsec: "",
  }),
  actions: {
    reset() {
      this.method = null;
      this.nsec = "";
    },
  },
});
