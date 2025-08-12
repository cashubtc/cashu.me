import { debug } from "src/js/logger";
import { ref } from "vue";
import { defineStore } from "pinia";
import { useMintsStore } from "./mints";
import type { WalletProof } from "src/types/proofs";
import { cashuDb, CashuDexie, useDexieStore } from "./dexie";
import { useBucketsStore } from "./buckets";
import { DEFAULT_BUCKET_ID } from "@/constants/buckets";
import { useTokensStore } from "./tokens";
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
        (m) => m.url === mintStore.activeMintUrl,
      );
      if (!currentMint) {
        mintStore.activeProofs = [];
        return;
      }

      const unitKeysets = currentMint?.keysets?.filter(
        (k) => k.unit === mintStore.activeUnit,
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
      quote?: string,
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
    proofsToWalletProofs(
      proofs: Proof[],
      quote?: string,
      bucketId: string = "unassigned",
      label: string = "",
      description: string = "",
    ): WalletProof[] {
      return proofs.map((p) => {
        return {
          ...p,
          reserved: false,
          quote: quote,
          bucketId,
          label,
          description,
        } as WalletProof;
      });
    },
    async addProofs(
      proofs: Proof[],
      quote?: string,
      bucketId: string = "unassigned",
      label: string = "",
      description: string = "",
    ) {
      const bucketsStore = useBucketsStore();
      const mintsStore = useMintsStore();
      if (bucketId === DEFAULT_BUCKET_ID) {
        let mintUrl: string | undefined;
        if (proofs.length) {
          const m = mintsStore.mints.find((mint) =>
            mint.keysets.some((k) => k.id === proofs[0].id),
          );
          mintUrl = m?.url;
        }
        const auto = bucketsStore.autoBucketFor(mintUrl, label);
        if (auto) {
          bucketId = auto;
        }
      }
      const walletProofs = this.proofsToWalletProofs(
        proofs,
        quote,
        bucketId,
        label,
        description,
      );
      await cashuDb.transaction("rw", cashuDb.proofs, async () => {
        walletProofs.forEach(async (p) => {
          await cashuDb.proofs.add(p);
        });
      });
    },
    async removeProofs(proofs: Proof[], bucketId: string = "unassigned") {
      const walletProofs = this.proofsToWalletProofs(
        proofs,
        undefined,
        bucketId,
      );
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
        m.keysets.filter((k) => uniqueIds.includes(k.id)),
      );
      if (keysets.length === 0) {
        throw new Error("No keysets found for proofs");
      }
      // mints that have any of the keyset.id
      let mints = mintStore.mints.filter((m) =>
        m.keysets.some((k) => uniqueIds.includes(k.id)),
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
        debug("Could not encode TokenV4, defaulting to TokenV3", e);
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
        m.keysets.some((k) => uniqueIds.includes(k.id)),
      );
      // what we put into the JSON
      let mints = mints_keysets.map((m) => [{ url: m.url, ids: m.keysets }][0]);
      return mints[0];
    },
    async moveProofs(secrets: string[], bucketId: string) {
      const bucketsStore = useBucketsStore();
      const bucketExists = bucketsStore.bucketList.find(
        (b) => b.id === bucketId,
      );
      if (!bucketExists) {
        throw new Error(`Bucket not found: ${bucketId}`);
      }
      await cashuDb.transaction("rw", cashuDb.proofs, async () => {
        for (const secret of secrets) {
          await cashuDb.proofs
            .where("secret")
            .equals(secret)
            .modify({ bucketId });
        }
      });
      const tokensStore = useTokensStore();
      tokensStore.changeHistoryTokenBucket({
        secrets,
        newBucketId: bucketId,
      });
    },
    async updateProofLabels(secrets: string[], label: string) {
      await cashuDb.transaction("rw", cashuDb.proofs, async () => {
        for (const secret of secrets) {
          await cashuDb.proofs.where("secret").equals(secret).modify({ label });
        }
      });
    },
    async updateProofDescriptions(secrets: string[], description: string) {
      await cashuDb.transaction("rw", cashuDb.proofs, async () => {
        for (const secret of secrets) {
          await cashuDb.proofs
            .where("secret")
            .equals(secret)
            .modify({ description });
        }
      });
    },
  },
});
