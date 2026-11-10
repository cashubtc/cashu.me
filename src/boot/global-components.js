import { boot } from "quasar/wrappers";
import { IconSet } from "quasar";

import VueQrcode from "@chenfengyuan/vue-qrcode";
import { lucideIconSet } from "src/js/lucide-icons";

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async ({ app }) => {
  app.component(VueQrcode.name, VueQrcode);
  // Quasar's own icons (toasts, pagers, field marks, the expansion chevron) in Lucide too.
  IconSet.set(lucideIconSet);
});
