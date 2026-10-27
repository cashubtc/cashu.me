import { Notify, QNotifyCreateOptions } from "quasar";
import { i18n } from "src/boot/i18n";
import { isolateLtr } from "src/js/format-currency";

// One toast for the whole app (user direction, R46; at the bottom since R50 so it never
// covers the balance): every kind appears in one place, as a
// raised card with a status icon (styled in app.scss), and closes on its own or with ✕.
// Positions are no longer chosen per call: copy confirmations used to appear at the bottom.
const POSITION: QNotifyCreateOptions["position"] = "bottom";
const CLOSE_ACTION = [
  { icon: "close", color: "grey", round: true, handler: () => {} },
];

type ToastKind = "positive" | "negative" | "warning" | "info";
const ICONS: Record<ToastKind, string> = {
  positive: "check_circle",
  negative: "error",
  warning: "warning",
  info: "info",
};

// Amounts keep their left-to-right order inside right-to-left toasts: each run such as
// "₿500" or "$1.00" is wrapped in Unicode isolates (LRI…PDI), so Arabic shows ₿500, not 500₿.
const AMOUNT_RUN = /[₿$€]?\d[\d.,\u00a0\u202f]*(\s?(sats?|[₿$€]))?/g;
function isolateAmounts(text: string): string {
  return text.replace(AMOUNT_RUN, (run) => isolateLtr(run));
}

// At most two toasts at once: a newer one dismisses the oldest, so a burst of messages never
// covers the page (R48).
const MAX_VISIBLE = 2;
const visible: Array<() => void> = [];

function toast(
  kind: ToastKind,
  message: string,
  caption?: string,
  timeout = 5000
) {
  try {
    const dismiss: () => void = Notify.create({
      type: kind,
      icon: ICONS[kind],
      message: isolateAmounts(message),
      caption: caption ? isolateAmounts(caption) : undefined,
      position: POSITION,
      timeout,
      actions: CLOSE_ACTION,
      onDismiss: () => {
        const i = visible.indexOf(dismiss);
        if (i >= 0) visible.splice(i, 1);
      },
    });
    visible.push(dismiss);
    while (visible.length > MAX_VISIBLE) visible.shift()?.();
  } catch {
    // no Quasar app (unit tests)
  }
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
