import { hash_e, createRandomPrivateKey, DLEQ } from '../common/index.js';
import { ProjPointType } from '@noble/curves/abstract/weierstrass';
import { bytesToHex, numberToBytesBE } from '@noble/curves/abstract/utils';
import { secp256k1 } from '@noble/curves/secp256k1';
import { bytesToNumber, hexToNumber } from '../util/utils.js';

/**
 * !!! WARNING !!! Not recommended for production use, due to non-constant time operations
 * See: https://github.com/cashubtc/cashu-crypto-ts/pull/2 for more details
 * See: https://en.wikipedia.org/wiki/Timing_attack for information about timing attacks.
 */
export const createDLEQProof = (B_: ProjPointType<bigint>, a: Uint8Array): DLEQ => {
	const r = bytesToHex(createRandomPrivateKey()); // r <- random
	const R_1 = secp256k1.ProjectivePoint.fromPrivateKey(r); // R1 = rG
	const R_2 = B_.multiply(hexToNumber(r)); // R2 = rB_
	const C_ = B_.multiply(bytesToNumber(a)); // C_ = aB_
	const A = secp256k1.ProjectivePoint.fromPrivateKey(bytesToHex(a)); // A = aG
	const e = hash_e([R_1, R_2, A, C_]); // e = hash(R1, R2, A, C_)
	const n_r = hexToNumber(r);
	const n_e = bytesToNumber(e);
	const n_a = bytesToNumber(a);
	// WARNING: NON-CONSTANT TIME OPERATIONS?
	const s = numberToBytesBE((n_r + n_e * n_a) % secp256k1.CURVE.n, 32); // (r + ea) mod n
	return { s, e };
};
