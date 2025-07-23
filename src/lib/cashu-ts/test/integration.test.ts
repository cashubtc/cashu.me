import { CashuMint } from '../src/CashuMint.js';
import { CashuWallet } from '../src/CashuWallet.js';

import dns from 'node:dns';
import { test, describe, expect } from 'vitest';
import { vi } from 'vitest';
import { schnorr, secp256k1 } from '@noble/curves/secp256k1';
import {
	CheckStateEnum,
	MeltQuoteState,
	MintKeys,
	MintQuoteState,
	Proof,
	ProofState,
	Token
} from '../src/model/types/index.js';
import { MintOperationError } from '../src/model/Errors.js';
import ws from 'ws';
import { injectWebSocketImpl } from '../src/ws.js';
import {
	getEncodedToken,
	getEncodedTokenV4,
	hexToNumber,
	numberToHexPadded64,
	splitAmount,
	sumProofs
} from '../src/utils.js';
import { OutputData, OutputDataFactory } from '../src/model/OutputData.js';
import { hexToBytes, bytesToHex, randomBytes } from '@noble/hashes/utils';
dns.setDefaultResultOrder('ipv4first');

const externalInvoice =
	'lnbc20u1p3u27nppp5pm074ffk6m42lvae8c6847z7xuvhyknwgkk7pzdce47grf2ksqwsdpv2phhwetjv4jzqcneypqyc6t8dp6xu6twva2xjuzzda6qcqzpgxqyz5vqsp5sw6n7cztudpl5m5jv3z6dtqpt2zhd3q6dwgftey9qxv09w82rgjq9qyyssqhtfl8wv7scwp5flqvmgjjh20nf6utvv5daw5h43h69yqfwjch7wnra3cn94qkscgewa33wvfh7guz76rzsfg9pwlk8mqd27wavf2udsq3yeuju';

let request: Record<string, string> | undefined;
const mintUrl = 'http://localhost:3338';
const unit = 'sat';

injectWebSocketImpl(ws);

function expectNUT10SecretDataToEqual(p: Array<Proof>, s: string) {
	p.forEach((p) => {
		const parsedSecret = JSON.parse(p.secret);
		expect(parsedSecret[1].data).toBe(s);
	});
}

