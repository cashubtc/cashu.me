import { LocalStorage, Dark } from "quasar";
import { boot } from "quasar/wrappers";
import { SafeArea } from "capacitor-plugin-safe-area";
import {
  changeColor,
  changeLanguage,
  toggleDarkMode,
  copyText,
  pasteFromClipboard,
  formatCurrency,
  formatSat,
  fromMsat,
  notifyApiError,
  notifySuccess,
  notifyRefreshed,
  notifyError,
  notifyWarning,
  notify,
} from "src/js/ui-utils";

export default boot(() => {
  window.LOCALE = "en";
  // window.EventHub = new Vue();

  const windowMixin = {
  data: function () {
    return {
      g: {
        offline: !navigator.onLine,
        visibleDrawer: false,
        extensions: [],
        user: null,
        wallet: null,
        payments: [],
        allowedThemes: null,
      },
    };
  },
  methods: {
    changeColor,
    changeLanguage,
    toggleDarkMode,
    copyText,
    pasteFromClipboard,
    formatCurrency,
    formatSat,
    fromMsat,
    notifyApiError,
    notifySuccess,
    notifyRefreshed,
    notifyError,
    notifyWarning,
    notify,
  },
  created: function () {
    if (
      LocalStorage.getItem("cashu.darkMode") == true ||
      LocalStorage.getItem("cashu.darkMode") == false
    ) {
      Dark.set(LocalStorage.getItem("cashu.darkMode"));
    } else {
      Dark.set(true);
    }
    this.g.allowedThemes = window.allowedThemes ?? ["nostr"];

    addEventListener("offline", (event) => {
      this.g.offline = true;
    });

    addEventListener("online", (event) => {
      this.g.offline = false;
    });

    // addEventListener("beforeunload", (event) => {
    //   event.preventDefault();
    //   var dialogText = "Are you sure about this?";
    //   event.returnValue = dialogText;
    //   return dialogText;
    // });

    if (LocalStorage.getItem("cashu.theme")) {
      document.body.setAttribute(
        "data-theme",
        LocalStorage.getItem("cashu.theme")
      );
    } else {
      this.changeColor("nostr");
    }

    const language = LocalStorage.getItem("cashu.language");
    if (language) {
      this.$i18n.locale = language;
    }

    // only for iOS
    if (window.Capacitor && Capacitor.getPlatform() === "ios") {
      SafeArea.getStatusBarHeight().then(({ statusBarHeight }) => {
        document.documentElement.style.setProperty(
          `--safe-area-inset-top`,
          `${statusBarHeight}px`
        );
      });

      SafeArea.removeAllListeners();

      // when safe-area changed
      SafeArea.addListener("safeAreaChanged", (data) => {
        const { insets } = data;
        for (const [key, value] of Object.entries(insets)) {
          document.documentElement.style.setProperty(
            `--safe-area-inset-${key}`,
            `${value}px`
          );
        }
      });
    }
  },
  };

  window.windowMixin = windowMixin;
});
