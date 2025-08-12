import { defineStore } from "pinia";
import type { NdkBootError } from "boot/ndk";

export const useBootErrorStore = defineStore("bootError", {
  state: () => ({
    error: null as NdkBootError | null,
  }),
  actions: {
    set(error: NdkBootError) {
      this.error = error;
    },
    clear() {
      this.error = null;
    },
  },
});
