import { blindMessage, constructProofFromPromise, serializeProof } from '../src/crypto/client/';
import { test, describe, expect } from 'vitest';
import { Keys, Proof, Token } from '../src/model/types/index.js';
import * as utils from '../src/utils.js';
import { PUBKEYS } from './consts.js';
import { createDLEQProof } from '../src/crypto/mint/NUT12';
import { hasValidDleq, hexToNumber, numberToHexPadded64 } from '../src/utils.js';
import { bytesToHex, hexToBytes } from '@noble/curves/abstract/utils';
import { createBlindSignature, getPubKeyFromPrivKey } from '../src/crypto/mint';
import { pointFromBytes } from '../src/crypto/common';

const keys: Keys = {};
for (let i = 1; i <= 2048; i *= 2) {
	keys[i] = 'deadbeef';
}

const keys_base10: Keys = {};
for (let i = 1; i <= 10000; i *= 10) {
	keys_base10[i] = 'deadbeef';
}

const keys_base16: Keys = {};
for (let i = 1; i <= 0x10000; i *= 16) {
	keys_base16[i] = 'deadbeef';
}

describe('test split amounts ', () => {
	test('testing amount 2561', async () => {
		const chunks = utils.splitAmount(2561, keys);
		expect(chunks).toStrictEqual([1, 512, 2048]);
	});
	test('testing amount 0', async () => {
		const chunks = utils.splitAmount(0, keys);
		expect(chunks).toStrictEqual([]);
	});
});

describe('test split custom amounts ', () => {
	const fiveToOne = [1, 1, 1, 1, 1];
	test('testing amount 5', async () => {
		const chunks = utils.splitAmount(5, keys, fiveToOne);
		expect(chunks).toStrictEqual([1, 1, 1, 1, 1]);
	});
	const tenToOneAndTwo = [1, 1, 2, 2, 2, 2];
	test('testing amount 10', async () => {
		const chunks = utils.splitAmount(10, keys, tenToOneAndTwo);
		expect(chunks).toStrictEqual([1, 1, 2, 2, 2, 2]);
	});
	test('testing amount 12', async () => {
		const chunks = utils.splitAmount(12, keys, tenToOneAndTwo);
		expect(chunks).toStrictEqual([1, 1, 2, 2, 2, 2, 2]);
	});
	const fiveTwelve = [512];
	test('testing amount 518', async () => {
		const chunks = utils.splitAmount(518, keys, fiveTwelve, 'desc');
		expect(chunks).toStrictEqual([512, 4, 2]);
	});
	const tooMuch = [512, 512];
	test('testing amount 512 but split too much', async () => {
		expect(() => utils.splitAmount(512, keys, tooMuch)).toThrowError();
	});
	const illegal = [3, 3];
	test('testing non pow2', async () => {
		expect(() => utils.splitAmount(6, keys, illegal)).toThrowError();
	});
	const empty: Array<number> = [];
	test('testing empty', async () => {
		const chunks = utils.splitAmount(5, keys, empty, 'desc');
		expect(chunks).toStrictEqual([4, 1]);
	});
	const undef = undefined;
	test('testing undefined', async () => {
		const chunks = utils.splitAmount(5, keys, undef);
		expect(chunks).toStrictEqual([1, 4]);
	});
});

describe('test split different key amount', () => {
	test('testing amount 68251', async () => {
		const chunks = utils.splitAmount(68251, keys_base10, undefined, 'desc');
		expect(chunks).toStrictEqual([
			10000, 10000, 10000, 10000, 10000, 10000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 100,
			100, 10, 10, 10, 10, 10, 1
		]);
	});
	test('testing amount 1917', async () => {
		const chunks = utils.splitAmount(1917, keys_base16);
		expect(chunks).toStrictEqual([
			1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 16, 16, 16, 16, 16, 16, 16, 256, 256, 256, 256, 256,
			256, 256
		]);
	});
});

