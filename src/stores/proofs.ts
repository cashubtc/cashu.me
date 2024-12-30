import { defineStore } from "pinia";
import { useMintsStore, WalletProof } from "./mints";
import { useDexieStore } from "./dexie";
import {
  Proof,
  getEncodedToken,
  getEncodedTokenV4,
  Token,
} from "@cashu/cashu-ts";
const dexieStore = useDexieStore();

export const useProofsStore = defineStore("proofs", {
  state: () => ({}),
  actions: {
    sumProofs: function (proofs: Proof[]) {
      return proofs.reduce((s, t) => (s += t.amount), 0);
    },
    setReserved: async function (
      proofs: Proof[],
      reserved: boolean = true,
      quote?: string
    ) {
      const setQuote: string | undefined = reserved ? quote : undefined;
      await dexieStore.db.transaction("rw", dexieStore.db.proofs, () => {
        for (const proof of proofs) {
          dexieStore.db.proofs
            .where("secret")
            .equals(proof.secret)
            .modify((pr) => {
              pr.reserved = reserved;
              pr.quote = setQuote;
            });
        }
      });
    },
    proofsToWalletProofs(proofs: Proof[], quote?: string): WalletProof[] {
      return proofs.map((p) => {
        return {
          ...p,
          reserved: false,
          quote: quote,
        } as WalletProof;
      });
    },
    async addProofs(proofs: Proof[], quote?: string) {
      const walletProofs = this.proofsToWalletProofs(proofs);
      const proofsTable = dexieStore.db.proofs;
      walletProofs.forEach((p) => {
        proofsTable.add(p);
      }
      );
    },
    async removeProofs(proofs: Proof[]) {
      const walletProofs = this.proofsToWalletProofs(proofs);
      const proofsTable = dexieStore.db.proofs;
      walletProofs.forEach((p) => {
        proofsTable.delete(p.secret);
      }
      );
    },
    getUnreservedProofs: function (proofs: WalletProof[]) {
      return proofs.filter((p) => !p.reserved);
    },
    serializeProofs: function (proofs: Proof[]): string {
      const mintStore = useMintsStore();
      // unique keyset IDs of proofs
      let uniqueIds = [...new Set(proofs.map((p) => p.id))];
      // keysets with these uniqueIds
      let keysets = mintStore.mints.flatMap((m) =>
        m.keysets.filter((k) => uniqueIds.includes(k.id))
      );
      if (keysets.length === 0) {
        throw new Error("No keysets found for proofs");
      }
      // mints that have any of the keyset.id
      let mints = mintStore.mints.filter((m) =>
        m.keysets.some((k) => uniqueIds.includes(k.id))
      );
      if (mints.length === 0) {
        throw new Error("No mints found for proofs");
      }
      // unit of keysets
      let unit = keysets[0].unit;
      const token = {
        mint: mints[0].url,
        proofs: proofs,
        unit: unit,
      } as Token;
      try {
        return getEncodedTokenV4(token);
      } catch (e) {
        console.log("Could not encode TokenV4, defaulting to TokenV3", e);
        return getEncodedToken(token);
      }

      // // what we put into the JSON
      // let mintsJson = mints.map((m) => [{ url: m.url, ids: m.keysets }][0]);
      // let tokenV3 = {
      //   token: [{ proofs: proofs, mint: mintsJson[0].url }],
      //   unit: unit,
      // };
      // return "cashuA" + btoa(JSON.stringify(tokenV3));
    },
    getProofsMint: function (proofs: WalletProof[]) {
      const mintStore = useMintsStore();
      // unique keyset IDs of proofs
      let uniqueIds = [...new Set(proofs.map((p) => p.id))];
      // mints that have any of the keyset IDs
      let mints_keysets = mintStore.mints.filter((m) =>
        m.keysets.some((k) => uniqueIds.includes(k.id))
      );
      // what we put into the JSON
      let mints = mints_keysets.map((m) => [{ url: m.url, ids: m.keysets }][0]);
      return mints[0];
    },
  },
});
