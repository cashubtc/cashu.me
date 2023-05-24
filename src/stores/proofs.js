import { defineStore } from "pinia";
import { useMintsStore } from "./mints";
export const useProofsStore = defineStore("proofs", {
  state: () => ({}),
  actions: {
    sumProofs: function (proofs) {
      return proofs.reduce((s, t) => (s += t.amount), 0);
    },

    deleteProofs: function (proofs) {
      const mintStore = useMintsStore();
      const usedSecrets = proofs.map((p) => p.secret);
      mintStore.setProofs(
        mintStore.proofs.filter((p) => !usedSecrets.includes(p.secret))
      );
      return mintStore.proofs;
    },
    serializeProofs: function (proofs) {
      const mintStore = useMintsStore();
      // unique keyset IDs of proofs
      let uniqueIds = [...new Set(proofs.map((p) => p.id))];
      // mints that have any of the keyset IDs
      let mints_keysets = mintStore.mints.filter((m) =>
        m.keysets.some((r) => uniqueIds.indexOf(r) >= 0)
      );
      // what we put into the JSON
      let mints = mints_keysets.map((m) => [{ url: m.url, ids: m.keysets }][0]);
      let tokenV3 = {
        token: [{ proofs: proofs, mint: mints[0].url }],
      };
      return "cashuA" + btoa(JSON.stringify(tokenV3));
    },
    getProofsMint: function (proofs) {
      const mintStore = useMintsStore();

      // unique keyset IDs of proofs
      let uniqueIds = [...new Set(proofs.map((p) => p.id))];
      // mints that have any of the keyset IDs
      let mints_keysets = mintStore.mints.filter((m) =>
        m.keysets.some((r) => uniqueIds.indexOf(r) >= 0)
      );
      // what we put into the JSON
      let mints = mints_keysets.map((m) => [{ url: m.url, ids: m.keysets }][0]);
      return mints[0];
    },
    serializeProofsV2: function (proofs) {
      const mintStore = useMintsStore();

      // unique keyset IDs of proofs
      let uniqueIds = [...new Set(proofs.map((p) => p.id))];
      // mints that have any of the keyset IDs
      let mints_keysets = mintStore.mints.filter((m) =>
        m.keysets.some((r) => uniqueIds.indexOf(r) >= 0)
      );
      // what we put into the JSON
      let mints = mints_keysets.map((m) => [{ url: m.url, ids: m.keysets }][0]);
      var tokenV2 = {
        proofs: proofs,
        mints,
      };
      return btoa(JSON.stringify(tokenV2));
    },
  },
});
