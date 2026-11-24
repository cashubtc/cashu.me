import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import { generateSecretKey, getPublicKey, nip19 } from "nostr-tools";
import { bytesToHex } from "@noble/hashes/utils.js"; // already an installed dependency
import { WalletProof } from "stores/mints";
import token from "src/js/token";
import { markRaw } from "vue";
import { cashuDb } from "src/stores/dexie";
import { moveLocalStorageKey } from "src/stores/legacyStorage";
import { createTableMirror, toMirrorRows } from "src/stores/tableMirror";
import {
  Amount,
  verifyP2PKSpendingConditions,
  type Proof,
} from "@cashu/cashu-ts";

/** Moves `cashu.P2PKKeys` into the p2pkKeys table. */
export async function importLegacyP2PKKeys() {
  await moveLocalStorageKey<P2PKKey[]>({
    key: "cashu.P2PKKeys",
    tables: [cashuDb.p2pkKeys],
    write: async (keys) => {
      const valid = (keys || []).filter((key) => key && key.publicKey);
      // keys already in the table keep their stored row
      const existing = await cashuDb.p2pkKeys.bulkGet(
        valid.map((key) => key.publicKey)
      );
      await cashuDb.p2pkKeys.bulkPut(
        toMirrorRows(valid.filter((_key, index) => !existing[index]))
      );
    },
    verify: async (keys) => {
      const valid = (keys || []).filter((key) => key && key.publicKey);
      const stored = await cashuDb.p2pkKeys.bulkGet(
        valid.map((key) => key.publicKey)
      );
      return stored.every(Boolean);
    },
  });
}

export type P2PKKey = {
  publicKey: string;
  privateKey: string;
  used: boolean;
  usedCount: number;
};

// Keys are stored as "02" + x-only nostr keys and NUT-11 signatures are x-only, so match on x.
const xOnly = (key: unknown) =>
  typeof key === "string" && /^0[23][0-9a-f]{64}$/i.test(key)
    ? key.slice(2).toLowerCase()
    : "";
const sameXOnlyKey = (a: unknown, b: unknown) =>
  xOnly(a) !== "" && xOnly(a) === xOnly(b);

// Whether a proof's own witness already meets its P2PK lock.
const witnessSatisfiesLock = (secret: string, witness: Proof["witness"]) => {
  if (!witness) return false;
  try {
    return verifyP2PKSpendingConditions({
      id: "",
      amount: Amount.zero(),
      C: "",
      secret,
      witness,
    }).success;
  } catch {
    return false;
  }
};

