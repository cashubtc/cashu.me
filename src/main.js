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
import "./css/app.scss";
import "./css/base.scss";

import App from "./App.vue";

const app = createApp(App);

app.use(Quasar, {
  plugins: { LocalStorage, Notify },
});
app.use(router);
let store = createPinia();
app.use(store);

// auto-imports boots
Object.values(import.meta.glob("boot/*.js")).forEach(async (mod) => {
  let boot = ((await mod()) || {}).default;
  boot(app, router, store);
});

app.mount("#q-app");