describe('test token v3 encoding', () => {
	test('encode a v3 token with getEncodedToken', () => {
		const tokenObj = {
			token: [
				{
					mint: 'https://8333.space:3338',
					proofs: [
						{
							amount: 2,
							id: '009a1f293253e41e',
							secret: '407915bc212be61a77e3e6d2aeb4c727980bda51cd06a6afc29e2861768a7837',
							C: '02bc9097997d81afb2cc7346b5e4345a9346bd2a506eb7958598a72f0cf85163ea'
						},
						{
							amount: 8,
							id: '009a1f293253e41e',
							secret: 'fe15109314e61d7756b0f8ee0f23a624acaa3f4e042f61433c728c7057b931be',
							C: '029e8e5050b890a7d6c0968db16bc1d5d5fa040ea1de284f6ec69d61299f671059'
						}
					]
				}
			],
			unit: 'sat',
			memo: 'Thank you.'
		};
		const encoded = utils.getEncodedToken(
			{
				mint: tokenObj.token[0].mint,
				memo: tokenObj.memo,
				unit: tokenObj.unit,
				proofs: tokenObj.token[0].proofs
			},
			{ version: 3 }
		);
		expect(encoded).toBe(
			'cashuAeyJ0b2tlbiI6W3sibWludCI6Imh0dHBzOi8vODMzMy5zcGFjZTozMzM4IiwicHJvb2ZzIjpbeyJhbW91bnQiOjIsImlkIjoiMDA5YTFmMjkzMjUzZTQxZSIsInNlY3JldCI6IjQwNzkxNWJjMjEyYmU2MWE3N2UzZTZkMmFlYjRjNzI3OTgwYmRhNTFjZDA2YTZhZmMyOWUyODYxNzY4YTc4MzciLCJDIjoiMDJiYzkwOTc5OTdkODFhZmIyY2M3MzQ2YjVlNDM0NWE5MzQ2YmQyYTUwNmViNzk1ODU5OGE3MmYwY2Y4NTE2M2VhIn0seyJhbW91bnQiOjgsImlkIjoiMDA5YTFmMjkzMjUzZTQxZSIsInNlY3JldCI6ImZlMTUxMDkzMTRlNjFkNzc1NmIwZjhlZTBmMjNhNjI0YWNhYTNmNGUwNDJmNjE0MzNjNzI4YzcwNTdiOTMxYmUiLCJDIjoiMDI5ZThlNTA1MGI4OTBhN2Q2YzA5NjhkYjE2YmMxZDVkNWZhMDQwZWExZGUyODRmNmVjNjlkNjEyOTlmNjcxMDU5In1dfV0sInVuaXQiOiJzYXQiLCJtZW1vIjoiVGhhbmsgeW91LiJ9'
		);
	});
	test('encode a v3 token with getEncodedTokenV3', () => {
		const tokenObj = {
			token: [
				{
					mint: 'https://8333.space:3338',
					proofs: [
						{
							amount: 2,
							id: '009a1f293253e41e',
							secret: '407915bc212be61a77e3e6d2aeb4c727980bda51cd06a6afc29e2861768a7837',
							C: '02bc9097997d81afb2cc7346b5e4345a9346bd2a506eb7958598a72f0cf85163ea'
						},
						{
							amount: 8,
							id: '009a1f293253e41e',
							secret: 'fe15109314e61d7756b0f8ee0f23a624acaa3f4e042f61433c728c7057b931be',
							C: '029e8e5050b890a7d6c0968db16bc1d5d5fa040ea1de284f6ec69d61299f671059'
						}
					]
				}
			],
			unit: 'sat',
			memo: 'Thank you.'
		};
		const encoded = utils.getEncodedTokenV3({
			mint: tokenObj.token[0].mint,
			memo: tokenObj.memo,
			unit: tokenObj.unit,
			proofs: tokenObj.token[0].proofs
		});
		expect(encoded).toBe(
			'cashuAeyJ0b2tlbiI6W3sibWludCI6Imh0dHBzOi8vODMzMy5zcGFjZTozMzM4IiwicHJvb2ZzIjpbeyJhbW91bnQiOjIsImlkIjoiMDA5YTFmMjkzMjUzZTQxZSIsInNlY3JldCI6IjQwNzkxNWJjMjEyYmU2MWE3N2UzZTZkMmFlYjRjNzI3OTgwYmRhNTFjZDA2YTZhZmMyOWUyODYxNzY4YTc4MzciLCJDIjoiMDJiYzkwOTc5OTdkODFhZmIyY2M3MzQ2YjVlNDM0NWE5MzQ2YmQyYTUwNmViNzk1ODU5OGE3MmYwY2Y4NTE2M2VhIn0seyJhbW91bnQiOjgsImlkIjoiMDA5YTFmMjkzMjUzZTQxZSIsInNlY3JldCI6ImZlMTUxMDkzMTRlNjFkNzc1NmIwZjhlZTBmMjNhNjI0YWNhYTNmNGUwNDJmNjE0MzNjNzI4YzcwNTdiOTMxYmUiLCJDIjoiMDI5ZThlNTA1MGI4OTBhN2Q2YzA5NjhkYjE2YmMxZDVkNWZhMDQwZWExZGUyODRmNmVjNjlkNjEyOTlmNjcxMDU5In1dfV0sInVuaXQiOiJzYXQiLCJtZW1vIjoiVGhhbmsgeW91LiJ9'
		);
	});
});

