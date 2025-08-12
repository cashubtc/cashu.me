import { useI18n } from "vue-i18n";
import { toastSuccess, toastError } from "src/js/toast";

export function useClipboard() {
  const { t } = useI18n();

  const copy = (text: string, message?: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toastSuccess(message || t("copied_to_clipboard"));
      },
      () => {
        toastError(t("copy_failed"));
      }
    );
  };

  return { copy };
}
