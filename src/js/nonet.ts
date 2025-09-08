import { HttpResponseError } from "../contrib/cashu-ts/src/model/Errors";
import { useNonetStore } from "../stores/nonet";
import { v4 as uuidv4 } from "uuid";

export type NonetConnection = {
  myPublicKey: string;
  myPrivateKey: string;
  mintPublicKey: string;
  mintRelays: string[] | undefined;
  mintHost: string;
};

export type RequestArgs = {
  endpoint: string;
  requestBody?: Record<string, unknown>;
  headers?: Record<string, string>;
};

export type RequestOptions = RequestArgs &
  Omit<RequestInit, "body" | "headers">;

export type MessageOption = (m: Message) => void;

export class Message {
  Key: string = uuidv4();
  Data: string = "";

  constructor(options?: MessageOption[]) {
    options?.forEach((option) => option(this));
  }
}

export function WithUUID(uuid: string): MessageOption {
  return (m: Message) => {
    m.Key = uuid;
  };
}

export function WithData(data: string): MessageOption {
  return (m: Message) => {
    m.Data = data;
  };
}

export function NewMessage(...configs: MessageOption[]): Message {
  return new Message(configs);
}

export function MarshalJSON(m: Message): string {
  return JSON.stringify(m);
}

export function UnmarshalJSON(data: string): Message | null {
  try {
    let jsonData = JSON.parse(data);
    return new Message([WithUUID(jsonData.Key), WithData(jsonData.Data)]);
  } catch (e) {
    console.error(e);
    return null;
  }
}

let globalRequestOptions: Partial<RequestOptions> = {};

/**
 * An object containing any custom settings that you want to apply to the global fetch method.
 * @param options See possible options here: https://developer.mozilla.org/en-US/docs/Web/API/fetch#options
 */
export function setGlobalRequestOptions(
  options: Partial<RequestOptions>
): void {
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
    ...{ Accept: "application/json, text/plain, */*" },
    ...(body ? { "Content-Type": "application/json" } : undefined),
    ...requestHeaders,
  };

  const nonetStore = useNonetStore();
  const response = await nonetStore.fetch({
    endpoint,
    requestBody,
    headers,
    ...options,
  });

  if (!response.ok) {
    // expecting: { error: '', code: 0 }
    // or: { detail: '' } (cashuBtc via pythonApi)
    const { error, detail } = await response
      .json()
      .catch(() => ({ error: "bad response" }));
    throw new HttpResponseError(
      error || detail || "bad response",
      response.status
    );
  }

  try {
    return await response.json();
  } catch (err) {
    console.error("Failed to parse HTTP response", err);
    throw new HttpResponseError("bad response", response.status);
  }
}

export default async function request<T>(options: RequestOptions): Promise<T> {
  const data = await _request({ ...options, ...globalRequestOptions });
  return data as T;
}
