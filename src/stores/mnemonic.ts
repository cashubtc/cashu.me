import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import { generateMnemonic, mnemonicToSeedSync } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english";
import { LOCAL_STORAGE_KEYS } from "src/constants/localStorageKeys";

export const useMnemonicStore = defineStore("mnemonic", {
  state: () => ({
    mnemonic: useLocalStorage<string>(LOCAL_STORAGE_KEYS.CASHU_MNEMONIC, ""),
    oldMnemonicCounters: useLocalStorage<
      { mnemonic: string; keysetCounters: any[] }[]
    >(LOCAL_STORAGE_KEYS.CASHU_OLDMNEMONICCOUNTERS, []),
  }),
  getters: {
    seed(state): Uint8Array {
      return mnemonicToSeedSync(state.mnemonic);
    },
  },
  actions: {
    mnemonicToSeedSync(mnemonic: string): Uint8Array {
      return mnemonicToSeedSync(mnemonic);
    },
    initializeMnemonic() {
      if (this.mnemonic === "") {
        this.mnemonic = generateMnemonic(wordlist);
      }
      return this.mnemonic;
    },
    newMnemonic(keysetCounters: any[]) {
      this.oldMnemonicCounters.push({
        mnemonic: this.mnemonic,
        keysetCounters,
      });
      this.mnemonic = generateMnemonic(wordlist);
    },
  },
});
