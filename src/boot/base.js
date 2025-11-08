import { copyToClipboard } from "quasar";
import { useUiStore } from "stores/ui";
import { Clipboard } from "@capacitor/clipboard";
import { SafeArea } from "capacitor-plugin-safe-area";
import { useSettingsStore } from "stores/settings";
window.LOCALE = "en";
// window.EventHub = new Vue();

// Ensure we capture the PWA install prompt as early as possible
if (typeof window !== "undefined") {
  if (!window.__deferredBeforeInstallPrompt) {
    window.__deferredBeforeInstallPrompt = null;
  }
  window.addEventListener(
    "beforeinstallprompt",
    (e) => {
      // Allow custom install UI by deferring the prompt
      e.preventDefault();
      window.__deferredBeforeInstallPrompt = e;
      // Notify any listeners that install is available
      try {
        window.dispatchEvent(new CustomEvent("bip-available"));
      } catch (err) {
        // noop
      }
    },
    { once: false }
  );
  window.addEventListener("appinstalled", () => {
    window.__deferredBeforeInstallPrompt = null;
  });
}

// ---- PWA status bar color sync helpers ----
function ensureMetaTag(name, initialContent) {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    if (initialContent != null) {
      el.setAttribute("content", initialContent);
    }
    document.head.appendChild(el);
  }
  return el;
}

function resolveEffectiveTopBackgroundColor() {
  const header = document.querySelector(".q-header");
  const isTransparent = (val) =>
    !val ||
    val === "transparent" ||
    (val.startsWith("rgba") && parseFloat(val.split(",")[3]) === 0);

  const getBg = (el) =>
    el ? window.getComputedStyle(el).backgroundColor || "" : "";

  let color = getBg(header);
  if (isTransparent(color)) {
    const layout = document.querySelector(".q-layout");
    color = getBg(layout);
    if (isTransparent(color)) {
      const pageContainer = document.querySelector(".q-page-container");
      color = getBg(pageContainer);
    }
    if (isTransparent(color)) {
      color = getBg(document.body);
    }
  }
  return color || "#000000";
}

function updateStatusBarMeta() {
  try {
    const iosBar = ensureMetaTag(
      "apple-mobile-web-app-status-bar-style",
      "black-translucent"
    );
    iosBar.setAttribute("content", "black-translucent");

    const themeMeta = ensureMetaTag("theme-color", "#000000");
    const color = resolveEffectiveTopBackgroundColor();
    themeMeta.setAttribute("content", color);
  } catch {
    // noop
  }
}
// -------------------------------------------

