// nock doesn't support native fetch, and hence we need this polyfill.

import fetch, { Headers, Request, Response } from 'node-fetch';

(globalThis as any).fetch = fetch;
(globalThis as any).Headers = Headers;
(globalThis as any).Request = Request;
(globalThis as any).Response = Response;
