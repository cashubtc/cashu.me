import { DLEQ, hash_e, hashToCurve } from '../common/index.js';
import { ProjPointType } from '@noble/curves/abstract/weierstrass';
import { bytesToHex } from '@noble/curves/abstract/utils';
import { secp256k1 } from '@noble/curves/secp256k1';
import { bytesToNumber } from '../util/utils.js';

function arraysEqual(arr1: any, arr2: any) {
	if (arr1.length !== arr2.length) return false;
	for (let i = 0; i < arr1.length; i++) {
		if (arr1[i] !== arr2[i]) return false;
	}
	return true;
}

export const verifyDLEQProof = (
	dleq: DLEQ,
	B_: ProjPointType<bigint>,
	C_: ProjPointType<bigint>,
	A: ProjPointType<bigint>
) => {
	const sG = secp256k1.ProjectivePoint.fromPrivateKey(bytesToHex(dleq.s));
	const eA = A.multiply(bytesToNumber(dleq.e));
	const sB_ = B_.multiply(bytesToNumber(dleq.s));
	const eC_ = C_.multiply(bytesToNumber(dleq.e));
	const R_1 = sG.subtract(eA); // R1 = sG - eA
	const R_2 = sB_.subtract(eC_); // R2 = sB' - eC'
	const hash = hash_e([R_1, R_2, A, C_]); // e == hash(R1, R2, A, C')
	return arraysEqual(hash, dleq.e);
};

export const verifyDLEQProof_reblind = (
	secret: Uint8Array, // secret
	dleq: DLEQ,
	C: ProjPointType<bigint>, // unblinded e-cash signature point
	A: ProjPointType<bigint> // mint public key point
) => {
	if (dleq.r === undefined) throw new Error('verifyDLEQProof_reblind: Undefined blinding factor');
	const Y = hashToCurve(secret);
	const C_ = C.add(A.multiply(dleq.r)); // Re-blind the e-cash signature
	const bG = secp256k1.ProjectivePoint.fromPrivateKey(dleq.r);
	const B_ = Y.add(bG); // Re-blind the message
	return verifyDLEQProof(dleq, B_, C_, A);
};
