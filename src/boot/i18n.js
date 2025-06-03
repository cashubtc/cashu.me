import { boot } from "quasar/wrappers";
import { createI18n } from "vue-i18n";
import { loadMessages } from "src/i18n";

// Get stored locale from localStorage or fallback to browser language or en-US
const storedLocale =
  localStorage.getItem("cashu.language") || navigator.language || "en-US";
const messages = { "en-US": await loadMessages("en-US") };
if (storedLocale !== "en-US") {
  messages[storedLocale] = await loadMessages(storedLocale);
}

export const i18n = createI18n({
  locale: storedLocale,
  fallbackLocale: "en-US",
  globalInjection: true,
  messages,
});

export default boot(async ({ app }) => {
  app.use(i18n);
});
