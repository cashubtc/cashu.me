import nock from 'nock';
import { CashuMint } from '../src/CashuMint.js';
import { CashuWallet } from '../src/CashuWallet.js';
import { MeltQuoteResponse, ReceiveResponse } from '../src/model/types/index.js';
import { cleanToken, getDecodedToken } from '../src/utils.js';
import { AmountPreference } from '../src/model/types/index';

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

describe('test fees', () => {
	test('test melt quote fees', async () => {
		nock(mintUrl).post('/v1/melt/quote/bolt11').reply(200, {
			quote: 'test_melt_quote_id',
			amount: 2000,
			fee_reserve: 20
		});
		const wallet = new CashuWallet(mint, { unit });

		const fee = await wallet.getMeltQuote(invoice);
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

		const response: ReceiveResponse = await wallet.receive(tokenInput);

		expect(response.token.token).toHaveLength(1);
		expect(response.token.token[0].proofs).toHaveLength(1);
		expect(response.token.token[0]).toMatchObject({
			proofs: [{ amount: 1, id: '009a1f293253e41e' }],
			mint: mintUrl
		});
		expect(/[0-9a-f]{64}/.test(response.token.token[0].proofs[0].C)).toBe(true);
		expect(/[0-9a-f]{64}/.test(response.token.token[0].proofs[0].secret)).toBe(true);
		expect(response.tokensWithErrors).toBe(undefined);
	});

	test('test receive raw token', async () => {
		const decodedInput = cleanToken(getDecodedToken(tokenInput));

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

		const { token: t, tokensWithErrors } = await wallet.receive(decodedInput);

		expect(t.token).toHaveLength(1);
		expect(t.token[0].proofs).toHaveLength(1);
		expect(t.token[0]).toMatchObject({
			proofs: [{ amount: 1, id: 'z32vUtKgNCm1' }],
			mint: 'http://localhost:3338'
		});
		expect(/[0-9a-f]{64}/.test(t.token[0].proofs[0].C)).toBe(true);
		expect(/[0-9a-f]{64}/.test(t.token[0].proofs[0].secret)).toBe(true);
		expect(tokensWithErrors).toBe(undefined);
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

		const response: ReceiveResponse = await wallet.receive(token3sat, {
			preference: [{ amount: 1, count: 3 }]
		});

		expect(response.token.token).toHaveLength(1);
		expect(response.token.token[0].proofs).toHaveLength(3);
		expect(response.token.token[0]).toMatchObject({
			proofs: [
				{ amount: 1, id: '009a1f293253e41e' },
				{ amount: 1, id: '009a1f293253e41e' },
				{ amount: 1, id: '009a1f293253e41e' }
			]
		});
		expect(/[0-9a-f]{64}/.test(response.token.token[0].proofs[0].C)).toBe(true);
		expect(/[0-9a-f]{64}/.test(response.token.token[0].proofs[0].secret)).toBe(true);
		expect(response.tokensWithErrors).toBe(undefined);
	});
	test('test receive tokens already spent', async () => {
		const msg = 'tokens already spent. Secret: asdasdasd';

		nock(mintUrl).post('/v1/swap').reply(200, { detail: msg });
		const wallet = new CashuWallet(mint, { unit });

		const { tokensWithErrors } = await wallet.receive(tokenInput);
		const t = tokensWithErrors!;

		expect(tokensWithErrors).toBeDefined();
		expect(t.token).toHaveLength(1);
		expect(t.token[0].proofs).toHaveLength(1);
		expect(t.token[0]).toMatchObject({
			proofs: [{ amount: 1, id: '009a1f293253e41e' }],
			mint: 'http://localhost:3338'
		});
		expect(/[0-9a-f]{64}/.test(t.token[0].proofs[0].C)).toBe(true);
		expect(/[0-9a-f]{64}/.test(t.token[0].proofs[0].secret)).toBe(true);
	});
	test('test receive could not verify proofs', async () => {
		nock(mintUrl).post('/v1/split').reply(200, { code: 0, error: 'could not verify proofs.' });
		const wallet = new CashuWallet(mint, { unit });

		const { tokensWithErrors } = await wallet.receive(tokenInput);
		const t = tokensWithErrors!;

		expect(tokensWithErrors).toBeDefined();
		expect(t.token).toHaveLength(1);
		expect(t.token[0].proofs).toHaveLength(1);
		expect(t.token[0]).toMatchObject({
			proofs: [{ amount: 1, id: '009a1f293253e41e' }],
			mint: 'http://localhost:3338'
		});
		expect(/[0-9a-f]{64}/.test(t.token[0].proofs[0].C)).toBe(true);
		expect(/[0-9a-f]{64}/.test(t.token[0].proofs[0].secret)).toBe(true);
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
			.post('/v1/melt/quote/bolt11')
			.reply(200, { quote: 'quote_id', amount: 123, fee_reserve: 0 });
		nock(mintUrl).post('/v1/melt/bolt11').reply(200, { paid: true, payment_preimage: '' });

		const wallet = new CashuWallet(mint, { unit });
		const meltQuote = await wallet.getMeltQuote('lnbcabbc');

		const result = await wallet.payLnInvoice(invoice, proofs, meltQuote);

		expect(result).toEqual({ isPaid: true, preimage: '', change: [] });
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
			.post('/v1/melt/quote/bolt11')
			.reply(200, { quote: 'quote_id', amount: 123, fee_reserve: 2 });
		nock(mintUrl)
			.post('/v1/melt/bolt11')
			.reply(200, {
				paid: true,
				payment_preimage: 'asd',
				change: [
					{
						id: '009a1f293253e41e',
						amount: 2,
						C_: '0361a2725cfd88f60ded718378e8049a4a6cee32e214a9870b44c3ffea2dc9e625'
					}
				]
			});

		const wallet = new CashuWallet(mint, { unit });
		const meltQuote = await wallet.getMeltQuote('lnbcabbc');
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
