// Captures every slide (shots.mjs) in both versions at the same viewport, full length, from
// the same seeded demo wallet, and saves that wallet as the snapshot the deck's live panes
// start from.
//
//   node scripts/side-by-side/capture.mjs [--only id,id] [--root http://127.0.0.1:5100] [--out DIR]
//
// --root serves the deploy as nginx does (serve.mjs): the branch at / and the base build at
// /side-by-side/before/. Writes DIR/<id>-<version>.png, DIR/manifest.json, DIR/seed-<version>.json.
import { chromium } from "playwright";
import fs from "node:fs";
import { generateMnemonic } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english";
import { getEncodedToken } from "@cashu/cashu-ts";
import { buildShots, TESTNUT } from "./shots.mjs";
import { mintProofs, token as testnutToken, invoice } from "./testnut.mjs";

const arg = (name, fallback) =>
  process.argv.includes(name)
    ? process.argv[process.argv.indexOf(name) + 1]
    : fallback;
const ROOT = arg("--root", "http://127.0.0.1:5100");
const OUT = arg("--out", "/tmp/sbs/shots");
const only = arg("--only", "")?.split(",").filter(Boolean);
const BASES = { before: ROOT + "/side-by-side/before", after: ROOT };
const PREFERRED_MINT = "https://mint.minibits.cash/Bitcoin";
fs.mkdirSync(OUT, { recursive: true });

const hex = (n) =>
  [...crypto.getRandomValues(new Uint8Array(n))]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
const G = "0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798";
const fakeProofs = (amounts, id) =>
  amounts.map((amount) => ({ amount, id, secret: hex(32), C: G }));
const ago = (hours) => new Date(Date.now() - hours * 36e5).toISOString();
const HISTORY = [
  { amount: 2500, date: ago(0.4), status: "paid", label: "" },
  { amount: -210, date: ago(3), status: "paid", label: "" },
  { amount: -1000, date: ago(26), status: "pending", label: "" },
  { amount: 5000, date: ago(50), status: "paid", label: "Coffee fund" },
  { amount: -2600, date: ago(4 * 24 + 2), status: "paid", label: "" },
  { amount: 21, date: ago(9 * 24 + 5), status: "paid", label: "" },
].map((h, i) => ({ id: `sbs-${i}`, unit: "sat", token: "", ...h }));

// The base build keeps its storage under a prefix (deck/shim.js); init scripts run before
// the shim, so they write the prefixed key themselves.
const setStorage = (entries) => {
  const P = location.pathname.startsWith("/side-by-side/before")
    ? "sbs-before:"
    : "";
  for (const [k, v] of Object.entries(entries)) localStorage.setItem(P + k, v);
};
const appReady = () =>
  document
    .querySelector("#q-app")
    ?.__vue_app__?.config.globalProperties.$pinia?._s.has("mints");

// Seed one wallet per version: the test mint and the demo mint, a fake balance and a history.
async function seed(browser, version) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    serviceWorkers: "block",
  });
  const page = await context.newPage();
  await page.addInitScript(setStorage, {
    "cashu.welcome.showWelcome": "false",
    "cashu.welcome.termsAccepted": "true",
    "cashu.welcome.seedPhraseValidated": "true",
    "cashu.language": "en-US",
  });
  await page.goto(BASES[version] + "/");
  await page.waitForFunction(appReady, null, { timeout: 30000 });
  const seeded = await page.evaluate(
    async ({ TESTNUT, PREFERRED_MINT }) => {
      const s =
        document.querySelector("#q-app").__vue_app__.config.globalProperties
          .$pinia._s;
      await s.get("mints").addMint({ url: TESTNUT });
      let url = PREFERRED_MINT;
      try {
        await s.get("mints").addMint({ url });
      } catch (e) {
        url = TESTNUT;
      }
      const mint = s
        .get("mints")
        .mints.find((m) => m.url === url && m.keysets?.length);
      if (!mint) url = TESTNUT;
      await s.get("mints").activateMintUrl(url);
      const keyset = s
        .get("mints")
        .mints.find((m) => m.url === url)
        .keysets.find((k) => k.unit === "sat" && k.active !== false);
      return { mint: url, keyset: keyset.id };
    },
    { TESTNUT, PREFERRED_MINT }
  );
  const proofs = fakeProofs([2048, 512, 128, 64, 32, 4, 1], seeded.keyset);
  const history = HISTORY.map((h) => ({ ...h, mint: seeded.mint }));
  await page.evaluate(
    async ({ proofs, history }) => {
      const s =
        document.querySelector("#q-app").__vue_app__.config.globalProperties
          .$pinia._s;
      await s.get("proofs").addProofs(proofs);
      for (const h of history) s.get("tokens").persistHistoryToken(h);
    },
    { proofs, history }
  );
  await page.waitForTimeout(1500);
  await page.reload();
  await page.waitForTimeout(2500);
  // What the deck writes before it frames this version: the app's own storage, then the
  // proofs and history through the app's stores.
  const stored = await page.evaluate(() => {
    const out = {};
    for (const k of Object.keys(localStorage))
      if (k.startsWith("cashu.")) out[k] = localStorage.getItem(k);
    return out;
  });
  fs.writeFileSync(
    `${OUT}/seed-${version}.json`,
    JSON.stringify({ localStorage: stored, proofs, history })
  );
  const state = await context.storageState({ indexedDB: true });
  await context.close();
  return { state, ...seeded };
}

