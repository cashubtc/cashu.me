import { HttpResponseError, NetworkError, MintOperationError } from './model/Errors';

type RequestArgs = {
	endpoint: string;
	requestBody?: Record<string, unknown>;
	headers?: Record<string, string>;
};

type RequestOptions = RequestArgs & Omit<RequestInit, 'body' | 'headers'>;

let globalRequestOptions: Partial<RequestOptions> = {};

/**
 * An object containing any custom settings that you want to apply to the global fetch method.
 * @param options See possible options here: https://developer.mozilla.org/en-US/docs/Web/API/fetch#options
 */
export function setGlobalRequestOptions(options: Partial<RequestOptions>): void {
	globalRequestOptions = options;
}

async function _request({
	endpoint,
	requestBody,
	headers: requestHeaders,
	...options
}: RequestOptions): Promise<unknown> {
	const body = requestBody ? JSON.stringify(requestBody) : undefined;
	const headers = {
		...{ Accept: 'application/json, text/plain, */*' },
		...(body ? { 'Content-Type': 'application/json' } : undefined),
		...requestHeaders
	};

	let response: Response;
	try {
		response = await fetch(endpoint, { body, headers, ...options });
	} catch (err) {
		// A fetch() promise only rejects when the request fails,
		// for example, because of a badly-formed request URL or a network error.
		throw new NetworkError(err instanceof Error ? err.message : 'Network request failed');
	}

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({ error: 'bad response' }));

		if (response.status === 400 && 'code' in errorData && 'detail' in errorData) {
			throw new MintOperationError(errorData.code, errorData.detail);
		}

		throw new HttpResponseError(
			'error' in errorData ? errorData.error : errorData.detail || 'HTTP request failed',
			response.status
		);
	}

	try {
		return await response.json();
	} catch (err) {
		console.error('Failed to parse HTTP response', err);
		throw new HttpResponseError('bad response', response.status);
	}
}

export default async function request<T>(options: RequestOptions): Promise<T> {
	const data = await _request({ ...options, ...globalRequestOptions });
	return data as T;
}
