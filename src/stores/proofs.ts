import { ref } from "vue";
import { defineStore } from "pinia";
import { useMintsStore, WalletProof } from "./mints";
import { cashuDb, CashuDexie, useDexieStore } from "./dexie";
import {
  Proof,
  getEncodedToken,
  getEncodedTokenV4,
  Token,
} from "@cashu/cashu-ts";
import { liveQuery } from "dexie";

export const useProofsStore = defineStore("proofs", {
  state: () => {
    const proofs = ref<WalletProof[]>([]);

    liveQuery(() => cashuDb.proofs.toArray()).subscribe({
      next: (newProofs) => {
        proofs.value = newProofs;
        updateActiveProofs();
      },
      error: (err) => {
        console.error(err);
      },
    });

    // Function to update activeProofs
    const updateActiveProofs = async () => {
      const mintStore = useMintsStore();
      const currentMint = mintStore.mints.find(
        (m) => m.url === mintStore.activeMintUrl
      );
      if (!currentMint) {
        mintStore.activeProofs = [];
        return;
      }

      const unitKeysets = currentMint?.keysets?.filter(
        (k) => k.unit === mintStore.activeUnit
      );
      if (!unitKeysets || unitKeysets.length === 0) {
        mintStore.activeProofs = [];
        return;
      }

      const keysetIds = unitKeysets.map((k) => k.id);
      const activeProofs = await cashuDb.proofs
        .where("id")
        .anyOf(keysetIds)
        .toArray()
        .then((proofs) => {
          return proofs.filter((p) => !p.reserved);
        });
      mintStore.activeProofs = activeProofs;
    };

    return {
      proofs,
      updateActiveProofs,
    };
  },
  actions: {
    sumProofs: function (proofs: Proof[]) {
      return proofs.reduce((s, t) => (s += t.amount), 0);
    },
    getProofs: async function (): Promise<WalletProof[]> {
      return await cashuDb.proofs.toArray();
    },
    setReserved: async function (
      proofs: Proof[],
      reserved: boolean = true,
      quote?: string
    ) {
      const setQuote: string | undefined = reserved ? quote : undefined;
      await cashuDb.transaction("rw", cashuDb.proofs, async () => {
        for (const p of proofs) {
          await cashuDb.proofs
            .where("secret")
            .equals(p.secret)
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
      await cashuDb.transaction("rw", cashuDb.proofs, async () => {
        walletProofs.forEach(async (p) => {
          await cashuDb.proofs.add(p);
        });
      });
    },
    async removeProofs(proofs: Proof[]) {
      const walletProofs = this.proofsToWalletProofs(proofs);
      await cashuDb.transaction("rw", cashuDb.proofs, async () => {
        walletProofs.forEach(async (p) => {
          await cashuDb.proofs.delete(p.secret);
        });
      });
    },
    async getProofsForQuote(quote: string): Promise<WalletProof[]> {
      return await cashuDb.proofs.where("quote").equals(quote).toArray();
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