export const useP2PKStore = defineStore("p2pk", {
  state: () => {
    // Stored in the p2pkKeys table; loaded by init() at startup.
    const p2pkKeysTable = createTableMirror<P2PKKey>(cashuDb.p2pkKeys, {
      keyOf: (key) => key.publicKey,
    });
    return {
      p2pkKeys: p2pkKeysTable.items,
      p2pkKeysTable: markRaw(p2pkKeysTable),
      showP2PkButtonInDrawer: useLocalStorage<boolean>(
        "cashu.p2pk.showP2PkButtonInDrawer",
        false
      ),
      showP2PKDialog: false,
      showP2PKData: {} as P2PKKey,
    };
  },
  getters: {},
  actions: {
    async init() {
      // Older wallets (and restored old backups) still have cashu.P2PKKeys.
      await importLegacyP2PKKeys();
      await this.p2pkKeysTable.hydrate();
    },
    findKey: function (pubkey: string) {
      return this.p2pkKeys.find((m) => sameXOnlyKey(m.publicKey, pubkey));
    },
    haveThisKey: function (key: string) {
      return !!this.findKey(key);
    },
    maybeConvertNpub: function (key: string) {
      // Check and convert npub to P2PK
      if (key && key.startsWith("npub1")) {
        const { type, data } = nip19.decode(key);
        if (type === "npub" && data.length === 64) {
          key = "02" + data;
        }
      }
      return key;
    },
    isValidPubkey: function (key: string) {
      key = this.maybeConvertNpub(key);
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
    importNsec: async function () {
      const nsec = (await prompt("Enter your nsec")) as string;
      if (!nsec || !nsec.startsWith("nsec1")) {
        console.log("input was not an nsec");
        return;
      }
      const sk = nip19.decode(nsec).data as Uint8Array; // `sk` is a Uint8Array
      const pk = "02" + getPublicKey(sk); // `pk` is a hex string
      const skHex = bytesToHex(sk);
      if (this.haveThisKey(pk)) {
        console.log("nsec already exists in p2pk keystore");
        return;
      }
      const keyPair: P2PKKey = {
        publicKey: pk,
        privateKey: skHex,
        used: false,
        usedCount: 0,
      };
      this.p2pkKeys = this.p2pkKeys.concat(keyPair);
    },
    generateKeypair: function () {
      const sk = generateSecretKey(); // `sk` is a Uint8Array
      const pk = "02" + getPublicKey(sk); // `pk` is a hex string
      const skHex = bytesToHex(sk);
      const keyPair: P2PKKey = {
        publicKey: pk,
        privateKey: skHex,
        used: false,
        usedCount: 0,
      };
      this.p2pkKeys = this.p2pkKeys.concat(keyPair);
    },
    getSecretP2PKPubkey: function (
      secret: string,
      witness?: Proof["witness"]
    ): string {
      try {
        const secretObject = JSON.parse(secret);
        if (secretObject[0] != "P2PK" || secretObject[1]["data"] == undefined) {
          console.log("not p2pk locked");
          return ""; // not p2pk locked
        }
        // Get all the p2pk secret data
        const now = Math.floor(Date.now() / 1000); // unix TS
        const { data, tags } = secretObject[1];
        const locktimeTag = tags && tags.find((tag) => tag[0] === "locktime");
        const locktime = locktimeTag ? parseInt(locktimeTag[1], 10) : Infinity; // Permanent lock if not set
        const refundTag = tags && tags.find((tag) => tag[0] === "refund");
        const refundKeys =
          refundTag && refundTag.length > 1 ? refundTag.slice(1) : [];
        const pubkeysTag = tags && tags.find((tag) => tag[0] === "pubkeys");
        const pubkeys =
          pubkeysTag && pubkeysTag.length > 1 ? pubkeysTag.slice(1) : [];
        const n_sigsTag = tags && tags.find((tag) => tag[0] === "n_sigs");
        const n_sigs = n_sigsTag ? parseInt(n_sigsTag[1], 10) : undefined;
        // First owned additional 'pubkeys' match if multisig ('n_sigs'),
        // otherwise the main key ('data')
        const mainKey = () => {
          if (n_sigs && n_sigs >= 1) {
            for (const pk of pubkeys) {
              if (this.haveThisKey(pk)) return pk;
            }
          }
          return data; // Main lock key (shows locked state)
        };
        if (locktime > now) {
          console.log("p2pk token - locktime is active");
          return mainKey();
        }
        // If locktime expired, return first owned 'refund' key match, then an
        // owned main key (still valid per NUT-11), or just the first refund
        // key to show token is locked
        if (refundKeys.length > 0) {
          console.log("p2pk token - locked to refund keys");
          for (const pk of refundKeys) {
            if (this.haveThisKey(pk)) return pk;
          }
          const main = mainKey();
          return this.haveThisKey(main) &&
            !witnessSatisfiesLock(secret, witness)
            ? main
            : refundKeys[0];
        }
        console.log("p2pk token - lock has expired");
      } catch {}
      return ""; // Token is not locked / secret is not P2PK
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
      for (const proof of proofs) {
        const pubkey = this.getSecretP2PKPubkey(proof.secret, proof.witness);
        if (pubkey) {
          return this.haveThisKey(pubkey);
        }
      }
    },
    getPrivateKeyForP2PKEncodedToken: async function (
      encodedToken: string
    ): Promise<string> {
      const decodedToken = await token.decodeFull(encodedToken);
      if (!decodedToken) {
        return "";
      }
      const proofs = token.getProofs(decodedToken);
      if (!this.isLocked(proofs) || !this.isLockedToUs(proofs)) {
        return "";
      }

      for (const proof of proofs) {
        const pubkey = this.getSecretP2PKPubkey(proof.secret, proof.witness);
        const key = pubkey ? this.findKey(pubkey) : undefined;
        // NOTE: we assume all tokens are locked to the same key here!
        if (key) return key.privateKey;
      }
      return "";
    },
  },
});
