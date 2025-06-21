import { copyToClipboard, useQuasar } from "quasar";
import { useI18n } from "vue-i18n";

export function useClipboard() {
  const $q = useQuasar();
  const { t } = useI18n();

  const copy = async (text: string, message?: string) => {
    try {
      await copyToClipboard(text);
      $q.notify({
        message: message ?? t("copied_to_clipboard"),
        position: "bottom",
      });
    } catch (e) {
      $q.notify({
        type: "negative",
        message: t("copy_failed"),
        position: "bottom",
      });
    }
  };

  return { copy };
}
