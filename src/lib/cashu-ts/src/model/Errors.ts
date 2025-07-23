/** This error is thrown when a HTTP response is not 2XX nor a protocol error. */
export class HttpResponseError extends Error {
	status: number;
	constructor(message: string, status: number) {
		super(message);
		this.status = status;
		this.name = 'HttpResponseError';
		Object.setPrototypeOf(this, HttpResponseError.prototype);
	}
}

/** This error is thrown when a network request fails. */
export class NetworkError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'NetworkError';
		Object.setPrototypeOf(this, NetworkError.prototype);
	}
}

/**
 * This error is thrown when a [protocol error](https://github.com/cashubtc/nuts/blob/main/00.md#errors) occurs.
 * See error codes [here](https://github.com/cashubtc/nuts/blob/main/error_codes.md).
 */
export class MintOperationError extends HttpResponseError {
	code: number;
	constructor(code: number, detail: string) {
		super(detail || 'Unknown mint operation error', 400);
		this.code = code;
		this.name = 'MintOperationError';
		Object.setPrototypeOf(this, MintOperationError.prototype);
	}
}
