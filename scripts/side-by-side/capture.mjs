// Capture every shot in both versions at the same viewport. Writes /tmp/sbs/shots/<id>-<version>.png
// and /tmp/sbs/shots/manifest.json. Run: node capture.mjs [--only id,id]
import { chromium } from "playwright";
import fs from "node:fs";
import { seed, VERSIONS, MINT } from "./setup.mjs";
import { generateMnemonic } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english";
import { TESTNUT, mintProofs, token as testnutToken, invoice } from "./testnut.mjs";

const OUT = "/tmp/sbs/shots";
fs.mkdirSync(OUT, { recursive: true });
const TOKEN = fs.readFileSync("/tmp/sbs/token.txt", "utf8").trim();
const PHONE = { width: 390, height: 844 };
const DESKTOP = { width: 1280, height: 832 };
const only = process.argv.includes("--only") ? process.argv[process.argv.indexOf("--only") + 1].split(",") : null;
const MINT_Q = "?mintUrl=" + encodeURIComponent(MINT);

const TESTIDS = { RECEIVE: "wallet-receive", SEND: "wallet-send" };
const click = (text) => async (p) => {
  if (Array.isArray(text)) {
    for (const t of text) if (await p.getByText(t, { exact: true }).locator("visible=true").count()) return click(t)(p);
    throw new Error("none of " + text.join(" / ") + " visible");
  }
  const loc = TESTIDS[text]
    ? p.getByTestId(TESTIDS[text]).locator("visible=true").first()
    : p.getByText(text, { exact: true }).locator("visible=true").last();
  await loc.click({ timeout: 6000, force: true });
  await p.waitForTimeout(1000);
};
const tab = (name) => async (p) => {
  const tabs = p.locator(".q-tab");
  await (typeof name === "number" ? tabs.nth(name) : tabs.filter({ hasText: name }).first()).click({ timeout: 6000 });
  await p.waitForTimeout(800);
};
const fill = (text) => async (p) => {
  const f = p.locator(".q-dialog textarea, .q-dialog input[type=text], .q-dialog input:not([type])").locator("visible=true").first();
  await f.fill(text, { timeout: 6000 });
  await p.waitForTimeout(1500);
};
const paste = (text) => async (p) => {
  await p.evaluate((t) => navigator.clipboard.writeText(t), text);
  await click(["Paste", "Paste token"])(p);
  await p.waitForTimeout(2000);
};
const type = (text) => async (p) => {
  await p.keyboard.type(text, { delay: 60 });
  await p.waitForTimeout(800);
};
// A button by its accessible name, inside the open dialog when there is one.
const btn = (re, settle = 1500) => async (p) => {
  const scope = (await p.locator(".q-dialog").count()) ? p.locator(".q-dialog").last() : p;
  await scope.getByRole("button", { name: re }).locator("visible=true").last().click({ timeout: 8000 });
  await p.waitForTimeout(settle);
};
const pasteLater = (make) => async (p) => paste(await make())(p);
const fillLater = (make) => async (p) => fill(await make())(p);
const wait = (ms) => async (p) => p.waitForTimeout(ms);
const scrollEnd = async (p) => {
  await p.evaluate(() => {
    const els = [document.scrollingElement, ...document.querySelectorAll(".q-page-container, .q-page, .scroll, .q-dialog .q-card")];
    for (const e of els) if (e) e.scrollTop = e.scrollHeight;
  });
  await p.waitForTimeout(600);
};

const shots = [];
const add = (section, id, title, o = {}) => shots.push({ section, id, title, path: "/", theme: "monochrome", dark: true, lang: "en-US", viewport: PHONE, steps: [], ...o });

// Onboarding (fresh wallet, nothing seeded)
const next = [click("Next")];
add("Onboarding", "welcome-1", "Welcome", { fresh: true, path: "/welcome" });
add("Onboarding", "welcome-2", "Welcome, step 2", { fresh: true, path: "/welcome", steps: [...next] });
add("Onboarding", "welcome-3", "Welcome, step 3", { fresh: true, path: "/welcome", steps: [...next, ...next] });
add("Onboarding", "welcome-light", "Welcome, light", { fresh: true, path: "/welcome", dark: false });
add("Onboarding", "terms", "Terms of service", { path: "/terms" });

