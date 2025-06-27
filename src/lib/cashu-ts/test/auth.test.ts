import { test, describe, expect } from 'vitest';
import { CashuWallet } from '../src/CashuWallet';
import { CashuMint } from '../src/CashuMint';
import { getBlindedAuthToken } from '../src/auth';

async function getClearAuthToken() {
	const res = await fetch(process.env.OICD_TOKEN_ENDPOINT!, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams({
			username: process.env.OICD_USERNAME!,
			password: process.env.OICD_PASSWORD!,
			grant_type: 'password',
			scope: 'openid',
			client_id: 'cashu-client'
		})
	});
	const data = await res.json();
	return data.access_token;
}

class FakeDatabase {
	private authToken: Array<string> = [];

	addTokenToDb(token: Array<string>) {
		this.authToken.push(...token);
	}

	async getTokenFromDb() {
		if (this.authToken.length < 1) {
			throw new Error('No token in DB');
		}
		return this.authToken.pop() as string;
	}
}

const db = new FakeDatabase();

const mintUrl = 'https://auth.testnut.cashu.space';

describe('NUT-22', () => {
	test('Mint ecash from protected endpoint', async () => {
		const clearAuthToken = await getClearAuthToken();
		const blindedAuthToken = await getBlindedAuthToken(20, mintUrl, clearAuthToken);
		db.addTokenToDb(blindedAuthToken);

		expect(blindedAuthToken.length).toBe(20);

		const wallet = new CashuWallet(new CashuMint(mintUrl, undefined, db.getTokenFromDb.bind(db)));
		const quote = await wallet.createMintQuote(1);
		await new Promise((r) => setTimeout(r, 1000));
		const proofs = await wallet.mintProofs(1, quote.quote);
		expect(proofs.length).toBe(1);
	});
});
