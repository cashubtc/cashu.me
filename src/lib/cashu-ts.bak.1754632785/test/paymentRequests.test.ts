import { test, describe, expect } from 'vitest';
import {
	decodePaymentRequest,
	PaymentRequest,
	PaymentRequestTransport,
	PaymentRequestTransportType,
	NUT10Option
} from '../src/index.js';

describe('payment requests', () => {
	test('encode payment requests', async () => {
		const request = new PaymentRequest(
			[
				{
					type: PaymentRequestTransportType.NOSTR,
					target: 'asd',
					tags: [['n', '17']]
				} as PaymentRequestTransport
			],
			'4840f51e',
			1000,
			'sat',
			['https://mint.com'],
			'test',
			true, // single use
			{
				kind: 'P2PK',
				data: 'pubkey',
				tags: [['tag', 'tag-value']]
			} as NUT10Option
		);
		const pr = request.toEncodedRequest();
		expect(pr).toBeDefined();
		const decodedRequest = decodePaymentRequest(pr);
		expect(decodedRequest).toBeDefined();
		expect(decodedRequest.id).toBe('4840f51e');
		expect(decodedRequest.amount).toBe(1000);
		expect(decodedRequest.unit).toBe('sat');
		expect(decodedRequest.mints).toStrictEqual(['https://mint.com']);
		expect(decodedRequest.description).toBe('test');
		expect(decodedRequest.transport).toBeDefined();
		expect(decodedRequest.transport?.length).toBe(1);
		expect(decodedRequest.singleUse).toBe(true);
		expect(decodedRequest.transport?.[0].type).toBe(PaymentRequestTransportType.NOSTR);
		expect(decodedRequest.transport?.[0].target).toBe('asd');
		expect(decodedRequest.transport?.[0].tags).toStrictEqual([['n', '17']]);
		expect(decodedRequest.nut10).toBeDefined();
		expect(decodedRequest.nut10?.kind).toBe('P2PK');
		expect(decodedRequest.nut10?.data).toBe('pubkey');
		expect(decodedRequest.nut10?.tags).toStrictEqual([['tag', 'tag-value']]);

		const decodedRequestClassConstructor = PaymentRequest.fromEncodedRequest(pr);
		expect(decodedRequestClassConstructor).toStrictEqual(decodedRequest);
	});
	test('test decoding payment requests with no amount', async () => {
		const prWithoutAmount =
			'creqApGF0gaNhdGVub3N0cmFheKlucHJvZmlsZTFxeTI4d3VtbjhnaGo3dW45ZDNzaGp0bnl2OWtoMnVld2Q5aHN6OW1od2RlbjV0ZTB3ZmprY2N0ZTljdXJ4dmVuOWVlaHFjdHJ2NWhzenJ0aHdkZW41dGUwZGVoaHh0bnZkYWtxcWd5bWRleDNndmZzZnVqcDN4eW43ZTdxcnM4eXlxOWQ4enN1MnpxdWp4dXhjYXBmcXZ6YzhncnFka3RzYWeBgmFuYjE3YWloNDg0MGY1MWVhdWNzYXRhbYFwaHR0cHM6Ly9taW50LmNvbQ==';
		const request: PaymentRequest = decodePaymentRequest(prWithoutAmount);
		expect(request).toBeDefined();
		expect(request.id).toBe('4840f51e');
		expect(request.amount).toBeUndefined();
		expect(request.unit).toBe('sat');
		expect(request.mints).toStrictEqual(['https://mint.com']);
		expect(request.description).toBeUndefined();
		expect(request.transport).toBeDefined();
		expect(request.transport?.length).toBe(1);
		expect(request.transport?.[0].type).toBe(PaymentRequestTransportType.NOSTR);
		expect(request.transport?.[0].target).toBe(
			'nprofile1qy28wumn8ghj7un9d3shjtnyv9kh2uewd9hsz9mhwden5te0wfjkccte9curxven9eehqctrv5hszrthwden5te0dehhxtnvdakqqgymdex3gvfsfujp3xyn7e7qrs8yyq9d8zsu2zqujxuxcapfqvzc8grqdkts'
		);
	});
});
