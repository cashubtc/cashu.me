import nock from 'nock';
import { CashuMint } from '../src/CashuMint.js';
import { CashuWallet } from '../src/CashuWallet.js';
import { MeltQuoteResponse, ReceiveResponse } from '../src/model/types/index.js';
import { getDecodedToken } from '../src/utils.js';
import { AmountPreference } from '../src/model/types/index';
import { Proof } from '@cashu/crypto/modules/common';

const dummyKeysResp = {
	keysets: [
		{
			id: '009a1f293253e41e',
			unit: 'sat',
			keys: { 1: '02f970b6ee058705c0dddc4313721cffb7efd3d142d96ea8e01d31c2b2ff09f181' }
		}
	]
};
const mintUrl = 'http://localhost:3338';
const mint = new CashuMint(mintUrl);
const unit = 'sat';
const invoice =
	'lnbc20u1p3u27nppp5pm074ffk6m42lvae8c6847z7xuvhyknwgkk7pzdce47grf2ksqwsdpv2phhwetjv4jzqcneypqyc6t8dp6xu6twva2xjuzzda6qcqzpgxqyz5vqsp5sw6n7cztudpl5m5jv3z6dtqpt2zhd3q6dwgftey9qxv09w82rgjq9qyyssqhtfl8wv7scwp5flqvmgjjh20nf6utvv5daw5h43h69yqfwjch7wnra3cn94qkscgewa33wvfh7guz76rzsfg9pwlk8mqd27wavf2udsq3yeuju';

const mnemonic = 'half depart obvious quality work element tank gorilla view sugar picture humble';

beforeAll(() => {
	nock.disableNetConnect();
});

beforeEach(() => {
	nock.cleanAll();
	nock(mintUrl).get('/v1/keys').reply(200, dummyKeysResp);
	nock(mintUrl).get('/v1/keys/009a1f293253e41e').reply(200, dummyKeysResp);
});

describe('test info', () => {
	const mintInfoResp = JSON.parse(
		'{"name":"Testnut mint","pubkey":"0296d0aa13b6a31cf0cd974249f28c7b7176d7274712c95a41c7d8066d3f29d679","version":"Nutshell/0.16.0","description":"Mint for testing Cashu wallets","description_long":"This mint usually runs the latest main branch of the nutshell repository. All your Lightning invoices will always be marked paid so that you can test minting and melting ecash via Lightning.","contact":[{"method":"email","info":"contact@me.com"},{"method":"twitter","info":"@me"},{"method":"nostr","info":"npub..."}],"motd":"This is a message of the day field. You should display this field to your users if the content changes!","nuts":{"4":{"methods":[{"method":"bolt11","unit":"sat"},{"method":"bolt11","unit":"usd"}],"disabled":false},"5":{"methods":[{"method":"bolt11","unit":"sat"},{"method":"bolt11","unit":"usd"}],"disabled":false},"7":{"supported":true},"8":{"supported":true},"9":{"supported":true},"10":{"supported":true},"11":{"supported":true},"12":{"supported":true},"17":[{"method":"bolt11","unit":"sat","commands":["bolt11_melt_quote","proof_state","bolt11_mint_quote"]},{"method":"bolt11","unit":"usd","commands":["bolt11_melt_quote","proof_state","bolt11_mint_quote"]}]}}'
	);
	test('test info', async () => {
		nock(mintUrl).get('/v1/info').reply(200, mintInfoResp);
		const wallet = new CashuWallet(mint, { unit });

		const info = await wallet.getMintInfo();
		expect(info.contact).toEqual([
			{ method: 'email', info: 'contact@me.com' },
			{ method: 'twitter', info: '@me' },
			{ method: 'nostr', info: 'npub...' }
		]);
		expect(info).toEqual(mintInfoResp);
	});
	test('test info with deprecated contact field', async () => {
		// mintInfoRespDeprecated is the same as mintInfoResp but with the contact field in the old format
		const mintInfoRespDeprecated = JSON.parse(
			'{"name":"Testnut mint","pubkey":"0296d0aa13b6a31cf0cd974249f28c7b7176d7274712c95a41c7d8066d3f29d679","version":"Nutshell/0.16.0","description":"Mint for testing Cashu wallets","description_long":"This mint usually runs the latest main branch of the nutshell repository. All your Lightning invoices will always be marked paid so that you can test minting and melting ecash via Lightning.","contact":[["email","contact@me.com"],["twitter","@me"],["nostr","npub..."]],"motd":"This is a message of the day field. You should display this field to your users if the content changes!","nuts":{"4":{"methods":[{"method":"bolt11","unit":"sat"},{"method":"bolt11","unit":"usd"}],"disabled":false},"5":{"methods":[{"method":"bolt11","unit":"sat"},{"method":"bolt11","unit":"usd"}],"disabled":false},"7":{"supported":true},"8":{"supported":true},"9":{"supported":true},"10":{"supported":true},"11":{"supported":true},"12":{"supported":true},"17":[{"method":"bolt11","unit":"sat","commands":["bolt11_melt_quote","proof_state","bolt11_mint_quote"]},{"method":"bolt11","unit":"usd","commands":["bolt11_melt_quote","proof_state","bolt11_mint_quote"]}]}}'
		);
		nock(mintUrl).get('/v1/info').reply(200, mintInfoRespDeprecated);
		const wallet = new CashuWallet(mint, { unit });
		const info = await wallet.getMintInfo();
		expect(info.contact).toEqual([
			{ method: 'email', info: 'contact@me.com' },
			{ method: 'twitter', info: '@me' },
			{ method: 'nostr', info: 'npub...' }
		]);
		expect(info).toEqual(mintInfoResp);
	});
});

