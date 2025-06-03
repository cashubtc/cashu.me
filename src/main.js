import { createApp } from "vue";
import { Quasar } from "quasar";
import router from "src/router";
import pinia from "src/stores";
import App from "./App.vue";
import registerIcons from "./icons";

const app = createApp(App);
registerIcons(app);
app.use(Quasar);
app.use(router);
app.use(pinia);
app.mount("#q-app");
