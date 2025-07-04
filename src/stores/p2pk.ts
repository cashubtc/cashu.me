import { debug } from "src/js/logger";
import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import { generateSecretKey, getPublicKey, nip19 } from "nostr-tools";
import { ensureCompressed } from "src/utils/ecash";
import { bytesToHex } from "@noble/hashes/utils";
import { WalletProof } from "stores/mints";
import token from "src/js/token";
import { useWalletStore } from "./wallet";
import { useProofsStore } from "./proofs";
import { useMintsStore } from "./mints";
import { useTokensStore } from "./tokens";
import { DEFAULT_BUCKET_ID } from "./buckets";
import { cashuDb } from "./dexie";
import { maybeRepublishNutzapProfile } from "./creatorHub";

/** Return `{ pub, priv }` where `pub` is SEC-compressed hex. */
export function generateP2pkKeyPair(): { pub: string; priv: string } {
  const priv = generateSecretKey();
  const privHex = bytesToHex(priv);
  const pubHex = ensureCompressed(getPublicKey(priv));
  return { pub: pubHex, priv: privHex };
}

type P2PKKey = {
  publicKey: string;
  privateKey: string;
  used: boolean;
  usedCount: number;
};

//--------------------------------------------------------------------------
// NEW  helper: buildTimedOutputs()
//--------------------------------------------------------------------------
import { CashuWallet } from "@cashu/cashu-ts";

/**
 * Split `totalAmount` into `count` equal Cashu outputs.
 * Each output is locked to `creatorPk` and—except index 0—has a unix
 * "locktime" tag set to `startTime + idx*interval`.
 *
 * Returns `{ proofs, tokenStrings }`.
 */
export async function buildTimedOutputs(
  wallet: CashuWallet,
  totalAmount: number,
  count: number,
  creatorPk: string,
  startTimeSec: number,
  intervalSec = 30 * 24 * 3600, // 30 days
): Promise<{ proofs: WalletProof[]; tokenStrings: string[] }> {
  if (count <= 0) throw new Error("count must be > 0");
  const unitAmount = Math.round(totalAmount / count);
  const amounts = Array(count).fill(unitAmount);

  return wallet.split(amounts, {
    buildSecret: (idx) => {
      const locktime = idx === 0 ? 0 : startTimeSec + idx * intervalSec;
      const secretObj: any[] = [
        "P2PK",
        {
          data: creatorPk,
          nonce: crypto.randomUUID(),
          tags: locktime ? [["locktime", String(locktime)]] : [],
        },
      ];
      return JSON.stringify(secretObj);
    },
  });
}

