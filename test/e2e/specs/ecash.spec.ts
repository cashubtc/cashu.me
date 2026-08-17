import { expect, test, type Video } from "@playwright/test";
import { MINT_A_URL } from "../fixtures/mint";
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
