import { createApp } from "vue";
import App from "./App.vue";
import registerIcons from "./icons";

const app = createApp(App);
registerIcons(app);
