import { expect, type APIRequestContext } from "@playwright/test";
import { connect } from "node:http2";

export const MINT_A_URL = process.env.E2E_MINT_A_URL ?? "http://127.0.0.1:8085";
export const MINT_B_URL = process.env.E2E_MINT_B_URL ?? "http://127.0.0.1:8086";
const MINT_A_MANAGEMENT_URL =
  process.env.E2E_MINT_A_MANAGEMENT_URL ?? "http://127.0.0.1:10000";

const TEST_PUBKEY =
  "03d56ce4e446a85bbdaa547b4ec2b073d40ff802831352b8272b7dd7a4de5a7cac";

export type PaymentMethod = "bolt11" | "bolt12" | "onchain";

const ROTATE_KEYSET_PATH = "/cdk_mint_management_v1.CdkMint/RotateNextKeyset";
const GRPC_PROTOCOL_VERSION = "1.0.0";

/** Rotate the E2E mint's active sat keyset through its local management RPC. */
export async function rotateMintAKeyset() {
  const client = connect(MINT_A_MANAGEMENT_URL);

  return new Promise<void>((resolve, reject) => {
    let settled = false;
    let grpcStatus: string | undefined;
    let responseStatus: number | undefined;

    const complete = (error?: Error) => {
      if (settled) return;
      settled = true;
      client.close();
      if (error) reject(error);
      else resolve();
    };

    const request = client.request({
      ":method": "POST",
      ":path": ROTATE_KEYSET_PATH,
      "content-type": "application/grpc",
      te: "trailers",
      "x-cdk-protocol-version": GRPC_PROTOCOL_VERSION,
    });

    request.on("response", (headers) => {
      responseStatus = Number(headers[":status"]);
    });
    request.on("trailers", (headers) => {
      grpcStatus = String(headers["grpc-status"]);
    });
    request.on("data", () => {});
    request.once("error", complete);
    request.once("end", () => {
      if (responseStatus !== 200) {
        complete(new Error(`Keyset rotation returned HTTP ${responseStatus}`));
      } else if (grpcStatus !== "0") {
        complete(
          new Error(`Keyset rotation failed with gRPC status ${grpcStatus}`)
        );
      } else {
        complete();
      }
    });
    client.once("error", complete);

    // RotateNextKeysetRequest { unit: "sat", use_keyset_v2: false }. Keeping
    // the keyset ID format consistent with the seed keyset makes the scenario
    // independent of the CDK mint image's default format.
    const message = Buffer.from([0x0a, 0x03, 0x73, 0x61, 0x74, 0x20, 0x00]);
    const frame = Buffer.alloc(message.length + 5);
    frame.writeUInt32BE(message.length, 1);
    message.copy(frame, 5);
    request.end(frame);
  });
}

async function postJson(
  request: APIRequestContext,
  url: string,
  data: Record<string, unknown>
) {
  const response = await request.post(url, { data });
  expect(
    response.ok(),
    `${response.status()} ${response.statusText()}: ${await response.text()}`
  ).toBeTruthy();
  return response.json();
}

export async function createMintQuote(
  request: APIRequestContext,
  method: PaymentMethod,
  options: { mintUrl?: string; amount?: number } = {}
) {
  const mintUrl = options.mintUrl ?? MINT_B_URL;
  const data: Record<string, unknown> = { unit: "sat" };

  if (method === "bolt11") {
    data.amount = options.amount ?? 10;
  } else {
    data.pubkey = TEST_PUBKEY;
    if (options.amount !== undefined) data.amount = options.amount;
  }

  return postJson(request, `${mintUrl}/v1/mint/quote/${method}`, data);
}

export async function counterpartyRequest(
  request: APIRequestContext,
  method: PaymentMethod,
  amount?: number
) {
  const quote = await createMintQuote(request, method, { amount });
  expect(
    quote.request,
    `${method} quote must contain a payment request`
  ).toEqual(expect.any(String));
  return quote.request as string;
}
