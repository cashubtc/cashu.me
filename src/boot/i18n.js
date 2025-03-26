import { boot } from "quasar/wrappers";
import { createI18n } from "vue-i18n";
import messages from "src/i18n";

export default boot(async ({ app }) => {
  app.use(
    createI18n({
      locale: navigator.language || "en-US",
      globalInjection: true,
      messages,
    })
  );
});