describe('test decode token', () => {
	test('testing v3 Token', async () => {
		const obj = {
			proofs: [
				{
					C: '02195081e622f98bfc19a05ebe2341d955c0d12588c5948c858d07adec007bc1e4',
					amount: 1,
					id: 'I2yN+iRYfkzT',
					secret: '97zfmmaGf5k8Mg0gajpnbmpervTtEeE8wwKri7rWpUs='
				}
			],
			mint: 'http://localhost:3338',
			unit: 'sat'
		};
		const uriPrefixes = ['web+cashu://', 'cashu://', 'cashu:'];
		uriPrefixes.forEach((prefix) => {
			const token =
				prefix +
				'cashuAeyJ0b2tlbiI6W3sibWludCI6Imh0dHA6Ly9sb2NhbGhvc3Q6MzMzOCIsInByb29mcyI6W3siaWQiOiJJMnlOK2lSWWZrelQiLCJhbW91bnQiOjEsInNlY3JldCI6Ijk3emZtbWFHZjVrOE1nMGdhanBuYm1wZXJ2VHRFZUU4d3dLcmk3cldwVXM9IiwiQyI6IjAyMTk1MDgxZTYyMmY5OGJmYzE5YTA1ZWJlMjM0MWQ5NTVjMGQxMjU4OGM1OTQ4Yzg1OGQwN2FkZWMwMDdiYzFlNCJ9XX1dfQ';

			const result = utils.getDecodedToken(token);
			expect(result).toStrictEqual(obj);
		});
	});
	test('testing v3 Token no prefix', async () => {
		const obj = {
			proofs: [
				{
					C: '02195081e622f98bfc19a05ebe2341d955c0d12588c5948c858d07adec007bc1e4',
					amount: 1,
					id: 'I2yN+iRYfkzT',
					secret: '97zfmmaGf5k8Mg0gajpnbmpervTtEeE8wwKri7rWpUs='
				}
			],
			mint: 'http://localhost:3338',
			unit: 'sat'
		};

		const token =
			'AeyJ0b2tlbiI6W3sibWludCI6Imh0dHA6Ly9sb2NhbGhvc3Q6MzMzOCIsInByb29mcyI6W3siaWQiOiJJMnlOK2lSWWZrelQiLCJhbW91bnQiOjEsInNlY3JldCI6Ijk3emZtbWFHZjVrOE1nMGdhanBuYm1wZXJ2VHRFZUU4d3dLcmk3cldwVXM9IiwiQyI6IjAyMTk1MDgxZTYyMmY5OGJmYzE5YTA1ZWJlMjM0MWQ5NTVjMGQxMjU4OGM1OTQ4Yzg1OGQwN2FkZWMwMDdiYzFlNCJ9XX1dfQ';
		const result = utils.getDecodedToken(token);
		expect(result).toStrictEqual(obj);
	});
	test('testing v4 Token', () => {
		const v3Token = {
			memo: 'Thank you',
			unit: 'sat',
			mint: 'http://localhost:3338',
			proofs: [
				{
					secret: '9a6dbb847bd232ba76db0df197216b29d3b8cc14553cd27827fc1cc942fedb4e',
					C: '038618543ffb6b8695df4ad4babcde92a34a96bdcd97dcee0d7ccf98d472126792',
					id: '00ad268c4d1f5826',
					amount: 1
				}
			]
		};

		const token =
			'cashuBpGF0gaJhaUgArSaMTR9YJmFwgaNhYQFhc3hAOWE2ZGJiODQ3YmQyMzJiYTc2ZGIwZGYxOTcyMTZiMjlkM2I4Y2MxNDU1M2NkMjc4MjdmYzFjYzk0MmZlZGI0ZWFjWCEDhhhUP_trhpXfStS6vN6So0qWvc2X3O4NfM-Y1HISZ5JhZGlUaGFuayB5b3VhbXVodHRwOi8vbG9jYWxob3N0OjMzMzhhdWNzYXQ=';

		const result = utils.getDecodedToken(token);
		expect(result).toStrictEqual(v3Token);
	});
	test('testing v4 Token with multi keyset', () => {
		const v3Token = {
			unit: 'sat',
			mint: 'http://localhost:3338',
			proofs: [
				{
					secret: 'acc12435e7b8484c3cf1850149218af90f716a52bf4a5ed347e48ecc13f77388',
					C: '0244538319de485d55bed3b29a642bee5879375ab9e7a620e11e48ba482421f3cf',
					id: '00ffd48b8f5ecf80',
					amount: 1
				},
				{
					secret: '1323d3d4707a58ad2e23ada4e9f1f49f5a5b4ac7b708eb0d61f738f48307e8ee',
					C: '023456aa110d84b4ac747aebd82c3b005aca50bf457ebd5737a4414fac3ae7d94d',
					id: '00ad268c4d1f5826',
					amount: 2
				},
				{
					secret: '56bcbcbb7cc6406b3fa5d57d2174f4eff8b4402b176926d3a57d3c3dcbb59d57',
					C: '0273129c5719e599379a974a626363c333c56cafc0e6d01abe46d5808280789c63',
					id: '00ad268c4d1f5826',
					amount: 1
				}
			]
		};

		const token =
			'cashuBo2F0gqJhaUgA_9SLj17PgGFwgaNhYQFhc3hAYWNjMTI0MzVlN2I4NDg0YzNjZjE4NTAxNDkyMThhZjkwZjcxNmE1MmJmNGE1ZWQzNDdlNDhlY2MxM2Y3NzM4OGFjWCECRFODGd5IXVW-07KaZCvuWHk3WrnnpiDhHki6SCQh88-iYWlIAK0mjE0fWCZhcIKjYWECYXN4QDEzMjNkM2Q0NzA3YTU4YWQyZTIzYWRhNGU5ZjFmNDlmNWE1YjRhYzdiNzA4ZWIwZDYxZjczOGY0ODMwN2U4ZWVhY1ghAjRWqhENhLSsdHrr2Cw7AFrKUL9Ffr1XN6RBT6w659lNo2FhAWFzeEA1NmJjYmNiYjdjYzY0MDZiM2ZhNWQ1N2QyMTc0ZjRlZmY4YjQ0MDJiMTc2OTI2ZDNhNTdkM2MzZGNiYjU5ZDU3YWNYIQJzEpxXGeWZN5qXSmJjY8MzxWyvwObQGr5G1YCCgHicY2FtdWh0dHA6Ly9sb2NhbGhvc3Q6MzMzOGF1Y3NhdA==';

		const result = utils.getDecodedToken(token);
		expect(result).toStrictEqual(v3Token);
	});
});

