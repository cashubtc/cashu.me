import { WSConnection } from '../src/WSConnection';
import { Client, Server, WebSocket } from 'mock-socket';
import { injectWebSocketImpl } from '../src/ws';
import { vi, test, describe, expect } from 'vitest';

injectWebSocketImpl(WebSocket);

const fakeUrl = 'ws://localhost:3338/v1/ws';
const server = new Server(fakeUrl, { mock: false });

describe('testing WSConnection', () => {
	test('connecting...', async () => {
		const connectionSpy = vi.fn();
		server.on('connection', connectionSpy);
		const conn = new WSConnection(fakeUrl);
		await conn.connect();
		expect(connectionSpy).toHaveBeenCalled();
	});
	test('requesting subscription', async () => {
		const message = (await new Promise(async (res) => {
			server.on('connection', (socket) => {
				socket.on('message', (m) => {
					res(m.toString());
				});
			});
			const conn = new WSConnection(fakeUrl);
			await conn.connect();

			const callback = vi.fn();
			const errorCallback = vi.fn();
			conn.createSubscription(
				{ kind: 'bolt11_mint_quote', filters: ['12345'] },
				callback,
				errorCallback
			);
		})) as string;
		expect(JSON.parse(message)).toMatchObject({
			jsonrpc: '2.0',
			method: 'subscribe',
			params: { kind: 'bolt11_mint_quote', filters: ['12345'] }
		});
	});
	test('unsubscribing', async () => {
		let wsSocket: Client;
		let subId: string;
		const conn = new WSConnection(fakeUrl);
		await new Promise<void>(async (res) => {
			server.on('connection', (socket) => {
				wsSocket = socket;
				res();
			});
			conn.connect();
		});
		const callback = vi.fn();
		const errorCallback = vi.fn();
		await new Promise<void>((res) => {
			wsSocket.on('message', (m) => {
				const parsed = JSON.parse(m.toString());
				if (parsed.method === 'subscribe') {
					const message = `{"jsonrpc": "2.0", "result": {"status": "OK", "subId": "${parsed.params.subId}"}, "id": ${parsed.id}}`;
					wsSocket.send(message);
					setTimeout(res, 0);
				}
			});
			subId = conn.createSubscription(
				{ kind: 'bolt11_mint_quote', filters: ['123'] },
				callback,
				errorCallback
			);
		});

		const message = await new Promise(async (res) => {
			wsSocket.on('message', (m) => {
				const parsed = JSON.parse(m.toString());
				if (parsed.method === 'unsubscribe') res(parsed);
			});
			conn.cancelSubscription(subId!, callback);
		});
		expect(message).toMatchObject({ jsonrpc: '2.0', method: 'unsubscribe' });
	});
	test('handing a notification', async () => {
		server.on('connection', (socket) => {
			socket.on('message', (m) => {
				try {
					const parsed = JSON.parse(m.toString());
					if (parsed.method === 'subscribe') {
						const message = `{"jsonrpc": "2.0", "result": {"status": "OK", "subId": "${parsed.params.subId}"}, "id": ${parsed.id}}`;
						socket.send(message);
						setTimeout(() => {
							const message = `{"jsonrpc": "2.0", "method": "subscribe", "params": {"subId": "${parsed.params.subId}", "payload": {"quote": "123", "request": "456", "paid": true, "expiry": 123}}}`;
							socket.send(message);
						}, 500);
					}
				} catch {
					console.log('Server parsing failed...');
				}
			});
		});
		const conn = new WSConnection(fakeUrl);
		await conn.connect();

		const payload = await new Promise((res) => {
			const callback = vi.fn((p: any) => {
				res(p);
			});
			const errorCallback = vi.fn();
			conn.createSubscription(
				{ kind: 'bolt11_mint_quote', filters: ['123'] },
				callback,
				errorCallback
			);
		});
		expect(payload).toMatchObject({ quote: '123', request: '456', paid: true, expiry: 123 });
	});
});
