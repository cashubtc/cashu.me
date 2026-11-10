// Every comparison slide, as data: the capture (capture.mjs) and the deck's live panes
// (deck/deck.js) run the same steps.
//
// A step is [kind, value]:
//   ["tab", "History" | 0]    the wallet tab by label or position
//   ["click", "Ecash"]         the last visible element with exactly this text (an array tries
//                              each in turn: the two versions label some things differently)
//   ["testid", "wallet-send"]  a data-testid
//   ["css", ".selector"]       the first visible match
//   ["btn", "^send$"]          a button by accessible name (regex, case-insensitive), in the
//                              open dialog when there is one
//   ["type", "2100"]           keys on the keypad
//   ["paste", "token"]         capture only: put a value on the clipboard and press Paste
//   ["fill", "invoice"]        capture only: fill the open dialog's field
//   ["wait", 2500]  ["scrollEnd"]
// "paste" and "fill" name a value made while capturing ("token", "testnutToken", "invoice").
// A slide whose steps need one, or real test ecash (testnut), has no live pane: live: false.
// `before` / `after` override path or steps for one version where the layout moved.

export const PHONE = { width: 390, height: 844 };
export const DESKTOP = { width: 1280, height: 832 };
export const TESTNUT = "https://testnut.cashu.space";

const RECEIVE = ["testid", "wallet-receive"];
const SEND = ["testid", "wallet-send"];
const click = (text) => ["click", text];
const type = (text) => ["type", text];
const wait = (ms) => ["wait", ms];
const btn = (re, settle) => ["btn", re, settle];
const tab = (name) => ["tab", name];

