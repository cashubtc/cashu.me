import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'

export function useClipboard() {
  const $q = useQuasar()
  const { t } = useI18n()

  const copy = (text: string, message?: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        $q.notify({
          type: 'positive',
          message: message || t('copied_to_clipboard'),
          timeout: 1000,
          position: 'top',
        })
      },
      () => {
        $q.notify({
          type: 'negative',
          message: t('copy_failed'),
          timeout: 1000,
          position: 'top',
        })
      }
    )
  }

  return { copy }
}
