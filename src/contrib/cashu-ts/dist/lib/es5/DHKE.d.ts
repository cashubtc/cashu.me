import { ProjPointType } from '@noble/curves/abstract/weierstrass';
import { MintKeys, Proof, SerializedBlindedSignature } from './model/types/index.js';
declare function hashToCurve(secret: Uint8Array): ProjPointType<bigint>;
export declare function pointFromHex(hex: string): ProjPointType<bigint>;
declare function blindMessage(secret: Uint8Array, r?: bigint): {
    B_: ProjPointType<bigint>;
    r: bigint;
};
declare function unblindSignature(C_: ProjPointType<bigint>, r: bigint, A: ProjPointType<bigint>): ProjPointType<bigint>;
declare function constructProofs(promises: Array<SerializedBlindedSignature>, rs: Array<bigint>, secrets: Array<Uint8Array>, keyset: MintKeys): Array<Proof>;
export { hashToCurve, blindMessage, unblindSignature, constructProofs };
