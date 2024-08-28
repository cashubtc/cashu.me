import { decodeCBOR, encodeCBOR } from '../src/cbor';
import { bytesToHex, hexToBytes } from '@noble/curves/abstract/utils';

const tests = [
	{
		cbor: 'AA==',
		hex: '00',
		roundtrip: true,
		decoded: 0
	},
	{
		cbor: 'AQ==',
		hex: '01',
		roundtrip: true,
		decoded: 1
	},
	{
		cbor: 'Cg==',
		hex: '0a',
		roundtrip: true,
		decoded: 10
	},
	{
		cbor: 'Fw==',
		hex: '17',
		roundtrip: true,
		decoded: 23
	},
	{
		cbor: 'GBg=',
		hex: '1818',
		roundtrip: true,
		decoded: 24
	},
	{
		cbor: 'GBk=',
		hex: '1819',
		roundtrip: true,
		decoded: 25
	},
	{
		cbor: 'GGQ=',
		hex: '1864',
		roundtrip: true,
		decoded: 100
	},
	{
		cbor: 'GQPo',
		hex: '1903e8',
		roundtrip: true,
		decoded: 1000
	},
	{
		cbor: 'GgAPQkA=',
		hex: '1a000f4240',
		roundtrip: true,
		decoded: 1000000
	},
	{
		cbor: '9A==',
		hex: 'f4',
		roundtrip: true,
		decoded: false
	},
	{
		cbor: '9Q==',
		hex: 'f5',
		roundtrip: true,
		decoded: true
	},
	{
		cbor: '9g==',
		hex: 'f6',
		roundtrip: true,
		decoded: null
	},
	{
		cbor: 'YA==',
		hex: '60',
		roundtrip: true,
		decoded: ''
	},
	{
		cbor: 'YWE=',
		hex: '6161',
		roundtrip: true,
		decoded: 'a'
	},
	{
		cbor: 'ZElFVEY=',
		hex: '6449455446',
		roundtrip: true,
		decoded: 'IETF'
	},
	{
		cbor: 'YiJc',
		hex: '62225c',
		roundtrip: true,
		decoded: '"\\'
	},
	{
		cbor: 'YsO8',
		hex: '62c3bc',
		roundtrip: true,
		decoded: 'ü'
	},
	{
		cbor: 'Y+awtA==',
		hex: '63e6b0b4',
		roundtrip: true,
		decoded: '水'
	},
	{
		cbor: 'ZPCQhZE=',
		hex: '64f0908591',
		roundtrip: true,
		decoded: '𐅑'
	},
	{
		cbor: 'gA==',
		hex: '80',
		roundtrip: true,
		decoded: []
	},
	{
		cbor: 'gwECAw==',
		hex: '83010203',
		roundtrip: true,
		decoded: [1, 2, 3]
	},
	{
		cbor: 'gwGCAgOCBAU=',
		hex: '8301820203820405',
		roundtrip: true,
		decoded: [1, [2, 3], [4, 5]]
	},
	{
		cbor: 'mBkBAgMEBQYHCAkKCwwNDg8QERITFBUWFxgYGBk=',
		hex: '98190102030405060708090a0b0c0d0e0f101112131415161718181819',
		roundtrip: true,
		decoded: [
			1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25
		]
	},
	{
		cbor: 'oA==',
		hex: 'a0',
		roundtrip: true,
		decoded: {}
	},
	{
		cbor: 'omFhAWFiggID',
		hex: 'a26161016162820203',
		roundtrip: true,
		decoded: {
			a: 1,
			b: [2, 3]
		}
	},
	{
		cbor: 'gmFhoWFiYWM=',
		hex: '826161a161626163',
		roundtrip: true,
		decoded: [
			'a',
			{
				b: 'c'
			}
		]
	},
	{
		cbor: 'pWFhYUFhYmFCYWNhQ2FkYURhZWFF',
		hex: 'a56161614161626142616361436164614461656145',
		roundtrip: true,
		decoded: {
			a: 'A',
			b: 'B',
			c: 'C',
			d: 'D',
			e: 'E'
		}
	},
	{
		cbor: 'RAECAwQ=',
		hex: '4401020304',
		roundtrip: true,
		decoded: hexToBytes('01020304')
	}
];

