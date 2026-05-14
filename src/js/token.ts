import {
  Amount,
  type Token,
  type Proof,
  getDecodedToken,
  getTokenMetadata,
  Mint,
  TokenMetadata,
} from "@cashu/cashu-ts";
import { useMintsStore, WalletProof } from "src/stores/mints";
import { useProofsStore } from "src/stores/proofs";
export default { decodeMeta, decodeFull, getProofs, getMint, getUnit, getMemo };

// getTokenMetadata returns proofs without `id` (keyset ID) and with Amount.
// This type narrows that to number amounts for the rest of the app.
type MetadataProof = Omit<Proof, "amount" | "id"> & { amount: number };

type DecodedTokenMetadata = Omit<
  TokenMetadata,
  "amount" | "incompleteProofs"
> & {
  amount: number;
  proofs: MetadataProof[];
};

/**
 * Decodes an encoded cashu token metadata
 */
function decodeMeta(encoded_token: string): DecodedTokenMetadata | undefined {
  if (!encoded_token || encoded_token === "") return;
  const { incompleteProofs, amount, ...rest } = getTokenMetadata(encoded_token);
  return {
    ...rest,
    amount: Amount.from(amount).toNumber(),
    proofs:
      incompleteProofs?.map((proof) => ({
        ...proof,
        amount: Amount.from(proof.amount).toNumber(),
      })) ?? [],
  };
}

/**
 * Decodes an encoded cashu token with full proofs
 */
async function decodeFull(encoded_token: string): Promise<Token | undefined> {
  if (!encoded_token || encoded_token === "") return;
  const mintStore = useMintsStore();
  try {
    return getDecodedToken(
      encoded_token,
      mintStore.allMintKeysets.map((k) => k.id)
    );
  } catch (error) {
    const tokenMint = getTokenMetadata(encoded_token).mint;
    // TODO: Should tokens from unknown mints "call home" for keysets automatically?
    // const knownMint = mintStore.mints.find((m) => m.url === tokenMint);
    // if (!knownMint) {
    //   throw new Error(`Token is from a mint you have not trusted: ${tokenMint}`);
    // }
    const fetchKeysets = await new Mint(tokenMint).getKeySets();
    return getDecodedToken(
      encoded_token,
      fetchKeysets.keysets.map((k: { id: string }) => k.id)
    );
  }
}

/**
 * Returns a list of proofs from a decoded token
 */
function getProofs(decoded_token: Token): WalletProof[] {
  if (!(decoded_token.proofs.length > 0)) {
    throw new Error("Token format wrong");
  }
  const proofs = decoded_token.proofs.flat();
  return useProofsStore().proofsToWalletProofs(proofs);
}

function getMint(decoded_token: { mint: string; proofs: unknown[] }) {
  if (decoded_token.proofs.length > 0) {
    return decoded_token.mint;
  } else {
    return "";
  }
}

function getUnit(decoded_token: {
  mint: string;
  proofs: unknown[];
  unit?: string;
}) {
  if (decoded_token.unit != null) {
    return decoded_token.unit;
  } else {
    // search for unit in mints[...].keysets[...].unit
    const mintStore = useMintsStore();
    const mint = getMint(decoded_token);
    const keysets = mintStore.mints
      .filter((m) => m.url === mint)
      .flatMap((m) => m.keysets);
    if (keysets.length > 0) {
      return keysets[0].unit;
    }
    return "";
  }
}

function getMemo(decoded_token: { mint: string; memo?: string }) {
  if (decoded_token.memo != null) {
    return decoded_token.memo;
  } else {
    return "";
  }
}
