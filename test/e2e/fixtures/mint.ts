import { expect, type APIRequestContext } from "@playwright/test";

export const MINT_A_URL = process.env.E2E_MINT_A_URL ?? "http://127.0.0.1:8085";
export const MINT_B_URL = process.env.E2E_MINT_B_URL ?? "http://127.0.0.1:8086";

const TEST_PUBKEY =
  "03d56ce4e446a85bbdaa547b4ec2b073d40ff802831352b8272b7dd7a4de5a7cac";

export type PaymentMethod = "bolt11" | "bolt12" | "onchain";

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
