import { Proof } from './index';

/**
 * A Cashu token
 */
export type Token = {
	/**
	 * the mints URL
	 */
	mint: string;
	/**
	 * a list of proofs
	 */
	proofs: Array<Proof>;
	/**
	 * a message to send along with the token
	 */
	memo?: string;
	/**
	 * the unit of the token
	 */
	unit?: string;
};

export type V4DLEQTemplate = {
	/**
	 * challenge
	 */
	e: Uint8Array;
	/**
	 * response
	 */
	s: Uint8Array;
	/**
	 * blinding factor
	 */
	r: Uint8Array;
};

/**
 * Template for a Proof inside a V4 Token
 */
export type V4ProofTemplate = {
	/**
	 * Amount
	 */
	a: number;
	/**
	 * Secret
	 */
	s: string;
	/**
	 * Signature
	 */
	c: Uint8Array;
	/**
	 * DLEQ
	 */
	d?: V4DLEQTemplate;
	/**
	 * Witness
	 */
	w?: string;
};

/**
 * TokenEntry in a V4 Token
 */
export type V4InnerToken = {
	/**
	 * ID
	 */
	i: Uint8Array;
	/**
	 * Proofs
	 */
	p: Array<V4ProofTemplate>;
};

/**
 * Template for a V4 Token
 */
export type TokenV4Template = {
	/**
	 * TokenEntries
	 */
	t: Array<V4InnerToken>;
	/**
	 * Memo
	 */
	d: string;
	/**
	 * Mint Url
	 */
	m: string;
	/**
	 * Unit
	 */
	u: string;
};

/**
 * A Cashu token
 */
export type DeprecatedToken = {
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
type TokenEntry = {
	/**
	 * a list of proofs
	 */
	proofs: Array<Proof>;
	/**
	 * the mints URL
	 */
	mint: string;
};
