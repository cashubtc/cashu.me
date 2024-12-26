import { createApp } from "vue";
import {
  LucideX,
  LucideQrCode,
  LucideWallet,
  LucideZap,
  // Add other icons you need here
} from "lucide-vue-next";

export default function (app) {
  app.component("IconClose", LucideX);
  app.component("IconQrCode", LucideQrCode);
  app.component("IconWallet", LucideWallet);
  app.component("IconZap", LucideZap);
  // Register other icons here
}
