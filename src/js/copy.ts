import { copyToClipboard } from "quasar";
import { notifyCopied, notifyApiError } from "src/js/notify";

/** Copy and report the outcome, including for callers that do not await feedback. */
export async function copyText(
  text: string,
  message?: string
): Promise<boolean> {
  try {
    await copyToClipboard(text);
    notifyCopied(message);
    return true;
  } catch (error) {
    notifyApiError(error);
    return false;
  }
}
