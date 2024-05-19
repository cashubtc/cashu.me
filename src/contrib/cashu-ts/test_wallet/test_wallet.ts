// typescript file that I run with ts-node to test the wallet
import { CashuMint, getEncodedToken, CashuWallet } from '@cashu/cashu-ts';
import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');
// // import objects from src/model/types/index.ts
// import { CashuMint, CashuWallet, getEncodedToken } from './index.js';

const account = async () => {
	const wallet = new CashuWallet(new CashuMint('http://localhost:3338'));

	const { pr, hash } = await wallet.getMintQuote(200);
	//pay this LN invoice
	console.log({ pr }, { hash });

	async function invoiceHasBeenPaid() {
		const { proofs } = await wallet.mintTokens(200, hash);
		//Encoded proofs can be spent at the mint
		const encoded = getEncodedToken({
			token: [{ mint: 'http://localhost:3338', proofs }]
		});
		console.log(encoded);
	}
};

account();
