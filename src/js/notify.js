import { Notify } from 'quasar'

function notifyApiError(error) {
  let types = {
    400: "warning",
    401: "warning",
    500: "negative",
  };
  Notify.create({
    timeout: 5000,
    type: types[error.response.status] || "warning",
    message:
      error.response.data.message || error.response.data.detail || null,
    caption:
      [error.response.status, " ", error.response.statusText]
        .join("")
        .toUpperCase() || null,
    icon: null,
  });
}

async function notifySuccess(message, position = "top") {
  Notify.create({
    timeout: 5000,
    type: "positive",
    message: message,
    position: position,
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

async function notifyError(message, caption = null) {
  Notify.create({
    color: "red",
    message: message,
    caption: caption,
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

async function notifyWarning(message, caption = null, timeout = 5000) {
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

async function notify(
  message,
  type = "null",
  position = "top",
  caption = null,
  color = null
) {
  // failure
  Notify.create({
    timeout: 5000,
    type: "nuill",
    color: "grey",
    message: message,
    caption: null,
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

export {
  notifyApiError,
  notifySuccess,
  notifyError,
  notifyWarning,
  notify,
}
