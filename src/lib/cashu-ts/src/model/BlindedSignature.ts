import { ProjPointType } from '@noble/curves/abstract/weierstrass';
import { SerializedBlindedSignature } from './types/index.js';
import { DLEQ } from '../crypto/common/index.js';
import { bytesToHex } from '@noble/hashes/utils';
import { numberToHexPadded64 } from '../utils.js';

class BlindedSignature {
	id: string;
	amount: number;
	C_: ProjPointType<bigint>;
	dleq?: DLEQ;

	constructor(id: string, amount: number, C_: ProjPointType<bigint>, dleq?: DLEQ) {
		this.id = id;
		this.amount = amount;
		this.C_ = C_;
		this.dleq = dleq;
	}

	getSerializedBlindedSignature(): SerializedBlindedSignature {
		return {
			id: this.id,
			amount: this.amount,
			C_: this.C_.toHex(true),
			...(this.dleq && {
				dleq: {
					s: bytesToHex(this.dleq.s),
					e: bytesToHex(this.dleq.e),
					r: numberToHexPadded64(this.dleq.r ?? BigInt(0))
				}
			})
		};
	}
}

export { BlindedSignature };
