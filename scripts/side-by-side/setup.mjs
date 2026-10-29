// Seed one wallet per version: Minibits mint, a fake balance and history. Saves storage state.
import { chromium } from "playwright";
export const MINT = "https://mint.minibits.cash/Bitcoin";
export const VERSIONS = { before: "http://127.0.0.1:5101", after: "http://127.0.0.1:5102" };
const KEYSET = "01fc0ec0e59cd6fa01b7a88f8cd77fce81fd1e64bca67d752e984992b7a3c3a821";
const G = "0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798";
const hex = (n) => [...crypto.getRandomValues(new Uint8Array(n))].map((b) => b.toString(16).padStart(2, "0")).join("");
const proofs = [2048, 512, 128, 64, 32, 4, 1].map((amount) => ({ amount, id: KEYSET, secret: hex(32), C: G }));
const day = (d, h = 12) => new Date(Date.UTC(2026, 9, 29 - d, h, 14)).toISOString();
const history = [
  { amount: 2500, date: day(0, 9), status: "paid", label: "" },
  { amount: -210, date: day(0, 8), status: "paid", label: "" },
  { amount: -1000, date: day(1), status: "pending", label: "" },
  { amount: 5000, date: day(2), status: "paid", label: "Coffee fund" },
  { amount: -2600, date: day(4), status: "paid", label: "" },
  { amount: 21, date: day(9), status: "paid", label: "" },
].map((h, i) => ({ id: `sbs-${i}`, mint: MINT, unit: "sat", token: "", ...h }));

export async function seed(browser, name) {
  const base = VERSIONS[name];
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: "block" });
  const page = await context.newPage();
  await page.addInitScript(() => {
    if (!localStorage.getItem("sbs.seeded")) {
      localStorage.setItem("cashu.welcome.showWelcome", "false"); localStorage.setItem("cashu.welcome.termsAccepted", "true"); localStorage.setItem("cashu.welcome.seedPhraseValidated", "true");
      localStorage.setItem("cashu.language", "en-US");
      localStorage.setItem("sbs.seeded", "1");
    }
  });
  await page.goto(base + "/");
  await page.waitForFunction(() => document.querySelector("#q-app")?.__vue_app__?.config.globalProperties.$pinia?._s.has("mints"), null, { timeout: 20000 }).catch(async () => { console.log(name, "url", page.url(), [...(await page.evaluate(() => document.querySelector("#q-app")?.__vue_app__?.config.globalProperties.$pinia?._s.keys() ?? []))]); throw new Error("no mints store"); });
  await page.evaluate(async ({ MINT, proofs, history }) => {
    const s = document.querySelector("#q-app").__vue_app__.config.globalProperties.$pinia._s;
    await s.get("mints").addMint({ url: "https://testnut.cashu.space" });
    await s.get("mints").addMint({ url: MINT });
    await s.get("mints").activateMintUrl(MINT);
    await s.get("proofs").addProofs(proofs);
    for (const h of history) s.get("tokens").persistHistoryToken(h);
  }, { MINT, proofs, history });
  await page.waitForTimeout(1500);
  await page.reload();
  await page.waitForTimeout(2500);
  const state = await context.storageState({ indexedDB: true });
  await context.close();
  return state;
}
