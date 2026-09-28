# cashu.me capture playbook

Project-specific mechanics for running dev-server builds and injecting
deterministic fixtures for visual review. Read this before every run — several
pitfalls below produce screenshots that look plausible but are wrong.

## Contents

- Dev server mechanics
- The Vite cache pitfall (stale before/after code)
- Running Playwright
- Storage keys and fixtures
- The Quasar boolean encoding pitfall (light mode)
- The useLocalStorage write-back race
- IndexedDB history seeding
- Mint info and avatars
- Navigation, tabs, and the history panel
- PWA install button
- Timing
- Fixture recipe (known-good)
- Failure modes: symptom → cause → fix

## Dev server mechanics

- Start: `npm run dev -- --port <PORT>` from the checkout you want to capture.
- The server is HTTPS with a self-signed certificate. Playwright needs
  `ignoreHTTPSErrors: true`; readiness checks need `curl -k`.
- Wait for readiness before capturing:

  ```sh
  for i in $(seq 1 60); do
    curl -sk -o /dev/null -w "%{http_code}" https://localhost:<PORT> 2>/dev/null \
      | grep -q 200 && break; sleep 2
  done
  ```

- Free ports between builds: `lsof -ti :<PORT> | xargs kill -9`.

## The Vite cache pitfall (stale before/after code)

The review worktree uses a `node_modules` symlink to the main checkout (to
avoid a second `npm install`). Quasar/Vite stores compiled output in
`node_modules/.q-cache`, which is therefore **shared between the two
checkouts**. A dev server started against a populated cache can serve files
compiled from the *other* checkout — your "before" screenshots then silently
show after-code.

Rules:

1. `rm -rf node_modules/.q-cache` before **every** dev-server start.
2. Run before/after servers **sequentially**, never concurrently: capture the
   before build completely, kill it, clear the cache again, then start the
   after build.

## Running Playwright

`require("playwright")` often does not resolve from ad-hoc script locations.
Use the local playwright-skill runner, which sets up resolution:

```sh
node /Users/cc/.agents/skills/playwright-skill/run.js <your-script.js>
```

Viewport: the app is mobile-first — use `{ width: 390, height: 844 }` CSS px
for the standard matrix. Add desktop widths only when the diff touches
responsive behavior.

## Storage keys and fixtures

Inject all localStorage through `page.addInitScript` so it exists before the
app boots. Known keys:

| Key | Value | Purpose |
|---|---|---|
| `cashu.welcome.showWelcome` | `"false"` | skip welcome flow |
| `cashu.welcome.termsAccepted` | `"true"` | skip terms gate |
| `cashu.darkMode` | `"__q_bool\|1"` / `"__q_bool\|0"` | dark / light theme — see encoding pitfall |
| `cashu.mints` | JSON array of mint objects | wallet mints |
| `cashu.activeMintUrl` | mint URL string | active mint |
| `cashu.activeUnit` | `"sat"` | display unit |
| `cashu.ui.expandHistory` | `"true"`/`"false"` | history panel open |
| `cashu.ui.tab` | `"history"` / `"mints"` | active main-screen tab (persisted!) |

## The Quasar boolean encoding pitfall (light mode)

`cashu.darkMode` is read through Quasar's `$q.localStorage`, which uses its own
encoding: booleans are stored as `__q_bool|1` / `__q_bool|0`. If you write a
plain `"false"`, Quasar decodes it as the *string* `"false"`, the app's
`getItem(...) == false` check fails, and it falls back to `dark.set(true)`.

**Symptom:** your light-mode capture comes out pixel-identical to dark mode,
with no error anywhere. **Fix:** always write the encoded form:

```js
localStorage.setItem("cashu.darkMode", dark ? "__q_bool|1" : "__q_bool|0");
```

## The useLocalStorage write-back race

Several stores use `@vueuse/core` `useLocalStorage`, which keeps a live ref and
**writes it back to localStorage on page unload**. If you mutate localStorage
directly (e.g. `page.evaluate(() => localStorage.setItem(...))`) and then
reload to apply it, the in-memory ref flushes its old value during unload and
**clobbers your write**. This has burned captures three ways:

- Seeded mint `info` "disappeared" after reload → pill fell back to showing
  the raw URL instead of the mint name.
- `cashu.ui.tab` reverted to the value from before the last UI click.
- `cashu.ui.expandHistory` refused to stay collapsed.

Rules:

- Seed everything through `addInitScript` so it is present at first boot —
  the live ref then holds your value for the whole session.
- For state changes *during* a session, drive the UI (click the tab, click
  the expansion chevron) instead of localStorage + reload.

Related: `addInitScript(fn, arg)` serializes `fn` — it cannot close over
variables from your script. Pass all data in as arguments.

## IndexedDB history seeding

Transaction history is **not** in localStorage; it lives in Dexie
(`indexedDB.open("db")`, object stores `ecashHistory` and `paymentHistory`).
Pattern that works: boot once with localStorage seeds → put rows → reload.