describe('test fees', () => {
	test('test melt quote fees', async () => {
		nock(mintUrl)
			.get('/v1/melt/quote/bolt11/test')
			.reply(200, {
				quote: 'test_melt_quote_id',
				amount: 2000,
				fee_reserve: 20,
				payment_preimage: null,
				state: 'UNPAID'
			} as MeltQuoteResponse);
		const wallet = new CashuWallet(mint, { unit });

		const fee = await wallet.checkMeltQuote('test');
		const amount = 2000;

		expect(fee.fee_reserve + amount).toEqual(2020);
	});
});

describe('receive', () => {
	const tokenInput =
		'cashuAeyJ0b2tlbiI6W3sicHJvb2ZzIjpbeyJpZCI6IjAwOWExZjI5MzI1M2U0MWUiLCJhbW91bnQiOjEsInNlY3JldCI6IjAxZjkxMDZkMTVjMDFiOTQwYzk4ZWE3ZTk2OGEwNmUzYWY2OTYxOGVkYjhiZThlNTFiNTEyZDA4ZTkwNzkyMTYiLCJDIjoiMDJmODVkZDg0YjBmODQxODQzNjZjYjY5MTQ2MTA2YWY3YzBmMjZmMmVlMGFkMjg3YTNlNWZhODUyNTI4YmIyOWRmIn1dLCJtaW50IjoiaHR0cDovL2xvY2FsaG9zdDozMzM4In1dfQ=';
	test('test receive encoded token', async () => {
		nock(mintUrl)
			.post('/v1/swap')
			.reply(200, {
				signatures: [
					{
						id: '009a1f293253e41e',
						amount: 1,
						C_: '021179b095a67380ab3285424b563b7aab9818bd38068e1930641b3dceb364d422'
					}
				]
			});
		const wallet = new CashuWallet(mint, { unit });

		const proofs = await wallet.receive(tokenInput);

		expect(proofs).toHaveLength(1);
		expect(proofs).toMatchObject([{ amount: 1, id: '009a1f293253e41e' }]);
		expect(/[0-9a-f]{64}/.test(proofs[0].C)).toBe(true);
		expect(/[0-9a-f]{64}/.test(proofs[0].secret)).toBe(true);
	});

	test('test receive raw token', async () => {
		const decodedInput = getDecodedToken(tokenInput);

		nock(mintUrl)
			.post('/v1/swap')
			.reply(200, {
				signatures: [
					{
						id: 'z32vUtKgNCm1',
						amount: 1,
						C_: '021179b095a67380ab3285424b563b7aab9818bd38068e1930641b3dceb364d422'
					}
				]
			});
		const wallet = new CashuWallet(mint);

		const proofs = await wallet.receive(decodedInput);

		expect(proofs).toHaveLength(1);
		expect(proofs).toMatchObject([{ amount: 1, id: 'z32vUtKgNCm1' }]);
		expect(/[0-9a-f]{64}/.test(proofs[0].C)).toBe(true);
		expect(/[0-9a-f]{64}/.test(proofs[0].secret)).toBe(true);
	});
	test('test receive custom split', async () => {
		nock(mintUrl)
			.post('/v1/swap')
			.reply(200, {
				signatures: [
					{
						id: '009a1f293253e41e',
						amount: 1,
						C_: '021179b095a67380ab3285424b563b7aab9818bd38068e1930641b3dceb364d422'
					},
					{
						id: '009a1f293253e41e',
						amount: 1,
						C_: '021179b095a67380ab3285424b563b7aab9818bd38068e1930641b3dceb364d422'
					},
					{
						id: '009a1f293253e41e',
						amount: 1,
						C_: '021179b095a67380ab3285424b563b7aab9818bd38068e1930641b3dceb364d422'
					}
				]
			});

		const wallet = new CashuWallet(mint, { unit });
		const token3sat =
			'cashuAeyJ0b2tlbiI6IFt7InByb29mcyI6IFt7ImlkIjogIjAwOWExZjI5MzI1M2U0MWUiLCAiYW1vdW50IjogMSwgInNlY3JldCI6ICJlN2MxYjc2ZDFiMzFlMmJjYTJiMjI5ZDE2MGJkZjYwNDZmMzNiYzQ1NzAyMjIzMDRiNjUxMTBkOTI2ZjdhZjg5IiwgIkMiOiAiMDM4OWNkOWY0Zjk4OGUzODBhNzk4OWQ0ZDQ4OGE3YzkxYzUyNzdmYjkzMDQ3ZTdhMmNjMWVkOGUzMzk2Yjg1NGZmIn0sIHsiaWQiOiAiMDA5YTFmMjkzMjUzZTQxZSIsICJhbW91bnQiOiAyLCAic2VjcmV0IjogImRlNTVjMTVmYWVmZGVkN2Y5Yzk5OWMzZDRjNjJmODFiMGM2ZmUyMWE3NTJmZGVmZjZiMDg0Y2YyZGYyZjVjZjMiLCAiQyI6ICIwMmRlNDBjNTlkOTAzODNiODg1M2NjZjNhNGIyMDg2NGFjODNiYTc1OGZjZTNkOTU5ZGJiODkzNjEwMDJlOGNlNDcifV0sICJtaW50IjogImh0dHA6Ly9sb2NhbGhvc3Q6MzMzOCJ9XX0=';

		const proofs = await wallet.receive(token3sat, {
			preference: [{ amount: 1, count: 3 }]
		});

		expect(proofs).toHaveLength(3);
		expect(proofs).toMatchObject([
			{ amount: 1, id: '009a1f293253e41e' },
			{ amount: 1, id: '009a1f293253e41e' },
			{ amount: 1, id: '009a1f293253e41e' }
		]);
		expect(/[0-9a-f]{64}/.test(proofs[0].C)).toBe(true);
		expect(/[0-9a-f]{64}/.test(proofs[0].secret)).toBe(true);
	});
	test('test receive tokens already spent', async () => {
		const msg = 'tokens already spent. Secret: asdasdasd';

		nock(mintUrl).post('/v1/swap').reply(400, { detail: msg });
		const wallet = new CashuWallet(mint, { unit });
		const result = await wallet.receive(tokenInput).catch((e) => e);
		expect(result).toEqual(new Error('Error when receiving'));
	});

	test('test receive could not verify proofs', async () => {
		nock(mintUrl).post('/v1/swap').reply(400, { code: 0, error: 'could not verify proofs.' });
		const wallet = new CashuWallet(mint, { unit });
		const result = await wallet.receive(tokenInput).catch((e) => e);
		expect(result).toEqual(new Error('Error when receiving'));
	});
});

