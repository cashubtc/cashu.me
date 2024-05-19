import { ProjPointType } from '@noble/curves/abstract/weierstrass';
import { secp256k1 } from '@noble/curves/secp256k1';
import { MintKeys, Proof, SerializedBlindedSignature } from './model/types/index.js';
import { bytesToNumber } from './utils.js';
import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex, hexToBytes } from '@noble/curves/abstract/utils';
import { Buffer } from 'buffer/';

const DOMAIN_SEPARATOR = hexToBytes('536563703235366b315f48617368546f43757276655f43617368755f');

function hashToCurve(secret: Uint8Array): ProjPointType<bigint> {
	const msgToHash = sha256(Buffer.concat([DOMAIN_SEPARATOR, secret]));
	const counter = new Uint32Array(1);
	const maxIterations = 2 ** 16;
	for (let i = 0; i < maxIterations; i++) {
		const counterBytes = new Uint8Array(counter.buffer);
		const hash = sha256(Buffer.concat([msgToHash, counterBytes]));
		try {
			return pointFromHex(bytesToHex(Buffer.concat([new Uint8Array([0x02]), hash])));
		} catch (error) {
			counter[0]++;
		}
	}
	throw new Error('No valid point found');
}

export function pointFromHex(hex: string) {
	return secp256k1.ProjectivePoint.fromHex(hex);
}
/* export function h2cToPoint(h2c: H2CPoint<bigint>): ProjPointType<bigint> {
	return secp256k1.ProjectivePoint.fromAffine(h2c.toAffine());
} */
function blindMessage(secret: Uint8Array, r?: bigint): { B_: ProjPointType<bigint>; r: bigint } {
	const Y = hashToCurve(secret);
	if (!r) {
		r = bytesToNumber(secp256k1.utils.randomPrivateKey());
	}
	const rG = secp256k1.ProjectivePoint.BASE.multiply(r);
	const B_ = Y.add(rG);
	return { B_, r };
}

function unblindSignature(
	C_: ProjPointType<bigint>,
	r: bigint,
	A: ProjPointType<bigint>
): ProjPointType<bigint> {
	const C = C_.subtract(A.multiply(r));
	return C;
}

function constructProofs(
	promises: Array<SerializedBlindedSignature>,
	rs: Array<bigint>,
	secrets: Array<Uint8Array>,
	keyset: MintKeys
): Array<Proof> {
	return promises.map((p: SerializedBlindedSignature, i: number) => {
		const C_ = pointFromHex(p.C_);
		const A = pointFromHex(keyset.keys[p.amount]);
		const C = unblindSignature(C_, rs[i], A);
		const proof = {
			id: p.id,
			amount: p.amount,
			secret: new TextDecoder().decode(secrets[i]),
			C: C.toHex(true)
		};
		return proof;
	});
}

export { hashToCurve, blindMessage, unblindSignature, constructProofs };