window.windowMixin = {
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
    changeColor: function (newValue) {
      document.body.setAttribute("data-theme", newValue);
      this.$q.localStorage.set("cashu.theme", newValue);
      updateStatusBarMeta();
    },
    changeLanguage: function (e) {
      this.$q.localStorage.set("cashu.language", e.target.value);
    },
    toggleDarkMode: function () {
      this.$q.dark.toggle();
      this.$q.localStorage.set("cashu.darkMode", this.$q.dark.isActive);
      updateStatusBarMeta();
    },
    copyText: function (text, message, position) {
      let notify = this.$q.notify;
      let i18n = this.$i18n;
      copyToClipboard(text).then(function () {
        notify({
          message:
            message ||
            (i18n && i18n.t("global.copy_to_clipboard.success")) ||
            "Copied to clipboard!",
          position: position || "bottom",
        });
      });
    },
    pasteFromClipboard: async function () {
      let text = "";
      if (window?.Capacitor) {
        const { value } = await Clipboard.read();
        text = value;
      } else {
        text = await navigator.clipboard.readText();
      }
      return text;
    },
    formatCurrency: function (value, currency, showBalance = false) {
      if (currency == undefined) {
        currency = "sat";
      }
      if (useUiStore().hideBalance && !showBalance) {
        return "****";
      }
      if (currency == "sat") return this.formatSat(value);
      if (currency == "msat") return this.fromMsat(value);
      if (currency == "usd") value = value / 100;
      if (currency == "eur") value = value / 100;
      return new Intl.NumberFormat(window.LOCALE, {
        style: "currency",
        currency: currency,
      }).format(value);
      // + " " +
      // currency.toUpperCase()
    },
    formatSat: function (value) {
      // convert value to integer
      value = parseInt(value);
      if (useSettingsStore().bip177BitcoinSymbol) {
        if (value >= 0) {
          return "₿" + new Intl.NumberFormat(window.LOCALE).format(value);
        } else {
          return (
            "-₿" + new Intl.NumberFormat(window.LOCALE).format(Math.abs(value))
          );
        }
      }
      return new Intl.NumberFormat(window.LOCALE).format(value) + " sat";
    },
    fromMsat: function (value) {
      value = parseInt(value);
      return new Intl.NumberFormat(window.LOCALE).format(value) + " msat";
    },
    notifyApiError: function (error) {
      var types = {
        400: "warning",
        401: "warning",
        500: "negative",
      };
      this.$q.notify({
        timeout: 5000,
        type: types[error.response.status] || "warning",
        message:
          error.message ||
          error.response.data.message ||
          error.response.data.detail ||
          null,
        caption:
          [error.response.status, " ", error.response.statusText]
            .join("")
            .toUpperCase() || null,
        icon: null,
      });
    },
    notifySuccess: async function (message, position = "top") {
      this.$q.notify({
        timeout: 5000,
        type: "positive",
        message: message,
        position: position,
        progress: true,
        actions: [
          {
            icon: "close",
            color: "white",
            handler: () => {},
          },
        ],
      });
    },
    notifyRefreshed: async function (message, position = "top") {
      this.$q.notify({
        timeout: 500,
        type: "positive",
        message: message,
        position: position,
        actions: [
          {
            color: "white",
            handler: () => {},
          },
        ],
      });
    },
    notifyError: async function (message, caption = null) {
      this.$q.notify({
        color: "red",
        message: message,
        caption: caption,
        position: "top",
        progress: true,
        actions: [
          {
            icon: "close",
            color: "white",
            handler: () => {},
          },
        ],
      });
    },
    notifyWarning: async function (message, caption = null, timeout = 5000) {
      this.$q.notify({
        timeout: timeout,
        type: "warning",
        message: message,
        caption: caption,
        position: "top",
        progress: true,
        actions: [
          {
            icon: "close",
            color: "black",
            handler: () => {},
          },
        ],
      });
    },
    notify: async function (
      message,
      type = "null",
      position = "top",
      caption = null,
      color = null
    ) {
      // failure
      this.$q.notify({
        timeout: 5000,
        type: "nuill",
        color: "grey",
        message: message,
        caption: null,
        position: "top",
        actions: [
          {
            icon: "close",
            color: "white",
            handler: () => {},
          },
        ],
      });
    },
  },
  created: function () {
    if (
      this.$q.localStorage.getItem("cashu.darkMode") == true ||
      this.$q.localStorage.getItem("cashu.darkMode") == false
    ) {
      this.$q.dark.set(this.$q.localStorage.getItem("cashu.darkMode"));
    } else {
      this.$q.dark.set(true);
    }
    this.g.allowedThemes = window.allowedThemes ?? ["classic"];

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

    if (this.$q.localStorage.getItem("cashu.theme")) {
      document.body.setAttribute(
        "data-theme",
        this.$q.localStorage.getItem("cashu.theme")
      );
    } else {
      this.changeColor("monochrome");
    }

    // Initial status bar sync and observers for changes
    updateStatusBarMeta();
    window.addEventListener("resize", updateStatusBarMeta);
    window.addEventListener("orientationchange", updateStatusBarMeta);
    try {
      const header = document.querySelector(".q-header");
      const observer = new MutationObserver(updateStatusBarMeta);
      if (header) {
        observer.observe(header, {
          attributes: true,
          attributeFilter: ["class", "style"],
        });
      }
      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ["class", "style", "data-theme"],
      });
    } catch {
      // noop
    }

    const language = this.$q.localStorage.getItem("cashu.language");
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