describe('test keyset derivation', () => {
	test('derive', () => {
		const keys = PUBKEYS;
		const keysetId = utils.deriveKeysetId(keys);
		expect(keysetId).toBe('009a1f293253e41e');
	});
});

describe('test v4 encoding', () => {
	test('standard token', async () => {
		const encodedV4 =
			'cashuBpGF0gaJhaUgArSaMTR9YJmFwgaNhYQFhc3hAOWE2ZGJiODQ3YmQyMzJiYTc2ZGIwZGYxOTcyMTZiMjlkM2I4Y2MxNDU1M2NkMjc4MjdmYzFjYzk0MmZlZGI0ZWFjWCEDhhhUP_trhpXfStS6vN6So0qWvc2X3O4NfM-Y1HISZ5JhZGlUaGFuayB5b3VhbXVodHRwOi8vbG9jYWxob3N0OjMzMzhhdWNzYXQ=';
		const v3Token = {
			memo: 'Thank you',
			mint: 'http://localhost:3338',
			proofs: [
				{
					secret: '9a6dbb847bd232ba76db0df197216b29d3b8cc14553cd27827fc1cc942fedb4e',
					C: '038618543ffb6b8695df4ad4babcde92a34a96bdcd97dcee0d7ccf98d472126792',
					id: '00ad268c4d1f5826',
					amount: 1
				}
			],
			unit: 'sat'
		};
		const encoded = utils.getEncodedTokenV4(v3Token);
		const decodedEncodedToken = utils.getDecodedToken(encoded);
		const decodedExpectedToken = utils.getDecodedToken(encodedV4);
		expect(decodedEncodedToken).toEqual(v3Token);
		expect(decodedExpectedToken).toEqual(decodedEncodedToken);
	});
	test('multi Id token', async () => {
		const encodedV4 =
			'cashuBo2F0gqJhaUgA_9SLj17PgGFwgaNhYQFhc3hAYWNjMTI0MzVlN2I4NDg0YzNjZjE4NTAxNDkyMThhZjkwZjcxNmE1MmJmNGE1ZWQzNDdlNDhlY2MxM2Y3NzM4OGFjWCECRFODGd5IXVW-07KaZCvuWHk3WrnnpiDhHki6SCQh88-iYWlIAK0mjE0fWCZhcIKjYWECYXN4QDEzMjNkM2Q0NzA3YTU4YWQyZTIzYWRhNGU5ZjFmNDlmNWE1YjRhYzdiNzA4ZWIwZDYxZjczOGY0ODMwN2U4ZWVhY1ghAjRWqhENhLSsdHrr2Cw7AFrKUL9Ffr1XN6RBT6w659lNo2FhAWFzeEA1NmJjYmNiYjdjYzY0MDZiM2ZhNWQ1N2QyMTc0ZjRlZmY4YjQ0MDJiMTc2OTI2ZDNhNTdkM2MzZGNiYjU5ZDU3YWNYIQJzEpxXGeWZN5qXSmJjY8MzxWyvwObQGr5G1YCCgHicY2FtdWh0dHA6Ly9sb2NhbGhvc3Q6MzMzOGF1Y3NhdA';
		const v3Token = {
			mint: 'http://localhost:3338',
			proofs: [
				{
					secret: 'acc12435e7b8484c3cf1850149218af90f716a52bf4a5ed347e48ecc13f77388',
					C: '0244538319de485d55bed3b29a642bee5879375ab9e7a620e11e48ba482421f3cf',
					id: '00ffd48b8f5ecf80',
					amount: 1
				},
				{
					secret: '1323d3d4707a58ad2e23ada4e9f1f49f5a5b4ac7b708eb0d61f738f48307e8ee',
					C: '023456aa110d84b4ac747aebd82c3b005aca50bf457ebd5737a4414fac3ae7d94d',
					id: '00ad268c4d1f5826',
					amount: 2
				},
				{
					secret: '56bcbcbb7cc6406b3fa5d57d2174f4eff8b4402b176926d3a57d3c3dcbb59d57',
					C: '0273129c5719e599379a974a626363c333c56cafc0e6d01abe46d5808280789c63',
					id: '00ad268c4d1f5826',
					amount: 1
				}
			],
			unit: 'sat'
		};

		const encoded = utils.getEncodedTokenV4(v3Token);
		const decodedEncodedToken = utils.getDecodedToken(encoded);
		const decodedExpectedToken = utils.getDecodedToken(encodedV4);
		expect(decodedEncodedToken).toEqual(v3Token);
		expect(decodedExpectedToken).toEqual(decodedEncodedToken);
	});
});

