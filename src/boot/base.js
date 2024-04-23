import { copyToClipboard } from "quasar";

window.LOCALE = "en";
// window.EventHub = new Vue();

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
    },
    toggleDarkMode: function () {
      this.$q.dark.toggle();
      this.$q.localStorage.set("cashu.darkMode", this.$q.dark.isActive);
    },
    copyText: function (text, message, position) {
      let notify = this.$q.notify;
      copyToClipboard(text).then(function () {
        notify({
          message: message || "Copied to clipboard!",
          position: position || "bottom",
        });
      });
    },
    formatCurrency: function (value, currency) {
      if (currency == "sat") return this.formatSat(value);
      if (currency == "usd") value = value / 100;
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
      return new Intl.NumberFormat(window.LOCALE).format(value) + " sat";
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

    if (this.$q.localStorage.getItem("cashu.theme")) {
      document.body.setAttribute(
        "data-theme",
        this.$q.localStorage.getItem("cashu.theme")
      );
    } else {
      this.changeColor("monochrome");
    }
  },
};
