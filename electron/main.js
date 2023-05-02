// ~~/electron/main.js

import { app, BrowserWindow } from "electron";

app.whenReady().then(() => {
  let browserWindow = new BrowserWindow({
    title: "Cashu Wallet",
  });
  browserWindow.loadFile("dist/index.html");
});
