import { defineStore } from "pinia";
import { useMintsStore, WalletProof } from "./mints";
import { Proof } from "@cashu/cashu-ts";

export const useProofsStore = defineStore("proofs", {
  state: () => ({}),
  actions: {
    sumProofs: function (proofs: Proof[]) {
      const mintStore = useMintsStore();
      const walletProofs = mintStore.proofsToWalletProofs(proofs);
      return walletProofs.reduce((s, t) => (s += t.amount), 0);
    },
    setReserved: function (proofs: Proof[], reserved: boolean = true) {
      const mintStore = useMintsStore();
      const walletProofs = mintStore.proofsToWalletProofs(proofs);
      walletProofs.forEach((p) => (p.reserved = reserved));
    },
    getUnreservedProofs: function (proofs: WalletProof[]) {
      return proofs.filter((p) => !p.reserved);
    },
    serializeProofs: function (proofs: Proof[]) {
      const mintStore = useMintsStore();
      // unique keyset IDs of proofs
      let uniqueIds = [...new Set(proofs.map((p) => p.id))];
      // mints that have any of the keyset.id
      let mints_keysets = mintStore.mints.filter((m) =>
        m.keysets.some((k) => uniqueIds.includes(k.id))
      );
      // what we put into the JSON
      let mints = mints_keysets.map((m) => [{ url: m.url, ids: m.keysets }][0]);
      let tokenV3 = {
        token: [{ proofs: proofs, mint: mints[0].url }],
      };
      return "cashuA" + btoa(JSON.stringify(tokenV3));
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
