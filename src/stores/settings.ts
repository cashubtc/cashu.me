import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";

export const useSettingsStore = defineStore("settings", {
  state: () => {
    return {
      getBitcoinPrice: useLocalStorage<boolean>("cashu.settings.getBitcoinPrice", false),
      checkSentTokens: useLocalStorage<boolean>("cashu.settings.checkSentTokens", true),
    }
  }
});
