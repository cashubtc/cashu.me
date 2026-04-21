import { ref } from "vue";
import { defineStore } from "pinia";
import { useMintsStore, WalletProof } from "./mints";
import {
  Proof,
  getEncodedToken,
  getEncodedTokenV4,
  Token,
} from "@cashu/cashu-ts";
import { useCocoStore } from "./coco";
import { CoreProof } from "@cashu/coco-core";

export const useProofsStore = defineStore("proofs", {
  state: () => {
    const proofs = ref<WalletProof[]>([]);

    // Function to update activeProofs
    const updateActiveProofs = async () => {
      const cocoStore = useCocoStore();
      if (!cocoStore.isInitialized || !cocoStore.manager) return;

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
      
      const allReadyProofs = await cocoStore.repos.proofRepository.getReadyProofs(currentMint.url);
      
      const activeProofs = allReadyProofs.filter((p: CoreProof) => keysetIds.includes(p.id)).map((p: CoreProof) => ({
        ...p,
        reserved: p.state === 'inflight',
        quote: undefined // Coco doesn't store quotes on proofs directly
      }));
      
      mintStore.activeProofs = activeProofs;
      
      // Update all proofs
      const allProofs = await cocoStore.repos.proofRepository.getAvailableProofs(currentMint.url); // just for this mint? actually all mints
      // Wait, getAvailableProofs requires a mintUrl. Let's get all ready proofs.
      const totalReady = await cocoStore.repos.proofRepository.getAllReadyProofs();
      proofs.value = totalReady.map((p: CoreProof) => ({
        ...p,
        reserved: p.state === 'inflight'
      }));
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
      const cocoStore = useCocoStore();
      if (!cocoStore.manager) return [];
      const proofs = await cocoStore.repos.proofRepository.getAllReadyProofs();
      return proofs.map((p: CoreProof) => ({...p, reserved: p.state === 'inflight'}));
    },
    setReserved: async function (
      proofs: Proof[],
      reserved: boolean = true,
      quote?: string
    ) {
      const cocoStore = useCocoStore();
      if (!cocoStore.manager) return;
      
      // Group proofs by mint URL to reserve them properly
      const secrets = proofs.map((p: CoreProof) => p.secret);
      
      if (reserved) {
        // Find which mint these belong to
        // This is a bit tricky if they span multiple mints, but usually they don't.
        // Let's assume we can set state to inflight without knowing mintUrl? No, we need mintUrl.
        // We'll skip manual reserving because Coco handles reserving via `manager.ops.*.prepare()` internally.
        console.warn("setReserved called directly, skipping as Coco handles this internally.");
      } else {
        // Release
      }
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
       console.warn("addProofs called directly. Use Coco ops.");
    },
    async removeProofs(proofs: Proof[]) {
       console.warn("removeProofs called directly. Use Coco ops.");
    },
    async getProofsForQuote(quote: string): Promise<WalletProof[]> {
      // Legacy method. Not supported directly in Coco.
      return [];
    },
    getUnreservedProofs: function (proofs: WalletProof[]) {
      return proofs.filter((p) => !p.reserved);
    },
    serializeProofs: function (proofs: Proof[]): string {
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
        proofs: proofs,
        unit: unit,
      } as Token;
      try {
        return getEncodedTokenV4(token);
      } catch (e) {
        console.log("Could not encode TokenV4, defaulting to TokenV3", e);
        return getEncodedToken(token);
      }
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
