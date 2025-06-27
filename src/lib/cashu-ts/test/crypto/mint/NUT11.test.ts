import { bytesToHex, randomBytes } from '@noble/hashes/utils';
import { Proof, pointFromHex } from '../../../src/crypto/common';
import { verifyP2PKSig } from '../../../src/crypto/mint/NUT11.js';
import { describe, expect, test } from 'vitest';
describe('test p2pk verify', () => {
	test('test no witness', () => {
		const proof: Proof = {
			amount: 1,
			id: '00000000',
			C: pointFromHex('034268c0bd30b945adf578aca2dc0d1e26ef089869aaf9a08ba3a6da40fda1d8be'),
			secret: new TextEncoder().encode(
				`["P2PK",{"nonce":"76f5bf3e36273bf1a09006ef32d4551c07a34e218c2fc84958425ad00abdfe06","data":"${bytesToHex(
					randomBytes(32)
				)}"}]`
			)
		};
		expect(() => verifyP2PKSig(proof)).toThrow(
			new Error('could not verify signature, no witness provided')
		);
	});
});
