import { defineStore } from "pinia";
import { useNutzapStore } from "./nutzap";
import { useMessengerStore } from "./messenger";

export const useNutzapSendWorker = defineStore("nutzapSendWorker", {
  state: () => ({
    interval: 5000,
    worker: null as NodeJS.Timeout | null,
  }),
  actions: {
    start() {
      if (this.worker) return;
      this.worker = setInterval(() => this.process(), this.interval);
      this.process();
    },
    stop() {
      if (this.worker) {
        clearInterval(this.worker);
        this.worker = null;
      }
    },
    async process() {
      const messenger = useMessengerStore();
      const nutzap = useNutzapStore();
      if (!messenger.isConnected() || !nutzap.sendQueue.length) return;
      await nutzap.retryQueuedSends();
    },
  },
});
