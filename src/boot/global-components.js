import { boot } from "quasar/wrappers";

import InfoTooltip from "components/InfoTooltip.vue";
import HelpPopup from "components/HelpPopup.vue";

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async ({ app }) => {
  app.component("InfoTooltip", InfoTooltip);
  app.component("HelpPopup", HelpPopup);
});
