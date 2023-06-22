import { boot } from "quasar/wrappers";

import VueQrcodeReader from "qrcode-reader-vue3";
import VueQrcode from "@chenfengyuan/vue-qrcode";

// Vue.use(VueQrcodeReader);
// Vue.component(VueQrcode.name, VueQrcode);

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async ({ app }) => {
  app.use(VueQrcodeReader);
  app.component(VueQrcode.name, VueQrcode);
});
