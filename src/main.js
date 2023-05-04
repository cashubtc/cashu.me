// ~~/src/main.js

import { createApp } from "vue";
import { createPinia } from "pinia";
import { LocalStorage, Notify, Quasar } from "quasar";
import router from "./router";

// Import icon libraries
import "@quasar/extras/material-icons/material-icons.css";
import "@quasar/extras/roboto-font/roboto-font.css";

// Import Quasar css
import "quasar/src/css/index.sass";

// local styling
import "assets/css/app.scss";
import "assets/css/base.scss";

import App from "./App.vue";

const app = createApp(App);

app.use(Quasar, {
  plugins: { LocalStorage, Notify },
});
app.use(router);
let store = createPinia();
app.use(store);

// manually boots
import axiosBoot from "boot/axios";
import globalComponentsBoot from "boot/global-components";
axiosBoot({ app, router, store });
globalComponentsBoot({ app, router, store });
// mixins
import "boot/base";

app.mount("#q-app");
