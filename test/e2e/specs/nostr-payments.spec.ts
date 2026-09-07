import { expect, test, type Page } from "@playwright/test";
import { PaymentRequest } from "@cashu/cashu-ts";
import { WalletPage } from "../pages/WalletPage";
import { MINT_A_URL } from "../fixtures/mint";
import { walletRows as rows } from "../fixtures/database";

async function configure(page: Page, relay: string, automatic: boolean) {
  await page.addInitScript(
    ({ relay, automatic }) => {
      // Synthetic wallet configuration only, before app initialization. Do not
      // overwrite user interactions when this test reloads its isolated context.
      if (!localStorage.getItem("test.nostr.configured")) {
        localStorage.setItem("cashu.nostr.relays", JSON.stringify([relay]));
        localStorage.setItem("cashu.pr.receive", JSON.stringify(automatic));
        localStorage.setItem("test.nostr.configured", "true");
      }
    },
    { relay, automatic }
  );
}

async function createRequest(wallet: WalletPage, amount: number) {
  await wallet.openReceive("ecash");
  await wallet.page.getByTestId("receive-payment-request").click();
  await wallet.page.getByTestId("request-edit-amount").click();
  const input = wallet.page.getByTestId("request-amount-input");
  await input.fill(String(amount));
  await input.press("Enter");
  await expect(wallet.page.getByTestId("request-edit-amount")).toContainText(
    String(amount)
  );
  await wallet.page.getByTestId("copy-cashu-payment-request").click();
  const encoded = await wallet.page.evaluate(() =>
    navigator.clipboard.readText()
  );
  expect(PaymentRequest.fromEncodedRequest(encoded).amount?.toNumber()).toBe(
    amount
  );
  await wallet.closeFullscreenDialog();
  return encoded;
}

async function payRequest(wallet: WalletPage, encoded: string) {
  await wallet.openSend("lightning");
  await wallet.page
    .getByTestId("payment-request-input")
    .locator("textarea")
    .fill(encoded);
  const pay = wallet.page.getByTestId("pay-cashu-payment-request");
  await expect(pay).toBeEnabled();
  await pay.click();
}

for (const [name, relay] of [
  ["open", "ws://127.0.0.1:7777/"],
  ["authenticated", "ws://127.0.0.1:7778/"],
] as const) {
  test(`Nostr payment reaches an isolated wallet through the ${name} relay and survives reload`, async ({
    browser,
  }) => {
    const contexts = await Promise.all([
      browser.newContext({
        permissions: ["clipboard-read", "clipboard-write"],
        serviceWorkers: "block",
      }),
      browser.newContext({
        permissions: ["clipboard-read", "clipboard-write"],
        serviceWorkers: "block",
      }),
    ]);
    try {
      const [senderPage, receiverPage] = await Promise.all(
        contexts.map((context) => context.newPage())
      );
      await configure(senderPage, relay, false);
      await configure(receiverPage, relay, true);
      const sender = new WalletPage(senderPage);
      const receiver = new WalletPage(receiverPage);
      await sender.onboard(MINT_A_URL);
      await receiver.onboard(MINT_A_URL);
      await sender.mintBolt11(100);
      const encoded = await createRequest(receiver, 37);
      await payRequest(sender, encoded);
      await expect.poll(() => sender.balanceSats()).toBe(63);
      await expect.poll(() => receiver.balanceSats()).toBe(37);
      await expect
        .poll(async () => (await rows(senderPage, "paymentJobs"))[0]?.state)
        .toBe("published");
      const receipts = await rows(receiverPage, "paymentJobs");
      expect(receipts).toHaveLength(1);
      expect(receipts[0]).toMatchObject({
        state: "confirmed",
        amount: 37,
        fee: 0,
        matching: true,
      });
      expect(
        (await rows(receiverPage, "ecashHistory")).filter((r) => r.paymentJobId)
      ).toHaveLength(1);
      expect(await rows(senderPage, "paymentRequests")).toHaveLength(0);
      await Promise.all([senderPage.reload(), receiverPage.reload()]);
      await expect.poll(() => sender.balanceSats()).toBe(63);
      await expect.poll(() => receiver.balanceSats()).toBe(37);
      expect(
        (await rows(receiverPage, "ecashHistory")).filter((r) => r.paymentJobId)
      ).toHaveLength(1);
    } finally {
      await Promise.all(contexts.map((context) => context.close()));
    }
  });
}

