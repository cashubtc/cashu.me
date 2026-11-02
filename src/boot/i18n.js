import { boot } from "quasar/wrappers";
import { watch } from "vue";
import { createI18n } from "vue-i18n";
import messages from "src/i18n";
import { setNumberLocale } from "src/js/format-currency";

// Get stored locale from localStorage or fallback to browser language or en-US
const storedLocale =
  localStorage.getItem("cashu.language") || navigator.language || "en-US";

export const i18n = createI18n({
  locale: storedLocale,
  fallbackLocale: "en-US",
  globalInjection: true,
  messages,
});

const RTL_LANGUAGES = ["ar", "fa", "he", "ur"];

/** The writing direction of a locale tag ("ar-SA" → "rtl"). */
export function localeDir(locale) {
  const tag = String(locale || "en-US");
  return RTL_LANGUAGES.includes(tag.split("-")[0].toLowerCase())
    ? "rtl"
    : "ltr";
}

// Keep <html lang dir> and number formatting in step with the active locale, so right-to-left languages lay out
// right to left (flex rows, text alignment and logical spacing follow `dir`). Reka's
// primitives read the same direction from the ConfigProvider in App.vue.
function applyDocumentLocale(locale) {
  setNumberLocale(String(locale || "en-US"));
  document.documentElement.lang = String(locale || "en-US");
  document.documentElement.dir = localeDir(locale);
}

export default boot(async ({ app }) => {
  app.use(i18n);
  watch(() => i18n.global.locale, applyDocumentLocale, { immediate: true });
});