export const useP2PKStore = defineStore("p2pk", {
  state: () => ({
    p2pkKeys: useLocalStorage<P2PKKey[]>("cashu.P2PKKeys", []),
    showP2PkButtonInDrawer: useLocalStorage<boolean>(
      "cashu.p2pk.showP2PkButtonInDrawer",
      false
    ),
    showP2PKDialog: false,
    showP2PKData: {} as P2PKKey,
  }),
  getters: {
    firstKey: (state) => state.p2pkKeys[0] || null,
  },
  actions: {
    haveThisKey: function (key: string) {
      return this.p2pkKeys.filter((m) => m.publicKey == key).length > 0;
    },
    maybeConvertNpub: function (key: string) {
      // Check and convert npub to P2PK.
      // Always normalise with ensureCompressed() before use.
      if (key && key.startsWith("npub1")) {
        const { type, data } = nip19.decode(key);
        if (type === "npub" && data.length === 64) {
          key = "02" + data;
        }
      }
      return ensureCompressed(key);
    },
    isValidPubkey: function (key: string) {
      try {
        return this.maybeConvertNpub(key).length === 66;
      } catch {
        return false;
      }
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
        debug("input was not an nsec");
        return;
      }
      let sk = nip19.decode(nsec).data as Uint8Array; // `sk` is a Uint8Array
      // ensureCompressed() so future code can't bypass compression checks
      let pk = ensureCompressed("02" + getPublicKey(sk));
      let skHex = bytesToHex(sk);
      if (this.haveThisKey(pk)) {
        debug("nsec already exists in p2pk keystore");
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
      let sk = generateSecretKey(); // `sk` is a Uint8Array
      // ensureCompressed() so future code can't bypass compression checks
      let pk = ensureCompressed("02" + getPublicKey(sk));
      let skHex = bytesToHex(sk);
      const keyPair: P2PKKey = {
        publicKey: pk,
        privateKey: skHex,
        used: false,
        usedCount: 0,
      };
      this.p2pkKeys = this.p2pkKeys.concat(keyPair);
    },
    async createAndSelectNewKey() {
      const { pub, priv } = generateP2pkKeyPair();
      this.p2pkKeys.unshift({
        publicKey: pub,
        privateKey: priv,
        used: false,
        usedCount: 0,
      });
    },
    getSecretP2PKInfo: function (secret: string): {
      pubkey: string;
      locktime?: number;
      refundKeys: string[];
    } {
      try {
        let secretObject = JSON.parse(secret);
        if (secretObject[0] != "P2PK" || secretObject[1]["data"] == undefined) {
          debug("not p2pk locked");
          return { pubkey: "", locktime: undefined, refundKeys: [] }; // not p2pk locked
        }
        // Get all the p2pk secret data
        const now = Math.floor(Date.now() / 1000); // unix TS
        const { data, tags } = secretObject[1];
        let mainKey: string;
        try {
          mainKey = ensureCompressed(data);
        } catch {
          mainKey = data;
        }
        const locktimeTag = tags && tags.find((tag) => tag[0] === "locktime");
        const locktime = locktimeTag ? parseInt(locktimeTag[1], 10) : undefined; // Permanent lock if not set
        const refundTag = tags && tags.find((tag) => tag[0] === "refund");
        const refundKeys =
          refundTag && refundTag.length > 1
            ? refundTag.slice(1).map((k: string) => {
                try {
                  return ensureCompressed(k);
                } catch {
                  return k;
                }
              })
            : [];
        const pubkeysTag = tags && tags.find((tag) => tag[0] === "pubkeys");
        const pubkeys =
          pubkeysTag && pubkeysTag.length > 1
            ? pubkeysTag.slice(1).map((k: string) => {
                try {
                  return ensureCompressed(k);
                } catch {
                  return k;
                }
              })
            : [];
        const n_sigsTag = tags && tags.find((tag) => tag[0] === "n_sigs");
        const n_sigs = n_sigsTag ? parseInt(n_sigsTag[1], 10) : undefined;
        // If locktime is in the future, return first owned additional 'pubkeys'
        // match if multisig ('n_sigs'), otherwise return the main key ('data')
        if (locktime > now) {
          debug("p2pk token - locktime is active");
          if (n_sigs && n_sigs >= 1) {
            for (const pk of pubkeys) {
              if (this.haveThisKey(pk))
                return { pubkey: pk, locktime, refundKeys };
            }
          }
          return { pubkey: mainKey, locktime, refundKeys };
        }
        // If locktime expired, return first owned 'refund' key match or
        // or just return the first refund key to show token is locked
        if (refundKeys.length > 0) {
          debug("p2pk token - locked to refund keys");
          for (const pk of refundKeys) {
            if (this.haveThisKey(pk))
              return { pubkey: pk, locktime, refundKeys };
          }
          return { pubkey: refundKeys[0], locktime, refundKeys };
        }
        debug("p2pk token - lock has expired");
      } catch {}
      return { pubkey: "", locktime: undefined, refundKeys: [] }; // Token is not locked / secret is not P2PK
    },
    getSecretP2PKPubkey: function (secret: string): {
      pubkey: string;
      locktime?: number;
    } {
      const { pubkey, locktime } = this.getSecretP2PKInfo(secret);
      return { pubkey, locktime };
    },
    isLocked: function (proofs: WalletProof[]) {
      const secrets = proofs.map((p) => p.secret);
      for (const secret of secrets) {
        try {
          if (this.getSecretP2PKPubkey(secret).pubkey) {
            return true;
          }
        } catch {}
      }
      return false;
    },
    isLockedToUs: function (proofs: WalletProof[]) {
      const secrets = proofs.map((p) => p.secret);
      for (const secret of secrets) {
        const { pubkey } = this.getSecretP2PKPubkey(secret);
        if (pubkey) {
          return this.haveThisKey(pubkey);
        }
      }
    },
    getTokenPubkey: function (encodedToken: string): string | undefined {
      const decodedToken = token.decode(encodedToken);
      if (!decodedToken) {
        return undefined;
      }
      const proofs = token.getProofs(decodedToken);
      for (const p of proofs) {
        const { pubkey } = this.getSecretP2PKInfo(p.secret);
        if (pubkey) return pubkey;
      }
      return undefined;
    },
    getTokenRefundPubkey: function (encodedToken: string): string | undefined {
      const decodedToken = token.decode(encodedToken);
      if (!decodedToken) {
        return undefined;
      }
      const proofs = token.getProofs(decodedToken);
      for (const p of proofs) {
        const { refundKeys } = this.getSecretP2PKInfo(p.secret);
        if (refundKeys.length) return refundKeys[0];
      }
      return undefined;
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
        const { pubkey } = this.getSecretP2PKPubkey(secret);
        if (pubkey && this.haveThisKey(pubkey)) {
          // NOTE: we assume all tokens are locked to the same key here!
          return this.p2pkKeys.filter((m) => m.publicKey == pubkey)[0]
            .privateKey;
        }
      }
      return "";
    },
    getTokenLocktime: function (encodedToken: string): number | undefined {
      const decodedToken = token.decode(encodedToken);
      if (!decodedToken) {
        return undefined;
      }
      const proofs = token.getProofs(decodedToken);
      const times = proofs
        .map((p) => this.getSecretP2PKPubkey(p.secret).locktime)
        .filter((t) => t !== undefined) as number[];
      if (!times.length) {
        return undefined;
      }
      return Math.max(...times);
    },
    claimLockedToken: async function (encodedToken: string) {
      const walletStore = useWalletStore();
      const proofsStore = useProofsStore();
      const mintsStore = useMintsStore();
      const tokensStore = useTokensStore();

      const decoded = token.decode(encodedToken);
      if (!decoded) {
        throw new Error("Invalid token");
      }

      const mintUrl = token.getMint(decoded);
      const unit = token.getUnit(decoded);

      if (!mintsStore.mints.find((m) => m.url === mintUrl)) {
        await mintsStore.addMint({ url: mintUrl });
      }

      const mint = mintsStore.mints.find((m) => m.url === mintUrl);
      if (!mint) {
        throw new Error("mint not found");
      }

      const wallet = walletStore.mintWallet(mintUrl, unit);

      const keysetId = walletStore.getKeyset(mintUrl, unit);
      const counter = walletStore.keysetCounter(keysetId);

      const entry = await cashuDb.lockedTokens
        .where("tokenString")
        .equals(encodedToken)
        .first();
      const bucketId = entry?.tierId ?? DEFAULT_BUCKET_ID;
      const label = entry?.label ?? "";

      const p2pkPriv = this.getPrivateKeyForP2PKEncodedToken(encodedToken);
      if (!p2pkPriv) {
        throw new Error("no P2PK private key found for locked token");
      }

      const receivedProofs = await wallet.receive(encodedToken, {
        counter,
        privkey: p2pkPriv,
        proofsWeHave: mintsStore.mintUnitProofs(mint, unit),
      });

      await proofsStore.addProofs(receivedProofs, undefined, bucketId, label);
      walletStore.increaseKeysetCounter(keysetId, receivedProofs.length);

      tokensStore.addPaidToken({
        amount: receivedProofs.reduce((s, p) => s + p.amount, 0),
        token: encodedToken,
        mint: mintUrl,
        unit,
        label,
        bucketId,
      });
    },
  },
});

// Disabled because buildTimedOutputs is already exported above.
// export { buildTimedOutputs };
