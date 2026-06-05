import { ref } from "vue";
import { defineStore } from "pinia";
import { useMintsStore, WalletProof } from "./mints";
import { cashuDb, CashuDexie, useDexieStore } from "./dexie";
import {
  Amount,
  Proof,
  type ProofLike,
  getEncodedToken,
  normalizeProofAmounts,
  Token,
} from "@cashu/cashu-ts";
import { liveQuery } from "dexie";
import { sumProofAmounts } from "src/js/proofs";

// Shape of a proof row as stored in Dexie (amount may be number or Amount).
type DexieProofRow = ProofLike & { reserved?: boolean; quote?: string };

function coerceWalletProofs(raw: DexieProofRow[]): WalletProof[] {
  return raw.map(({ amount, reserved, quote, ...rest }) => ({
    ...rest,
    amount: Amount.from(amount).toNumber(),
    reserved: Boolean(reserved),
    quote,
  }));
}

export const useProofsStore = defineStore("proofs", {
  state: () => {
    const proofs = ref<WalletProof[]>([]);

    liveQuery(() => cashuDb.proofs.toArray()).subscribe({
      next: (newProofs) => {
        proofs.value = coerceWalletProofs(newProofs);
        updateActiveProofs();
      },
      error: (err) => {
        console.error(err);
      },
    });

    // Filter the live in-memory proofs ref instead of re-querying cashuDb.
    // The liveQuery above keeps `proofs.value` in sync with the table, so
    // doing this synchronously lets activeProofs update in the same tick
    // as activeMintUrl/activeUnit — otherwise downstream getters like
    // activeBalance briefly read the old mint's proofs and the UI flashes
    // an "insufficient balance" warning before the async fetch resolves.
    const updateActiveProofs = () => {
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

      const keysetIds = new Set(unitKeysets.map((k) => k.id));
      mintStore.activeProofs = proofs.value.filter(
        (p) => keysetIds.has(p.id) && !p.reserved
      );
    };

    return {
      proofs,
      updateActiveProofs,
    };
  },
  actions: {
    sumProofs: function (proofs: Array<Pick<ProofLike, "amount">>) {
      return sumProofAmounts(proofs);
    },
    getProofs: async function (): Promise<WalletProof[]> {
      return coerceWalletProofs(await cashuDb.proofs.toArray());
    },
    setReserved: async function (
      proofs: Array<Pick<Proof, "secret">>,
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
    proofsToWalletProofs(proofs: ProofLike[], quote?: string): WalletProof[] {
      return coerceWalletProofs(proofs).map((p) => {
        return {
          ...p,
          reserved: false,
          quote: quote,
        };
      });
    },
    async addProofs(proofs: ProofLike[], quote?: string) {
      const walletProofs = this.proofsToWalletProofs(proofs);
      await cashuDb.transaction("rw", cashuDb.proofs, async () => {
        for (const p of walletProofs) {
          await cashuDb.proofs.add(p);
        }
      });
    },
    async removeProofs(proofs: ProofLike[]) {
      const walletProofs = this.proofsToWalletProofs(proofs);
      await cashuDb.transaction("rw", cashuDb.proofs, async () => {
        for (const p of walletProofs) {
          await cashuDb.proofs.delete(p.secret);
        }
      });
    },
    async getProofsForQuote(quote: string): Promise<WalletProof[]> {
      return coerceWalletProofs(
        await cashuDb.proofs.where("quote").equals(quote).toArray()
      );
    },
    getUnreservedProofs: function (proofs: WalletProof[]) {
      return proofs.filter((p) => !p.reserved);
    },
    serializeProofs: function (proofs: ProofLike[]): string {
      const mintStore = useMintsStore();
      // unique keyset IDs of proofs
      const uniqueIds = [...new Set(proofs.map((p) => p.id))];
      // keysets with these uniqueIds
      const keysets = mintStore.mints.flatMap((m) =>
        m.keysets.filter((k) => uniqueIds.includes(k.id))
      );
      if (keysets.length === 0) {
        throw new Error("No keysets found for proofs");
      }
      // mints that have any of the keyset.id
      const mints = mintStore.mints.filter((m) =>
        m.keysets.some((k) => uniqueIds.includes(k.id))
      );
      if (mints.length === 0) {
        throw new Error("No mints found for proofs");
      }
      // unit of keysets
      const unit = keysets[0].unit;
      const token = {
        mint: mints[0].url,
        proofs: normalizeProofAmounts(proofs),
        unit: unit,
      } as Token;
      return getEncodedToken(token);

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
      const uniqueIds = [...new Set(proofs.map((p) => p.id))];
      // mints that have any of the keyset IDs
      const mints_keysets = mintStore.mints.filter((m) =>
        m.keysets.some((k) => uniqueIds.includes(k.id))
      );
      // what we put into the JSON
      const mints = mints_keysets.map(
        (m) => [{ url: m.url, ids: m.keysets }][0]
      );
      return mints[0];
    },
  },
});