// Wallet
add("Wallet", "wallet-history", "Wallet, history tab", { steps: [tab("History")] });
add("Wallet", "wallet-mints", "Wallet, mints tab", { steps: [tab("Mints")] });
add("Wallet", "wallet-history-light", "Wallet, light", { dark: false, steps: [tab("History")] });
add("Wallet", "wallet-mints-light", "Mints tab, light", { dark: false, steps: [tab("Mints")] });

// Receive and send
add("Receive", "receive-chooser", "Receive options", { steps: [click("RECEIVE")] });
add("Receive", "receive-ecash", "Receive ecash", { steps: [click("RECEIVE"), click("Ecash")] });
add("Receive", "receive-ecash-token", "Receive ecash, token pasted", { steps: [click("RECEIVE"), click("Ecash"), paste(TOKEN)] });
add("Receive", "receive-lightning", "Receive Lightning, amount", { steps: [click("RECEIVE"), click("Lightning")] });
add("Receive", "receive-lightning-typed", "Receive Lightning, 2,100 typed", { steps: [click("RECEIVE"), click("Lightning"), type("2100")] });
add("Receive", "receive-onchain", "Receive on-chain", { steps: [click("RECEIVE"), click("On-chain")] });
add("Receive", "receive-chooser-light", "Receive options, light", { dark: false, steps: [click("RECEIVE")] });
add("Send", "send-chooser", "Send options", { steps: [click("SEND")] });
add("Send", "send-ecash", "Send ecash, amount", { steps: [click("SEND"), click("Ecash")] });
add("Send", "send-ecash-typed", "Send ecash, 500 typed", { steps: [click("SEND"), click("Ecash"), type("500")] });
add("Send", "send-lightning", "Pay Lightning", { steps: [click("SEND"), click("Lightning")] });
add("Send", "send-onchain", "Send on-chain", { steps: [click("SEND"), click("On-chain")] });
add("Send", "send-ecash-light", "Send ecash, light", { dark: false, steps: [click("SEND"), click("Ecash"), type("500")] });

// Real flows on testnut (fake funds; it pays its own invoices). Every shot mints fresh ecash.
const T = { section: "Testnut flows", testnut: 4000 };
const tn = (id, title, o) => add(T.section, id, title, { testnut: T.testnut, ...o });
tn("tn-wallet", "Wallet on testnut", { steps: [tab("History")] });
tn("tn-receive-invoice", "Receive Lightning, invoice created", { steps: [click("RECEIVE"), click("Lightning"), type("2100"), btn(/create invoice/i, 250)] });
tn("tn-receive-invoice-paid", "Receive Lightning, invoice paid", { steps: [click("RECEIVE"), click("Lightning"), type("2100"), btn(/create invoice/i), wait(8000)] });
tn("tn-receive-onchain", "Receive on-chain, address created", { steps: [click("RECEIVE"), click("On-chain"), type("50000"), btn(/create address/i), wait(1500)] });
tn("tn-receive-request", "Receive ecash, payment request", { steps: [click("RECEIVE"), click("Ecash"), click(["Request", "Request ecash"]), wait(2000)] });
tn("tn-receive-request-amount", "Payment request, 1,000 typed", { steps: [click("RECEIVE"), click("Ecash"), click(["Request", "Request ecash"]), wait(1500), type("1000"), wait(1000)] });
tn("tn-receive-token", "Receive a testnut token", { steps: [click("RECEIVE"), click("Ecash"), pasteLater(() => testnutToken(1500, "Pizza split"))] });
tn("tn-receive-token-done", "Testnut token received", { steps: [click("RECEIVE"), click("Ecash"), pasteLater(() => testnutToken(1500, "Pizza split")), btn(/^receive$/i), wait(4000)] });
tn("tn-send-token", "Send ecash, token created", { steps: [click("SEND"), click("Ecash"), type("500"), btn(/^send$/i), wait(2500)] });
tn("tn-pay-invoice", "Pay Lightning, real invoice", { steps: [click("SEND"), click("Lightning"), fillLater(() => invoice(1210)), wait(3000)] });
tn("tn-send-onchain", "Send on-chain", { steps: [click("SEND"), click("On-chain")] });
tn("tn-mint-details", "Testnut mint details", { path: "/mintdetails?mintUrl=" + encodeURIComponent(TESTNUT), steps: [wait(2500)] });
tn("tn-receive-invoice-light", "Receive Lightning invoice, light", { dark: false, steps: [click("RECEIVE"), click("Lightning"), type("2100"), btn(/create invoice/i, 250)] });
tn("tn-send-token-light", "Send ecash token, light", { dark: false, steps: [click("SEND"), click("Ecash"), type("500"), btn(/^send$/i), wait(2500)] });

