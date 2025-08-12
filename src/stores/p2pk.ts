import { debug } from "src/js/logger";
import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import { LOCAL_STORAGE_KEYS } from "src/constants/localStorageKeys";
import { generateSecretKey, getPublicKey, nip19 } from "nostr-tools";
import { ensureCompressed } from "src/utils/ecash";
import { bytesToHex, randomBytes } from "@noble/hashes/utils";
import { sha256 } from "@noble/hashes/sha256";
import type { WalletProof } from "src/types/proofs";
import tokenUtil from "src/js/token";
import { useWalletStore } from "./wallet";
import { useProofsStore } from "./proofs";
import { useMintsStore } from "./mints";
import { useTokensStore } from "./tokens";
import { useSendTokensStore } from "./sendTokensStore";
import { useBucketsStore } from "./buckets";
import { DEFAULT_BUCKET_ID } from "@/constants/buckets";
import { useLockedTokensStore } from "./lockedTokens";
import { useSignerStore } from "./signer";
import { notifyApiError, notifyError } from "src/js/notify";
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
  intervalSec = 30 * 24 * 3600 // 30 days
): Promise<{ proofs: WalletProof[]; tokenStrings: string[] }> {
  if (count <= 0) throw new Error("count must be > 0");
  const unitAmount = Math.round(totalAmount / count);
  const amounts = Array(count).fill(unitAmount);

  return (wallet as any).split(amounts, {
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
    p2pkKeys: useLocalStorage<P2PKKey[]>(LOCAL_STORAGE_KEYS.CASHU_P2PKKEYS, []),
    showP2PkButtonInDrawer: useLocalStorage<boolean>(
      LOCAL_STORAGE_KEYS.CASHU_P2PK_SHOWP2PKBUTTONINDRAWER,
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
    isValidPubkey: function (key: string) {
      if (!key) return false;
      try {
        if (key.startsWith("npub1")) {
          const { type, data } = nip19.decode(key);
          if (type === "npub") key = data as string;
        }
        const COMPRESSED_RE = /^(02|03)[0-9a-f]{64}$/i;
        return COMPRESSED_RE.test(ensureCompressed(key));
      } catch (e) {
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
      let pk = ensureCompressed(getPublicKey(sk));
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
      let pk = ensureCompressed(getPublicKey(sk));
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
    } {
      try {
        let secretObject = JSON.parse(secret);
        if (secretObject[0] != "P2PK" || secretObject[1]["data"] == undefined) {
          debug("not p2pk locked");
          return { pubkey: "", locktime: undefined }; // not p2pk locked
        }
        // Get all the p2pk secret data
        const now = Math.floor(Date.now() / 1000); // unix TS
        const { data, tags } = secretObject[1];
        const mainKey = ensureCompressed(data);
        const locktimeTag = tags && tags.find((tag) => tag[0] === "locktime");
        const locktime = locktimeTag ? parseInt(locktimeTag[1], 10) : undefined; // Permanent lock if not set
        const pubkeysTag = tags && tags.find((tag) => tag[0] === "pubkeys");
        const pubkeys =
          pubkeysTag && pubkeysTag.length > 1
            ? pubkeysTag.slice(1).map((k: string) => ensureCompressed(k))
            : [];
        const n_sigsTag = tags && tags.find((tag) => tag[0] === "n_sigs");
        const n_sigs = n_sigsTag ? parseInt(n_sigsTag[1], 10) : undefined;
        // If locktime is in the future, return first owned additional 'pubkeys'
        // match if multisig ('n_sigs'), otherwise return the main key ('data')
        if (locktime > now) {
          debug("p2pk token - locktime is active");
          if (n_sigs && n_sigs >= 1) {
            for (const pk of pubkeys) {
              if (this.haveThisKey(pk)) return { pubkey: pk, locktime };
            }
          }
          return { pubkey: mainKey, locktime };
        }
        // If locktime expired, return main key
        debug("p2pk token - lock has expired");
      } catch {}
      return { pubkey: "", locktime: undefined }; // Token is not locked / secret is not P2PK
    },
    getSecretP2PKPubkey: function (secret: string): string {
      if (typeof secret !== "string" || secret.trim() === "") {
        console.error("Invalid or empty secret provided. Cannot parse.");
        return "";
      }

      const trimmedSecret = secret.trim();

      if (trimmedSecret.startsWith("P2PK:")) {
        const key = trimmedSecret.slice("P2PK:".length);
        return this.isValidPubkey(key) ? key : "";
      }

      // Non JSON strings are interpreted as raw pubkeys
      if (!trimmedSecret.startsWith("{") && !trimmedSecret.startsWith("[")) {
        return this.isValidPubkey(trimmedSecret) ? trimmedSecret : "";
      }

      try {
        const secretObject = JSON.parse(trimmedSecret);

        // handle HTLC style tokens created via createP2PKHTLC
        if (!Array.isArray(secretObject) && secretObject.receiverP2PK) {
          const pk = ensureCompressed(secretObject.receiverP2PK);
          return this.isValidPubkey(pk) ? pk : "";
        }

        if (
          !Array.isArray(secretObject) ||
          secretObject[0] !== "P2PK" ||
          !secretObject[1]?.data
        ) {
          console.error("Secret is not a valid P2PK format.");
          return "";
        }

        const { data, tags } = secretObject[1];
        const now = Math.floor(Date.now() / 1000);

        const locktimeTag = tags?.find((tag: any) => tag[0] === "locktime");
        const locktime = locktimeTag ? parseInt(locktimeTag[1], 10) : Infinity;

        const pk = ensureCompressed(data);

        if (locktime > now) {
          return this.isValidPubkey(pk) ? pk : "";
        }

        return this.isValidPubkey(pk) ? pk : "";
      } catch (e) {
        console.error(
          "Failed to parse P2PK secret JSON:",
          e,
          "Secret was:",
          trimmedSecret
        );
        return "";
      }
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
    isPureP2PK: function (proofs: WalletProof[]) {
      const secrets = proofs.map((p) => p.secret);
      for (const secret of secrets) {
        try {
          const obj = JSON.parse(secret);
          if (!Array.isArray(obj)) continue;
          if (obj[0] !== "P2PK") continue;
          // ignore HTLC style objects
          if (
            obj[1] &&
            typeof obj[1] === "object" &&
            "receiverP2PK" in obj[1]
          ) {
            continue;
          }
          return true;
        } catch {}
      }
      return false;
    },
    isHTLC: function (proofs: WalletProof[]) {
      const secrets = proofs.map((p) => p.secret);
      for (const secret of secrets) {
        try {
          const obj = JSON.parse(secret);
          if (!Array.isArray(obj) && obj.receiverP2PK) {
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
    getTokenPubkey: function (encodedToken: string): string | undefined {
      const decodedToken = tokenUtil.decode(encodedToken);
      if (!decodedToken) {
        return undefined;
      }
      const proofs = tokenUtil.getProofs(decodedToken);
      for (const p of proofs) {
        const { pubkey } = this.getSecretP2PKInfo(p.secret);
        if (pubkey) return pubkey;
      }
      return undefined;
    },
    getPrivateKeyForP2PKEncodedToken: function (encodedToken: string): string {
      const decodedToken = tokenUtil.decode(encodedToken);
      if (!decodedToken) {
        return "";
      }
      const proofs = tokenUtil.getProofs(decodedToken);
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
    getTokenLocktime: function (encodedToken: string): number | undefined {
      const decodedToken = tokenUtil.decode(encodedToken);
      if (!decodedToken) {
        return undefined;
      }
      const proofs = tokenUtil.getProofs(decodedToken);
      const times = proofs
        .map((p) => this.getSecretP2PKInfo(p.secret).locktime)
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

      const decoded = tokenUtil.decode(encodedToken);
      if (!decoded) {
        throw new Error("Invalid token");
      }

      const mintUrl = tokenUtil.getMint(decoded);
      const unit = tokenUtil.getUnit(decoded);

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
        description: (entry as any)?.description ?? "",
        bucketId,
      });
    },
    async sendToLock(amount: number, receiverPubkey: string, locktime: number) {
      const mintStore = useMintsStore();
      const walletStore = useWalletStore();
      const wallet = walletStore.wallet;
      const sendTokensStore = useSendTokensStore();
      const bucketId = sendTokensStore.sendData.bucketId || DEFAULT_BUCKET_ID;
      const proofs = mintStore.activeProofs.filter(
        (p) => p.bucketId === bucketId
      );
      const info = mintStore.activeInfo || {};
      const nuts = Array.isArray((info as any).nut_supports)
        ? (info as any).nut_supports
        : Object.keys((info as any).nuts || {}).map((n) => Number(n));
      if (!(nuts.includes(10) && nuts.includes(11))) {
        notifyError(walletStore.t("wallet.notifications.lock_not_supported"));
        throw new Error("Mint does not support timelocks or P2PK");
      }
      const spendableProofs = walletStore.spendableProofs(proofs, amount);
      const proofsToSend = walletStore.coinSelect(
        spendableProofs,
        wallet,
        amount,
        true,
        bucketId
      );
      const keysetId = walletStore.getKeyset(wallet.mint.mintUrl, wallet.unit);
      let keepProofs: any[] = [];
      let sendProofs: any[] = [];
      const proofsStore = useProofsStore();
      try {
        ({ keep: keepProofs, send: sendProofs } = await wallet.send(
          amount,
          proofsToSend,
          {
            keysetId,
            p2pk: { pubkey: ensureCompressed(receiverPubkey), locktime },
          }
        ));
        await proofsStore.removeProofs(proofsToSend);
        const bucketsStore = useBucketsStore();
        const tokenStr = useProofsStore().serializeProofs(sendProofs);
        const locked = useLockedTokensStore().addLockedToken({
          amount,
          tokenString: tokenStr,

          token: tokenStr,
          pubkey: receiverPubkey,
          locktime,
          bucketId: bucketsStore.ensureCreatorBucket(receiverPubkey),
        });
        await proofsStore.addProofs(keepProofs, undefined, bucketId, "");
        useSignerStore().reset();
        return { keepProofs, sendProofs, locked };
      } catch (error: any) {
        console.error(error);
        if (error.message && error.message.includes("Token already spent")) {
          notifyError(
            "Selected proofs have already been spent. Correcting local state.",
            "Balance Out of Sync"
          );
          await walletStore.reconcileSpentProofs(proofsToSend);
        } else {
          notifyApiError(error, "Payment failed");
        }
        walletStore.handleOutputsHaveAlreadyBeenSignedError(keysetId, error);
        throw error;
      }
    },
  },
});

// Disabled because buildTimedOutputs is already exported above.
// export { buildTimedOutputs };
