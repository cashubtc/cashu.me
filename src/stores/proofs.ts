import { defineStore } from "pinia";
import { useMintsStore, WalletProof } from "./mints";
import { Proof, getEncodedToken, getEncodedTokenV4, Token } from "@cashu/cashu-ts";

export const useProofsStore = defineStore("proofs", {
  state: () => ({}),
  actions: {
    sumProofs: function (proofs: Proof[]) {
      const mintStore = useMintsStore();
      const walletProofs = mintStore.proofsToWalletProofs(proofs);
      return walletProofs.reduce((s, t) => (s += t.amount), 0);
    },
    setReserved: function (proofs: Proof[], reserved: boolean = true, quote?: string) {
      const mintStore = useMintsStore();
      const walletProofs = mintStore.proofsToWalletProofs(proofs);
      // unset quote if we unset reserved
      let proofQuote: string | undefined;
      if (reserved && quote) {
        proofQuote = quote;
      } else {
        proofQuote = undefined;
      }
      walletProofs.forEach((p) => {
        mintStore.proofs
          .filter((pr) => pr.secret === p.secret)
          .forEach((pr) => {
            pr.reserved = reserved;
            pr.quote = proofQuote;
          });
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