// Mints
add("Mints", "mint-details", "Mint details (Minibits)", { path: "/mintdetails" + MINT_Q, steps: [wait(2500)] });
add("Mints", "mint-details-scrolled", "Mint details, scrolled", { path: "/mintdetails" + MINT_Q, steps: [wait(2500), scrollEnd] });
add("Mints", "mint-details-light", "Mint details, light", { dark: false, path: "/mintdetails" + MINT_Q, steps: [wait(2500)] });
add("Mints", "mint-ratings", "Mint reviews", { path: "/mintratings" + MINT_Q, steps: [wait(4000)] });
add("Mints", "discover-mints", "Discover mints", { path: "/discoverMints", steps: [wait(6000)] });
add("Mints", "restore", "Restore from seed", { path: "/restore" });

// Settings
const SETTINGS = ["", "backup", "lightning-address", "nostr", "payment-requests", "nwc", "p2pk", "privacy", "experimental", "appearance", "language", "advanced", "about"];
for (const s of SETTINGS) {
  const name = s ? s.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase()) : "Settings menu";
  add("Settings", "settings-" + (s || "menu"), name, { path: "/settings" + (s ? "/" + s : "") });
  if (["", "advanced", "nostr", "privacy"].includes(s))
    add("Settings", "settings-" + (s || "menu") + "-scrolled", name + ", scrolled", { path: "/settings" + (s ? "/" + s : ""), steps: [scrollEnd] });
}
add("Settings", "settings-menu-light", "Settings menu, light", { dark: false, path: "/settings" });
add("Settings", "settings-appearance-light", "Appearance, light", { dark: false, path: "/settings/appearance" });

// Themes
for (const theme of ["monochrome", "classic", "bitcoin", "mint", "autumn", "salvador", "freedom", "cyber", "flamingo"]) {
  add("Themes", `theme-${theme}-dark`, `${theme}, dark`, { theme, steps: [tab("History")] });
  add("Themes", `theme-${theme}-light`, `${theme}, light`, { theme, dark: false, steps: [tab("History")] });
}

// Languages
for (const lang of ["en-US", "de-DE", "es-ES", "fr-FR", "it-IT", "pt-BR", "sv-SE", "cs-CZ", "el-GR", "tr-TR", "ar-SA", "th-TH", "ja-JP", "zh-CN"]) {
  add("Languages", `lang-${lang}-wallet`, `${lang}: wallet`, { lang, steps: [tab(0)] });
  add("Languages", `lang-${lang}-settings`, `${lang}: settings`, { lang, path: "/settings" });
  add("Languages", `lang-${lang}-receive`, `${lang}: receive options`, { lang, steps: [click("RECEIVE")] });
}

// Desktop
add("Desktop", "desktop-wallet", "Desktop wallet", { viewport: DESKTOP, steps: [tab("History")] });
add("Desktop", "desktop-settings", "Desktop settings", { viewport: DESKTOP, path: "/settings" });
add("Desktop", "desktop-receive", "Desktop receive Lightning", { viewport: DESKTOP, steps: [click("RECEIVE"), click("Lightning")] });
add("Desktop", "desktop-mint-details", "Desktop mint details", { viewport: DESKTOP, path: "/mintdetails" + MINT_Q, steps: [wait(2500)] });
add("Desktop", "desktop-light", "Desktop wallet, light", { viewport: DESKTOP, dark: false, steps: [tab("History")] });

