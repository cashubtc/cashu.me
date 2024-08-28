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
};

/**
 * Public keys are a dictionary of number and string. The number represents the amount that the key signs for.
 */
export type Keys = { [amount: number]: string };

/**
 * An array of mint keysets
 */
export type MintActiveKeys = {
	/**
	 * Keysets
	 */
	keysets: Array<MintKeys>;
};

/**
 * A mint keyset.
 */
export type MintKeys = {
	/**
	 * Keyset ID
	 */
	id: string;
	/**
	 * Unit of the keyset.
	 */
	unit: string;
	/**
	 * Public keys are a dictionary of number and string. The number represents the amount that the key signs for.
	 */
	keys: Keys;
};

/**
 * An array of mint keyset entries.
 */
export type MintAllKeysets = {
	/**
	 * Keysets
	 */
	keysets: Array<MintKeyset>;
};

/**
 * A mint keyset entry.
 */
export type MintKeyset = {
	/**
	 * Keyset ID
	 */
	id: string;
	/**
	 * Unit of the keyset.
	 */
	unit: string;
	/**
	 * Whether the keyset is active or not.
	 */
	active: boolean;
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
 *  response after sending
 */
export type SendResponse = {
	/**
	 * Proofs that exceeded the needed amount
	 */
	returnChange: Array<Proof>;
	/**
	 * Proofs to be sent, matching the chosen amount
	 */
	send: Array<Proof>;
};
/**
 * Response when receiving a complete token.
 */
export type ReceiveResponse = {
	/**
	 * Successfully received Cashu Token
	 */
	token: Token;
	/**
	 * TokenEntries that had errors. No error will be thrown, but clients can choose to handle tokens with errors accordingly.
	 */
	tokensWithErrors: Token | undefined;
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
 * Payload that needs to be send to the mint to request a melt quote
 */
export type MeltQuotePayload = {
	/**
	 * Unit to be melted
	 */
	unit: string;
	/**
	 * Request to be melted to
	 */
	request: string;
};

export enum MeltQuoteState {
	UNPAID = 'UNPAID',
	PENDING = 'PENDING',
	PAID = 'PAID'
}

/**
 * Response from the mint after requesting a melt quote
 */
export type MeltQuoteResponse = {
	/**
	 * Quote ID
	 */
	quote: string;
	/**
	 * Amount to be melted
	 */
	amount: number;
	/**
	 * Fee reserve to be added to the amount
	 */
	fee_reserve: number;
	/**
	 * State of the melt quote
	 */
	state: MeltQuoteState;
	/**
	 * Timestamp of when the quote expires
	 */
	expiry: number;
	/**
	 * preimage of the paid invoice. is null if it the invoice has not been paid yet. can be null, depending on which LN-backend the mint uses
	 */
	payment_preimage: string | null;
	/**
	 * Return/Change from overpaid fees. This happens due to Lighting fee estimation being inaccurate
	 */
	change?: Array<SerializedBlindedSignature>;
} & ApiError;

/**
 * Payload that needs to be sent to the mint when melting. Includes Return for overpaid fees
 */
export type MeltPayload = {
	/**
	 * ID of the melt quote
	 */
	quote: string;
	/**
	 * Inputs (Proofs) to be melted
	 */
	inputs: Array<Proof>;
	/**
	 * Blank outputs (blinded messages) that can be filled by the mint to return overpaid fees
	 */
	outputs: Array<SerializedBlindedMessage>;
};

/**
 * Response after paying a Lightning invoice
 */
export type MeltTokensResponse = {
	/**
	 * if false, the proofs have not been invalidated and the payment can be tried later again with the same proofs
	 */
	isPaid: boolean;
	/**
	 * preimage of the paid invoice. can be null, depending on which LN-backend the mint uses
	 */
	preimage: string | null;
	/**
	 * Return/Change from overpaid fees. This happens due to Lighting fee estimation being inaccurate
	 */
	change: Array<Proof>;
};

/**
 * Payload that needs to be sent to the mint when performing a split action
 */
export type SwapPayload = {
	/**
	 * Inputs to the split operation
	 */
	inputs: Array<Proof>;
	/**
	 * Outputs (blinded messages) to be signed by the mint
	 */
	outputs: Array<SerializedBlindedMessage>;
};
/**
 * Response from the mint after performing a split action
 */
export type SwapResponse = {
	/**
	 * represents the outputs after the split
	 */
	signatures: Array<SerializedBlindedSignature>;
} & ApiError;

/**
 * Cashu api error
 */
export type ApiError = {
	/**
	 * Error message
	 */
	error?: string;
	/**
	 * HTTP error code
	 */
	code?: number;
	/**
	 * Detailed error message
	 */
	detail?: string;
};

/**
 * Payload that needs to be sent to the mint when requesting a mint
 */
export type MintQuotePayload = {
	/**
	 * Unit to be minted
	 */
	unit: string;
	/**
	 * Amount to be minted
	 */
	amount: number;
};

export enum MintQuoteState {
	UNPAID = 'UNPAID',
	PAID = 'PAID',
	ISSUED = 'ISSUED'
}

/**
 * Response from the mint after requesting a mint
 */
export type MintQuoteResponse = {
	/**
	 * Payment request
	 */
	request: string;
	/**
	 * Quote ID
	 */
	quote: string;
	/**
	 * State of the mint quote
	 */
	state: MintQuoteState;
	/**
	 * Timestamp of when the quote expires
	 */
	expiry: number;
} & ApiError;

/**
 * Payload that needs to be sent to the mint when requesting a mint
 */
export type MintPayload = {
	/**
	 * Quote ID received from the mint.
	 */
	quote: string;
	/**
	 * Outputs (blinded messages) to be signed by the mint.
	 */
	outputs: Array<SerializedBlindedMessage>;
};
/**
 * Response from the mint after requesting a mint
 */
export type MintResponse = {
	signatures: Array<SerializedBlindedSignature>;
} & ApiError;

/**
 * Payload that needs to be sent to the mint when checking for spendable proofs
 */
export type CheckStatePayload = {
	/**
	 * The Y = hash_to_curve(secret) of the proofs to be checked.
	 */
	Ys: Array<string>;
};

/**
 * Enum for the state of a proof
 */
export enum CheckStateEnum {
	UNSPENT = 'UNSPENT',
	PENDING = 'PENDING',
	SPENT = 'SPENT'
}

/**
 * Entries of CheckStateResponse with state of the proof
 */
export type CheckStateEntry = {
	Y: string;
	state: CheckStateEnum;
	witness: string | null;
};

/**
 * Response when checking proofs if they are spendable. Should not rely on this for receiving, since it can be easily cheated.
 */
export type CheckStateResponse = {
	/**
	 *
	 */
	states: Array<CheckStateEntry>;
} & ApiError;
/**
 * blinded message for sending to the mint
 */
export type SerializedBlindedMessage = {
	/**
	 * amount
	 */
	amount: number;
	/**
	 * Blinded message
	 */
	B_: string;
	/**
	 * Keyset id
	 */
	id: string;
};
/**
 * Blinded signature as it is received from the mint
 */
export type SerializedBlindedSignature = {
	/**
	 * keyset id for indicating which public key was used to sign the blinded message
	 */
	id: string;
	/**
	 * Amount denominated in Satoshi
	 */
	amount: number;
	/**
	 * Blinded signature
	 */
	C_: string;
};

/**
 * A Cashu token
 */
export type Token = {
	/**
	 * token entries
	 */
	token: Array<TokenEntry>;
	/**
	 * a message to send along with the token
	 */
	memo?: string;
	/**
	 * the unit of the token
	 */
	unit?: string;
};
/**
 * TokenEntry that stores proofs and mints
 */
export type TokenEntry = {
	/**
	 * a list of proofs
	 */
	proofs: Array<Proof>;
	/**
	 * the mints URL
	 */
	mint: string;
};
/**
 * @deprecated Token V2
 * should no longer be used
 */
export type TokenV2 = {
	proofs: Array<Proof>;
	mints: Array<{ url: string; ids: Array<string> }>;
};

/**
 * Data that the library needs to hold in memory while it awaits the blinded signatures for the mint. It is later used for unblinding the signatures.
 */
export type BlindedTransaction = {
	/**
	 * Blinded messages sent to the mint for signing.
	 */
	blindedMessages: Array<SerializedBlindedMessage>;
	/**
	 * secrets, kept client side for constructing proofs later.
	 */
	secrets: Array<Uint8Array>;
	/**
	 * Blinding factor used for blinding messages and unblinding signatures after they are received from the mint.
	 */
	rs: Array<bigint>;
	/**
	 * amounts denominated in Satoshi
	 */
	amounts: Array<number>;
};

/**
 * Data that the library needs to hold in memory while it awaits the blinded signatures for the mint. It is later used for unblinding the signatures.
 */
export type BlindedMessageData = {
	/**
	 * Blinded messages sent to the mint for signing.
	 */
	blindedMessages: Array<SerializedBlindedMessage>;
	/**
	 * secrets, kept client side for constructing proofs later.
	 */
	secrets: Array<Uint8Array>;
	/**
	 * Blinding factor used for blinding messages and unblinding signatures after they are received from the mint.
	 */
	rs: Array<bigint>;
};

export type MintContactInfo = {
	method: string;
	info: string;
};

/**
 * Response from mint at /info endpoint
 */
export type GetInfoResponse = {
	name: string;
	pubkey: string;
	version: string;
	description?: string;
	description_long?: string;
	contact: Array<MintContactInfo>;
	nuts: {
		'4': {
			methods: Array<SwapMethod>;
			disabled: boolean;
		};
		'5': {
			methods: Array<SwapMethod>;
			disabled: boolean;
		};
		'7'?: {
			supported: boolean;
		};
		'8'?: {
			supported: boolean;
		};
		'9'?: {
			supported: boolean;
		};
		'10'?: {
			supported: boolean;
		};
		'11'?: {
			supported: boolean;
		};
		'12'?: {
			supported: boolean;
		};
		'13'?: {
			supported: boolean;
		};
	};
	motd?: string;
};

/**
 * Ecash to other MoE swap method, displayed in @type {GetInfoResponse}
 */
export type SwapMethod = {
	method: string;
	unit: string;
	min_amount: number;
	max_amount: number;
};

/**
 * Request to mint at /v1/restore endpoint
 */

export type PostRestorePayload = {
	outputs: Array<SerializedBlindedMessage>;
};

/**
 * Response from mint at /v1/restore endpoint
 */
export type PostRestoreResponse = {
	outputs: Array<SerializedBlindedMessage>;
	promises: Array<SerializedBlindedSignature>;
};

export type AmountPreference = {
	amount: number;
	count: number;
};

export type InvoiceData = {
	paymentRequest: string;
	amountInSats?: number;
	amountInMSats?: number;
	timestamp?: number;
	paymentHash?: string;
	memo?: string;
	expiry?: number;
};

export type V4ProofTemplate = {
	a: number;
	s: string;
	c: Uint8Array;
};

export type V4InnerToken = {
	i: Uint8Array;
	p: Array<V4ProofTemplate>;
};

export type TokenV4Template = {
	t: Array<V4InnerToken>;
	d: string;
	m: string;
	u: string;
};
