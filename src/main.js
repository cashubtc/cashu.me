import { createApp } from "vue";
import { createI18n } from "vue-i18n";
import App from "./App.vue";
import registerIcons from "./icons";

const i18n = createI18n({
  // something vue-i18n options here ...
});

const app = createApp(App);
registerIcons(app);
// ... other app configurations

app.use(i18n);
app.mount("#app");
