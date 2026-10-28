import { boot } from "quasar/wrappers";
import { IconSet } from "quasar";

import VueQrcode from "@chenfengyuan/vue-qrcode";

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async ({ app }) => {
  app.component(VueQrcode.name, VueQrcode);
  // Field errors use the outline alert icon, like the error callout, not Material's
  // filled disc (the only filled glyph among the line icons).
  IconSet.props.field.error = "error_outline";
});