describe('test output selection', () => {
	test('keep amounts', () => {
		const amountsWeHave = [1, 2, 4, 4, 4, 8];
		const proofsWeHave = amountsWeHave.map((amount) => {
			return {
				amount: amount,
				id: 'id',
				C: 'C'
			} as Proof;
		});
		const keys = PUBKEYS as Keys;

		// info: getKeepAmounts returns the amounts we need to fill up
		// the wallet to a target number of denominations plus an optimal
		// split of the remaining amount (to reach the total amount)

		let amountsToKeep = utils.getKeepAmounts(proofsWeHave, 22, keys, 3);
		// keeping 22 with a target count of 3, we expect two 1s, two 2s, no 4s, and two 8s, and no extra to reach 22
		expect(amountsToKeep).toEqual([1, 1, 2, 2, 8, 8]);

		// keeping 22 with a target count of 4, we expect three 1s, three 2s, one 4, and one 8 and another 1 to reach 22
		amountsToKeep = utils.getKeepAmounts(proofsWeHave, 22, keys, 4);
		expect(amountsToKeep).toEqual([1, 1, 1, 1, 2, 2, 2, 4, 8]);

		// keeping 22 with a target of 2, we expect one 1, one 2, no 4s, one 8, and another 1, 2, 8 to reach 22
		amountsToKeep = utils.getKeepAmounts(proofsWeHave, 22, keys, 2);
		expect(amountsToKeep).toEqual([1, 1, 2, 2, 8, 8]);
	});
});
describe('test zero-knowledge utilities', () => {
	// create private public key pair
	const privkey = hexToBytes('1'.padStart(64, '0'));
	const pubkey = pointFromBytes(getPubKeyFromPrivKey(privkey));

	// make up a secret
	const fakeSecret = new TextEncoder().encode('fakeSecret');
	// make up blinding factor
	const r = hexToNumber('123456'.padStart(64, '0'));
	// blind secret
	const fakeBlindedMessage = blindMessage(fakeSecret, r);
	// construct DLEQ
	const fakeDleq = createDLEQProof(fakeBlindedMessage.B_, privkey);
	// blind signature
	const fakeBlindSignature = createBlindSignature(fakeBlindedMessage.B_, privkey, 1, '00');
	// unblind
	const proof = constructProofFromPromise(fakeBlindSignature, r, fakeSecret, pubkey);
	// serialize
	const serializedProof = {
		...serializeProof(proof),
		dleq: {
			r: numberToHexPadded64(r),
			e: bytesToHex(fakeDleq.e),
			s: bytesToHex(fakeDleq.s)
		}
	} as Proof;

	test('has valid dleq', () => {
		const keyset = {
			id: '00',
			unit: 'sat',
			keys: { [1]: pubkey.toHex(true) }
		};
		const validDleq = hasValidDleq(serializedProof, keyset);
		expect(validDleq).toBe(true);
	});
	test('has valid dleq with no matching key', () => {
		const keyset = {
			id: '00',
			unit: 'sat',
			keys: { [2]: pubkey.toHex(true) }
		};
		let exc;
		try {
			hasValidDleq(serializedProof, keyset);
		} catch (e) {
			exc = e;
		}
		expect(exc).toEqual(new Error('undefined key for amount 1'));
	});
});

