import { AmountPreference, Token } from '../src/model/types/index.js';
import * as utils from '../src/utils.js';
import { PUBKEYS } from './consts.js';

describe('test split amounts ', () => {
	test('testing amount 2561', async () => {
		const chunks = utils.splitAmount(2561);
		expect(chunks).toStrictEqual([1, 512, 2048]);
	});
	test('testing amount 0', async () => {
		const chunks = utils.splitAmount(0);
		expect(chunks).toStrictEqual([]);
	});
});

describe('test split custom amounts ', () => {
	const fiveToOne: AmountPreference = { amount: 1, count: 5 };
	test('testing amount 5', async () => {
		const chunks = utils.splitAmount(5, [fiveToOne]);
		expect(chunks).toStrictEqual([1, 1, 1, 1, 1]);
	});
	const tenToOneAndTwo: Array<AmountPreference> = [
		{ amount: 1, count: 2 },
		{ amount: 2, count: 4 }
	];
	test('testing amount 10', async () => {
		const chunks = utils.splitAmount(10, tenToOneAndTwo);
		expect(chunks).toStrictEqual([1, 1, 2, 2, 2, 2]);
	});
	const fiveTwelve: Array<AmountPreference> = [{ amount: 512, count: 2 }];
	test('testing amount 516', async () => {
		const chunks = utils.splitAmount(518, fiveTwelve);
		expect(chunks).toStrictEqual([512, 2, 4]);
	});
	const illegal: Array<AmountPreference> = [{ amount: 3, count: 2 }];
	test('testing non pow2', async () => {
		expect(() => utils.splitAmount(6, illegal)).toThrowError();
	});
	const empty: Array<AmountPreference> = [];
	test('testing empty', async () => {
		const chunks = utils.splitAmount(5, empty);
		expect(chunks).toStrictEqual([1, 4]);
	});
});

describe('test decode token', () => {
	test('testing v1 Token', () => {
		const token =
			'W3siaWQiOiIwTkkzVFVBczFTZnkiLCJhbW91bnQiOjIsInNlY3JldCI6Ild6ZC9vNUVHdmVKb3hTQVlGcjZ1U3lnUmFWSUFrOFc4MXNLTlRxdVd4UjQ9IiwiQyI6IjAzNWNiZmQwOTNiOWZlMWRjNjU2MGEwNDM3YzQyNDQxZjA0ZDIyYzk4MDY2NGMyNGExMGZlZGFiNTlmZWY0YmZjOSJ9LHsiaWQiOiIwTkkzVFVBczFTZnkiLCJhbW91bnQiOjQsInNlY3JldCI6InU0N2lWUkhneUNuUFhCNWxOdFpGaTBOeHpPZ1lyRk1WODV2aFpyRThIbWM9IiwiQyI6IjAyNThiYmZkZWJmZGQzYjk0OTljZDk1YzFkMWZiYTVjZTQ1MWFjOGNlZTE0NzM1Yzk2MGFiMDc1ZmI2ZTQ4ZjBkYyJ9LHsiaWQiOiIwTkkzVFVBczFTZnkiLCJhbW91bnQiOjY0LCJzZWNyZXQiOiJ1YTFaT0hjeVB3T0M0UUxPaWthQVV1MThJM2pEUDJCSVNYREFGcW91N1VNPSIsIkMiOiIwMjU2MWNhNjcyNTdlNzdhNjNjN2U3NWQ4MGVkYTI3ZDlhMmEyYzUxZTA0NGM4ZjhmODVlNzc0OTZlMGRlM2U2NWIifSx7ImlkIjoiME5JM1RVQXMxU2Z5IiwiYW1vdW50IjoxLCJzZWNyZXQiOiJ5ZTlNRCtaQ25VUHlHOTBscmYyZ2tudnA3N2I4V05wNUxRT2ZtcERjRGNFPSIsIkMiOiIwM2UwN2M1NjExNzcwMmNmODg3MDFlYjAyOTM2YjA5MDNhZmEyMTQwZDcwNTY1N2ZkODVkM2YxZWI5MzRiYTBjYzMifSx7ImlkIjoiME5JM1RVQXMxU2Z5IiwiYW1vdW50IjoyLCJzZWNyZXQiOiJIUHpzRmZPUDFWRU1BMW8vTnFHVXFhRXdaV2RiN3VERzM4T1grLzlZTURzPSIsIkMiOiIwMmQ3ZDE1YTBhZmIyNThjMjlhZDdmOWY4N2ZmMzIxZWRmNTgyOTM0ZWI0NWExNTE2MjhiNTJjMDExZjQ2MWZkOGEifSx7ImlkIjoiME5JM1RVQXMxU2Z5IiwiYW1vdW50IjoxLCJzZWNyZXQiOiJnMVR1YXdha1RVQkJBTW9tZGpDVHkrRENNTnBaUmd3dWluNXB5V2xoTVVNPSIsIkMiOiIwMzU4Y2IxMGE5NWEzY2E1YmE5MTc5MTllMWNhODA1NjZmMTg5NTI4Njk1MTJjYWFjMDlmYmQ5MGYxN2QyZTZlYmEifSx7ImlkIjoiME5JM1RVQXMxU2Z5IiwiYW1vdW50IjoyLCJzZWNyZXQiOiJRMTFyamNXWk55Q2dkRmxqRThaNkdwNFhDYllKcndzRGhncXVQOTU1VWU0PSIsIkMiOiIwMjAxNjBmODIwNGU4MGIxNDg4NmFlMzZjMzRiMjI3ODllMzMxZmM5MjVhNGMwOGE3ZWYxZDZjYzMyYTIwNjZjZWUifSx7ImlkIjoiME5JM1RVQXMxU2Z5IiwiYW1vdW50Ijo4LCJzZWNyZXQiOiI1MVZrUXFYT2kwM0k2a0pzM0tlSEI0OVVCQTFSRktrWnMyMFljZEtOSW1JPSIsIkMiOiIwMjZiYWU2YTgzOWE3OTdjNmU5NGZlNGM5MWZlNTIwOGU4MDE3MTg2Y2NkMDk0ZmI4ZTNkZjYyNjAyZWJmMjczMjUifSx7ImlkIjoiME5JM1RVQXMxU2Z5IiwiYW1vdW50IjoxNiwic2VjcmV0IjoiVk4ySlMwUENKdGQ3MjJUTXUxdGFxNUZSMXg0dDlXM28xNndWRGVweXBxYz0iLCJDIjoiMDIxMmM4ZGE5NWE4NDEyYjgyMDE4MTgxNzQxZWY1YWQ0ZjYzMTU1NjBhMWFmODM5ZjMxOTU4NTcwZTVlYzI2ZDQyIn1d';
		let result: Token | undefined;
		expect(() => {
			result = utils.getDecodedToken(token);
		}).toThrow();
		expect(result).toBe(undefined);
	});
	test('testing v2 Token', async () => {
		const token =
			'eyJ0b2tlbiI6W3sicHJvb2ZzIjpbeyJpZCI6IkkyeU4raVJZZmt6VCIsImFtb3VudCI6MSwic2VjcmV0IjoiOTd6Zm1tYUdmNWs4TWcwZ2FqcG5ibXBlcnZUdEVlRTh3d0tyaTdyV3BVcz0iLCJDIjoiMDIxOTUwODFlNjIyZjk4YmZjMTlhMDVlYmUyMzQxZDk1NWMwZDEyNTg4YzU5NDhjODU4ZDA3YWRlYzAwN2JjMWU0In1dLCJtaW50IjoiaHR0cDovL2xvY2FsaG9zdDozMzM4In1dfQ';
		let result: Token | undefined;
		expect(() => {
			result = utils.getDecodedToken(token);
		}).toThrow();
		expect(result).toBe(undefined);
	});
});

