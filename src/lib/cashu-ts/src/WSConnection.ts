import { MessageQueue } from './utils';
import {
	JsonRpcErrorObject,
	JsonRpcMessage,
	JsonRpcNotification,
	JsonRpcReqParams,
	RpcSubId
} from './model/types';
import { OnOpenError, OnOpenSuccess } from './model/types/wallet/websocket';
import { getWebSocketImpl } from './ws';

export class ConnectionManager {
	static instace: ConnectionManager;
	private connectionMap: Map<string, WSConnection> = new Map();

	static getInstance() {
		if (!ConnectionManager.instace) {
			ConnectionManager.instace = new ConnectionManager();
		}
		return ConnectionManager.instace;
	}

	getConnection(url: string): WSConnection {
		if (this.connectionMap.has(url)) {
			return this.connectionMap.get(url) as WSConnection;
		}
		const newConn = new WSConnection(url);
		this.connectionMap.set(url, newConn);
		return newConn;
	}
}

export class WSConnection {
	public readonly url: URL;
	private readonly _WS: typeof WebSocket;
	private ws: WebSocket | undefined;
	private connectionPromise: Promise<void> | undefined;
	private subListeners: { [subId: string]: Array<(payload: any) => any> } = {};
	private rpcListeners: { [rpcSubId: string]: any } = {};
	private messageQueue: MessageQueue;
	private handlingInterval?: number;
	private rpcId = 0;

	constructor(url: string) {
		this._WS = getWebSocketImpl();
		this.url = new URL(url);
		this.messageQueue = new MessageQueue();
	}

	connect() {
		if (!this.connectionPromise) {
			this.connectionPromise = new Promise((res: OnOpenSuccess, rej: OnOpenError) => {
				try {
					this.ws = new this._WS(this.url.toString());
				} catch (err) {
					rej(err);
					return;
				}
				this.ws.onopen = () => {
					res();
				};
				this.ws.onerror = () => {
					rej(new Error('Failed to open WebSocket'));
				};
				this.ws.onmessage = (e: MessageEvent) => {
					this.messageQueue.enqueue(e.data);
					if (!this.handlingInterval) {
						this.handlingInterval = setInterval(
							this.handleNextMesage.bind(this),
							0
						) as unknown as number;
					}
				};
				this.ws.onclose = () => {
					this.connectionPromise = undefined;
				};
			});
		}
		return this.connectionPromise;
	}

	sendRequest(method: 'subscribe', params: JsonRpcReqParams): void;
	sendRequest(method: 'unsubscribe', params: { subId: string }): void;
	sendRequest(method: 'subscribe' | 'unsubscribe', params: Partial<JsonRpcReqParams>) {
		if (this.ws?.readyState !== 1) {
			throw new Error('Socket not open...');
		}
		const id = this.rpcId;
		this.rpcId++;
		const message = JSON.stringify({ jsonrpc: '2.0', method, params, id });
		this.ws?.send(message);
	}

	closeSubscription(subId: string) {
		this.ws?.send(JSON.stringify(['CLOSE', subId]));
	}

	addSubListener(subId: string, callback: (payload: any) => any) {
		(this.subListeners[subId] = this.subListeners[subId] || []).push(callback);
	}

	//TODO: Move to RPCManagerClass
	private addRpcListener(
		callback: () => any,
		errorCallback: (e: JsonRpcErrorObject) => any,
		id: Exclude<RpcSubId, null>
	) {
		this.rpcListeners[id] = { callback, errorCallback };
	}

	//TODO: Move to RPCManagerClass
	private removeRpcListener(id: Exclude<RpcSubId, null>) {
		delete this.rpcListeners[id];
	}

	private removeListener(subId: string, callback: (payload: any) => any) {
		if (!this.subListeners[subId]) {
			return;
		}
		if (this.subListeners[subId].length === 1) {
			delete this.subListeners[subId];
			return;
		}
		this.subListeners[subId] = this.subListeners[subId].filter((fn: any) => fn !== callback);
	}

	async ensureConnection() {
		if (this.ws?.readyState !== 1) {
			await this.connect();
		}
	}

	private handleNextMesage() {
		if (this.messageQueue.size === 0) {
			clearInterval(this.handlingInterval);
			this.handlingInterval = undefined;
			return;
		}
		const message = this.messageQueue.dequeue() as string;
		let parsed;
		try {
			parsed = JSON.parse(message) as JsonRpcMessage;
			if ('result' in parsed && parsed.id != undefined) {
				if (this.rpcListeners[parsed.id]) {
					this.rpcListeners[parsed.id].callback();
					this.removeRpcListener(parsed.id);
				}
			} else if ('error' in parsed && parsed.id != undefined) {
				if (this.rpcListeners[parsed.id]) {
					this.rpcListeners[parsed.id].errorCallback(parsed.error);
					this.removeRpcListener(parsed.id);
				}
			} else if ('method' in parsed) {
				if ('id' in parsed) {
					// Do nothing as mints should not send requests
				} else {
					const subId = parsed.params.subId;
					if (!subId) {
						return;
					}
					if (this.subListeners[subId]?.length > 0) {
						const notification = parsed as JsonRpcNotification;
						this.subListeners[subId].forEach((cb) => cb(notification.params.payload));
					}
				}
			}
		} catch (e) {
			console.error(e);
			return;
		}
	}

	createSubscription(
		params: Omit<JsonRpcReqParams, 'subId'>,
		callback: (payload: any) => any,
		errorCallback: (e: Error) => any
	) {
		if (this.ws?.readyState !== 1) {
			return errorCallback(new Error('Socket is not open'));
		}
		const subId = (Math.random() + 1).toString(36).substring(7);
		this.addRpcListener(
			() => {
				this.addSubListener(subId, callback);
			},
			(e: JsonRpcErrorObject) => {
				errorCallback(new Error(e.message));
			},
			this.rpcId
		);
		this.sendRequest('subscribe', { ...params, subId });
		this.rpcId++;
		return subId;
	}

	cancelSubscription(subId: string, callback: (payload: any) => any) {
		this.removeRpcListener(subId);
		this.removeListener(subId, callback);
		this.rpcId++;
		this.sendRequest('unsubscribe', { subId });
	}

	get activeSubscriptions() {
		return Object.keys(this.subListeners);
	}

	close() {
		if (this.ws) {
			this.ws?.close();
		}
	}
}
