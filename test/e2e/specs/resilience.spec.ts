import { expect, test } from "@playwright/test";

import {
  counterpartyRequest,
  MINT_A_URL,
  type PaymentMethod,
} from "../fixtures/mint";
import {
  forceMeltQuoteState,
  forceMintQuoteState,
  forceMintQuoteStateSequence,
} from "../fixtures/scenarios";
import { WalletPage } from "../pages/WalletPage";

test.describe("payment input and balance safety", () => {
  test("does not create a payment from malformed input", async ({ page }) => {
    const wallet = new WalletPage(page);
    await wallet.onboard(MINT_A_URL);
    await wallet.openSend("lightning");

    const input = page.getByTestId("payment-request-input").locator("textarea");
    await input.fill("not-a-lightning-payment-request");

    await expect(page.getByTestId("pay-payment-request")).toHaveCount(0);
    await expect.poll(() => wallet.balanceSats()).toBe(0);
  });

  for (const scenario of [
    {
      name: "BOLT11",
      method: "bolt11" as PaymentMethod,
      sendMethod: "lightning" as const,
      requestAmount: 25,
      quoteAmount: undefined,
    },
    {
      name: "BOLT12",
      method: "bolt12" as PaymentMethod,
      sendMethod: "lightning" as const,
      requestAmount: 25,
      quoteAmount: undefined,
    },
    {
      name: "on-chain",
      method: "onchain" as PaymentMethod,
      sendMethod: "onchain" as const,
      requestAmount: undefined,
      quoteAmount: 25,
    },
  ]) {
    test(`blocks ${scenario.name} payment when the wallet has insufficient balance`, async ({
      page,
      request,
    }) => {
      const wallet = new WalletPage(page);
      await wallet.onboard(MINT_A_URL);

      const paymentRequest = await counterpartyRequest(
        request,
        scenario.method,
        scenario.requestAmount
      );
      await wallet.openSend(scenario.sendMethod);
      await wallet.quoteRequest(paymentRequest, scenario.quoteAmount, false);

      if (scenario.method === "onchain") {
        await expect(page.getByTestId("quote-payment-request")).toBeDisabled();
      } else {
        await expect(
          page.getByText("Balance too low", { exact: true })
        ).toBeVisible();
        await expect(page.getByTestId("pay-payment-request")).toHaveCount(0);
      }
      await expect.poll(() => wallet.balanceSats()).toBe(0);
    });
  }
});

test.describe("incoming quote recovery", () => {
  test("keeps an unpaid BOLT11 quote pending without minting proofs", async ({
    page,
  }) => {
    const wallet = new WalletPage(page);
    await wallet.onboard(MINT_A_URL);
    await forceMintQuoteState(page, MINT_A_URL, "bolt11", "UNPAID");

    await wallet.openReceive("lightning");
    await wallet.enterAmount(19);
    await page.getByTestId("create-payment-request").click();

    await expect(
      page.getByText("Lightning invoice", { exact: true })
    ).toBeVisible();
    await expect.poll(() => wallet.balanceSats()).toBe(0);
  });

  test("mints after a quote changes from unpaid to paid", async ({ page }) => {
    const wallet = new WalletPage(page);
    await wallet.onboard(MINT_A_URL);
    await forceMintQuoteStateSequence(page, MINT_A_URL, "bolt11", [
      "UNPAID",
      "PAID",
    ]);

    await wallet.openReceive("lightning");
    await wallet.enterAmount(23);
    await page.getByTestId("create-payment-request").click();

    await expect.poll(() => wallet.balanceSats()).toBe(23);
  });
});

test.describe("outgoing quote recovery", () => {
  for (const scenario of [
    {
      name: "BOLT11",
      method: "bolt11" as PaymentMethod,
      sendMethod: "lightning" as const,
      requestAmount: 31,
      quoteAmount: undefined,
    },
    {
      name: "BOLT12",
      method: "bolt12" as PaymentMethod,
      sendMethod: "lightning" as const,
      requestAmount: 32,
      quoteAmount: undefined,
    },
    {
      name: "on-chain",
      method: "onchain" as PaymentMethod,
      sendMethod: "onchain" as const,
      requestAmount: undefined,
      quoteAmount: 33,
    },
  ]) {
    test(`releases funds after a failed ${scenario.name} melt`, async ({
      page,
      request,
    }) => {
      const wallet = new WalletPage(page);
      await wallet.onboard(MINT_A_URL);
      await wallet.mintBolt11(250);
      const before = await wallet.balanceSats();

      const paymentRequest = await counterpartyRequest(
        request,
        scenario.method,
        scenario.requestAmount
      );
      await forceMeltQuoteState(page, MINT_A_URL, scenario.method, "UNPAID");
      await wallet.openSend(scenario.sendMethod);
      await wallet.quoteRequest(paymentRequest, scenario.quoteAmount);
      await page.getByTestId("pay-payment-request").click();

      await expect(page.getByText("Unpaid", { exact: true })).toBeVisible();
      await expect.poll(() => wallet.balanceSats()).toBe(before);
    });

    test(`does not spend funds while a ${scenario.name} melt is pending`, async ({
      page,
      request,
    }) => {
      const wallet = new WalletPage(page);
      await wallet.onboard(MINT_A_URL);
      await wallet.mintBolt11(250);
      const before = await wallet.balanceSats();

      const paymentRequest = await counterpartyRequest(
        request,
        scenario.method,
        scenario.requestAmount
      );
      await forceMeltQuoteState(page, MINT_A_URL, scenario.method, "PENDING");
      await wallet.openSend(scenario.sendMethod);
      await wallet.quoteRequest(paymentRequest, scenario.quoteAmount);
      await page.getByTestId("pay-payment-request").click();

      await expect(page.getByTestId("wallet-send")).toBeVisible();
      await expect.poll(() => wallet.balanceSats()).toBe(before);
    });
  }
});

test("prevents duplicate melt submissions from a double click", async ({
  page,
  request,
}) => {
  const wallet = new WalletPage(page);
  await wallet.onboard(MINT_A_URL);
  await wallet.mintBolt11(250);

  const paymentRequest = await counterpartyRequest(request, "bolt11", 31);
  await wallet.openSend("lightning");
  await wallet.quoteRequest(paymentRequest);

  let meltSubmissions = 0;
  page.on("request", (outgoingRequest) => {
    if (
      outgoingRequest.method() === "POST" &&
      new URL(outgoingRequest.url()).pathname.includes("/v1/melt/")
    ) {
      meltSubmissions += 1;
    }
  });

  const pay = page.getByTestId("pay-payment-request");
  await Promise.all([pay.click(), pay.click().catch(() => undefined)]);
  await expect(page.getByText("Paid", { exact: false })).toBeVisible();
  await expect.poll(() => meltSubmissions).toBe(1);
});
