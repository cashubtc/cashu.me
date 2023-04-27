// ~~/src/main.js

import { createApp } from "vue";
import { createPinia } from "pinia";
import { LocalStorage, Notify, Quasar } from "quasar";
import router from "./router";

// Import icon libraries
import "@quasar/extras/material-icons/material-icons.css";

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

// boot
Object.values(import.meta.globEager("boot/*.js")).forEach((module) => {
  if (!!module.default) module.default({ app, router, store });
});

app.mount("#q-app");