describe('mint api', () => {
	test('get keys', async () => {
		const mint = new CashuMint(mintUrl);
		const keys = await mint.getKeys();
		expect(keys).toBeDefined();
	});
	test('get keysets', async () => {
		const mint = new CashuMint(mintUrl);
		const keysets = await mint.getKeySets();
		expect(keysets).toBeDefined();
		expect(keysets.keysets).toBeDefined();
		expect(keysets.keysets.length).toBeGreaterThan(0);
	});

	test('get info', async () => {
		const mint = new CashuMint(mintUrl);
		const info = await mint.getInfo();
		expect(info).toBeDefined();
	});
	test('request mint', async () => {
		const mint = new CashuMint(mintUrl);
		const wallet = new CashuWallet(mint, { unit });
		const request = await wallet.createMintQuote(100);
		expect(request).toBeDefined();
		const mintQuote = await wallet.checkMintQuote(request.quote);
		expect(mintQuote).toBeDefined();
	});
	test('mint tokens', async () => {
		const mint = new CashuMint(mintUrl);
		const wallet = new CashuWallet(mint, { unit });
		const request = await wallet.createMintQuote(1337);
		expect(request).toBeDefined();
		expect(request.request).toContain('lnbc1337');
		const proofs = await wallet.mintProofs(1337, request.quote);
		expect(proofs).toBeDefined();
		// expect that the sum of all tokens.proofs.amount is equal to the requested amount
		expect(sumProofs(proofs)).toBe(1337);
	});
	test('get fee for local invoice', async () => {
		const mint = new CashuMint(mintUrl);
		const wallet = new CashuWallet(mint, { unit });
		const request = await wallet.createMintQuote(100);
		const fee = (await wallet.createMeltQuote(request.request)).fee_reserve;
		expect(fee).toBeDefined();
		// because local invoice, fee should be 0
		expect(fee).toBe(0);
	});
	test('invoice with description', async () => {
		const mint = new CashuMint(mintUrl);
		const wallet = new CashuWallet(mint, { unit });
		const quote = await wallet.createMintQuote(100, 'test description');
		expect(quote).toBeDefined();
		console.log(`invoice with description: ${quote.request}`);
	});
	test('get fee for external invoice', async () => {
		const mint = new CashuMint(mintUrl);
		const wallet = new CashuWallet(mint, { unit });
		const fee = (await wallet.createMeltQuote(externalInvoice)).fee_reserve;
		expect(fee).toBeDefined();
		// because external invoice, fee should be > 0
		expect(fee).toBeGreaterThan(0);
	});
	test('pay local invoice', async () => {
		const mint = new CashuMint(mintUrl);
		const wallet = new CashuWallet(mint, { unit });
		const request = await wallet.createMintQuote(100);
		const proofs = await wallet.mintProofs(100, request.quote);

		// expect no fee because local invoice
		const mintQuote = await wallet.createMintQuote(10);
		const quote = await wallet.createMeltQuote(mintQuote.request);
		const fee = quote.fee_reserve;
		expect(fee).toBe(0);

		// get the quote from the mint
		const quote_ = await wallet.checkMeltQuote(quote.quote);
		expect(quote_).toBeDefined();

		const sendResponse = await wallet.send(10, proofs, { includeFees: true });
		const response = await wallet.meltProofs(quote, sendResponse.send);
		expect(response).toBeDefined();
		// expect that we have received the fee back, since it was internal
		expect(response.change.reduce((a, b) => a + b.amount, 0)).toBe(fee);

		// check states of spent and kept proofs after payment
		const sentProofsStates = await wallet.checkProofsStates(sendResponse.send);
		expect(sentProofsStates).toBeDefined();
		// expect that all proofs are spent, i.e. all are CheckStateEnum.SPENT
		sentProofsStates.forEach((state) => {
			expect(state.state).toBe(CheckStateEnum.SPENT);
			expect(state.witness).toBeNull();
		});
		// expect none of the sendResponse.keep to be spent
		const keepProofsStates = await wallet.checkProofsStates(sendResponse.keep);
		expect(keepProofsStates).toBeDefined();
		keepProofsStates.forEach((state) => {
			expect(state.state).toBe(CheckStateEnum.UNSPENT);
			expect(state.witness).toBeNull();
		});
	});
	test('pay external invoice', async () => {
		const mint = new CashuMint(mintUrl);
		const wallet = new CashuWallet(mint, { unit });
		const request = await wallet.createMintQuote(3000);
		const proofs = await wallet.mintProofs(3000, request.quote);

		const meltQuote = await wallet.createMeltQuote(externalInvoice);
		const fee = meltQuote.fee_reserve;
		expect(fee).toBeGreaterThan(0);

		// get the quote from the mint
		const quote_ = await wallet.checkMeltQuote(meltQuote.quote);
		expect(quote_).toBeDefined();

		const sendResponse = await wallet.send(2000 + fee, proofs, { includeFees: true });
		const response = await wallet.meltProofs(meltQuote, sendResponse.send);

		expect(response).toBeDefined();
		// expect that we have not received the fee back, since it was external
		expect(response.change.reduce((a, b) => a + b.amount, 0)).toBeLessThan(fee);

		// check states of spent and kept proofs after payment
		const sentProofsStates = await wallet.checkProofsStates(sendResponse.send);
		expect(sentProofsStates).toBeDefined();
		// expect that all proofs are spent, i.e. all are CheckStateEnum.SPENT
		sentProofsStates.forEach((state) => {
			expect(state.state).toBe(CheckStateEnum.SPENT);
			expect(state.witness).toBeNull();
		});
		// expect none of the sendResponse.keep to be spent
		const keepProofsStates = await wallet.checkProofsStates(sendResponse.keep);
		expect(keepProofsStates).toBeDefined();
		keepProofsStates.forEach((state) => {
			expect(state.state).toBe(CheckStateEnum.UNSPENT);
			expect(state.witness).toBeNull();
		});
	});
	test('test send tokens exact without previous split', async () => {
		const mint = new CashuMint(mintUrl);
		const wallet = new CashuWallet(mint, { unit });
		const request = await wallet.createMintQuote(64);
		const proofs = await wallet.mintProofs(64, request.quote);

		const sendResponse = await wallet.send(64, proofs);
		expect(sendResponse).toBeDefined();
		expect(sendResponse.send).toBeDefined();
		expect(sendResponse.keep).toBeDefined();
		expect(sendResponse.send.length).toBe(1);
		expect(sendResponse.keep.length).toBe(0);
		expect(sumProofs(sendResponse.send)).toBe(64);
	});
	test('test send tokens with change', async () => {
		const mint = new CashuMint(mintUrl);
		const wallet = new CashuWallet(mint, { unit });
		const request = await wallet.createMintQuote(100);
		const proofs = await wallet.mintProofs(100, request.quote);

		const sendResponse = await wallet.send(10, proofs, { includeFees: false });
		expect(sendResponse).toBeDefined();
		expect(sendResponse.send).toBeDefined();
		expect(sendResponse.keep).toBeDefined();
		expect(sendResponse.send.length).toBe(2);
		expect(sendResponse.keep.length).toBe(5);
		expect(sumProofs(sendResponse.send)).toBe(10);
		expect(sumProofs(sendResponse.keep)).toBe(89);
	}, 10000000);
	test('receive tokens with previous split', async () => {
		const mint = new CashuMint(mintUrl);
		const wallet = new CashuWallet(mint, { unit });
		const request = await wallet.createMintQuote(100);
		const proofs = await wallet.mintProofs(100, request.quote);

		const sendResponse = await wallet.send(10, proofs);
		const encoded = getEncodedToken({ mint: mintUrl, proofs: sendResponse.send });
		const response = await wallet.receive(encoded);
		expect(response).toBeDefined();
	});
	test('receive tokens with previous mint', async () => {
		const mint = new CashuMint(mintUrl);
		const wallet = new CashuWallet(mint, { unit });
		const request = await wallet.createMintQuote(64);
		const proofs = await wallet.mintProofs(64, request.quote);
		const encoded = getEncodedToken({ mint: mintUrl, proofs: proofs });
		const response = await wallet.receive(encoded);
		expect(response).toBeDefined();
	});
	test('send and receive p2pk', async () => {
		const mint = new CashuMint(mintUrl);
		const wallet = new CashuWallet(mint, { unit });

		const privKeyAlice = secp256k1.utils.randomPrivateKey();
		const pubKeyAlice = secp256k1.getPublicKey(privKeyAlice);

		const privKeyBob = secp256k1.utils.randomPrivateKey();
		const pubKeyBob = secp256k1.getPublicKey(privKeyBob);

		const request = await wallet.createMintQuote(128);
		const mintedProofs = await wallet.mintProofs(128, request.quote);

		const { send } = await wallet.send(64, mintedProofs, { pubkey: bytesToHex(pubKeyBob) });
		const encoded = getEncodedToken({ mint: mintUrl, proofs: send });

		const result = await wallet
			.receive(encoded, { privkey: bytesToHex(privKeyAlice) })
			.catch((e) => e);
		expect(result).toEqual(new MintOperationError(0, 'no valid signature provided for input.'));

		const proofs = await wallet.receive(encoded, { privkey: bytesToHex(privKeyBob) });

		expect(
			proofs.reduce((curr, acc) => {
				return curr + acc.amount;
			}, 0)
		).toBe(63);
	});

	test('mint and melt p2pk', async () => {
		const mint = new CashuMint(mintUrl);
		const wallet = new CashuWallet(mint);

		const privKeyBob = secp256k1.utils.randomPrivateKey();
		const pubKeyBob = secp256k1.getPublicKey(privKeyBob);

		const mintRequest = await wallet.createMintQuote(3000);

		const proofs = await wallet.mintProofs(3000, mintRequest.quote, {
			pubkey: bytesToHex(pubKeyBob)
		});

		const meltRequest = await wallet.createMeltQuote(externalInvoice);
		const fee = meltRequest.fee_reserve;
		expect(fee).toBeGreaterThan(0);
		const response = await wallet.meltProofs(meltRequest, proofs, {
			privkey: bytesToHex(privKeyBob)
		});
		expect(response).toBeDefined();
		expect(response.quote.state == MeltQuoteState.PAID).toBe(true);
	});
	test('mint deterministic', async () => {
		const hexSeed = bytesToHex(randomBytes(64));
		const mint = new CashuMint(mintUrl);
		const wallet = new CashuWallet(mint);

		const keys = await wallet.getKeys();

		const data = OutputData.createSingleDeterministicData(1, hexToBytes(hexSeed), 1, keys.id);
		const quote = await wallet.createMintQuote(1);
		await new Promise((r) => setTimeout(r, 1500));
		const proof = await wallet.mintProofs(1, quote.quote, { outputData: [data] });
	});
	test('websocket updates', async () => {
		const mint = new CashuMint(mintUrl);
		const wallet = new CashuWallet(mint);

		const mintQuote = await wallet.createMintQuote(21);
		const callback = vi.fn();
		const res = await new Promise(async (res, rej) => {
			const unsub = await wallet.onMintQuoteUpdates(
				[mintQuote.quote],
				(p) => {
					if (p.state === MintQuoteState.PAID) {
						callback();
						res(1);
						unsub();
					}
				},
				(e) => {
					console.log(e);
					rej(e);
					unsub();
				}
			);
		});
		mint.disconnectWebSocket();
		expect(res).toBe(1);
		expect(callback).toBeCalled();
	});
	test('websocket mint quote updates on multiple ids', async () => {
		const mint = new CashuMint(mintUrl);
		const wallet = new CashuWallet(mint);

		const mintQuote1 = await wallet.createMintQuote(21);
		const mintQuote2 = await wallet.createMintQuote(22);

		const callbackRef = vi.fn();
		const res = await new Promise(async (res, rej) => {
			let counter = 0;
			const unsub = await wallet.onMintQuoteUpdates(
				[mintQuote1.quote, mintQuote2.quote],
				() => {
					counter++;
					callbackRef();
					if (counter === 4) {
						unsub();
						res(1);
					}
				},
				() => {
					counter++;
					if (counter === 4) {
						unsub();
						rej();
					}
				}
			);
		});
		mint.disconnectWebSocket();
		expect(res).toBe(1);
		expect(callbackRef).toHaveBeenCalledTimes(4);
		expect(mint.webSocketConnection?.activeSubscriptions.length).toBe(0);
	});
	test('websocket proof state + mint quote updates', async () => {
		const mint = new CashuMint(mintUrl);
		const wallet = new CashuWallet(mint);

		const quote = await wallet.createMintQuote(63);
		await new Promise((res, rej) => {
			wallet.onMintQuotePaid(quote.quote, res, rej);
		});
		const proofs = await wallet.mintProofs(63, quote.quote);
		const data = await new Promise<ProofState>((res) => {
			wallet.onProofStateUpdates(
				proofs,
				(p) => {
					if (p.state === CheckStateEnum.SPENT) {
						res(p);
					}
				},
				(e) => {
					console.log(e);
				}
			);
			wallet.swap(21, proofs);
		});
		mint.disconnectWebSocket();
	}, 10000);
	test('mint with signed quote and payload', async () => {
		const mint = new CashuMint(mintUrl);
		const wallet = new CashuWallet(mint);

		const privkey = 'd56ce4e446a85bbdaa547b4ec2b073d40ff802831352b8272b7dd7a4de5a7cac';
		const pubkey = '02' + bytesToHex(schnorr.getPublicKey(hexToBytes(privkey)));

		const quote = await wallet.createLockedMintQuote(63, pubkey);
		const proofs = await wallet.mintProofs(63, quote, { privateKey: privkey });

		expect(proofs).toBeDefined();
		expect(proofs.length).toBeGreaterThan(0);
	});
});
describe('dleq', () => {
	test('mint and check dleq', async () => {
		const mint = new CashuMint(mintUrl);
		const NUT12 = (await mint.getInfo()).nuts['12'];
		if (NUT12 == undefined || !NUT12.supported) {
			throw new Error('Cannot run this test: mint does not support NUT12');
		}
		const wallet = new CashuWallet(mint);

		const mintRequest = await wallet.createMintQuote(3000);
		const proofs = await wallet.mintProofs(3000, mintRequest.quote);

		proofs.forEach((p) => {
			expect(p).toHaveProperty('dleq');
			expect(p.dleq).toHaveProperty('s');
			expect(p.dleq).toHaveProperty('e');
			expect(p.dleq).toHaveProperty('r');
		});
	});
	test('send and receive token with dleq', async () => {
		const mint = new CashuMint(mintUrl);
		const wallet = new CashuWallet(mint);
		const NUT12 = (await mint.getInfo()).nuts['12'];
		if (NUT12 == undefined || !NUT12.supported) {
			throw new Error('Cannot run this test: mint does not support NUT12');
		}

		const mintRequest = await wallet.createMintQuote(8);
		const proofs = await wallet.mintProofs(8, mintRequest.quote);

		const { keep, send } = await wallet.send(4, proofs, { includeDleq: true });

		send.forEach((p) => {
			expect(p.dleq).toBeDefined();
			expect(p.dleq?.r).toBeDefined();
		});

		const token = {
			mint: mint.mintUrl,
			proofs: send
		} as Token;
		const encodedToken = getEncodedTokenV4(token);
		const newProofs = await wallet.receive(encodedToken, { requireDleq: true });
		expect(newProofs).toBeDefined();
	});
	test('send strip dleq', async () => {
		const mint = new CashuMint(mintUrl);
		const wallet = new CashuWallet(mint);
		const NUT12 = (await mint.getInfo()).nuts['12'];
		if (NUT12 == undefined || !NUT12.supported) {
			throw new Error('Cannot run this test: mint does not support NUT12');
		}

		const mintRequest = await wallet.createMintQuote(8);
		const proofs = await wallet.mintProofs(8, mintRequest.quote);

		const { keep, send } = await wallet.send(4, proofs, { includeDleq: false });
		send.forEach((p) => {
			expect(p.dleq).toBeUndefined();
		});
		keep.forEach((p) => {
			expect(p.dleq).toBeDefined();
			expect(p.dleq?.r).toBeDefined();
		});
	});
	test('send not enough proofs when dleq is required', async () => {
		const mint = new CashuMint(mintUrl);
		const wallet = new CashuWallet(mint);
		const NUT12 = (await mint.getInfo()).nuts['12'];
		if (NUT12 == undefined || !NUT12.supported) {
			throw new Error('Cannot run this test: mint does not support NUT12');
		}

		const mintRequest = await wallet.createMintQuote(8);
		let proofs = await wallet.mintProofs(8, mintRequest.quote);

		// strip dleq
		proofs = proofs.map((p) => {
			return { ...p, dleq: undefined };
		});

		const exc = await wallet.send(4, proofs, { includeDleq: true }).catch((e) => e);
		expect(exc).toEqual(new Error('Not enough funds available to send'));
	});
	test('receive with invalid dleq', async () => {
		const mint = new CashuMint(mintUrl);
		const keys = await mint.getKeys();
		const wallet = new CashuWallet(mint);
		const NUT12 = (await mint.getInfo()).nuts['12'];
		if (NUT12 == undefined || !NUT12.supported) {
			throw new Error('Cannot run this test: mint does not support NUT12');
		}

		const mintRequest = await wallet.createMintQuote(8);
		let proofs = await wallet.mintProofs(8, mintRequest.quote);

		// alter dleq signature
		proofs.forEach((p) => {
			if (p.dleq != undefined) {
				const s = hexToNumber(p.dleq.s) + BigInt(1);
				p.dleq.s = numberToHexPadded64(s);
			}
		});

		const token = {
			mint: mint.mintUrl,
			proofs: proofs
		} as Token;

		const exc = await wallet.receive(token, { requireDleq: true }).catch((e) => e);
		expect(exc).toEqual(new Error('Token contains proofs with invalid DLEQ'));
	});
});
describe('Custom Outputs', () => {
	const sk = randomBytes(32);
	const pk = schnorr.getPublicKey(sk);
	const hexSk = bytesToHex(sk);
	const hexPk = '02' + bytesToHex(pk);
	const invoice =
		'lnbc10n1pn449a7pp5eh3jn9p8hlcq0c0ppcfem2hg9ehptqr9hjk5gst6c0c9qfmrrvgsdq4gdshx6r4ypqkgerjv4ehxcqzpuxqr8pqsp539s9559pdth06j37kexk9zq2pusl4yvy97ruf36jqgyskawlls3s9p4gqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpqysgqy00qa3xgn03jtwrtpu93rqrp806czmpftj8g97cm0r3d2x4rsvlhp5vzgjyzzazl9xf4gpgd35gmys998tlfu8j5zrk7sf3n2nh3t3gpyul75t';
	test('Default keepFactory', async () => {
		// First we create a keep factory, this is a function that will be used to construct all outputs that we "keep"
		function p2pkFactory(a: number, k: MintKeys) {
			return OutputData.createSingleP2PKData({ pubkey: hexPk }, a, k.id);
		}
		const mint = new CashuMint(mintUrl);
		// We then pass our factory to the CashuWallet constructor
		const wallet = new CashuWallet(mint, { keepFactory: p2pkFactory });

		// Lets mint some fresh proofs
		const quoteRes = await wallet.createMintQuote(32);
		await new Promise((res) => setTimeout(res, 2000));
		const proofs = await wallet.mintProofs(32, quoteRes.quote);

		// Because of the keepFactory we expect these proofs to be locked to our public key
		expectNUT10SecretDataToEqual(proofs, hexPk);

		// Lets melt some of these proofs to pay an invoice
		const meltQuote = await wallet.createMeltQuote(invoice);
		const meltAmount = meltQuote.amount + meltQuote.fee_reserve;
		// We need to provide our private key because the proofs are locked
		const { keep: meltKeep, send: meltSend } = await wallet.send(meltAmount, proofs, {
			privkey: hexSk,
			includeFees: true
		});
		// Again the change we get from the swap are expected to be locked to our public key
		expectNUT10SecretDataToEqual(meltKeep, hexPk);

		// We then pay the melt. In this case no private key is required, as our factory only applies to keep Proofs, not send Proofs
		const meltRes = await wallet.meltProofs(meltQuote, meltSend);
		// Even the change we receive from the fee reserve is expected to be locked
		if (meltRes.change && meltRes.change.length > 0) {
			expectNUT10SecretDataToEqual(meltRes.change, hexPk);
		}
		// Finally we want to check whether received token are locked as well
		const restAmount = sumProofs(meltKeep) - wallet.getFeesForProofs(meltKeep);
		// First we unlock all the proofs that we have left
		const unlockedProofs = await wallet.send(restAmount, meltKeep, {
			privkey: hexSk
		});
		// Just to receive them and lock them again, but this time overwriting the default factory
		const newProofs = await wallet.receive(
			{ proofs: unlockedProofs.send, mint: mintUrl },
			{ outputData: (a, k) => OutputData.createSingleP2PKData({ pubkey: 'testKey' }, a, k.id) }
		);
		// Our factory also applies to the receive method, so we expect all received proofs to be locked
		expectNUT10SecretDataToEqual(newProofs, 'testKey');
	}, 15000);
	test('Manual Factory Mint', async () => {
		function createFactory(pubkey: string): OutputDataFactory {
			function inner(a: number, k: MintKeys) {
				return OutputData.createSingleP2PKData({ pubkey: pubkey }, a, k.id);
			}
			return inner;
		}

		const mint = new CashuMint(mintUrl);
		const wallet = new CashuWallet(mint);

		const quote = await wallet.createMintQuote(21);
		await new Promise((res) => setTimeout(res, 1000));
		const proofs = await wallet.mintProofs(21, quote.quote, {
			outputData: createFactory('mintTest')
		});
		expectNUT10SecretDataToEqual(proofs, 'mintTest');
	});
	test('Manual Factory Send', async () => {
		function createFactory(pubkey: string): OutputDataFactory {
			function inner(a: number, k: MintKeys) {
				return OutputData.createSingleP2PKData({ pubkey }, a, k.id);
			}
			return inner;
		}

		const mint = new CashuMint(mintUrl);
		const wallet = new CashuWallet(mint);

		const quote = await wallet.createMintQuote(21);
		await new Promise((res) => setTimeout(res, 1000));
		const proofs = await wallet.mintProofs(21, quote.quote);
		const amount = sumProofs(proofs) - wallet.getFeesForProofs(proofs);
		const { send, keep } = await wallet.send(amount, proofs, {
			outputData: { send: createFactory('send'), keep: createFactory('keep') }
		});
		expectNUT10SecretDataToEqual(send, 'send');
		expectNUT10SecretDataToEqual(keep, 'keep');
	});
	test('Manual BlindingData', async () => {
		const mint = new CashuMint(mintUrl);
		const wallet = new CashuWallet(mint);
		const keys = await wallet.getKeys();

		const quote = await wallet.createMintQuote(40);
		await new Promise((res) => setTimeout(res, 1000));
		const proofs = await wallet.mintProofs(40, quote.quote);
		const data1 = OutputData.createP2PKData({ pubkey: 'key1' }, 10, keys);
		const data2 = OutputData.createP2PKData({ pubkey: 'key2' }, 10, keys);
		const { keep, send } = await wallet.send(20, proofs, {
			outputData: { send: [...data1, ...data2] }
		});
		const key1Sends = send.slice(0, data1.length);
		const key2Sends = send.slice(data1.length);
		expectNUT10SecretDataToEqual(key1Sends, 'key1');
		expectNUT10SecretDataToEqual(key2Sends, 'key2');
	});
});
describe('Keep Vector and Reordering', () => {
	test('Receive', async () => {
		const mint = new CashuMint(mintUrl);
		const wallet = new CashuWallet(mint);

		const mintQuote = await wallet.createMintQuote(64);
		await new Promise((res) => setTimeout(res, 1000));
		const testOutputAmounts = [8, 4, 8, 2, 8, 2];
		const testProofs = await wallet.mintProofs(64, mintQuote.quote);

		const { send } = await wallet.send(32, testProofs, { includeFees: true });
		const receiveProofs = await wallet.receive(
			{ mint: mintUrl, proofs: send },
			{ outputAmounts: { keepAmounts: [], sendAmounts: testOutputAmounts } }
		);
		receiveProofs.forEach((p, i) => expect(p.amount).toBe(testOutputAmounts[i]));
	});
	test('Send', async () => {
		const mint = new CashuMint(mintUrl);
		const wallet = new CashuWallet(mint);

		const mintQuote = await wallet.createMintQuote(64);
		await new Promise((res) => setTimeout(res, 1000));
		const testOutputAmounts = [8, 4, 8, 2, 8, 2];
		const testProofs = await wallet.mintProofs(64, mintQuote.quote);

		const fees = wallet.getFeesForProofs(testProofs);

		const { send } = await wallet.send(32, testProofs, {
			outputAmounts: {
				sendAmounts: testOutputAmounts,
				keepAmounts: [16, 8, ...Array(8 - fees).fill(1)]
			}
		});
		send.forEach((p, i) => expect(p.amount).toBe(testOutputAmounts[i]));
	});
});
describe('Wallet Restore', () => {
	test('Using batch restore', async () => {
		const seed = randomBytes(64);
		const mint = new CashuMint(mintUrl);
		const wallet = new CashuWallet(mint, { bip39seed: seed });

		const mintQuote = await wallet.createMintQuote(70);
		await new Promise((r) => setTimeout(r, 1000));
		const proofs = await wallet.mintProofs(70, mintQuote.quote, { counter: 5 });

		const { proofs: restoredProofs, lastCounterWithSignature } = await wallet.batchRestore();
		expect(restoredProofs).toEqual(proofs);
		expect(sumProofs(restoredProofs)).toBe(70);
		expect(lastCounterWithSignature).toBe(7);
	});
});
