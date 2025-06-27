import { secp256k1 } from '@noble/curves/secp256k1';
import { bytesToHex } from '@noble/hashes/utils';
import { describe, expect, test } from 'vitest';
import { hash_e, pointFromBytes, pointFromHex } from '../../../src/crypto/common/index.js';
import {
	constructProofFromPromise,
	createRandomBlindedMessage
} from '../../../src/crypto/client/index.js';
import { createBlindSignature } from '../../../src/crypto/mint/index.js';
import { createDLEQProof } from '../../../src/crypto/mint/NUT12.js';
import { verifyDLEQProof, verifyDLEQProof_reblind } from '../../../src/crypto/client/NUT12.js';

describe('test hash_e', () => {
	test('test hash_e function', async () => {
		const C_ = pointFromHex('02a9acc1e48c25eeeb9289b5031cc57da9fe72f3fe2861d264bdc074209b107ba2');
		const K = pointFromHex('020000000000000000000000000000000000000000000000000000000000000001');
		const R1 = pointFromHex('020000000000000000000000000000000000000000000000000000000000000001');
		const R2 = pointFromHex('020000000000000000000000000000000000000000000000000000000000000001');
		const e = hash_e([R1, R2, K, C_]);
		console.log('e = ' + bytesToHex(e));
		expect(bytesToHex(e)).toEqual(
			'a4dc034b74338c28c6bc3ea49731f2a24440fc7c4affc08b31a93fc9fbe6401e'
		);
	});
});

describe('test DLEQ scheme', () => {
	test('test DLEQ scheme: Alice verifies', async () => {
		const mintPrivKey = secp256k1.utils.randomPrivateKey();
		const mintPubKey = pointFromBytes(secp256k1.getPublicKey(mintPrivKey, true));

		// Wallet(Alice)
		const blindMessage = createRandomBlindedMessage();

		// Mint
		const blindSignature = createBlindSignature(blindMessage.B_, mintPrivKey, 1, '');
		const dleqProof = createDLEQProof(blindMessage.B_, mintPrivKey);

		// Wallet(Alice)
		const isValid = verifyDLEQProof(dleqProof, blindMessage.B_, blindSignature.C_, mintPubKey);
		expect(isValid).toBe(true);
	});
	test('test DLEQ scheme: Carol verifies', async () => {
		const mintPrivKey = secp256k1.utils.randomPrivateKey();
		const mintPubKey = pointFromBytes(secp256k1.getPublicKey(mintPrivKey, true));

		// Wallet(Alice)
		const blindMessage = createRandomBlindedMessage();

		// Mint
		const blindSignature = createBlindSignature(blindMessage.B_, mintPrivKey, 1, '');
		let dleqProof = createDLEQProof(blindMessage.B_, mintPrivKey);

		// Wallet(Alice)
		const proof = constructProofFromPromise(
			blindSignature,
			blindMessage.r,
			blindMessage.secret,
			mintPubKey
		);
		dleqProof.r = blindMessage.r;

		// Wallet(Carol)
		const isValid = verifyDLEQProof_reblind(blindMessage.secret, dleqProof, proof.C, mintPubKey);
		expect(isValid).toBe(true);
	});
});
