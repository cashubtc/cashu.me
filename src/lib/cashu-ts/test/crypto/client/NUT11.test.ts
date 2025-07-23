import { schnorr } from '@noble/curves/secp256k1';
import { bytesToHex } from '@noble/curves/abstract/utils';
import { describe, expect, test } from 'vitest';
import {
	createP2PKsecret,
	getSignedProof,
	getSignedProofs
} from '../../../src/crypto/client/NUT11';
import { parseSecret } from '../../../src/crypto/common/NUT11';
import { pointFromHex, Proof } from '../../../src/crypto/common';
import { verifyP2PKSig, verifyP2PKSigOutput } from '../../../src/crypto/mint/NUT11';
import { createRandomBlindedMessage } from '../../../src/crypto/client';

const PRIVKEY = schnorr.utils.randomPrivateKey();
const PUBKEY = schnorr.getPublicKey(PRIVKEY);

describe('test create p2pk secret', () => {
	test('create from key', async () => {
		const secret = createP2PKsecret(bytesToHex(PUBKEY));
		const decodedSecret = parseSecret(secret);

		expect(decodedSecret[0]).toBe('P2PK');
		// console.log(JSON.stringify(decodedSecret))
		expect(Object.keys(decodedSecret[1]).includes('nonce')).toBe(true);
		expect(Object.keys(decodedSecret[1]).includes('data')).toBe(true);
	});
	test('sign and verify proof', async () => {
		const secretStr = `["P2PK",{"nonce":"76f5bf3e36273bf1a09006ef32d4551c07a34e218c2fc84958425ad00abdfe06","data":"${bytesToHex(
			PUBKEY
		)}"}]`;
		const proof: Proof = {
			amount: 1,
			C: pointFromHex('034268c0bd30b945adf578aca2dc0d1e26ef089869aaf9a08ba3a6da40fda1d8be'),
			id: '00000000000',
			secret: new TextEncoder().encode(secretStr)
		};
		const signedProof = getSignedProof(proof, PRIVKEY);
		const verify = verifyP2PKSig(signedProof);
		expect(verify).toBe(true);
	});

	test('sign and verify proofs', async () => {
		const secretStr = `["P2PK",{"nonce":"76f5bf3e36273bf1a09006ef32d4551c07a34e218c2fc84958425ad00abdfe06","data":"${bytesToHex(
			PUBKEY
		)}"}]`;
		const proof1: Proof = {
			amount: 1,
			C: pointFromHex('034268c0bd30b945adf578aca2dc0d1e26ef089869aaf9a08ba3a6da40fda1d8be'),
			id: '00000000000',
			secret: new TextEncoder().encode(secretStr)
		};

		const proof2: Proof = {
			amount: 1,
			C: pointFromHex('034268c0bd30b945adf578aca2dc0d1e26ef089869aaf9a08ba3a6da40fda1d8be'),
			id: '00000000000',
			secret: new TextEncoder().encode(secretStr)
		};

		const proofs = [proof1, proof2];

		const signedProofs = getSignedProofs(proofs, bytesToHex(PRIVKEY));
		const verify0 = verifyP2PKSig(signedProofs[0]);
		const verify1 = verifyP2PKSig(signedProofs[1]);
		expect(verify0).toBe(true);
		expect(verify1).toBe(true);
	});

	test('sign and verify proofs, different keys', async () => {
		const PRIVKEY2 = schnorr.utils.randomPrivateKey();
		const PUBKEY2 = schnorr.getPublicKey(PRIVKEY2);

		const secretStr = `["P2PK",{"nonce":"76f5bf3e36273bf1a09006ef32d4551c07a34e218c2fc84958425ad00abdfe06","data":"${bytesToHex(
			PUBKEY
		)}"}]`;
		const secretStr2 = `["P2PK",{"nonce":"76f5bf3e36273bf1a09006ef32d4551c07a34e218c2fc84958425ad00abdfe06","data":"${bytesToHex(
			PUBKEY2
		)}"}]`;
		const proof1: Proof = {
			amount: 1,
			C: pointFromHex('034268c0bd30b945adf578aca2dc0d1e26ef089869aaf9a08ba3a6da40fda1d8be'),
			id: '00000000000',
			secret: new TextEncoder().encode(secretStr)
		};

		const proof2: Proof = {
			amount: 1,
			C: pointFromHex('034268c0bd30b945adf578aca2dc0d1e26ef089869aaf9a08ba3a6da40fda1d8be'),
			id: '00000000000',
			secret: new TextEncoder().encode(secretStr2)
		};

		const proofs = [proof1, proof2];

		const signedProofs = getSignedProofs(proofs, [bytesToHex(PRIVKEY), bytesToHex(PRIVKEY2)]);
		const verify0 = verifyP2PKSig(signedProofs[0]);
		const verify1 = verifyP2PKSig(signedProofs[1]);
		expect(verify0).toBe(true);
		expect(verify1).toBe(true);
	});
	test('sign and verify blindedMessage', async () => {
		const blindedMessage = createRandomBlindedMessage(PRIVKEY);
		const verify = verifyP2PKSigOutput(blindedMessage, bytesToHex(PUBKEY));
		expect(verify).toBe(true);
	});
});
