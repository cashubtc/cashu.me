import { defineStore } from "pinia";
import NDK, { NDKEvent, NDKNip07Signer, NDKNip46Signer, NDKFilter, NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import { connected } from "process";
import { min } from "underscore";
import { useLocalStorage } from "@vueuse/core";
import { generateSecretKey, getPublicKey } from 'nostr-tools/pure'
import { bytesToHex, hexToBytes } from '@noble/hashes/utils' // already an installed dependency

type P2PKKey = {
  publicKey: string,
  privateKey: string,
  used: boolean,
  usedCount: number
}

export const useP2PKStore = defineStore("p2pk", {
  state: () => ({
    p2pkKeys: useLocalStorage<P2PKKey[]>("cashu.P2PKKeys", []),
    showP2PKDialog: false,
    showP2PKData: {} as P2PKKey
  }),
  getters: {

  },
  actions: {
    haveThisKey: function (key: string) {
      return (
        this.p2pkKeys.filter((m) => m.publicKey == key).length > 0
      );
    },
    showKeyDetails: function (key: string) {
      const thisKeys = this.p2pkKeys.filter((k) => k.publicKey == key)
      if (thisKeys.length) {
        this.showP2PKData = thisKeys[0];
        this.showP2PKDialog = true;
      }
    },
    generateKeypair: function () {
      let sk = generateSecretKey() // `sk` is a Uint8Array
      let pk = "02" + getPublicKey(sk) // `pk` is a hex string
      let skHex = bytesToHex(sk)
      const keyPair: P2PKKey = {
        publicKey: pk,
        privateKey: skHex,
        used: false,
        usedCount: 0
      }
      this.p2pkKeys = this.p2pkKeys.concat(keyPair)
    }
  },
});
