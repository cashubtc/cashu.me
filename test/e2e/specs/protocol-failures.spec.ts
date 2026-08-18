import { expect, test } from "@playwright/test";

import { MINT_A_URL, type PaymentMethod } from "../fixtures/mint";

for (const method of ["bolt11", "bolt12", "onchain"] as PaymentMethod[]) {
  test(`rejects an unknown ${method} mint quote`, async ({ request }) => {
    const response = await request.get(
      `${MINT_A_URL}/v1/mint/quote/${method}/missing-quote`
    );
    expect(response.ok()).toBeFalsy();
  });
}

test("rejects an invalid BOLT11 melt quote", async ({ request }) => {
  const response = await request.post(`${MINT_A_URL}/v1/melt/quote/bolt11`, {
    data: { unit: "sat", request: "lnbc-invalid" },
  });
  expect(response.ok()).toBeFalsy();
});

test("rejects an invalid BOLT12 melt quote", async ({ request }) => {
  const response = await request.post(`${MINT_A_URL}/v1/melt/quote/bolt12`, {
    data: { unit: "sat", request: "lno1-invalid", amount_msat: 1_000 },
  });
  expect(response.ok()).toBeFalsy();
});

test("rejects an invalid on-chain melt quote", async ({ request }) => {
  const response = await request.post(`${MINT_A_URL}/v1/melt/quote/onchain`, {
    data: { unit: "usd", request: "not-a-bitcoin-address", amount: 10 },
  });
  expect(response.ok()).toBeFalsy();
});