const todo = only ? shots.filter((s) => only.includes(s.id)) : shots;
const browser = await chromium.launch();
const states = {};
for (const v of Object.keys(VERSIONS)) states[v] = await seed(browser, v);
console.log("seeded", todo.length, "shots");

const results = {};
async function run(shot, v) {
  const context = await browser.newContext({
    storageState: shot.fresh ? undefined : states[v],
    viewport: shot.viewport, deviceScaleFactor: 2, serviceWorkers: "block", reducedMotion: "reduce", permissions: ["clipboard-read", "clipboard-write"],
    locale: shot.lang, colorScheme: shot.dark ? "dark" : "light",
  });
  const page = await context.newPage();
  // Testnut flows mint and swap for real: each needs its own seed, or the deterministic
  // outputs repeat across shots and the mint rejects them as duplicates.
  if (shot.testnut) {
    await page.addInitScript((m) => {
      localStorage.setItem("cashu.mnemonic", m);
      localStorage.setItem("cashu.keysetCounters", "[]");
    }, generateMnemonic(wordlist));
  }
  await page.addInitScript(({ theme, dark, lang, fresh }) => {
    localStorage.setItem("cashu.theme", theme);
    localStorage.setItem("cashu.darkMode", dark ? "__q_bool|1" : "__q_bool|0");
    localStorage.setItem("cashu.language", lang);
    if (fresh) localStorage.setItem("cashu.welcome.showWelcome", "true");
  }, shot);
  await page.addStyleTag?.({ content: "" }).catch(() => {});
  let error = null;
  try {
    // Start at the wallet like a user, then route inside the app: main only applies its
    // stored theme and mode from the wallet page.
    await page.goto(VERSIONS[v] + (shot.fresh ? shot.path : "/"));
    await page.waitForTimeout(2500);
    if (!shot.fresh && shot.path !== "/") {
      await page.evaluate((to) => document.querySelector("#q-app").__vue_app__.config.globalProperties.$router.push(to), shot.path);
      await page.waitForTimeout(2000);
    }
    await page.addStyleTag({ content: "*,*::before,*::after{caret-color:transparent!important;transition:none!important;animation-duration:0s!important}.q-notifications__list{display:none!important}" });
    if (shot.testnut) {
      const proofs = await mintProofs(shot.testnut);
      await page.evaluate(async ({ TESTNUT, proofs }) => {
        const st = document.querySelector("#q-app").__vue_app__.config.globalProperties.$pinia._s;
        await st.get("mints").activateMintUrl(TESTNUT);
        await st.get("proofs").addProofs(proofs);
      }, { TESTNUT, proofs });
      await page.waitForTimeout(1000);
      await page.reload();
      await page.waitForTimeout(2500);
    }
    for (const step of shot.steps) await step(page);
    await page.waitForTimeout(700);
  } catch (e) {
    error = String(e.message).split("\n")[0];
  }
  await page.screenshot({ path: `${OUT}/${shot.id}-${v}.png` });
  await context.close();
  return error;
}

const queue = todo.flatMap((s) => Object.keys(VERSIONS).map((v) => [s, v]));
await Promise.all(Array.from({ length: 5 }, async () => {
  while (queue.length) {
    const [s, v] = queue.shift();
    const err = await run(s, v);
    (results[s.id] ??= {})[v] = err;
    if (err) console.log("step failed", s.id, v, err);
  }
}));
const manifest = shots.map(({ section, id, title, viewport, theme, dark, lang }) => ({ section, id, title, viewport, theme, dark, lang, errors: results[id] ?? null }));
const prev = fs.existsSync(`${OUT}/manifest.json`) && only ? JSON.parse(fs.readFileSync(`${OUT}/manifest.json`)) : [];
if (only) for (const m of manifest) if (!results[m.id]) m.errors = prev.find((x) => x.id === m.id)?.errors ?? null;
fs.writeFileSync(`${OUT}/manifest.json`, JSON.stringify(manifest, null, 1));
console.log("done", todo.length * 2, "screenshots");
await browser.close();
