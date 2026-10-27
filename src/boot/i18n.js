import { boot } from "quasar/wrappers";
import { watch } from "vue";
import { createI18n } from "vue-i18n";
import messages from "src/i18n";

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

// Keep <html lang dir> in step with the active locale, so right-to-left languages lay out
// right to left (flex rows, text alignment and logical spacing follow `dir`).
function applyDocumentLocale(locale) {
  const tag = String(locale || "en-US");
  const rtl = RTL_LANGUAGES.includes(tag.split("-")[0].toLowerCase());
  document.documentElement.lang = tag;
  document.documentElement.dir = rtl ? "rtl" : "ltr";
}

export default boot(async ({ app }) => {
  app.use(i18n);
  watch(() => i18n.global.locale, applyDocumentLocale, { immediate: true });
});
