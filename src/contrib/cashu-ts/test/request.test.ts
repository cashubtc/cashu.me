import nock from 'nock';
import { CashuMint } from '../src/CashuMint.js';
import { CashuWallet } from '../src/CashuWallet.js';
import { setGlobalRequestOptions } from '../src/request.js';
import { MeltQuoteResponse } from '../src/model/types/index.js';

let request: Record<string, string> | undefined;
const mintUrl = 'https://localhost:3338';
const unit = 'sats';
const invoice =
	'lnbc20u1p3u27nppp5pm074ffk6m42lvae8c6847z7xuvhyknwgkk7pzdce47grf2ksqwsdpv2phhwetjv4jzqcneypqyc6t8dp6xu6twva2xjuzzda6qcqzpgxqyz5vqsp5sw6n7cztudpl5m5jv3z6dtqpt2zhd3q6dwgftey9qxv09w82rgjq9qyyssqhtfl8wv7scwp5flqvmgjjh20nf6utvv5daw5h43h69yqfwjch7wnra3cn94qkscgewa33wvfh7guz76rzsfg9pwlk8mqd27wavf2udsq3yeuju';

beforeAll(() => {
	nock.disableNetConnect();
});

beforeEach(() => {
	nock.cleanAll();
	request = undefined;
});

describe('requests', () => {
	test('request with body contains the correct headers', async () => {
		const mint = new CashuMint(mintUrl);
		nock(mintUrl)
			.get('/v1/melt/quote/bolt11/test')
			.reply(200, function () {
				request = this.req.headers;
				console.log(this.req.headers);
				return {
					quote: 'test_melt_quote_id',
					amount: 2000,
					fee_reserve: 20,
					payment_preimage: null,
					state: 'UNPAID'
				} as MeltQuoteResponse;
			});

		const wallet = new CashuWallet(mint, { unit });
		await wallet.checkMeltQuote('test');

		expect(request).toBeDefined();
		// expect(request!['content-type']).toContain('application/json');
		expect(request!['accept']).toContain('application/json, text/plain, */*');
	});
	test('global custom headers can be set', async () => {
		const mint = new CashuMint(mintUrl);
		nock(mintUrl)
			.get('/v1/melt/quote/bolt11/test')
			.reply(200, function () {
				request = this.req.headers;
				return {
					quote: 'test_melt_quote_id',
					amount: 2000,
					fee_reserve: 20,
					payment_preimage: null,
					state: 'UNPAID'
				} as MeltQuoteResponse;
			});

		const wallet = new CashuWallet(mint, { unit });
		setGlobalRequestOptions({ headers: { 'x-cashu': 'xyz-123-abc' } });

		await wallet.checkMeltQuote('test');

		expect(request).toBeDefined();
		expect(request!['x-cashu']).toContain('xyz-123-abc');
	});
});
