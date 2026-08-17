import { expect, test } from "@playwright/test";
import {
  createMintQuote,
  MINT_A_URL,
  MINT_B_URL,
  type PaymentMethod,
} from "../fixtures/mint";

for (const [name, mintUrl] of [
  ["mint-a", MINT_A_URL],
  ["mint-b", MINT_B_URL],
] as const) {
  test(`${name} advertises every wallet payment rail`, async ({ request }) => {
    const response = await request.get(`${mintUrl}/v1/info`);
    expect(response.ok()).toBeTruthy();
    const info = await response.json();

    for (const nut of ["4", "5"]) {
      const methods = info.nuts[nut].methods.map(
        (entry: { method: string }) => entry.method
      );
      expect(methods).toEqual(
        expect.arrayContaining(["bolt11", "bolt12", "onchain"])
      );
    }
  });
}

for (const method of ["bolt11", "bolt12", "onchain"] as PaymentMethod[]) {
  test(`fake backend settles an incoming ${method} quote`, async ({
    request,
  }) => {
    const quote = await createMintQuote(request, method, {
      mintUrl: MINT_A_URL,
      amount: method === "onchain" ? undefined : 17,
    });

    await expect
      .poll(async () => {
        const response = await request.get(
          `${MINT_A_URL}/v1/mint/quote/${method}/${quote.quote}`
        );
        expect(response.ok()).toBeTruthy();
        const body = await response.json();
        return method === "bolt11" ? body.state : body.amount_paid > 0;
      })
      .toBe(method === "bolt11" ? "PAID" : true);
  });
}
