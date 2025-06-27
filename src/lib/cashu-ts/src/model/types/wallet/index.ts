import { SerializedDLEQ } from '../mint';

export * from './payloads';
export * from './responses';
export * from './tokens';
export * from './paymentRequests';

/**
 * represents a single Cashu proof.
 */
export type Proof = {
	/**
	 * Keyset id, used to link proofs to a mint an its MintKeys.
	 */
	id: string;
	/**
	 * Amount denominated in Satoshis. Has to match the amount of the mints signing key.
	 */
	amount: number;
	/**
	 * The initial secret that was (randomly) chosen for the creation of this proof.
	 */
	secret: string;
	/**
	 * The unblinded signature for this secret, signed by the mints private key.
	 */
	C: string;
	/**
	 * DLEQ proof
	 */
	dleq?: SerializedDLEQ;
	/**
	 * The witness for this proof.
	 */
	witness?: string | P2PKWitness | HTLCWitness;
};

/**
 * P2PK witness
 */
export type P2PKWitness = {
	/**
	 * An array of signatures in hex format
	 */
	signatures?: Array<string>;
};

/**
 * HTLC witness
 */
export type HTLCWitness = {
	/**
	 * preimage
	 */
	preimage: string;
	/**
	 * An array of signatures in hex format
	 */
	signatures?: Array<string>;
};

/**
 * response when after receiving a single TokenEntry
 */
export type ReceiveTokenEntryResponse = {
	/**
	 * Received proofs
	 */
	proofs: Array<Proof>;
};

/**
 * Payload that needs to be sent to the mint when paying a lightning invoice.
 */
export type PaymentPayload = {
	/**
	 * Payment request/Lighting invoice that should get paid by the mint.
	 */
	pr: string;
	/**
	 * Proofs, matching Lightning invoices amount + fees.
	 */
	proofs: Array<Proof>;
};

/**
 * @deprecated Token V2
 * should no longer be used
 */
export type TokenV2 = {
	proofs: Array<Proof>;
	mints: Array<{ url: string; ids: Array<string> }>;
};
