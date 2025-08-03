import { boot } from "quasar/wrappers";
import { createI18n } from "vue-i18n";
import { loadMessages } from "src/i18n";

const fallbackLocale = "en-US";
let locale =
  localStorage.getItem("cashu.language") ||
  navigator.language ||
  fallbackLocale;

const messages = {};

try {
  messages[locale] = await loadMessages(locale);
} catch (err) {
  console.warn(
    `Failed to load locale ${locale}, falling back to ${fallbackLocale}`,
    err
  );
  locale = fallbackLocale;
  messages[locale] = await loadMessages(fallbackLocale);
}

if (locale !== fallbackLocale) {
  messages[fallbackLocale] = await loadMessages(fallbackLocale);
}

export const i18n = createI18n({
  legacy: false,
  locale,
  fallbackLocale,
  globalInjection: true,
  messages,
});

export default boot(({ app }) => {
  app.use(i18n);
});