const visible = (loc) => loc.locator("visible=true");
async function runStep(page, [kind, value, settle], values) {
  if (kind === "tab") {
    const tabs = page.locator(".q-tab");
    await (typeof value === "number"
      ? tabs.nth(value)
      : tabs.filter({ hasText: value }).first()
    ).click({ timeout: 6000 });
  } else if (kind === "click") {
    const texts = [value].flat();
    let hit = false;
    for (const text of texts) {
      const loc = visible(page.getByText(text, { exact: true }));
      if (await loc.count()) {
        await loc.last().click({ timeout: 6000, force: true });
        hit = true;
        break;
      }
    }
    if (!hit) throw new Error("none of " + texts.join(" / ") + " visible");
  } else if (kind === "testid") {
    await visible(page.getByTestId(value)).first().click({ timeout: 6000 });
  } else if (kind === "css") {
    await visible(page.locator(value)).first().click({ timeout: 6000 });
  } else if (kind === "btn") {
    const scope = (await page.locator(".q-dialog").count())
      ? page.locator(".q-dialog").last()
      : page;
    await visible(scope.getByRole("button", { name: new RegExp(value, "i") }))
      .last()
      .click({ timeout: 8000 });
  } else if (kind === "type") {
    await page.keyboard.type(value, { delay: 60 });
  } else if (kind === "paste") {
    await page.evaluate(
      (t) => navigator.clipboard.writeText(t),
      await values[value]()
    );
    await runStep(page, ["click", ["Paste", "Paste token"]], values);
    await page.waitForTimeout(1000);
  } else if (kind === "fill") {
    const field = visible(
      page.locator(
        ".q-dialog textarea, .q-dialog input[type=text], .q-dialog input:not([type])"
      )
    ).first();
    await field.fill(await values[value](), { timeout: 6000 });
  } else if (kind === "scrollEnd") {
    await page.evaluate(() => {
      const els = [
        document.scrollingElement,
        ...document.querySelectorAll(
          ".q-page-container, .q-page, .scroll, .q-dialog .q-card"
        ),
      ];
      for (const e of els) if (e) e.scrollTop = e.scrollHeight;
    });
  } else if (kind === "wait") {
    await page.waitForTimeout(value);
    return;
  } else throw new Error("unknown step " + kind);
  await page.waitForTimeout(
    settle ?? (kind === "type" || kind === "tab" ? 800 : 1000)
  );
}

const browser = await chromium.launch();
const seeds = {};
for (const v of Object.keys(BASES)) seeds[v] = await seed(browser, v);
const MINT = seeds.after.mint;
console.log("seeded on", MINT);
const shots = buildShots(MINT);
const todo = only?.length ? shots.filter((s) => only.includes(s.id)) : shots;
const values = {
  token: async () =>
    getEncodedToken({
      mint: MINT,
      unit: "sat",
      memo: "Thanks for lunch",
      proofs: fakeProofs([500, 250, 250], seeds.after.keyset),
    }),
  testnutToken: () => testnutToken(1500, "Pizza split"),
  invoice: () => invoice(1210),
};

// --probe: list boxes that scroll by a few pixels without meaning to (a scroll container
// whose content overhangs it by less than a row), which reads as a page that wobbles under
// a finger. Written to DIR/accidental-scroll.json.
const PROBE = process.argv.includes("--probe");
const probes = {};
const accidentalScrollers = () =>
  [...document.querySelectorAll("body *")].flatMap((el) => {
    const style = getComputedStyle(el);
    const y = /auto|scroll/.test(style.overflowY)
      ? el.scrollHeight - el.clientHeight
      : 0;
    const x = /auto|scroll/.test(style.overflowX)
      ? el.scrollWidth - el.clientWidth
      : 0;
    if (
      !el.getClientRects().length ||
      !((y > 0 && y <= 40) || (x > 0 && x <= 40))
    )
      return [];
    return [
      `${el.tagName.toLowerCase()}.${String(el.className)
        .trim()
        .split(/\s+/)
        .slice(0, 3)
        .join(".")} y+${y} x+${x}`,
    ];
  });