describe('test raw tokens', () => {
	const token: Token = {
		mint: 'http://localhost:3338',
		proofs: [
			{
				id: '00ad268c4d1f5826',
				amount: 1,
				secret: '9a6dbb847bd232ba76db0df197216b29d3b8cc14553cd27827fc1cc942fedb4e',
				C: '038618543ffb6b8695df4ad4babcde92a34a96bdcd97dcee0d7ccf98d472126792'
			}
		],
		memo: 'Thank you',
		unit: 'sat'
	};

	test('bytes to token', () => {
		const expectedBytes = hexToBytes(
			'6372617742a4617481a261694800ad268c4d1f5826617081a3616101617378403961366462623834376264323332626137366462306466313937323136623239643362386363313435353363643237383237666331636339343266656462346561635821038618543ffb6b8695df4ad4babcde92a34a96bdcd97dcee0d7ccf98d4721267926164695468616e6b20796f75616d75687474703a2f2f6c6f63616c686f73743a33333338617563736174'
		);

		const decodedToken = utils.getDecodedTokenBinary(expectedBytes);
		expect(decodedToken).toEqual(token);
	});

	test('token to bytes', () => {
		const bytes = utils.getEncodedTokenBinary(token);
		const decodedToken = utils.getDecodedTokenBinary(bytes);
		expect(decodedToken).toEqual(token);
	});
});
