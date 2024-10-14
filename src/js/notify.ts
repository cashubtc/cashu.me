import { Notify, QNotifyCreateOptions } from "quasar";

type StatusMap = { [x: number]: "warning" | "negative" };
const errorTypes = {
  400: "warning",
  401: "warning",
  500: "negative",
} as StatusMap;

async function notifyApiError(
  error: Error,
  caption: string = "",
  position = "top" as QNotifyCreateOptions["position"]
) {
  try {
    Notify.create({
      timeout: 5000,
      type: "warning",
      position,
      message: error.message,
      caption: caption ?? null,
      progress: true,
      actions: [
        {
          icon: "close",
          color: "white",
          handler: () => {},
        },
      ],
    });
  } catch (e) {
    // skip
  }
}

async function notifySuccess(
  message: string,
  position = "top" as QNotifyCreateOptions["position"]
) {
  Notify.create({
    timeout: 5000,
    type: "positive",
    message: message,
    position,
    progress: true,
    actions: [
      {
        icon: "close",
        color: "white",
        handler: () => {},
      },
    ],
  });
}

async function notifyError(message: string, caption?: string) {
  Notify.create({
    color: "red",
    message: message,
    caption,
    position: "top",
    progress: true,
    actions: [
      {
        icon: "close",
        color: "white",
        handler: () => {},
      },
    ],
  });
}

async function notifyWarning(
  message: string,
  caption?: string,
  timeout = 5000
) {
  Notify.create({
    timeout: timeout,
    type: "warning",
    message: message,
    caption: caption,
    position: "top",
    progress: true,
    actions: [
      {
        icon: "close",
        color: "black",
        handler: () => {},
      },
    ],
  });
}

async function notify(message: string) {
  // failure
  Notify.create({
    timeout: 5000,
    type: "null",
    color: "grey",
    message: message,
    position: "top",
    actions: [
      {
        icon: "close",
        color: "white",
        handler: () => {},
      },
    ],
  });
}

export { notifyApiError, notifySuccess, notifyError, notifyWarning, notify };
