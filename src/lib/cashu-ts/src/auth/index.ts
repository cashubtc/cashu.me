import { CashuAuthMint } from './CashuAuthMint';
import { CashuAuthWallet } from './CashuAuthWallet';
import { encodeJsonToBase64 } from '../base64';
import { Proof } from '../model/types';

/**
 * Helper function to encode a cashu auth token authA
 * @param proof
 */
export function getEncodedAuthToken(proof: Proof): string {
	const token = {
		id: proof.id,
		secret: proof.secret,
		C: proof.C
	};
	const base64Data = encodeJsonToBase64(token);
	const prefix = 'auth';
	const version = 'A';
	return prefix + version + base64Data;
}

export async function getBlindedAuthToken(amount: number, url: string, clearAuthToken: string) {
	const authMint = new CashuAuthMint(url);
	const authWallet = new CashuAuthWallet(authMint);
	const authProofs = await authWallet.mintProofs(amount, clearAuthToken);
	return authProofs.map((p) => getEncodedAuthToken(p));
}

export { CashuAuthMint, CashuAuthWallet };
