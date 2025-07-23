import { MeltQuoteResponse } from '../mint';
import { Proof, Token } from './index';

/**
 * Response after paying a Lightning invoice
 */
export type MeltProofsResponse = {
	/**
	 * if false, the proofs have not been invalidated and the payment can be tried later again with the same proofs
	 */
	quote: MeltQuoteResponse;
	/**
	 * Return/Change from overpaid fees. This happens due to Lighting fee estimation being inaccurate
	 */
	change: Array<Proof>;
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
 *  response after sending
 */
export type SendResponse = {
	/**
	 * Proofs that exceeded the needed amount
	 */
	keep: Array<Proof>;
	/**
	 * Proofs to be sent, matching the chosen amount
	 */
	send: Array<Proof>;
	serialized?: Array<{ proof: Proof; keep: boolean }>;
};
