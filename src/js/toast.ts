import { Notify, QNotifyCreateOptions } from "quasar";

const baseOpts: QNotifyCreateOptions = {
  timeout: 1500,
  position: "top",
  classes: "cashu-toast",
};

export function toastSuccess(message: string) {
  Notify.create({ ...baseOpts, type: "positive", message });
}

export function toastError(message: string) {
  Notify.create({ ...baseOpts, type: "negative", message });
}

export function toast(message: string) {
  Notify.create({ ...baseOpts, message });
}

export function showToast(
  message: string,
  type?: QNotifyCreateOptions["type"]
) {
  Notify.create({ ...baseOpts, type, message });
}
