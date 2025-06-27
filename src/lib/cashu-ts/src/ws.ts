let _WS: typeof WebSocket;

if (typeof WebSocket !== 'undefined') {
	_WS = WebSocket;
}

export function injectWebSocketImpl(ws: any) {
	_WS = ws;
}

export function getWebSocketImpl() {
	return _WS;
}
