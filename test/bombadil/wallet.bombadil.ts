// Bombadil specification for the Cashu.me web wallet.
//
// Bombadil explores the running wallet with random taps, typing, scrolling,
// back and reload, and checks every rule below after each step.
//
// See README.md in this folder for how to run it.
import {
  actions,
  always,
  eventually,
  extract,
  now,
  weighted,
} from "@antithesishq/bombadil";
import {
  clicks,
  inputs,
  navigation,
  reload,
  scroll,
} from "@antithesishq/bombadil/browser/defaults/actions";

// Crashes, unhandled rejections, console errors and failed requests.
export * from "@antithesishq/bombadil/browser/defaults/properties";

// The dev build takes a few seconds to draw. Back, forward and reload restart
// that boot, so only allow them once the wallet is on screen; until then, wait.
const appDrawn = extract(
  (state) => (state.document.body?.innerText ?? "").trim() !== ""
);

// If the wallet stays blank, mostly wait, and reload about once every 30
// seconds so one dead end does not stop the exploration.
const recover = weighted([
  [600, actions(() => ["Wait"])],
  [1, reload],
]);

export const explore = weighted([
  [20, clicks],
  [8, inputs],
  [5, scroll],
  [1, navigation.when(() => appDrawn.current)],
  [3, actions(() => ["Wait"]).when(() => appDrawn.current)],
  [3, recover.when(() => !appDrawn.current)],
]);

const visibleText = extract((state) => state.document.body?.innerText ?? "");

const brokenText = extract((state) => {
  const text = state.document.body?.innerText ?? "";
  const match = text.match(
    /\bNaN\b|\bundefined\b|\[object Object\]|\bInfinity\b/
  );
  if (!match) return null;
  const at = match.index ?? 0;
  return text.slice(Math.max(0, at - 40), at + 40).replace(/\s+/g, " ");
});

// A translation key shown instead of its text, e.g. "WalletPage.actions.send.label".
const rawTranslationKey = extract((state) => {
  const text = state.document.body?.innerText ?? "";
  const match = text.match(
    /(^|\s)([A-Z][A-Za-z]+(?:\.[A-Za-z_]+){2,})(?=\s|$)/
  );
  return match ? match[2] : null;
});

const horizontalOverflow = extract((state) => {
  const root = state.document.documentElement;
  return root.scrollWidth - state.window.innerWidth;
});

const spinnerShown = extract((state) =>
  Array.from(
    state.document.querySelectorAll(".q-spinner, .q-inner-loading")
  ).some((element) => {
    const box = element.getBoundingClientRect();
    return box.width > 0 && box.height > 0;
  })
);

const errorToast = extract((state) => {
  const toast = state.document.querySelector(
    ".q-notification.bg-negative, .q-notification.text-negative"
  );
  return toast ? (toast.textContent ?? "").trim().slice(0, 120) : null;
});

const openDialogs = extract(
  (state) => state.document.querySelectorAll(".q-dialog").length
);

// Small tap targets: visible buttons and links under 32px in either direction.
const smallTapTarget = extract((state) => {
  for (const element of Array.from(
    state.document.querySelectorAll("button, a[href], [role=button]")
  )) {
    const box = element.getBoundingClientRect();
    if (box.width === 0 || box.height === 0) continue;
    if (box.width < 32 || box.height < 32) {
      const label = (
        element.getAttribute("aria-label") ??
        element.textContent ??
        ""
      )
        .trim()
        .slice(0, 40);
      return `${Math.round(box.width)}x${Math.round(box.height)} "${label}"`;
    }
  }
  return null;
});

export const neverShowsBrokenText = always(() => brokenText.current === null);

export const neverShowsRawTranslationKeys = always(
  () => rawTranslationKey.current === null
);

// Pages slide a few pixels past the edge while they change, so only flag a
// page that stays too wide.
export const neverStaysTooWide = always(
  now(() => horizontalOverflow.current > 1).implies(
    eventually(() => horizontalOverflow.current <= 1).within(3, "seconds")
  )
);

export const neverBlank = always(
  now(() => visibleText.current.trim() === "").implies(
    eventually(() => visibleText.current.trim() !== "").within(15, "seconds")
  )
);

export const spinnersFinish = always(
  now(() => spinnerShown.current).implies(
    eventually(() => !spinnerShown.current).within(30, "seconds")
  )
);

export const errorToastsGoAway = always(
  now(() => errorToast.current !== null).implies(
    eventually(() => errorToast.current === null).within(15, "seconds")
  )
);

// One dialog can still be closing while the next opens, so only flag a stack
// that lasts.
export const dialogsDoNotPileUp = always(
  now(() => openDialogs.current > 2).implies(
    eventually(() => openDialogs.current <= 2).within(3, "seconds")
  )
);

export const tapTargetsAreBigEnough = always(
  () => smallTapTarget.current === null
);
