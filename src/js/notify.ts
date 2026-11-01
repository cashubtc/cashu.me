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

function toast(
  kind: ToastKind,
  message: string,
  caption?: string,
  duration = 5000
) {
  SHOW[kind](isolateAmounts(message), {
    description: caption ? isolateAmounts(caption) : undefined,
    duration,
  });
}

async function notifyApiError(error: Error, caption: string = "") {
  toast("warning", error.message, caption);
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
