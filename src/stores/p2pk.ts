import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import { generateSecretKey, getPublicKey } from "nostr-tools";
import { bytesToHex } from "@noble/hashes/utils"; // already an installed dependency
import { WalletProof } from "stores/mints";
import token from "src/js/token";

type P2PKKey = {
  publicKey: string;
  privateKey: string;
  used: boolean;
  usedCount: number;
};

export const useP2PKStore = defineStore("p2pk", {
  state: () => ({
    p2pkKeys: useLocalStorage<P2PKKey[]>("cashu.P2PKKeys", []),
    showP2PKDialog: false,
    showP2PKData: {} as P2PKKey,
  }),
  getters: {},
  actions: {
    haveThisKey: function (key: string) {
      return this.p2pkKeys.filter((m) => m.publicKey == key).length > 0;
    },
    isValidPubkey: function (key: string) {
      return key && key.length == 66;
    },
    setPrivateKeyUsed: function (key: string) {
      const thisKeys = this.p2pkKeys.filter((k) => k.privateKey == key);
      if (thisKeys.length) {
        thisKeys[0].used = true;
        thisKeys[0].usedCount += 1;
      }
    },
    showKeyDetails: function (key: string) {
      const thisKeys = this.p2pkKeys.filter((k) => k.publicKey == key);
      if (thisKeys.length) {
        this.showP2PKData = JSON.parse(JSON.stringify(thisKeys[0]));
        this.showP2PKDialog = true;
      }
    },
    showLastKey: function () {
      if (this.p2pkKeys.length) {
        this.showP2PKData = JSON.parse(
          JSON.stringify(this.p2pkKeys[this.p2pkKeys.length - 1])
        );
        this.showP2PKDialog = true;
      }
    },
    generateKeypair: function () {
      let sk = generateSecretKey(); // `sk` is a Uint8Array
      let pk = "02" + getPublicKey(sk); // `pk` is a hex string
      let skHex = bytesToHex(sk);
      const keyPair: P2PKKey = {
        publicKey: pk,
        privateKey: skHex,
        used: false,
        usedCount: 0,
      };
      this.p2pkKeys = this.p2pkKeys.concat(keyPair);
    },
    getSecretP2PKPubkey: function (secret: string) {
      try {
        let secretObject = JSON.parse(secret);
        if (secretObject[0] == "P2PK" && secretObject[1]["data"] != undefined) {
          return secretObject[1]["data"];
        }
      } catch {}
      return "";
    },
    isLocked: function (proofs: WalletProof[]) {
      const secrets = proofs.map((p) => p.secret);
      for (const secret of secrets) {
        try {
          if (this.getSecretP2PKPubkey(secret)) {
            return true;
          }
        } catch {}
      }
      return false;
    },
    isLockedToUs: function (proofs: WalletProof[]) {
      const secrets = proofs.map((p) => p.secret);
      for (const secret of secrets) {
        const pubkey = this.getSecretP2PKPubkey(secret);
        if (pubkey) {
          return this.haveThisKey(pubkey);
        }
      }
    },
    getPrivateKeyForP2PKEncodedToken: function (encodedToken: string): string {
      const decodedToken = token.decode(encodedToken);
      if (!decodedToken) {
        return "";
      }
      const proofs = token.getProofs(decodedToken);
      if (!this.isLocked(proofs) || !this.isLockedToUs(proofs)) {
        return "";
      }

      const secrets = proofs.map((p) => p.secret);
      for (const secret of secrets) {
        const pubkey = this.getSecretP2PKPubkey(secret);
        if (pubkey && this.haveThisKey(pubkey)) {
          // NOTE: we assume all tokens are locked to the same key here!
          return this.p2pkKeys.filter((m) => m.publicKey == pubkey)[0]
            .privateKey;
        }
      }
      return "";
    },
  },
});
