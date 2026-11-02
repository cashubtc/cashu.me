import { toast as sonner } from "vue-sonner";
import { i18n } from "src/boot/i18n";
import { isolateLtr } from "src/js/format-currency";

// One toast for the whole app, shadcn's (Sonner, through vue-sonner; the Toaster sits in
// App.vue, styled in app.scss): top-centre, a neutral raised card with the tone in its icon,
// sliding in from the edge; older toasts tuck behind the newest as a stack that fans out on
// hover, and each closes on its own, with ✕, or with a swipe.

type ToastKind = "positive" | "negative" | "warning" | "info";
const SHOW: Record<ToastKind, typeof sonner.success> = {
  positive: sonner.success,
  negative: sonner.error,
  warning: sonner.warning,
  info: sonner.info,
};

// Amounts keep their left-to-right order inside right-to-left toasts: each run such as
// "₿500" or "$1.00" is wrapped in Unicode isolates (LRI…PDI), so Arabic shows ₿500, not 500₿.
const AMOUNT_RUN = /[₿$€]?\d[\d.,\u00a0\u202f]*(\s?(sats?|[₿$€]))?/g;
function isolateAmounts(text: string): string {
  return text.replace(AMOUNT_RUN, (run) => isolateLtr(run));
}

// In a right-to-left page each line also takes its direction from its own first letter
// (Unicode first-strong isolate, FSI…PDI): a raw English error from a mint under an Arabic
// title reads "mint returned 500", not "500 mint returned".
function isolateLine(text: string): string {
  if (typeof document === "undefined" || document.documentElement.dir !== "rtl")
    return text;
  return `\u2068${text}\u2069`;
}

function toast(
  kind: ToastKind,
  message: string,
  caption?: string,
  duration = 5000
) {
  SHOW[kind](isolateLine(isolateAmounts(message)), {
    description: caption ? isolateLine(isolateAmounts(caption)) : undefined,
    duration,
  });
}

// A library or mint error: when the caller says what failed (translated), that is the title
// and the raw message, which is often English from the mint, drops to the second line.
async function notifyApiError(error: Error, caption: string = "") {
  const detail = error?.message ?? String(error);
  if (caption) toast("warning", caption, detail === caption ? "" : detail);
  else toast("warning", detail);
}

async function notifySuccess(message: string) {
  toast("positive", message);
}

async function notifyError(message: string, caption?: string) {
  toast("negative", message, caption);
}

async function notifyWarning(
  message: string,
  caption?: string,
  timeout = 5000
) {
  toast("warning", message, caption, timeout);
}

async function notify(message: string) {
  toast("info", message);
}

// Copy confirmations: short, the same toast as the rest.
function notifyCopied(message?: string) {
  toast(
    "positive",
    message || (i18n.global.t("common.copied") as string),
    undefined,
    2000
  );
}

export {
  notifyApiError,
  notifySuccess,
  notifyError,
  notifyWarning,
  notify,
  notifyCopied,
};
