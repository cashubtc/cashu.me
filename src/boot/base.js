import { copyToClipboard } from "quasar";
import { useUiStore } from "stores/ui";
import { Clipboard } from "@capacitor/clipboard";
import { SafeArea } from "capacitor-plugin-safe-area";
import { useSettingsStore } from "stores/settings";
import { formatBigIntCurrency, isolateLtr } from "src/js/format-currency";
import {
  notify,
  notifyCopied,
  notifyError,
  notifySuccess,
  notifyWarning,
} from "src/js/notify";
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
    if (isTransparent(color)) {
      color = getBg(document.documentElement);
    }
  }
  return isTransparent(color) ? "#000000" : color;
}

// index.html paints the document (and the splash) black or white from the saved mode before
// the app loads. Keep it in step with the mode: it shows behind every sheet's scrim, so a
// stale black made light mode look broken until a reload (R46).
function syncDocumentBackground(isDark) {
  const bg = isDark ? "#000000" : "#ffffff";
  document.documentElement.style.backgroundColor = bg;
  document.documentElement.style.setProperty("--cashu-splash-bg", bg);
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
      syncDocumentBackground(this.$q.dark.isActive);
      // The browser/PWA top bar takes its colour from the page header. Read it again once the
      // new mode has painted: read at once it could keep the old mode's colour until a reload
      // (R46: "light theme only seems to work after refresh").
      updateStatusBarMeta();
      requestAnimationFrame(() => setTimeout(updateStatusBarMeta, 300));
    },
    copyText: function (text, message) {
      copyToClipboard(text).then(() => notifyCopied(message));
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
    // Every amount reads left to right, also inside Arabic text.
    formatCurrency: function (value, currency, showBalance = false) {
      return isolateLtr(this.formatCurrencyText(value, currency, showBalance));
    },
    formatCurrencyText: function (value, currency, showBalance = false) {
      if (currency == undefined) {
        currency = "sat";
      }
      if (useUiStore().hideBalance && !showBalance) {
        return "****";
      }
      if (typeof value === "bigint") {
        return formatBigIntCurrency(
          value,
          currency,
          window.LOCALE,
          useSettingsStore().bip177BitcoinSymbol
        );
      }
      if (currency == "sat") return this.formatSat(value);
      if (currency == "msat") return this.fromMsat(value);
      if (currency == "usd") value = value / 100;
      if (currency == "eur") value = value / 100;
      try {
        return new Intl.NumberFormat(window.LOCALE, {
          style: "currency",
          currency: currency,
        }).format(value);
      } catch {
        return (
          new Intl.NumberFormat(window.LOCALE).format(value) +
          " " +
          String(currency)
        );
      }
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
      const message =
        error.message ||
        error.response?.data?.message ||
        error.response?.data?.detail ||
        "";
      const caption = error.response
        ? `${error.response.status} ${error.response.statusText}`.toUpperCase()
        : undefined;
      if (error.response?.status >= 500) notifyError(message, caption);
      else notifyWarning(message, caption);
    },
    notifySuccess: async function (message) {
      notifySuccess(message);
    },
    notifyRefreshed: async function (message) {
      notifySuccess(message);
    },
    notifyError: async function (message, caption = null) {
      notifyError(message, caption || undefined);
    },
    notifyWarning: async function (message, caption = null, timeout = 5000) {
      notifyWarning(message, caption || undefined, timeout);
    },
    notify: async function (message) {
      notify(message);
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
    syncDocumentBackground(this.$q.dark.isActive);
    this.g.allowedThemes = window.allowedThemes ?? ["classic"];

    addEventListener("offline", (event) => {
      this.g.offline = true;
    });

    addEventListener("online", (event) => {
      this.g.offline = false;
    });

    // addEventListener("beforeunload", (event) => {
    //   event.preventDefault();
    //   const dialogText = "Are you sure about this?";
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
