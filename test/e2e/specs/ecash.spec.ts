import { expect, test, type Video } from "@playwright/test";
import { MINT_A_URL, rotateMintAKeyset } from "../fixtures/mint";
import { WalletPage } from "../pages/WalletPage";

test("sends ecash between two isolated browser wallets and rejects replay", async ({
  browser,
}) => {
  const recordVideo =
    process.env.E2E_VIDEO === "on"
      ? { dir: "test-results/ecash-video", size: { width: 1280, height: 720 } }
      : undefined;
  const senderContext = await browser.newContext({
    permissions: ["clipboard-read", "clipboard-write"],
    reducedMotion: "reduce",
    serviceWorkers: "block",
    recordVideo,
  });
  const receiverContext = await browser.newContext({
    permissions: ["clipboard-read", "clipboard-write"],
    reducedMotion: "reduce",
    serviceWorkers: "block",
    recordVideo,
  });
  let senderVideo: Video | null = null;
  let receiverVideo: Video | null = null;

  try {
    const senderPage = await senderContext.newPage();
    const receiverPage = await receiverContext.newPage();
    senderVideo = senderPage.video();
    receiverVideo = receiverPage.video();
    const sender = new WalletPage(senderPage);
    const receiver = new WalletPage(receiverPage);
    await sender.onboard(MINT_A_URL);
    await receiver.onboard(MINT_A_URL);
    await sender.mintBolt11(100);

    await sender.openSend("ecash");
    await sender.enterAmount(37);
    await sender.page.getByTestId("send-ecash").click();
    await sender.page.getByTestId("copy-ecash-token").click();
    const token = await sender.page.evaluate(() =>
      navigator.clipboard.readText()
    );
    expect(token).toMatch(/^cashu[AB]/i);
    await expect.poll(() => sender.balanceSats()).toBe(63);

    await receiver.page.evaluate(
      (cashuToken) => navigator.clipboard.writeText(cashuToken),
      token
    );
    await receiver.openReceive("ecash");
    await receiver.page.getByTestId("receive-ecash-paste").click();
    await receiver.page.getByTestId("receive-ecash").click();
    await expect.poll(() => receiver.balanceSats()).toBe(37);

    await receiver.page.evaluate(
      (cashuToken) => navigator.clipboard.writeText(cashuToken),
      token
    );
    await receiver.openReceive("ecash");
    await receiver.page.getByTestId("receive-ecash-paste").click();
    await receiver.page
      .getByTestId("receive-token-input")
      .locator("textarea")
      .fill(token);
    await receiver.page.getByTestId("receive-ecash").click();
    await expect(
      receiver.page.getByText(/spent|already/i).first()
    ).toBeVisible();

    await receiver.page.reload();
    await expect.poll(() => receiver.balanceSats()).toBe(37);
  } finally {
    const videoCopies = recordVideo
      ? Promise.allSettled([
          senderVideo?.saveAs("test-results/ecash-video/sender.webm"),
          receiverVideo?.saveAs("test-results/ecash-video/receiver.webm"),
        ])
      : undefined;
    await Promise.allSettled([senderContext.close(), receiverContext.close()]);
    await videoCopies;
  }
});

test("recovers when a mint rotates its keyset before receiving old ecash", async ({
  browser,
  request,
}) => {
  const senderContext = await browser.newContext({
    permissions: ["clipboard-read", "clipboard-write"],
    reducedMotion: "reduce",
    serviceWorkers: "block",
  });
  const receiverContext = await browser.newContext({
    permissions: ["clipboard-read", "clipboard-write"],
    reducedMotion: "reduce",
    serviceWorkers: "block",
  });

  try {
    const senderPage = await senderContext.newPage();
    const receiverPage = await receiverContext.newPage();
    const sender = new WalletPage(senderPage);
    const receiver = new WalletPage(receiverPage);
    await sender.onboard(MINT_A_URL);
    await receiver.onboard(MINT_A_URL);
    await sender.mintBolt11(100);

    await sender.openSend("ecash");
    await sender.enterAmount(37);
    await sender.page.getByTestId("send-ecash").click();
    await sender.page.getByTestId("copy-ecash-token").click();
    const token = await sender.page.evaluate(() =>
      navigator.clipboard.readText()
    );
    await expect.poll(() => sender.balanceSats()).toBe(63);

    const initialKeysetsResponse = await request.get(
      `${MINT_A_URL}/v1/keysets`
    );
    expect(initialKeysetsResponse.ok()).toBeTruthy();
    const initialKeysets = await initialKeysetsResponse.json();
    const oldActiveKeyset = initialKeysets.keysets.find(
      (keyset: { unit: string; active: boolean }) =>
        keyset.unit === "sat" && keyset.active
    );
    expect(oldActiveKeyset).toBeDefined();

    await rotateMintAKeyset();

    await expect
      .poll(async () => {
        const response = await request.get(`${MINT_A_URL}/v1/keysets`);
        const { keysets } = await response.json();
        return keysets.find(
          (keyset: { unit: string; active: boolean }) =>
            keyset.unit === "sat" && keyset.active
        )?.id;
      })
      .not.toBe(oldActiveKeyset.id);

    const rotatedKeysetsResponse = await request.get(
      `${MINT_A_URL}/v1/keysets`
    );
    expect(rotatedKeysetsResponse.ok()).toBeTruthy();
    const rotatedKeysets = await rotatedKeysetsResponse.json();
    const newActiveKeyset = rotatedKeysets.keysets.find(
      (keyset: { unit: string; active: boolean }) =>
        keyset.unit === "sat" && keyset.active
    );
    expect(newActiveKeyset).toBeDefined();
    expect(
      rotatedKeysets.keysets.find(
        (keyset: { id: string }) => keyset.id === oldActiveKeyset.id
      )?.active
    ).toBe(false);

    const swapOutputKeysets: string[][] = [];
    const failedSwapStatuses: number[] = [];
    receiver.page.on("request", (swapRequest) => {
      if (
        new URL(swapRequest.url()).pathname !== "/v1/swap" ||
        swapRequest.method() !== "POST"
      ) {
        return;
      }
      const body = JSON.parse(swapRequest.postData() ?? "{}");
      swapOutputKeysets.push(
        Array.from(
          new Set(body.outputs?.map((output: { id: string }) => output.id))
        )
      );
    });
    receiver.page.on("response", (swapResponse) => {
      if (
        new URL(swapResponse.url()).pathname === "/v1/swap" &&
        !swapResponse.ok()
      ) {
        failedSwapStatuses.push(swapResponse.status());
      }
    });

    await receiver.page.evaluate(
      (cashuToken) => navigator.clipboard.writeText(cashuToken),
      token
    );
    await receiver.openReceive("ecash");
    await receiver.page.getByTestId("receive-ecash-paste").click();
    await receiver.page.getByTestId("receive-ecash").click();

    await expect.poll(() => receiver.balanceSats()).toBe(37);
    await expect.poll(() => failedSwapStatuses.length).toBeGreaterThan(0);
    await expect.poll(() => swapOutputKeysets.length).toBeGreaterThanOrEqual(2);
    expect(swapOutputKeysets[0]).toContain(oldActiveKeyset.id);
    expect(swapOutputKeysets.at(-1)).toContain(newActiveKeyset.id);
  } finally {
    await Promise.allSettled([senderContext.close(), receiverContext.close()]);
  }
});
