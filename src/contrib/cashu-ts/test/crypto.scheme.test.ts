import { secp256k1 } from '@noble/curves/secp256k1';
import { hashToCurve } from '../src/DHKE.js';
import { bytesToNumber } from '../src/utils.js';
import { ProjPointType } from '@noble/curves/abstract/weierstrass';

describe('test crypto bdhke', () => {
	test('bdhke', async () => {
		//Mint(Alice)
		const mint: Mint = new Mint();

		//Wallet(Bob)
		const wallet: Wallet = new Wallet();
		const B_ = await wallet.createBlindedMessage('secret');

		//Mint
		const C_ = mint.createBlindSignature(B_);

		//Wallet
		const { C, secret } = wallet.unblindSignature(C_, mint.publicKey);

		//Mint
		const aY = await mint.calculateCVerify(secret);
		expect(aY.equals(C)).toBe(true);
	});
});

class Mint {
	private privateKey: Uint8Array;
	publicKey: ProjPointType<bigint>;
	constructor() {
		this.privateKey = secp256k1.utils.randomPrivateKey();
		this.publicKey = secp256k1.ProjectivePoint.BASE.multiply(bytesToNumber(this.privateKey));
	}

	createBlindSignature(B_: ProjPointType<bigint>): ProjPointType<bigint> {
		const C_ = B_.multiply(bytesToNumber(this.privateKey));
		return C_;
	}

	async calculateCVerify(secret: Uint8Array): Promise<ProjPointType<bigint>> {
		const Y = hashToCurve(secret);
		const aY = Y.multiply(bytesToNumber(this.privateKey));
		return aY;
	}
}

class Wallet {
	private Y: ProjPointType<bigint> | undefined;
	private r = BigInt(0);
	private rG: ProjPointType<bigint> | undefined;
	private B_: ProjPointType<bigint> | undefined;
	private secret = new Uint8Array();
	constructor() {}

	async createBlindedMessage(message: string): Promise<ProjPointType<bigint>> {
		const enc = new TextEncoder();
		this.secret = enc.encode(message);
		this.Y = hashToCurve(this.secret);
		this.r = bytesToNumber(secp256k1.utils.randomPrivateKey());
		this.rG = secp256k1.ProjectivePoint.BASE.multiply(this.r);
		this.B_ = this.Y.add(this.rG);
		return this.B_;
	}

	unblindSignature(
		C_: ProjPointType<bigint>,
		mintPubK: ProjPointType<bigint>
	): { C: ProjPointType<bigint>; secret: Uint8Array } {
		const C = C_.subtract(mintPubK.multiply(this.r));
		return { C, secret: this.secret };
	}
}
