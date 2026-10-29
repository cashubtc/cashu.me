import { Notify, QNotifyCreateOptions } from "quasar";
import { i18n } from "src/boot/i18n";
import { isolateLtr } from "src/js/format-currency";
import { lucideIcon } from "src/js/lucide-icons";
import {
  CircleAlert,
  CircleCheck,
  Info,
  TriangleAlert,
  X,
} from "lucide-vue-next";

// One toast for the whole app, top-centre (owner item 7): every kind appears in one place, as a
// raised card with a status icon (styled in app.scss), newest first, and closes on its own or
// with ✕. The icons are the callout's: the same glyph for the same tone. Positions are not
// chosen per call.
const POSITION: QNotifyCreateOptions["position"] = "top";
// Built per toast, so the close button's name follows the current language.
const closeAction = () => [
  {
    icon: lucideIcon(X),
    color: "grey",
    round: true,
    "aria-label": i18n.global.t("global.actions.close.label") as string,
    handler: () => {},
  },
];

type ToastKind = "positive" | "negative" | "warning" | "info";
const ICONS: Record<ToastKind, string> = {
  positive: lucideIcon(CircleCheck),
  negative: lucideIcon(CircleAlert),
  warning: lucideIcon(TriangleAlert),
  info: lucideIcon(Info),
};

// Amounts keep their left-to-right order inside right-to-left toasts: each run such as
// "₿500" or "$1.00" is wrapped in Unicode isolates (LRI…PDI), so Arabic shows ₿500, not 500₿.
const AMOUNT_RUN = /[₿$€]?\d[\d.,\u00a0\u202f]*(\s?(sats?|[₿$€]))?/g;
function isolateAmounts(text: string): string {
  return text.replace(AMOUNT_RUN, (run) => isolateLtr(run));
}

// At most two toasts at once, both fully readable: a newer one dismisses the oldest, so a burst
// of messages never covers the page. Ungrouped, so two identical messages are two toasts and
// the queue matches what is on screen.
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
      group: false,
      timeout,
      actions: closeAction(),
      attrs: {
        "data-testid": "app-toast",
        role: kind === "negative" || kind === "warning" ? "alert" : "status",
      },
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
