import { defineStore } from 'pinia'

export const useWorkersStore = defineStore('workers', {
  state: () => {
    return {
      invoiceCheckListener: () => {},
      tokensCheckSpendableListener: () => {},
    }
  },
  getters: {},
  actions: {
    clearAllWorkers: function () {
      if (this.invoiceCheckListener) {
        clearInterval(this.invoiceCheckListener);
      }
      if (this.tokensCheckSpendableListener) {
        clearInterval(this.tokensCheckSpendableListener);
      }
    }
  }
})