describe('cbor decoder', () => {
	test.each(tests)('given $hex as arguments, returns $decoded', ({ hex, decoded }) => {
		const res = decodeCBOR(hexToBytes(hex));
		expect(res).toEqual(decoded);
	});
});

describe('cbor encoder', () => {
	test.each(tests)('given $hex as arguments, returns $decoded', ({ hex, decoded }) => {
		const res = encodeCBOR(decoded);
		expect(hex).toBe(bytesToHex(res));
	});
});

describe('raw v4 token cbor en/decoding', () => {
	const expectedBase64 =
		'o2F0gqJhaUgA_9SLj17PgGFwgaNhYQFhc3hAYWNjMTI0MzVlN2I4NDg0YzNjZjE4NTAxNDkyMThhZjkwZjcxNmE1MmJmNGE1ZWQzNDdlNDhlY2MxM2Y3NzM4OGFjWCECRFODGd5IXVW-07KaZCvuWHk3WrnnpiDhHki6SCQh88-iYWlIAK0mjE0fWCZhcIKjYWECYXN4QDEzMjNkM2Q0NzA3YTU4YWQyZTIzYWRhNGU5ZjFmNDlmNWE1YjRhYzdiNzA4ZWIwZDYxZjczOGY0ODMwN2U4ZWVhY1ghAjRWqhENhLSsdHrr2Cw7AFrKUL9Ffr1XN6RBT6w659lNo2FhAWFzeEA1NmJjYmNiYjdjYzY0MDZiM2ZhNWQ1N2QyMTc0ZjRlZmY4YjQ0MDJiMTc2OTI2ZDNhNTdkM2MzZGNiYjU5ZDU3YWNYIQJzEpxXGeWZN5qXSmJjY8MzxWyvwObQGr5G1YCCgHicY2FtdWh0dHA6Ly9sb2NhbGhvc3Q6MzMzOGF1Y3NhdA==';
	const token = {
		t: [
			{
				i: hexToBytes('00ffd48b8f5ecf80'),
				p: [
					{
						a: 1,
						s: 'acc12435e7b8484c3cf1850149218af90f716a52bf4a5ed347e48ecc13f77388',
						c: hexToBytes('0244538319de485d55bed3b29a642bee5879375ab9e7a620e11e48ba482421f3cf')
					}
				]
			},
			{
				i: hexToBytes('00ad268c4d1f5826'),
				p: [
					{
						a: 2,
						s: '1323d3d4707a58ad2e23ada4e9f1f49f5a5b4ac7b708eb0d61f738f48307e8ee',
						c: hexToBytes('023456aa110d84b4ac747aebd82c3b005aca50bf457ebd5737a4414fac3ae7d94d')
					},
					{
						a: 1,
						s: '56bcbcbb7cc6406b3fa5d57d2174f4eff8b4402b176926d3a57d3c3dcbb59d57',
						c: hexToBytes('0273129c5719e599379a974a626363c333c56cafc0e6d01abe46d5808280789c63')
					}
				]
			}
		],
		m: 'http://localhost:3338',
		u: 'sat'
	};
	test('encode v4 raw', () => {
		const encoded = encodeCBOR(token);
		const encodedString = Buffer.from(encoded).toString('base64url');
		expect(encodedString).toBe(expectedBase64.replace(/\=+$/, ''));
	});
	test('decode v4 raw', () => {
		const decoded = decodeCBOR(Buffer.from(expectedBase64.replace(/\=+$/, ''), 'base64url'));
		expect(decoded).toEqual(token);
	});
});