describe('checkProofsSpent', () => {
	const proofs = [
		{
			id: '009a1f293253e41e',
			amount: 1,
			secret: '1f98e6837a434644c9411825d7c6d6e13974b931f8f0652217cea29010674a13',
			C: '034268c0bd30b945adf578aca2dc0d1e26ef089869aaf9a08ba3a6da40fda1d8be'
		}
	];
	test('test checkProofsSpent - get proofs that are NOT spendable', async () => {
		nock(mintUrl)
			.post('/v1/checkstate')
			.reply(200, { states: [{ Y: 'asd', state: 'UNSPENT', witness: 'witness-asd' }] });
		const wallet = new CashuWallet(mint, { unit });

		const result = await wallet.checkProofsSpent(proofs);

		expect(result).toStrictEqual([]);
	});
});

describe('payLnInvoice', () => {
	const proofs = [
		{
			id: '009a1f293253e41e',
			amount: 1,
			secret: '1f98e6837a434644c9411825d7c6d6e13974b931f8f0652217cea29010674a13',
			C: '034268c0bd30b945adf578aca2dc0d1e26ef089869aaf9a08ba3a6da40fda1d8be'
		}
	];
	test('test payLnInvoice base case', async () => {
		nock(mintUrl)
			.get('/v1/melt/quote/bolt11/test')
			.reply(200, {
				quote: 'test_melt_quote_id',
				amount: 2000,
				fee_reserve: 20,
				payment_preimage: null,
				state: 'PAID'
			} as MeltQuoteResponse);
		nock(mintUrl)
			.post('/v1/melt/bolt11')
			.reply(200, {
				quote: 'test_melt_quote_id',
				amount: 2000,
				fee_reserve: 20,
				payment_preimage: null,
				state: 'PAID'
			} as MeltQuoteResponse);

		const wallet = new CashuWallet(mint, { unit });
		const meltQuote = await wallet.checkMeltQuote('test');

		const result = await wallet.payLnInvoice(invoice, proofs, meltQuote);

		expect(result).toEqual({ isPaid: true, preimage: null, change: [] });
	});
	test('test payLnInvoice change', async () => {
		nock.cleanAll();
		nock(mintUrl)
			.get('/v1/keys')
			.reply(200, {
				keysets: [
					{
						id: '009a1f293253e41e',
						unit: 'sat',
						keys: {
							1: '02f970b6ee058705c0dddc4313721cffb7efd3d142d96ea8e01d31c2b2ff09f181',
							2: '03361cd8bd1329fea797a6add1cf1990ffcf2270ceb9fc81eeee0e8e9c1bd0cdf5'
						}
					}
				]
			});
		nock(mintUrl)
			.get('/v1/melt/quote/bolt11/test')
			.reply(200, {
				quote: 'test_melt_quote_id',
				amount: 2000,
				fee_reserve: 20,
				payment_preimage: 'asd',
				state: 'PAID'
			} as MeltQuoteResponse);
		nock(mintUrl)
			.post('/v1/melt/bolt11')
			.reply(200, {
				quote: 'test_melt_quote_id',
				amount: 2000,
				fee_reserve: 20,
				payment_preimage: 'asd',
				state: 'PAID',
				change: [
					{
						id: '009a1f293253e41e',
						amount: 2,
						C_: '0361a2725cfd88f60ded718378e8049a4a6cee32e214a9870b44c3ffea2dc9e625'
					}
				]
			});

		const wallet = new CashuWallet(mint, { unit });
		const meltQuote = await wallet.checkMeltQuote('test');
		const result = await wallet.payLnInvoice(invoice, [{ ...proofs[0], amount: 3 }], meltQuote);

		expect(result.isPaid).toBe(true);
		expect(result.preimage).toBe('asd');
		expect(result.change).toHaveLength(1);
	});
	test('test payLnInvoice bad resonse', async () => {
		nock(mintUrl).post('/v1/melt/bolt11').reply(200, {});
		const wallet = new CashuWallet(mint, { unit });
		const result = await wallet
			.payLnInvoice(invoice, proofs, {} as MeltQuoteResponse)
			.catch((e) => e);

		expect(result).toEqual(new Error('bad response'));
	});
});

