import { OutputDataFactory, OutputDataLike } from '../OutputData';
import { Proof } from './wallet/index';

export * from './mint/index';
export * from './wallet/index';

export type OutputAmounts = {
	sendAmounts: Array<number>;
	keepAmounts?: Array<number>;
};

export type LockedMintQuote = {
	id: string;
	privkey: string;
};

/**
 * @param {ReceiveOptions} [options] - Optional configuration for token processing:
 *   - `keysetId`: Override the default keyset ID with a custom one fetched from the `/keysets` endpoint.
 *   - `outputAmounts`: Specify output amounts for keeping or sending.
 *   - `proofsWeHave`: Provide stored proofs for optimal output derivation.
 *   - `counter`: Set a counter to deterministically derive secrets (requires CashuWallet initialized with a seed phrase).
 *   - `pubkey`: Lock eCash to a public key (non-deterministic, even with a counter set).
 *   - `privkey`: Create a signature for token secrets.
 *   - `requireDleq`: Verify DLEQ proofs for all provided proofs; reject the token if any proof fails verification.
 */
export type ReceiveOptions = {
	keysetId?: string;
	outputAmounts?: OutputAmounts;
	proofsWeHave?: Array<Proof>;
	counter?: number;
	pubkey?: string;
	privkey?: string;
	requireDleq?: boolean;
	outputData?: Array<OutputDataLike> | OutputDataFactory;
	p2pk?: { pubkey: string; locktime?: number; refundKeys?: Array<string> };
};

/**
 * @param {SendOptions} [options] - Optional parameters for configuring the send operation:
 *   - `outputAmounts` (OutputAmounts): Specify the amounts to keep and send in the output.
 *   - `counter` (number): Set a counter to derive secrets deterministically. Requires the `CashuWallet` class to be initialized with a seed phrase.
 *   - `proofsWeHave` (Array<Proof>): Provide all currently stored proofs for the mint. Used to derive optimal output amounts.
 *   - `pubkey` (string): Lock eCash to a specified public key. Note that this will not be deterministic, even if a counter is set.
 *   - `privkey` (string): Create a signature for the output secrets if provided.
 *   - `keysetId` (string): Override the keyset ID derived from the current mint keys with a custom one. The keyset ID should be fetched from the `/keysets` endpoint.
 *   - `offline` (boolean): Send proofs offline, if enabled.
 *   - `includeFees` (boolean): Include fees in the response, if enabled.
 *   - `includeDleq` (boolean): Include DLEQ proofs in the proofs to be sent, if enabled.
 */
export type SendOptions = {
	outputAmounts?: OutputAmounts;
	proofsWeHave?: Array<Proof>;
	counter?: number;
	pubkey?: string;
	privkey?: string;
	keysetId?: string;
	offline?: boolean;
	includeFees?: boolean;
	includeDleq?: boolean;
	outputData?: {
		send?: Array<OutputDataLike> | OutputDataFactory;
		keep?: Array<OutputDataLike> | OutputDataFactory;
	};
	p2pk?: { pubkey: string; locktime?: number; refundKeys?: Array<string> };
};

/**
 * @param {SwapOptions} [options] - Optional parameters for configuring the swap operation:
 * - `amount`: amount to send while performing the optimal split (least proofs possible). can be set to undefined if preference is set
 * - proofs proofs matching that amount
 * - outputAmounts? optionally specify the output's amounts to keep and to send.
 * - counter? optionally set counter to derive secret deterministically. CashuWallet class must be initialized with seed phrase to take effect
 * - keysetId? override the keysetId derived from the current mintKeys with a custom one. This should be a keyset that was fetched from the `/keysets` endpoint
 * - includeFees? include estimated fees for the receiver to receive the proofs
 * - proofsWeHave? optionally provide all currently stored proofs of this mint. Cashu-ts will use them to derive the optimal output amounts
 * - pubkey? optionally locks ecash to pubkey. Will not be deterministic, even if counter is set!
 * - privkey? will create a signature on the  proofs secrets if set
 */
export type SwapOptions = {
	outputAmounts?: OutputAmounts;
	proofsWeHave?: Array<Proof>;
	counter?: number;
	pubkey?: string;
	privkey?: string;
	keysetId?: string;
	includeFees?: boolean;
	outputData?: {
		send?: Array<OutputDataLike> | OutputDataFactory;
		keep?: Array<OutputDataLike> | OutputDataFactory;
	};
	p2pk?: { pubkey: string; locktime?: number; refundKeys?: Array<string> };
};

export type RestoreOptions = {
	keysetId?: string;
};

/**
 * @param {MintProofOptions} [options] - Optional parameters for configuring the Mint Proof operation:
 * - `keysetId`: override the keysetId derived from the current mintKeys with a custom one. This should be a keyset that was fetched from the `/keysets` endpoint
 * - `outputAmounts`:  optionally specify the output's amounts to keep and to send.
 * - `counter`: optionally set counter to derive secret deterministically. CashuWallet class must be initialized with seed phrase to take effect
 * - `proofsWeHave`: optionally provide all currently stored proofs of this mint. Cashu-ts will use them to derive the optimal output amounts
 * - `pubkey`: optionally locks ecash to pubkey. Will not be deterministic, even if counter is set!
 */
export type MintProofOptions = {
	keysetId?: string;
	outputAmounts?: OutputAmounts;
	proofsWeHave?: Array<Proof>;
	counter?: number;
	pubkey?: string;
	outputData?: Array<OutputDataLike> | OutputDataFactory;
	p2pk?: { pubkey: string; locktime?: number; refundKeys?: Array<string> };
};

/**
 * @param {MeltProofOptions} [options] - Optional parameters for configuring the Melting Proof operation:
 * - `keysetId`: override the keysetId derived from the current mintKeys with a custom one. This should be a keyset that was fetched from the `/keysets` endpoint
 * - `counter`: optionally set counter to derive secret deterministically. CashuWallet class must be initialized with seed phrase to take effect
 * - `privkey`: will create a signature on the  proofs secrets if set
 */
export type MeltProofOptions = {
	keysetId?: string;
	counter?: number;
	privkey?: string;
};
// deprecated

export type InvoiceData = {
	paymentRequest: string;
	amountInSats?: number;
	amountInMSats?: number;
	timestamp?: number;
	paymentHash?: string;
	memo?: string;
	expiry?: number;
};

type RpcSubKinds = 'bolt11_mint_quote' | 'bolt11_melt_quote' | 'proof_state';

export type RpcSubId = string | number | null;

type JsonRpcParams = any;

export type JsonRpcReqParams = {
	kind: RpcSubKinds;
	filters: Array<string>;
	subId: string;
};

type JsonRpcSuccess<T = any> = {
	jsonrpc: '2.0';
	result: T;
	id: RpcSubId;
};

export type JsonRpcErrorObject = {
	code: number;
	message: string;
	data?: any;
};

type JsonRpcError = {
	jsonrpc: '2.0';
	error: JsonRpcErrorObject;
	id: RpcSubId;
};

type JsonRpcRequest = {
	jsonrpc: '2.0';
	method: 'sub';
	params: JsonRpcReqParams;
	id: Exclude<RpcSubId, null>;
};

export type JsonRpcNotification = {
	jsonrpc: '2.0';
	method: string;
	params?: JsonRpcParams;
};

export type JsonRpcMessage = JsonRpcRequest | JsonRpcNotification | JsonRpcSuccess | JsonRpcError;