```js
await page.evaluate(async () => {
  const put = (table, rows) => new Promise((resolve, reject) => {
    const req = indexedDB.open("db");
    req.onsuccess = () => {
      const db = req.result;
      const tx = db.transaction(table, "readwrite");
      rows.forEach((r) => tx.objectStore(table).put(r));
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = () => reject(tx.error);
    };
  });
  await put("ecashHistory", [/* rows */]);
  await put("paymentHistory", [/* rows */]);
});
await page.reload({ waitUntil: "domcontentloaded" });
```

Row shapes that render correctly:

```js
// ecashHistory: amount sign = direction, status: paid|pending
{ id: "e1", status: "paid", amount: 21000, date: iso, token: "cashuA…",
  mint: "https://testnut.cashu.space", unit: "sat", label: "Coffee refund" }
// paymentHistory: direction: mint|melt, method: bolt11|onchain
{ id: "p1", direction: "mint", quote: "q1", method: "bolt11", status: "paid",
  mint: "https://testnut.cashu.space", unit: "sat", date: iso, amount: 50000,
  label: "Top up", request: "lnbc1…" }
```

## Mint info and avatars

- The **main screen does not fetch mint info**. If the seeded mint lacks
  `info: { name, icon_url }`, labels fall back to the raw URL and no avatar
  renders. Seed full info for any mint whose avatar/name must appear.
- The **mint details page does fetch** the mint's `/v1/info` live when
  reachable. For determinism prefer seeded info; for unreachable fake mints
  the page still renders from the seed.
- `https://testnut.cashu.space` is a public test mint and safe to reference in
  published evidence; its `/v1/info` document (name, icon_url, motd,
  description, version, nuts) makes a realistic fixture. Use `*.example.com`
  URLs and synthetic names for any additional mints.
- Seed synthetic contact entries if you want the contact section to render
  (`info.contact = [{ method: "email", info: "support@testnut.example" }]`).

## Navigation, tabs, and the history panel

- Routes: `/` (main wallet), `/mintdetails?mintUrl=<url-encoded mint URL>`,
  `/mintratings`. History-mode routing — direct URLs work on the dev server.
- Main-screen tabs (`History` / `Mints`) persist in `cashu.ui.tab` — a click
  in one capture affects later ones even across reloads. Plan the capture
  order, or explicitly click back.
- The history panel is a `q-expansion-item` whose header is only a chevron
  (`.q-expansion-item .q-icon` with text `keyboard_arrow_up`/`_down`). Click
  the chevron to collapse/expand. Clicking a tab while collapsed also opens
  the panel.
- Useful selectors/testids: `[data-testid="wallet-receive"]`,
  `[data-testid="wallet-send"]`, `[data-testid="wallet-balance"]`,
  `.q-tab`, `.q-bottom-sheet`, `.mint-chip` (branch-dependent — before/after
  builds may need different selectors; parameterize them).

## PWA install button

The install button renders only when `getPwaDisplayMode() === "browser"` (true
on the dev server) and a `beforeinstallprompt` event was captured. Trigger it
synthetically:

```js
await page.evaluate(() => window.dispatchEvent(new Event("beforeinstallprompt")));
```

The button sits **below the history panel** — if the panel is expanded it is
below the fold. Collapse the panel (chevron click) and make sure the
`history` tab is active before shooting.

## Timing

- After initial load/reload: wait 4–6s (boot + live fetches + 600ms balance
  count-up).
- After each interaction: 800–1000ms (sheet/dialog entrances ~300ms, expand
  transitions ~260ms, tab animations).
- Prefer one generous fixed wait over many clever waits — flakiness here
  costs more than seconds.

## Fixture recipe (known-good)

The bundled [../scripts/capture_starter.js](../scripts/capture_starter.js)
implements this exact recipe:

- welcome/terms bypassed, dark mode via encoded flag, activeUnit `sat`,
  history expanded
- active mint = testnut with its public `/v1/info` seeded (incl. icon_url)
  plus two synthetic `*.example.com` mints
- 3 ecash rows ("Coffee refund" +21000 paid, "Sent to Alice" −5000 paid,
  +1200 pending) and 3 payment rows ("Top up" +50000 mint paid,
  "Dinner split" −12400 melt paid, +100000 onchain mint pending)

## Failure modes: symptom → cause → fix

| Symptom | Cause | Fix |
|---|---|---|
| "Before" shots show after-code (or vice versa) | shared `node_modules/.q-cache` served stale compiled files | clear cache before every server start; run servers sequentially |
| Light-mode shot is identical to dark | plain `"false"` fails Quasar's decode → app forces dark | write `__q_bool\|0` |
| Mint label shows URL, no avatar, though info was seeded | `useLocalStorage` ref clobbered localStorage on reload | seed info via `addInitScript` before first boot |
| Capture lands on the Mints tab unexpectedly | `cashu.ui.tab` persisted from an earlier click | click the History q-tab, or account for it in capture order |
| Install button absent | history panel expanded → button below fold | collapse via expansion-header chevron |
| `ReferenceError` inside addInitScript | function serialized without closure variables | pass data as `addInitScript(fn, arg)` |
| `Cannot find module 'playwright'` | module not resolvable from script location | run via the playwright-skill runner |
| Element not found on one build only | before/after markup legitimately differs | parameterize selectors per BUILD; never "fix" one build's code to match |