const results = {};
async function capture(shot, v) {
  const context = await browser.newContext({
    storageState: shot.fresh ? undefined : seeds[v].state,
    viewport: shot.viewport,
    deviceScaleFactor: 2,
    serviceWorkers: "block",
    reducedMotion: "reduce",
    permissions: ["clipboard-read", "clipboard-write"],
    locale: shot.lang,
    colorScheme: shot.dark ? "dark" : "light",
  });
  const page = await context.newPage();
  const settings = {
    "cashu.theme": shot.theme,
    "cashu.darkMode": shot.dark ? "__q_bool|1" : "__q_bool|0",
    "cashu.language": shot.lang,
  };
  if (shot.fresh) settings["cashu.welcome.showWelcome"] = "true";
  // Testnut flows mint and swap for real: each needs its own seed, or the deterministic
  // outputs repeat across shots and the mint rejects them as duplicates.
  if (shot.testnut)
    Object.assign(settings, {
      "cashu.mnemonic": generateMnemonic(wordlist),
      "cashu.keysetCounters": "[]",
    });
  await page.addInitScript(setStorage, settings);
  const { path, steps } = { path: shot.path, steps: shot.steps, ...shot[v] };
  let error = null;
  try {
    // Start at the wallet like a user, then route inside the app: the base build only
    // applies its stored theme and mode from the wallet page.
    await page.goto(BASES[v] + (shot.fresh ? path : "/"));
    await page.waitForTimeout(2500);
    if (!shot.fresh && path !== "/") {
      await page.evaluate(
        (to) =>
          document
            .querySelector("#q-app")
            .__vue_app__.config.globalProperties.$router.push(to),
        path
      );
      await page.waitForTimeout(2000);
    }
    await page.addStyleTag({
      content:
        "*,*::before,*::after{caret-color:transparent!important;transition:none!important;animation-duration:0s!important}.q-notifications__list,[data-sonner-toaster]{display:none!important}",
    });
    if (shot.testnut) {
      const proofs = await mintProofs(shot.testnut);
      await page.evaluate(
        async ({ TESTNUT, proofs, fake }) => {
          const st =
            document.querySelector("#q-app").__vue_app__.config.globalProperties
              .$pinia._s;
          await st.get("mints").activateMintUrl(TESTNUT);
          // When the demo wallet itself sits on testnut, its fake balance would be picked
          // for a real send and refused: these flows run on the minted proofs alone.
          if (fake)
            await st.get("proofs").removeProofs([...st.get("proofs").proofs]);
          await st.get("proofs").addProofs(proofs);
        },
        { TESTNUT, proofs, fake: MINT === TESTNUT }
      );
      await page.waitForTimeout(1000);
      await page.reload();
      await page.waitForTimeout(2500);
    }
    for (const step of steps) await runStep(page, step, values);
    // The resting state: no hover fill under a pointer left on the last thing it pressed.
    await page.mouse.move(0, 0);
    await page.waitForTimeout(700);
  } catch (e) {
    error = String(e.message).split("\n")[0];
  }
  if (PROBE && !error)
    probes[`${shot.id}-${v}`] = await page.evaluate(accidentalScrollers);
  // The whole page, unless a dialog or sheet is open: those belong to the window, and a
  // full-length capture would move them to the foot of the document.
  const overlay = await visible(page.locator(".q-dialog")).count();
  await page.screenshot({
    path: `${OUT}/${shot.id}-${v}.png`,
    fullPage: !overlay,
  });
  await context.close();
  return error;
}

const queue = todo.flatMap((s) => Object.keys(BASES).map((v) => [s, v]));
await Promise.all(
  Array.from({ length: 4 }, async () => {
    while (queue.length) {
      const [s, v] = queue.shift();
      const error = await capture(s, v);
      (results[s.id] ??= {})[v] = error;
      if (error) console.log("step failed", s.id, v, error);
    }
  })
);
const previous = fs.existsSync(`${OUT}/manifest.json`)
  ? JSON.parse(fs.readFileSync(`${OUT}/manifest.json`)).shots
  : [];
const manifest = {
  mint: MINT,
  capturedAt: new Date().toISOString(),
  shots: shots.map((s) => ({
    ...s,
    errors:
      results[s.id] ?? previous.find((p) => p.id === s.id)?.errors ?? null,
  })),
};
fs.writeFileSync(`${OUT}/manifest.json`, JSON.stringify(manifest, null, 1));
if (PROBE)
  fs.writeFileSync(
    `${OUT}/accidental-scroll.json`,
    JSON.stringify(probes, null, 1)
  );
const failed = manifest.shots.filter(
  (s) => s.errors && (s.errors.before || s.errors.after)
);
console.log(
  "done",
  todo.length * 2,
  "captures;",
  failed.length,
  "slides with a failed step"
);
await browser.close();