export function buildShots(mint) {
  const MINT_Q = "?mintUrl=" + encodeURIComponent(mint);
  const shots = [];
  const add = (section, id, title, o = {}) =>
    shots.push({
      section,
      id,
      title,
      path: "/",
      theme: "monochrome",
      dark: true,
      lang: "en-US",
      viewport: PHONE,
      steps: [],
      live: !(o.testnut || o.fresh),
      ...o,
    });

  // Onboarding (fresh wallet, nothing seeded)
  const next = click("Next");
  add("Onboarding", "welcome-1", "Welcome", { fresh: true, path: "/welcome" });
  add("Onboarding", "welcome-2", "Welcome, step 2", {
    fresh: true,
    path: "/welcome",
    steps: [next],
  });
  add("Onboarding", "welcome-3", "Welcome, step 3", {
    fresh: true,
    path: "/welcome",
    steps: [next, next],
  });
  add("Onboarding", "welcome-light", "Welcome, light", {
    fresh: true,
    path: "/welcome",
    dark: false,
  });
  add("Onboarding", "terms", "Terms of service", { path: "/terms" });

  // Wallet
  add("Wallet", "wallet-history", "Wallet, history tab", { steps: [tab(0)] });
  add("Wallet", "wallet-mints", "Wallet, mints tab", { steps: [tab(1)] });
  add("Wallet", "wallet-history-light", "Wallet, light", {
    dark: false,
    steps: [tab(0)],
  });
  add("Wallet", "wallet-mints-light", "Mints tab, light", {
    dark: false,
    steps: [tab(1)],
  });
  add("Wallet", "wallet-filter", "History filter", {
    before: { steps: [tab(0), btn("filter pending")] },
    after: { steps: [tab(0), ["testid", "history-filter"]] },
  });
  add("Wallet", "wallet-filtered", "History, filtered to pending", {
    before: { steps: [tab(0), btn("filter pending")] },
    after: {
      steps: [
        tab(0),
        ["testid", "history-filter"],
        ["testid", "history-filter-status-pending"],
        ["css", ".bottom-sheet-close"],
      ],
    },
  });

  // Receive and send
  add("Receive", "receive-chooser", "Receive options", { steps: [RECEIVE] });
  add("Receive", "receive-ecash", "Receive ecash", {
    steps: [RECEIVE, click("Ecash")],
  });
  add("Receive", "receive-ecash-token", "Receive ecash, token pasted", {
    live: false,
    steps: [RECEIVE, click("Ecash"), ["paste", "token"]],
  });
  add("Receive", "receive-lightning", "Receive Lightning, amount", {
    steps: [RECEIVE, click("Lightning")],
  });
  add("Receive", "receive-lightning-typed", "Receive Lightning, 2,100 typed", {
    steps: [RECEIVE, click("Lightning"), type("2100")],
  });
  add("Receive", "receive-onchain", "Receive on-chain", {
    steps: [RECEIVE, click("On-chain")],
  });
  add("Receive", "receive-chooser-light", "Receive options, light", {
    dark: false,
    steps: [RECEIVE],
  });
  add("Send", "send-chooser", "Send options", { steps: [SEND] });
  add("Send", "send-ecash", "Send ecash, amount", {
    steps: [SEND, click("Ecash")],
  });
  add("Send", "send-ecash-typed", "Send ecash, 500 typed", {
    steps: [SEND, click("Ecash"), type("500")],
  });
  add("Send", "send-lightning", "Pay Lightning", {
    steps: [SEND, click("Lightning")],
  });
  add("Send", "send-onchain", "Send on-chain", {
    steps: [SEND, click("On-chain")],
  });
  add("Send", "send-ecash-light", "Send ecash, light", {
    dark: false,
    steps: [SEND, click("Ecash"), type("500")],
  });

  // Real flows on testnut (fake funds; it pays its own invoices). Every shot mints fresh ecash.
  const tn = (id, title, o) =>
    add("Testnut flows", id, title, { testnut: 4000, ...o });
  const request = click(["Request", "Request ecash"]);
  tn("tn-wallet", "Wallet on testnut", { steps: [tab(0)] });
  tn("tn-receive-invoice", "Receive Lightning, invoice created", {
    steps: [
      RECEIVE,
      click("Lightning"),
      type("2100"),
      btn("create invoice", 250),
    ],
  });
  tn("tn-receive-invoice-paid", "Receive Lightning, invoice paid", {
    steps: [
      RECEIVE,
      click("Lightning"),
      type("2100"),
      btn("create invoice"),
      wait(8000),
    ],
  });
  tn("tn-receive-onchain", "Receive on-chain, address created", {
    steps: [
      RECEIVE,
      click("On-chain"),
      type("50000"),
      btn("create address"),
      wait(1500),
    ],
  });
  tn("tn-receive-request", "Receive ecash, payment request", {
    steps: [RECEIVE, click("Ecash"), request, wait(2000)],
  });
  tn("tn-receive-request-amount", "Payment request, 1,000 typed", {
    steps: [
      RECEIVE,
      click("Ecash"),
      request,
      wait(1500),
      type("1000"),
      wait(1000),
    ],
  });
  tn("tn-receive-token", "Receive a testnut token", {
    steps: [RECEIVE, click("Ecash"), ["paste", "testnutToken"]],
  });
  tn("tn-receive-token-done", "Testnut token received", {
    steps: [
      RECEIVE,
      click("Ecash"),
      ["paste", "testnutToken"],
      btn("^receive$"),
      wait(4000),
    ],
  });
  tn("tn-send-token", "Send ecash, token created", {
    steps: [SEND, click("Ecash"), type("500"), btn("^send$"), wait(2500)],
  });
  tn("tn-pay-invoice", "Pay Lightning, real invoice", {
    steps: [SEND, click("Lightning"), ["fill", "invoice"], wait(3000)],
  });
  tn("tn-send-onchain", "Send on-chain", { steps: [SEND, click("On-chain")] });
  tn("tn-mint-details", "Testnut mint details", {
    path: "/mintdetails?mintUrl=" + encodeURIComponent(TESTNUT),
    steps: [wait(2500)],
  });
  tn("tn-receive-invoice-light", "Receive Lightning invoice, light", {
    dark: false,
    steps: [
      RECEIVE,
      click("Lightning"),
      type("2100"),
      btn("create invoice", 250),
    ],
  });
  tn("tn-send-token-light", "Send ecash token, light", {
    dark: false,
    steps: [SEND, click("Ecash"), type("500"), btn("^send$"), wait(2500)],
  });

  // Mints
  add("Mints", "mint-details", "Mint details", {
    path: "/mintdetails" + MINT_Q,
    steps: [wait(2500)],
  });
  add("Mints", "mint-details-light", "Mint details, light", {
    dark: false,
    path: "/mintdetails" + MINT_Q,
    steps: [wait(2500)],
  });
  add("Mints", "mint-ratings", "Mint reviews", {
    path: "/mintratings" + MINT_Q,
    steps: [wait(4000)],
  });
  add("Mints", "discover-mints", "Discover mints", {
    path: "/discoverMints",
    steps: [wait(6000)],
  });
  add("Mints", "restore", "Restore from seed", { path: "/restore" });

  // Settings: every page, full length.
  const SETTINGS = [
    "",
    "backup",
    "lightning-address",
    "nostr",
    "payment-requests",
    "nwc",
    "p2pk",
    "privacy",
    "experimental",
    "appearance",
    "language",
    "advanced",
    "about",
  ];
  const names = {
    "": "Settings menu",
    p2pk: "Locked ecash (P2PK)",
    nwc: "Nostr Wallet Connect",
  };
  for (const s of SETTINGS) {
    const name =
      names[s] ?? s.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase());
    add("Settings", "settings-" + (s || "menu"), name, {
      path: "/settings" + (s ? "/" + s : ""),
    });
  }
  add("Settings", "settings-menu-light", "Settings menu, light", {
    dark: false,
    path: "/settings",
  });
  add("Settings", "settings-privacy-light", "Privacy, light", {
    dark: false,
    path: "/settings/privacy",
  });
  add("Settings", "settings-appearance-light", "Appearance, light", {
    dark: false,
    path: "/settings/appearance",
  });

  // Themes
  for (const theme of [
    "monochrome",
    "classic",
    "bitcoin",
    "mint",
    "autumn",
    "salvador",
    "freedom",
    "cyber",
    "flamingo",
  ]) {
    const name = theme[0].toUpperCase() + theme.slice(1);
    add("Themes", `theme-${theme}-dark`, `${name}, dark`, {
      theme,
      steps: [tab(0)],
    });
    add("Themes", `theme-${theme}-light`, `${name}, light`, {
      theme,
      dark: false,
      steps: [tab(0)],
    });
  }

  // Languages
  const LANGS = {
    "en-US": "English",
    "de-DE": "German",
    "es-ES": "Spanish",
    "fr-FR": "French",
    "it-IT": "Italian",
    "pt-BR": "Portuguese (Brazil)",
    "sv-SE": "Swedish",
    "cs-CZ": "Czech",
    "el-GR": "Greek",
    "tr-TR": "Turkish",
    "ar-SA": "Arabic (right to left)",
    "th-TH": "Thai",
    "ja-JP": "Japanese",
    "zh-CN": "Chinese (Simplified)",
  };
  for (const [lang, name] of Object.entries(LANGS)) {
    add("Languages", `lang-${lang}-wallet`, `${name}: wallet`, {
      lang,
      steps: [tab(0)],
    });
    add("Languages", `lang-${lang}-settings`, `${name}: settings`, {
      lang,
      path: "/settings",
    });
    add("Languages", `lang-${lang}-receive`, `${name}: receive options`, {
      lang,
      steps: [RECEIVE],
    });
  }

  // Desktop
  add("Desktop", "desktop-wallet", "Desktop wallet", {
    viewport: DESKTOP,
    steps: [tab(0)],
  });
  add("Desktop", "desktop-settings", "Desktop settings", {
    viewport: DESKTOP,
    path: "/settings",
  });
  add("Desktop", "desktop-privacy", "Desktop privacy settings", {
    viewport: DESKTOP,
    path: "/settings/privacy",
  });
  add("Desktop", "desktop-receive", "Desktop receive Lightning", {
    viewport: DESKTOP,
    steps: [RECEIVE, click("Lightning")],
  });
  add("Desktop", "desktop-mint-details", "Desktop mint details", {
    viewport: DESKTOP,
    path: "/mintdetails" + MINT_Q,
    steps: [wait(2500)],
  });
  add("Desktop", "desktop-light", "Desktop wallet, light", {
    viewport: DESKTOP,
    dark: false,
    steps: [tab(0)],
  });
  return shots;
}

export const NOTES = {
  Onboarding: "First run, with nothing stored.",
  Wallet: "The home screen with a seeded balance and history.",
  Receive: "Receive flows, including a pasted token.",
  Send: "Send flows with amounts typed on the keypad.",
  "Testnut flows":
    "Real flows on testnut.cashu.space, a test mint with fake funds that pays its own invoices. Each screen starts with freshly minted test ecash, so these slides are captures only.",
  Mints: "Mint details, reviews, discovery and restore.",
  Settings: "The settings menu and every settings page, full length.",
  Themes: "The wallet in each of the nine themes, dark and light.",
  Languages: "Wallet, settings and receive options in all fourteen languages.",
  Desktop: "A 1280 by 832 window.",
};
