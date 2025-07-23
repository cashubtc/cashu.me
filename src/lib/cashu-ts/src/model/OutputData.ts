import {
	MintKeys,
	Proof,
	SerializedBlindedMessage,
	SerializedBlindedSignature,
	SerializedDLEQ
} from './types';
import { blindMessage, constructProofFromPromise, serializeProof } from '../crypto/client/index';
import { BlindedMessage } from './BlindedMessage';
import { bytesToHex, hexToBytes, randomBytes } from '@noble/hashes/utils';
import { DLEQ, pointFromHex } from '../crypto/common/index.js';
import { bytesToNumber, numberToHexPadded64, splitAmount } from '../utils';
import { deriveBlindingFactor, deriveSecret } from '../crypto/client/NUT09.js';

export interface OutputDataLike {
	blindedMessage: SerializedBlindedMessage;
	blindingFactor: bigint;
	secret: Uint8Array;

	toProof: (signature: SerializedBlindedSignature, keyset: MintKeys) => Proof;
}

export type OutputDataFactory = (amount: number, keys: MintKeys) => OutputDataLike;

export function isOutputDataFactory(
	value: Array<OutputData> | OutputDataFactory
): value is OutputDataFactory {
	return typeof value === 'function';
}

export class OutputData implements OutputDataLike {
	blindedMessage: SerializedBlindedMessage;
	blindingFactor: bigint;
	secret: Uint8Array;

	constructor(blindedMessage: SerializedBlindedMessage, blidingFactor: bigint, secret: Uint8Array) {
		this.secret = secret;
		this.blindingFactor = blidingFactor;
		this.blindedMessage = blindedMessage;
	}

	toProof(sig: SerializedBlindedSignature, keyset: MintKeys) {
		let dleq: DLEQ | undefined;
		if (sig.dleq) {
			dleq = {
				s: hexToBytes(sig.dleq.s),
				e: hexToBytes(sig.dleq.e),
				r: this.blindingFactor
			};
		}
		const blindSignature = {
			id: sig.id,
			amount: sig.amount,
			C_: pointFromHex(sig.C_),
			dleq: dleq
		};
		const A = pointFromHex(keyset.keys[sig.amount]);
		const proof = constructProofFromPromise(blindSignature, this.blindingFactor, this.secret, A);
		const serializedProof = {
			...serializeProof(proof),
			...(dleq && {
				dleq: {
					s: bytesToHex(dleq.s),
					e: bytesToHex(dleq.e),
					r: numberToHexPadded64(dleq.r ?? BigInt(0))
				} as SerializedDLEQ
			})
		} as Proof;
		return serializedProof;
	}

	static createP2PKData(
		p2pk: { pubkey: string; locktime?: number; refundKeys?: Array<string> },
		amount: number,
		keyset: MintKeys,
		customSplit?: Array<number>
	) {
		const amounts = splitAmount(amount, keyset.keys, customSplit);
		return amounts.map((a) => this.createSingleP2PKData(p2pk, a, keyset.id));
	}

	static createSingleP2PKData(
		p2pk: { pubkey: string; locktime?: number; refundKeys?: Array<string> },
		amount: number,
		keysetId: string
	) {
		const newSecret: [string, { nonce: string; data: string; tags: Array<any> }] = [
			'P2PK',
			{
				nonce: bytesToHex(randomBytes(32)),
				data: p2pk.pubkey,
				tags: []
			}
		];
		if (p2pk.locktime) {
			newSecret[1].tags.push(['locktime', p2pk.locktime]);
		}
		if (p2pk.refundKeys) {
			newSecret[1].tags.push(['refund', ...p2pk.refundKeys]);
		}
		const parsed = JSON.stringify(newSecret);
		const secretBytes = new TextEncoder().encode(parsed);
		const { r, B_ } = blindMessage(secretBytes);
		return new OutputData(
			new BlindedMessage(amount, B_, keysetId).getSerializedBlindedMessage(),
			r,
			secretBytes
		);
	}

	static createRandomData(amount: number, keyset: MintKeys, customSplit?: Array<number>) {
		const amounts = splitAmount(amount, keyset.keys, customSplit);
		return amounts.map((a) => this.createSingleRandomData(a, keyset.id));
	}

	static createSingleRandomData(amount: number, keysetId: string) {
		const randomHex = bytesToHex(randomBytes(32));
		const secretBytes = new TextEncoder().encode(randomHex);
		const { r, B_ } = blindMessage(secretBytes);
		return new OutputData(
			new BlindedMessage(amount, B_, keysetId).getSerializedBlindedMessage(),
			r,
			secretBytes
		);
	}

	static createDeterministicData(
		amount: number,
		seed: Uint8Array,
		counter: number,
		keyset: MintKeys,
		customSplit?: Array<number>
	): Array<OutputData> {
		const amounts = splitAmount(amount, keyset.keys, customSplit);
		return amounts.map((a, i) =>
			this.createSingleDeterministicData(a, seed, counter + i, keyset.id)
		);
	}

	static createSingleDeterministicData(
		amount: number,
		seed: Uint8Array,
		counter: number,
		keysetId: string
	) {
		const secretBytes = deriveSecret(seed, keysetId, counter);
		const secretBytesAsHex = bytesToHex(secretBytes);
		const utf8SecretBytes = new TextEncoder().encode(secretBytesAsHex);
		const deterministicR = bytesToNumber(deriveBlindingFactor(seed, keysetId, counter));
		const { r, B_ } = blindMessage(utf8SecretBytes, deterministicR);
		return new OutputData(
			new BlindedMessage(amount, B_, keysetId).getSerializedBlindedMessage(),
			r,
			utf8SecretBytes
		);
	}
}
