import { Proof } from './index';

export type RawTransport = {
	t: PaymentRequestTransportType; // type
	a: string; // target
	g?: Array<Array<string>>; // tags
};

export type RawNUT10Option = {
	k: string; // kind
	d: string; // data
	t: Array<Array<string>>; // tags
};

export type RawPaymentRequest = {
	i?: string; // id
	a?: number; // amount
	u?: string; // unit
	s?: boolean; // single use
	m?: Array<string>; // mints
	d?: string; // description
	t?: Array<RawTransport>; // transports
	nut10?: RawNUT10Option;
};

export type PaymentRequestTransport = {
	type: PaymentRequestTransportType;
	target: string;
	tags?: Array<Array<string>>;
};

export enum PaymentRequestTransportType {
	POST = 'post',
	NOSTR = 'nostr'
}

export type PaymentRequestPayload = {
	id?: string;
	memo?: string;
	unit: string;
	mint: string;
	proofs: Array<Proof>;
};

/** Used to express a spending condition that proofs should be encumbered with */
export type NUT10Option = {
	/** The kind of spending condition */
	kind: string;
	/** Expresses the spending condition relative to the kind */
	data: string;
	/** Tags associated with the spending condition for additional data */
	tags: Array<Array<string>>;
};
