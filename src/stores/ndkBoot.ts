import { defineStore } from "pinia";
import { getNdk, NdkBootError } from "boot/ndk";

export type NdkBootState = {
  error: NdkBootError | null;
};

export const useNdkBootStore = defineStore("ndkBoot", {
  state: (): NdkBootState => ({
    error: null,
  }),
  actions: {
    setError(err: NdkBootError | null) {
      this.error = err;
    },
    async retry() {
      try {
        await getNdk();
        this.error = null;
      } catch (e) {
        this.error =
          e instanceof NdkBootError
            ? e
            : new NdkBootError("unknown", (e as any)?.message);
        throw e;
      }
    },
  },
});
