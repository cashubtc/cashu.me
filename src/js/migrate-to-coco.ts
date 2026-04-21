import { Manager, CoreProof } from "@cashu/coco-core";
import { IndexedDbRepositories } from "@cashu/coco-indexeddb";
import { cashuDb } from "../stores/dexie";
import { StoredMint } from "../stores/mints";

export async function migrateToCoco(manager: Manager, repos: IndexedDbRepositories) {
  const isMigrated = localStorage.getItem("cashu.coco.migrated");
  if (isMigrated === "true") {
    return;
  }
  
  console.log("Starting migration to Coco...");
  try {
    // 1. Migrate Mints
    const mintsStr = localStorage.getItem("cashu.mints");
    const keysetToMintUrl = new Map<string, string>();
    const mintUrls = new Set<string>();
    
    if (mintsStr) {
      const storedMints: StoredMint[] = JSON.parse(mintsStr);
      for (const mint of storedMints) {
        if (!mintUrls.has(mint.url)) {
          mintUrls.add(mint.url);
          try {
            await manager.mint.addMint(mint.url);
          } catch (e) {
            console.warn(`Could not add mint ${mint.url} to Coco`, e);
          }
        }
        
        if (mint.keysets) {
          for (const keyset of mint.keysets) {
            keysetToMintUrl.set(keyset.id, mint.url);
          }
        }
      }
    }
    
    // 2. Migrate Proofs
    const proofs = await cashuDb.proofs.toArray();
    if (proofs.length > 0) {
      console.log(`Migrating ${proofs.length} proofs...`);
      
      // Group proofs by mintUrl to batch insert
      const proofsByMint = new Map<string, CoreProof[]>();
      
      for (const proof of proofs) {
        const mintUrl = keysetToMintUrl.get(proof.id);
        if (!mintUrl) {
          console.warn(`Could not find mint URL for keyset ${proof.id}, skipping proof of amount ${proof.amount}`);
          continue;
        }
        
        const coreProof: CoreProof = {
          id: proof.id,
          amount: proof.amount,
          secret: proof.secret,
          C: proof.C,
          mintUrl: mintUrl,
          state: proof.reserved ? 'inflight' : 'ready',
        };
        
        if (!proofsByMint.has(mintUrl)) {
          proofsByMint.set(mintUrl, []);
        }
        proofsByMint.get(mintUrl)!.push(coreProof);
      }
      
      for (const [mintUrl, mintProofs] of proofsByMint.entries()) {
        try {
          await repos.proofRepository.saveProofs(mintUrl, mintProofs);
          console.log(`Saved ${mintProofs.length} proofs for mint ${mintUrl}`);
        } catch (e) {
          console.error(`Failed to save proofs for mint ${mintUrl}`, e);
        }
      }
    }
    
    // 3. Mark as migrated
    localStorage.setItem("cashu.coco.migrated", "true");
    console.log("Migration complete.");
    
  } catch (e) {
    console.error("Migration to Coco failed", e);
  }
}