describe('requestTokens', () => {
	test('test requestTokens', async () => {
		nock(mintUrl)
			.post('/v1/mint/bolt11')
			.reply(200, {
				signatures: [
					{
						id: '009a1f293253e41e',
						amount: 1,
						C_: '0361a2725cfd88f60ded718378e8049a4a6cee32e214a9870b44c3ffea2dc9e625'
					}
				]
			});
		const wallet = new CashuWallet(mint, { unit });

		const { proofs } = await wallet.mintTokens(1, '');

		expect(proofs).toHaveLength(1);
		expect(proofs[0]).toMatchObject({ amount: 1, id: '009a1f293253e41e' });
		expect(/[0-9a-f]{64}/.test(proofs[0].C)).toBe(true);
		expect(/[0-9a-f]{64}/.test(proofs[0].secret)).toBe(true);
	});
	test('test requestTokens bad resonse', async () => {
		nock(mintUrl).post('/v1/mint/bolt11').reply(200, {});
		const wallet = new CashuWallet(mint, { unit });

		const result = await wallet.mintTokens(1, '').catch((e) => e);

		expect(result).toEqual(new Error('bad response'));
	});
});

describe('send', () => {
	const proofs = [
		{
			id: '009a1f293253e41e',
			amount: 1,
			secret: '1f98e6837a434644c9411825d7c6d6e13974b931f8f0652217cea29010674a13',
			C: '034268c0bd30b945adf578aca2dc0d1e26ef089869aaf9a08ba3a6da40fda1d8be'
		}
	];
	test('test send base case', async () => {
		nock(mintUrl)
			.post('/split')
			.reply(200, {
				signatures: [
					{
						id: '009a1f293253e41e',
						amount: 1,
						C_: '021179b095a67380ab3285424b563b7aab9818bd38068e1930641b3dceb364d422'
					}
				]
			});
		const wallet = new CashuWallet(mint, { unit });

		const result = await wallet.send(1, proofs);

		expect(result.returnChange).toHaveLength(0);
		expect(result.send).toHaveLength(1);
		expect(result.send[0]).toMatchObject({ amount: 1, id: '009a1f293253e41e' });
		expect(/[0-9a-f]{64}/.test(result.send[0].C)).toBe(true);
		expect(/[0-9a-f]{64}/.test(result.send[0].secret)).toBe(true);
	});
	test('test send over paying. Should return change', async () => {
		nock(mintUrl)
			.post('/v1/swap')
			.reply(200, {
				signatures: [
					{
						id: '009a1f293253e41e',
						amount: 1,
						C_: '021179b095a67380ab3285424b563b7aab9818bd38068e1930641b3dceb364d422'
					},
					{
						id: '009a1f293253e41e',
						amount: 1,
						C_: '021179b095a67380ab3285424b563b7aab9818bd38068e1930641b3dceb364d422'
					}
				]
			});
		const wallet = new CashuWallet(mint, { unit });

		const result = await wallet.send(1, [
			{
				id: '009a1f293253e41e',
				amount: 2,
				secret: '1f98e6837a434644c9411825d7c6d6e13974b931f8f0652217cea29010674a13',
				C: '034268c0bd30b945adf578aca2dc0d1e26ef089869aaf9a08ba3a6da40fda1d8be'
			}
		]);

		expect(result.send).toHaveLength(1);
		expect(result.send[0]).toMatchObject({ amount: 1, id: '009a1f293253e41e' });
		expect(/[0-9a-f]{64}/.test(result.send[0].C)).toBe(true);
		expect(/[0-9a-f]{64}/.test(result.send[0].secret)).toBe(true);
		expect(result.returnChange).toHaveLength(1);
		expect(result.returnChange[0]).toMatchObject({ amount: 1, id: '009a1f293253e41e' });
		expect(/[0-9a-f]{64}/.test(result.returnChange[0].C)).toBe(true);
		expect(/[0-9a-f]{64}/.test(result.returnChange[0].secret)).toBe(true);
	});

	test('test send over paying2', async () => {
		nock(mintUrl)
			.post('/v1/swap')
			.reply(200, {
				signatures: [
					{
						id: '009a1f293253e41e',
						amount: 1,
						C_: '021179b095a67380ab3285424b563b7aab9818bd38068e1930641b3dceb364d422'
					},
					{
						id: '009a1f293253e41e',
						amount: 1,
						C_: '021179b095a67380ab3285424b563b7aab9818bd38068e1930641b3dceb364d422'
					}
				]
			});
		const wallet = new CashuWallet(mint, { unit });

		const overpayProofs = [
			{
				id: '009a1f293253e41e',
				amount: 2,
				secret: '1f98e6837a434644c9411825d7c6d6e13974b931f8f0652217cea29010674a13',
				C: '034268c0bd30b945adf578aca2dc0d1e26ef089869aaf9a08ba3a6da40fda1d8be'
			}
		];
		const result = await wallet.send(1, overpayProofs);

		expect(result.send).toHaveLength(1);
		expect(result.send[0]).toMatchObject({ amount: 1, id: '009a1f293253e41e' });
		expect(/[0-9a-f]{64}/.test(result.send[0].C)).toBe(true);
		expect(/[0-9a-f]{64}/.test(result.send[0].secret)).toBe(true);
		expect(result.returnChange).toHaveLength(1);
		expect(result.returnChange[0]).toMatchObject({ amount: 1, id: '009a1f293253e41e' });
		expect(/[0-9a-f]{64}/.test(result.returnChange[0].C)).toBe(true);
		expect(/[0-9a-f]{64}/.test(result.returnChange[0].secret)).toBe(true);
	});
	test('test send preference', async () => {
		nock(mintUrl)
			.post('/v1/swap')
			.reply(200, {
				signatures: [
					{
						id: '009a1f293253e41e',
						amount: 1,
						C_: '021179b095a67380ab3285424b563b7aab9818bd38068e1930641b3dceb364d422'
					},
					{
						id: '009a1f293253e41e',
						amount: 1,
						C_: '021179b095a67380ab3285424b563b7aab9818bd38068e1930641b3dceb364d422'
					},
					{
						id: '009a1f293253e41e',
						amount: 1,
						C_: '021179b095a67380ab3285424b563b7aab9818bd38068e1930641b3dceb364d422'
					},
					{
						id: '009a1f293253e41e',
						amount: 1,
						C_: '021179b095a67380ab3285424b563b7aab9818bd38068e1930641b3dceb364d422'
					}
				]
			});
		const wallet = new CashuWallet(mint, { unit });

		const overpayProofs = [
			{
				id: '009a1f293253e41e',
				amount: 2,
				secret: '1f98e6837a434644c9411825d7c6d6e13974b931f8f0652217cea29010674a13',
				C: '034268c0bd30b945adf578aca2dc0d1e26ef089869aaf9a08ba3a6da40fda1d8be'
			},
			{
				id: '009a1f293253e41e',
				amount: 2,
				secret: '1f98e6837a434644c9411825d7c6d6e13974b931f8f0652217cea29010674a13',
				C: '034268c0bd30b945adf578aca2dc0d1e26ef089869aaf9a08ba3a6da40fda1d8be'
			}
		];
		const result = await wallet.send(4, overpayProofs, { preference: [{ amount: 1, count: 4 }] });

		expect(result.send).toHaveLength(4);
		expect(result.send[0]).toMatchObject({ amount: 1, id: '009a1f293253e41e' });
		expect(result.send[1]).toMatchObject({ amount: 1, id: '009a1f293253e41e' });
		expect(result.send[2]).toMatchObject({ amount: 1, id: '009a1f293253e41e' });
		expect(result.send[3]).toMatchObject({ amount: 1, id: '009a1f293253e41e' });
		expect(/[0-9a-f]{64}/.test(result.send[0].C)).toBe(true);
		expect(/[0-9a-f]{64}/.test(result.send[0].secret)).toBe(true);
		expect(result.returnChange).toHaveLength(0);
	});

	test('test send preference overpay', async () => {
		nock(mintUrl)
			.post('/v1/swap')
			.reply(200, {
				signatures: [
					{
						id: '009a1f293253e41e',
						amount: 1,
						C_: '021179b095a67380ab3285424b563b7aab9818bd38068e1930641b3dceb364d422'
					},
					{
						id: '009a1f293253e41e',
						amount: 1,
						C_: '021179b095a67380ab3285424b563b7aab9818bd38068e1930641b3dceb364d422'
					},
					{
						id: '009a1f293253e41e',
						amount: 1,
						C_: '021179b095a67380ab3285424b563b7aab9818bd38068e1930641b3dceb364d422'
					},
					{
						id: '009a1f293253e41e',
						amount: 1,
						C_: '021179b095a67380ab3285424b563b7aab9818bd38068e1930641b3dceb364d422'
					}
				]
			});
		const wallet = new CashuWallet(mint, { unit });

		const overpayProofs = [
			{
				id: '009a1f293253e41e',
				amount: 2,
				secret: '1f98e6837a434644c9411825d7c6d6e13974b931f8f0652217cea29010674a13',
				C: '034268c0bd30b945adf578aca2dc0d1e26ef089869aaf9a08ba3a6da40fda1d8be'
			},
			{
				id: '009a1f293253e41e',
				amount: 2,
				secret: '1f98e6837a434644c9411825d7c6d6e13974b931f8f0652217cea29010674a13',
				C: '034268c0bd30b945adf578aca2dc0d1e26ef089869aaf9a08ba3a6da40fda1d8be'
			}
		];
		const result = await wallet.send(4, overpayProofs, { preference: [{ amount: 1, count: 3 }] });

		expect(result.send).toHaveLength(3);
		expect(result.send[0]).toMatchObject({ amount: 1, id: '009a1f293253e41e' });
		expect(result.send[1]).toMatchObject({ amount: 1, id: '009a1f293253e41e' });
		expect(result.send[2]).toMatchObject({ amount: 1, id: '009a1f293253e41e' });
		expect(/[0-9a-f]{64}/.test(result.send[0].C)).toBe(true);
		expect(/[0-9a-f]{64}/.test(result.send[0].secret)).toBe(true);
		expect(result.returnChange).toHaveLength(1);
		expect(result.returnChange[0]).toMatchObject({ amount: 1, id: '009a1f293253e41e' });
	});

	test('test send not enough funds', async () => {
		nock(mintUrl)
			.post('/v1/swap')
			.reply(200, {
				signatures: [
					{
						id: '009a1f293253e41e',
						amount: 1,
						C_: '021179b095a67380ab3285424b563b7aab9818bd38068e1930641b3dceb364d422'
					}
				]
			});
		const wallet = new CashuWallet(mint, { unit });

		const result = await wallet.send(2, proofs).catch((e) => e);

		expect(result).toEqual(new Error('Not enough funds available'));
	});
	test('test send bad response', async () => {
		nock(mintUrl).post('/v1/swap').reply(200, {});
		const wallet = new CashuWallet(mint, { unit });

		const result = await wallet
			.send(1, [
				{
					id: '009a1f293253e41e',
					amount: 2,
					secret: '1f98e6837a434644c9411825d7c6d6e13974b931f8f0652217cea29010674a13',
					C: '034268c0bd30b945adf578aca2dc0d1e26ef089869aaf9a08ba3a6da40fda1d8be'
				}
			])
			.catch((e) => e);

		expect(result).toEqual(new Error('bad response'));
	});
});

describe('deterministic', () => {
	test('no seed', async () => {
		const wallet = new CashuWallet(mint);
		const result = await wallet
			.send(
				1,
				[
					{
						id: 'z32vUtKgNCm1',
						amount: 2,
						secret: '1f98e6837a434644c9411825d7c6d6e13974b931f8f0652217cea29010674a13',
						C: '034268c0bd30b945adf578aca2dc0d1e26ef089869aaf9a08ba3a6da40fda1d8be'
					}
				],
				{ counter: 1 }
			)
			.catch((e) => e);
		expect(result).toEqual(
			new Error(
				'Cannot create deterministic messages without seed. Instantiate CashuWallet with a mnemonic, or omit counter param.'
			)
		);
	});
});
