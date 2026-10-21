// Capture starter for cashu.me web UI visual review.
//
// Copy this file into your artifact/session directory and extend the
// interaction section with the navigation paths from your capture matrix.
// It already implements the fixture recipe that is easy to get wrong:
//   - welcome/terms bypass
//   - Quasar-encoded dark-mode flag (__q_bool|1/0, NOT plain true/false)
//   - mints seeded WITH info (the main screen never fetches mint info)
//   - history rows seeded into IndexedDB (they are NOT in localStorage)
//   - everything injected via addInitScript before first boot, because
//     @vueuse useLocalStorage refs clobber direct localStorage writes on
//     unload (so localStorage-then-reload silently loses your data)
//
// Usage:
//   BUILD=before BASE_URL=https://localhost:8014 OUT_DIR=<artifacts> \
//     node /Users/cc/.agents/skills/playwright-skill/run.js capture.js
//   BUILD=after  BASE_URL=https://localhost:8013 OUT_DIR=<artifacts> \
//     node /Users/cc/.agents/skills/playwright-skill/run.js capture.js
//
// Keep the fixture logically identical between before and after runs.
// Only selectors and navigation may differ per BUILD (markup legitimately
// changed between builds); never "fix" one build's code to match the other.
const path = require("node:path");
const { chromium } = require("playwright");

const BUILD = process.env.BUILD || "before";
const BASE_URL = process.env.BASE_URL || "https://localhost:8014";
const OUT_DIR = process.env.OUT_DIR || ".";
const TESTNUT = "https://testnut.cashu.space";

// Synthetic fixture. Mint metadata mirrors testnut's public /v1/info document
// (a public test mint); contact entries, extra mints, and all history rows
// are artificial. Never seed real wallet data into review captures.
const MINT_INFO = {
  name: "Testnut mint",
  pubkey: "02f23d920a6a29cbcc0c15d2d046829ffe78bda10eaa4515f4397ec3036b11dec3",
  version: "cdk-mintd/0.17.0-rc.3",
  description: "Mint for testing Cashu wallets",
  description_long:
    "This mint usually runs the latest cdk-mintd from main branch of the cdk repository. It uses a FakeWallet, all your Lightning invoices will always be marked paid so that you can test minting and melting ecash via Lightning.",
  motd: "This is a message of the day field. You should display this field to your users if the content changes!",
  icon_url:
    "https://image.nostr.build/46ee47763c345d2cfa3317f042d332003f498ee281fb42808d47a7d3b9585911.png",
  contact: [
    { method: "email", info: "support@testnut.example" },
    { method: "twitter", info: "@testnut-example" },
  ],
  nuts: {
    4: {
      methods: [
        { method: "bolt11", unit: "sat", min_amount: 1, max_amount: 500000 },
        { method: "bolt12", unit: "sat", min_amount: 1, max_amount: 500000 },
      ],
      disabled: false,
    },
    5: {
      methods: [
        { method: "bolt11", unit: "sat", min_amount: 1, max_amount: 500000 },
      ],
      disabled: false,
    },
    7: { supported: true },
    8: { supported: true },
    9: { supported: true },
    10: { supported: true },
    11: { supported: true },
    12: { supported: true },
    14: { supported: true },
    15: { methods: [{ method: "bolt11", unit: "sat" }] },
    17: { supported: true },
    19: { supported: true },
    20: { supported: true },
  },
};

// Injected before the app boots. addInitScript serializes this function, so
// it cannot close over outer variables — everything arrives via `seed`.
function seedLocalStorage(seed) {
  localStorage.setItem("cashu.welcome.showWelcome", "false");
  localStorage.setItem("cashu.welcome.termsAccepted", "true");
  // Quasar's web-storage plugin encodes booleans as __q_bool|1/0. A plain
  // "false" decodes to the STRING "false", the app's `== false` check fails,
  // and it forces dark mode — light captures come out dark with no error.
  localStorage.setItem(
    "cashu.darkMode",
    seed.dark ? "__q_bool|1" : "__q_bool|0"
  );
  localStorage.setItem("cashu.activeUnit", "sat");
  localStorage.setItem("cashu.ui.expandHistory", "true");
  localStorage.setItem(
    "cashu.mints",
    JSON.stringify([
      {
        url: "https://testnut.cashu.space",
        nickname: "",
        keysets: [],
        keys: [],
        info: seed.mintInfo,
      },
      {
        url: "https://mint-alpha.example.com",
        nickname: "",
        keysets: [],
        keys: [],
        info: { name: "Mint Alpha" },
      },
      {
        url: "https://mint-beta.example.com",
        nickname: "",
        keysets: [],
        keys: [],
        info: { name: "Mint Beta" },
      },
    ])
  );
  localStorage.setItem("cashu.activeMintUrl", "https://testnut.cashu.space");
}

