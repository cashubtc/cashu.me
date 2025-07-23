import { hexToBytes } from '@noble/curves/abstract/utils';
import { describe, expect, test } from 'vitest';
import { blindMessage, unblindSignature } from '../../../src/crypto/client';
import { bytesToNumber } from '../../../src/crypto/util/utils';
import { pointFromHex } from '../../../src/crypto/common';

const SECRET_MESSAGE = 'test_message';

describe('test blinding message', () => {
	test('testing string 0000....01', async () => {
		var enc = new TextEncoder();
		let secretUInt8 = enc.encode(SECRET_MESSAGE);
		let { B_ } = await blindMessage(
			secretUInt8,
			bytesToNumber(hexToBytes('0000000000000000000000000000000000000000000000000000000000000001'))
		);
		expect(B_.toHex(true)).toBe(
			'025cc16fe33b953e2ace39653efb3e7a7049711ae1d8a2f7a9108753f1cdea742b'
		);
	});
});

describe('test unblinding signature', () => {
	test('testing string 0000....01', async () => {
		let C_ = pointFromHex('02a9acc1e48c25eeeb9289b5031cc57da9fe72f3fe2861d264bdc074209b107ba2');
		let r = bytesToNumber(
			hexToBytes('0000000000000000000000000000000000000000000000000000000000000001')
		);
		let A = pointFromHex('020000000000000000000000000000000000000000000000000000000000000001');
		let C = unblindSignature(C_, r, A);
		expect(C.toHex(true)).toBe(
			'03c724d7e6a5443b39ac8acf11f40420adc4f99a02e7cc1b57703d9391f6d129cd'
		);
	});
});
