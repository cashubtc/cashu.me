import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";

const defaultNostrRelays = [
  "wss://relay.primal.net",
  "wss://relay.damus.io",
  "wss://relay.8333.space/",
  "wss://nos.lol",
];

export const useSettingsStore = defineStore("settings", {
  state: () => {
    return {
      getBitcoinPrice: useLocalStorage<boolean>(
        "cashu.settings.getBitcoinPrice",
        false
      ),
      checkSentTokens: useLocalStorage<boolean>(
        "cashu.settings.checkSentTokens",
        true
      ),
      defaultNostrRelays: useLocalStorage<string[]>(
        "cashu.settings.defaultNostrRelays",
        defaultNostrRelays
      ),
    };
  },
});
