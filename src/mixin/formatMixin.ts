import { useUiStore } from "stores/ui";

declare global {
  interface Window {
    LOCALE: string;
    windowMixin: any;
    allowedThemes?: string[];
    Capacitor?: any;
  }
}

window.LOCALE = "en";

const formatMixin = {
  methods: {
    formatCurrency(
      value: number,
      currency: string = "sat",
      showBalance: boolean = false
    ): string {
      if (useUiStore().hideBalance && !showBalance) {
        return "****";
      }
      if (currency === "sat") return this.formatSat(value);
      if (currency === "msat") return this.fromMsat(value);
      if (currency === "usd" || currency === "eur") value = value / 100;
      return new Intl.NumberFormat(window.LOCALE, {
        style: "currency",
        currency: currency,
      }).format(value);
    },
    formatSat(value: number): string {
      value = parseInt(value.toString());
      return new Intl.NumberFormat(window.LOCALE).format(value) + " sat";
    },
    fromMsat(value: number): string {
      value = parseInt(value.toString());
      return new Intl.NumberFormat(window.LOCALE).format(value) + " msat";
    },
  },
};

export default formatMixin;
