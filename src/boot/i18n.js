import { boot } from "quasar/wrappers";
import { createI18n } from "vue-i18n";
import { loadMessages } from "src/i18n";

// Get stored locale from localStorage or fallback to browser language or en
let storedLocale =
  localStorage.getItem("cashu.language") || navigator.language || "en";

const messages = {
  en: await loadMessages("en"),
  "en-US": await loadMessages("en-US"),
};

if (!["en", "en-US"].includes(storedLocale)) {
  messages[storedLocale] = await loadMessages(storedLocale);
}

export const i18n = createI18n({
  legacy: false,
  locale: storedLocale,
  fallbackLocale: "en-US",
  globalInjection: true,
  messages,
});

export default boot(async ({ app }) => {
  app.use(i18n);
});
