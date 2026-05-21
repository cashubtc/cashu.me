import { boot } from "quasar/wrappers";
import { setupBackButtonHandler } from "../js/back-button-handler";

export default boot(() => {
  // Only set up the handler if we're in a PWA or mobile browser
  if (
    window.matchMedia("(display-mode: standalone)").matches ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
  ) {
    setupBackButtonHandler();
  }
});