describe('test decode token', () => {
	test('testing v3 Token', async () => {
		const obj = {
			token: [
				{
					proofs: [
						{
							C: '02195081e622f98bfc19a05ebe2341d955c0d12588c5948c858d07adec007bc1e4',
							amount: 1,
							id: 'I2yN+iRYfkzT',
							secret: '97zfmmaGf5k8Mg0gajpnbmpervTtEeE8wwKri7rWpUs='
						}
					],
					mint: 'http://localhost:3338'
				}
			]
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
			token: [
				{
					proofs: [
						{
							C: '02195081e622f98bfc19a05ebe2341d955c0d12588c5948c858d07adec007bc1e4',
							amount: 1,
							id: 'I2yN+iRYfkzT',
							secret: '97zfmmaGf5k8Mg0gajpnbmpervTtEeE8wwKri7rWpUs='
						}
					],
					mint: 'http://localhost:3338'
				}
			]
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
			token: [
				{
					mint: 'http://localhost:3338',
					proofs: [
						{
							secret: '9a6dbb847bd232ba76db0df197216b29d3b8cc14553cd27827fc1cc942fedb4e',
							C: '038618543ffb6b8695df4ad4babcde92a34a96bdcd97dcee0d7ccf98d472126792',
							id: '00ad268c4d1f5826',
							amount: 1
						}
					]
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
			memo: '',
			unit: 'sat',
			token: [
				{
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
			token: [
				{
					mint: 'http://localhost:3338',
					proofs: [
						{
							secret: '9a6dbb847bd232ba76db0df197216b29d3b8cc14553cd27827fc1cc942fedb4e',
							C: '038618543ffb6b8695df4ad4babcde92a34a96bdcd97dcee0d7ccf98d472126792',
							id: '00ad268c4d1f5826',
							amount: 1
						}
					]
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
			token: [
				{
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
				}
			],
			memo: '',
			unit: 'sat'
		};

		const encoded = utils.getEncodedTokenV4(v3Token);
		const decodedEncodedToken = utils.getDecodedToken(encoded);
		const decodedExpectedToken = utils.getDecodedToken(encodedV4);
		expect(decodedEncodedToken).toEqual(v3Token);
		expect(decodedExpectedToken).toEqual(decodedEncodedToken);
	});
});
