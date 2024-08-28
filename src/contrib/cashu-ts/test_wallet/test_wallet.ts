
// typescript file that I run with ts-node to test the wallet 
// must run npm run compile in parent directory to update the dist folder
import {
	CashuMint,
	getEncodedToken,
	CashuWallet,
	MintQuoteState,
	Proof,
	AmountPreference
} from '@cashu/cashu-ts';
import { sumProofs } from '../dist/lib/es5/utils';
import dns from 'node:dns';
import * as utils from '../dist/lib/es5/utils';

dns.setDefaultResultOrder('ipv4first');
const MINT_URL = 'http://localhost:3338';
// // import objects from src/model/types/index.ts
// import { CashuMint, CashuWallet, getEncodedToken } from './index.js';

const account = async () => {
	const wallet = new CashuWallet(new CashuMint(MINT_URL));

	await wallet.loadMint();
	// console.log(`active keyest: ${wallet.keysetId}`);

	const amountToMint = 100;
	const mintQuote = await wallet.createMintQuote(amountToMint);
	//pay this LN invoice
	// console.log(mintQuote);

	const mintQuoteChecked = await wallet.checkMintQuote(mintQuote.quote);
	// console.log(mintQuoteChecked);
	let proofs: Proof[] = [];

	// create an array of AmountPreference objects that sums to amountToMint and has 3 of each amount
	// const preference = [{ amount: 1, count: 1 }] as AmountPreference[];
	let preference: AmountPreference[] = [];
	let preferredAmount = 1;
	const targetCount = 4;
	while (
		preference.reduce((acc, curr) => acc + curr.amount * curr.count, 0) <
		amountToMint - targetCount * preferredAmount
	) {
		preference.push({ amount: preferredAmount, count: targetCount });
		preferredAmount *= 2;
	}
	// console.log(
	// 	`Amounts preference: ${preference
	// 		.map((p) => `${p.count} * ${p.amount} sat`)
	// 		.join(', ')}, sum: ${preference.reduce((acc, curr) => acc + curr.amount * curr.count, 0)}`
	// );

	if (mintQuoteChecked.state == MintQuoteState.PAID) {
		proofs = (await wallet.mintTokens(amountToMint, mintQuote.quote, { proofsWeHave: [] }))
			.proofs;
	}

	console.log(`Proofs: ${proofs.length} - ${sumProofs(proofs)} sat`);
	console.log(`Amounts: ${proofs.map((p) => p.amount).join(', ')}`);

	for (let i = 0; i < 10; i++) {
		console.log(`******** Balance: ${sumProofs(proofs)} sat (${proofs.length} proofs)`);
		const amountToSend = 10;
		const { returnChange: proofsToKeep, send: proofsToSend } = await wallet.send(
			amountToSend,
			proofs,
			{ proofsWeHave: proofs }
		);
		console.log(`Proofs to keep (${proofsToKeep.length}): ${sumProofs(proofsToKeep)} sat`);
		console.log(`Proofs to send (${proofsToSend.length}): ${sumProofs(proofsToSend)} sat`);
		const result = utils.getEncodedToken({
			token: [{ mint: MINT_URL, proofs: proofsToSend }]
		});
		console.log(result);
		proofs = proofsToKeep;
	}

	// const amountToSend = 30;
	// console.log(`Proofs: ${proofs.length} - ${sumProofs(proofs)} sat`);
	// const { returnChange: proofsToKeep, send: proofsToSend } = await wallet.send(amountToSend, proofs);
	// console.log(`Proofs to keep (${proofsToKeep.length}): ${sumProofs(proofsToKeep)} sat`);
	// console.log(`Proofs to send (${proofsToSend.length}): ${sumProofs(proofsToSend)} sat`);

	// const result = utils.getEncodedToken({
	// 	token: [{ mint: MINT_URL, proofs: proofsToSend }]
	// });
	// console.log(result);

	// repeat
	// async function invoiceHasBeenPaid() {
	// 	const { proofs } = await wallet.mintTokens(200, mintQuote.quote);
	// 	//Encoded proofs can be spent at the mint
	// 	const encoded = getEncodedToken({
	// 		token: [{ mint: 'http://localhost:3338', proofs }]
	// 	});
	// 	// console.log(encoded);
	// }

	// const invoice =
	// 	'lnbc100n1pnf6tdhpp5p20yuv26sqv24esnz6lzmkwdrl8da8ld7tjdqnmt8ncqa8uscxeqdp42phhwetjv4jzqcneypekzarn9ekk7cnfypq9xct5wdxk7cnfgfhhgcqzzsxqrrssrzjqvq5ztkzvh6ejph3cz89ws3hfyfajp3spemqjcmuj3mwj54gsmz0kr9y6vqqg8qqqyqqqqlgqqqp8zqqjqsp5uwfmh5draa78wamzevqj6hxqd0xdn0eyfkh6q280xj4ul8cjw83s9qxpqysgqm6dvq8mvw0fg6qqcywrh6dngd2gq0fx3re4plfsmmsccgn23x5xxaezt88z26pa6c7tam5nl75skqeslmsl50tnaf2evy72kssv34esp2aq4rn';
	// const meltQuote = await wallet.createMeltQuote(invoice);
	// const amountToSend = meltQuote.amount + meltQuote.fee_reserve;

	// // in a real wallet, we would try to select the correct amount of proofs from the wallet
	// // instead, here we perform a swap with the mint to get the correct amount of proofs
	// const { returnChange: proofsToKeep, send: proofsToSend } = await wallet.send(
	// 	amountToSend,
	// 	proofs
	// );
	// // store proofsToKeep in wallet ..
	// const meltResponse = await wallet.melt(meltQuote, proofsToSend);
	// // store meltResponse.change in wallet ..
};

account();
