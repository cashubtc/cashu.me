import { Notify, QNotifyCreateOptions } from "quasar";
import { i18n } from "src/boot/i18n";

// One toast for the whole app (user direction, R46): every kind appears at the top, as a
// raised card with a status icon (styled in app.scss), and closes on its own or with ✕.
// Positions are no longer chosen per call: copy confirmations used to appear at the bottom.
const POSITION: QNotifyCreateOptions["position"] = "top";
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

function toast(
  kind: ToastKind,
  message: string,
  caption?: string,
  timeout = 5000
) {
  try {
    Notify.create({
      type: kind,
      icon: ICONS[kind],
      message,
      caption: caption || undefined,
      position: POSITION,
      timeout,
      actions: CLOSE_ACTION,
    });
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
