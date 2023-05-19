import { Notify, QNotifyCreateOptions } from "quasar";
import axios, { AxiosError } from "axios";

type ApiError =
  | AxiosError
  | {
      response: {
        status: number;
        statusText: string;
        data: { message?: string; detail?: string };
      };
    };

type StatusMap = { [x: number]: "warning" | "negative" };
const errorTypes = {
  400: "warning",
  401: "warning",
  500: "negative",
} as StatusMap;

function notifyApiError(error: ApiError) {
  if (axios.isAxiosError(error)) {
    notifyAxiosError(error);
    return;
  }
  Notify.create({
    timeout: 5000,
    type: errorTypes[error.response.status] ?? "warning",
    message: error.response.data.message ?? error.response.data.detail,
    caption: [error.response.status, " ", error.response.statusText]
      .join("")
      .toUpperCase(),
  });
}

/**
 * Cashu-TS will return axios errors when certain calls fail, so we should handle those
 * @param {AxiosError} error
 */
function notifyAxiosError(error: AxiosError) {
  Notify.create({
    timeout: 5000,
    type: errorTypes[error.status!] || "warning",
    message: error.message,
    caption: error.code,
  });
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
