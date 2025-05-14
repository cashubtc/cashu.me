import { defineStore } from "pinia";

export const useSettingsStore = defineStore("settings", {
  state: () => ({
    savageMode: false,
  }),
  actions: {
    toggleSavageMode() {
      this.savageMode = !this.savageMode;
    },
    setSavageMode(value) {
      this.savageMode = value;
    },
  },
});