test("unacknowledged publication is retryable without a second debit and manual receipt survives reload", async ({
  browser,
}) => {
  const contexts = await Promise.all([
    browser.newContext({
      permissions: ["clipboard-read", "clipboard-write"],
      serviceWorkers: "block",
    }),
    browser.newContext({
      permissions: ["clipboard-read", "clipboard-write"],
      serviceWorkers: "block",
    }),
  ]);
  try {
    const [senderPage, receiverPage] = await Promise.all(
      contexts.map((context) => context.newPage())
    );
    await configure(senderPage, "ws://127.0.0.1:7777/", false);
    await configure(receiverPage, "ws://127.0.0.1:7777/", false);
    let rejectPublications = true;
    const transmitted: string[] = [];
    await senderPage.routeWebSocket("ws://127.0.0.1:7777/**", (socket) => {
      const upstream = socket.connectToServer();
      socket.onMessage((message) => {
        const frame = JSON.parse(String(message));
        if (frame[0] === "EVENT" && frame[1].kind === 1059) {
          transmitted.push(frame[1].id);
          if (rejectPublications) {
            socket.send(
              JSON.stringify(["OK", frame[1].id, false, "blocked: test fault"])
            );
            return;
          }
        }
        upstream.send(message);
      });
    });
    const sender = new WalletPage(senderPage);
    const receiver = new WalletPage(receiverPage);
    await sender.onboard(MINT_A_URL);
    await receiver.onboard(MINT_A_URL);
    await sender.mintBolt11(100);
    await payRequest(sender, await createRequest(receiver, 21));
    await expect
      .poll(async () => (await rows(senderPage, "paymentJobs"))[0]?.reason)
      .toContain("not acknowledged");
    const [failed] = await rows(senderPage, "paymentJobs");
    expect(failed.state).toBe("ready");
    await expect.poll(() => sender.balanceSats()).toBe(79);
    rejectPublications = false;
    await senderPage.reload();
    await senderPage.goto("/settings/payment-requests");
    await senderPage.getByRole("button", { name: "Retry publication" }).click();
    await expect
      .poll(async () => (await rows(senderPage, "paymentJobs"))[0]?.state)
      .toBe("published");
    expect(new Set(transmitted).size).toBe(1);
    expect((await rows(senderPage, "paymentJobs"))[0].token).toBe(failed.token);
    await expect
      .poll(async () => (await rows(receiverPage, "paymentJobs")).length)
      .toBe(1);
    expect(await receiver.balanceSats()).toBe(0);
    await receiverPage.reload();
    await receiverPage.goto("/settings/payment-requests");
    await receiverPage
      .getByRole("button", { name: "Review", exact: true })
      .click();
    await receiverPage.getByTestId("receive-ecash").click();
    await expect.poll(() => receiver.balanceSats()).toBe(21);
    await senderPage.goto("/");
    await expect.poll(() => sender.balanceSats()).toBe(79);
  } finally {
    await Promise.all(contexts.map((context) => context.close()));
  }
});

test("recovers a lost swap response and a payment delivered while the receiver is offline", async ({
  browser,
}) => {
  const contexts = await Promise.all([
    browser.newContext({
      permissions: ["clipboard-read", "clipboard-write"],
      serviceWorkers: "block",
    }),
    browser.newContext({
      permissions: ["clipboard-read", "clipboard-write"],
      serviceWorkers: "block",
    }),
  ]);
  try {
    const [senderPage, receiverPage] = await Promise.all(
      contexts.map((context) => context.newPage())
    );
    await configure(senderPage, "ws://127.0.0.1:7777/", false);
    await configure(receiverPage, "ws://127.0.0.1:7777/", true);
    const sender = new WalletPage(senderPage);
    const receiver = new WalletPage(receiverPage);
    await sender.onboard(MINT_A_URL);
    await receiver.onboard(MINT_A_URL);
    await sender.mintBolt11(100);
    const encoded = await createRequest(receiver, 29);
    await receiverPage.goto("about:blank");
    let responseLost = false;
    let restores = 0;
    senderPage.on("request", (request) => {
      if (request.url() === `${MINT_A_URL}/v1/restore`) restores++;
    });
    await senderPage.route(`${MINT_A_URL}/v1/swap`, async (route) => {
      if (responseLost) {
        await route.fulfill({
          status: 400,
          contentType: "application/json",
          body: JSON.stringify({ code: 11001, detail: "Token already spent" }),
        });
        return;
      }
      const response = await route.fetch();
      expect(response.ok()).toBe(true);
      responseLost = true;
      await route.abort("connectionfailed");
    });
    await payRequest(sender, encoded);
    await expect
      .poll(async () => (await rows(senderPage, "paymentJobs"))[0]?.state)
      .toBe("published");
    expect(responseLost).toBe(true);
    expect(restores).toBeGreaterThan(0);
    await expect.poll(() => sender.balanceSats()).toBe(71);
    await receiver.goto();
    await expect.poll(() => receiver.balanceSats()).toBe(29);
    await Promise.all([senderPage.reload(), receiverPage.reload()]);
    await expect.poll(() => sender.balanceSats()).toBe(71);
    await expect.poll(() => receiver.balanceSats()).toBe(29);
    expect(
      (await rows(receiverPage, "paymentJobs")).filter(
        (job) => job.state === "confirmed"
      )
    ).toHaveLength(1);
  } finally {
    await Promise.all(contexts.map((context) => context.close()));
  }
});
