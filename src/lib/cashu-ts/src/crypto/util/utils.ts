import { bytesToHex } from '@noble/curves/abstract/utils';
import 'buffer';
declare const Buffer: any;

export function bytesToNumber(bytes: Uint8Array): bigint {
	return hexToNumber(bytesToHex(bytes));
}

export function hexToNumber(hex: string): bigint {
	return BigInt(`0x${hex}`);
}

export function encodeBase64toUint8(base64String: string): Uint8Array {
	return Buffer.from(base64String, 'base64');
}
