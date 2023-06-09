import { boot } from "quasar/wrappers";

import VueQrcode from "@chenfengyuan/vue-qrcode";

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async ({ app }) => {
  app.component(VueQrcode.name, VueQrcode);
});