// History lives in Dexie (IndexedDB "db"), not localStorage. Boot once, put
// rows, reload. Timestamps are relative to capture time; keep labels/amounts
// identical between builds.
async function seedIndexedDB(page) {
  await page.evaluate(async () => {
    const now = Date.now();
    const iso = (minsAgo) => new Date(now - minsAgo * 60000).toISOString();
    const ecash = [
      {
        id: "e1",
        status: "paid",
        amount: 21000,
        date: iso(35),
        token: "cashuAexample",
        mint: "https://testnut.cashu.space",
        unit: "sat",
        label: "Coffee refund",
      },
      {
        id: "e2",
        status: "paid",
        amount: -5000,
        date: iso(60 * 5),
        token: "cashuBexample",
        mint: "https://testnut.cashu.space",
        unit: "sat",
        label: "Sent to Alice",
      },
      {
        id: "e3",
        status: "pending",
        amount: 1200,
        date: iso(60 * 26),
        token: "cashuCexample",
        mint: "https://testnut.cashu.space",
        unit: "sat",
      },
    ];
    const payments = [
      {
        id: "p1",
        direction: "mint",
        quote: "q1",
        method: "bolt11",
        status: "paid",
        mint: "https://testnut.cashu.space",
        unit: "sat",
        date: iso(10),
        amount: 50000,
        label: "Top up",
        request: "lnbc1…",
      },
      {
        id: "p2",
        direction: "melt",
        quote: "q2",
        method: "bolt11",
        status: "paid",
        mint: "https://testnut.cashu.space",
        unit: "sat",
        date: iso(60 * 3),
        amount: -12400,
        label: "Dinner split",
        request: "lnbc1…",
      },
      {
        id: "p3",
        direction: "mint",
        quote: "q3",
        method: "onchain",
        status: "pending",
        mint: "https://testnut.cashu.space",
        unit: "sat",
        date: iso(60 * 50),
        amount: 100000,
        request: "bc1q…",
      },
    ];
    const put = (table, rows) =>
      new Promise((resolve, reject) => {
        const req = indexedDB.open("db");
        req.onsuccess = () => {
          const db = req.result;
          const tx = db.transaction(table, "readwrite");
          rows.forEach((r) => tx.objectStore(table).put(r));
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
          tx.onerror = () => reject(tx.error);
        };
        req.onerror = () => reject(req.error);
      });
    await put("ecashHistory", ecash);
    await put("paymentHistory", payments);
  });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const viewport = { width: 390, height: 844 };
  const shot = async (page, name) => {
    const file = path.join(OUT_DIR, `${BUILD}-${name}.png`);
    await page.screenshot({ path: file });
    console.log("saved", file);
  };

  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    viewport,
  });
  await context.addInitScript(seedLocalStorage, {
    dark: true,
    mintInfo: MINT_INFO,
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 160)));

  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(4000);
  await seedIndexedDB(page);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForTimeout(6000); // boot + live fetches + 600ms count-up

  // --- baseline capture ---------------------------------------------------
  await shot(page, "wallet-main-dark");

  // --- extend here with your capture matrix -------------------------------
  // Examples of interactions that are easy to get wrong (see the playbook):
  //
  // Mint details page (direct URL works on the dev server):
  //   await page.goto(`${BASE_URL}/mintdetails?mintUrl=${encodeURIComponent(TESTNUT)}`);
  //
  // PWA install button (collapse the history panel first — the button is
  // below the fold when it is expanded):
  //   await page.locator(".q-expansion-item .q-icon", { hasText: "keyboard_arrow_up" }).click();
  //   await page.evaluate(() => window.dispatchEvent(new Event("beforeinstallprompt")));
  //
  // Light theme: create a second context with addInitScript(seedLocalStorage,
  // { dark: false, mintInfo: MINT_INFO }) and re-run the navigation.
  //
  // Parameterize per-build selectors with the BUILD env var — markup
  // legitimately differs between before and after.

  console.log("pageerrors:", errors.length ? errors : "none");
  await browser.close();
})().catch((e) => {
  console.error("CAPTURE FAILED:", e.message);
  process.exit(1);
});
