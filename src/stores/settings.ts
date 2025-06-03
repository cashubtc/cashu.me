import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import { STORAGE_KEYS } from "../js/storageKeys";

const defaultNostrRelays = [
  "wss://relay.f7z.io/",
  "wss://relay.primal.net/",
  "wss://relay.nostr.band/",
];

export const useSettingsStore = defineStore("settings", {
  state: () => {
    return {
      getBitcoinPrice: useLocalStorage<boolean>(
        STORAGE_KEYS.SETTINGS_GET_BITCOIN_PRICE,
        false
      ),
      checkSentTokens: useLocalStorage<boolean>(
        STORAGE_KEYS.SETTINGS_CHECK_SENT_TOKENS,
        true
      ),
      checkIncomingInvoices: useLocalStorage<boolean>(
        STORAGE_KEYS.SETTINGS_CHECK_INCOMING_INVOICES,
        true
      ),
      periodicallyCheckIncomingInvoices: useLocalStorage<boolean>(
        STORAGE_KEYS.SETTINGS_PERIODICALLY_CHECK_INCOMING_INVOICES,
        true
      ),
      checkInvoicesOnStartup: useLocalStorage<boolean>(
        STORAGE_KEYS.SETTINGS_CHECK_INVOICES_ON_STARTUP,
        true
      ),
      useWebsockets: useLocalStorage<boolean>(
        STORAGE_KEYS.SETTINGS_USE_WEBSOCKETS,
        true
      ),
      defaultNostrRelays: useLocalStorage<string[]>(
        STORAGE_KEYS.SETTINGS_DEFAULT_NOSTR_RELAYS,
        defaultNostrRelays
      ),
      includeFeesInSendAmount: useLocalStorage<boolean>(
        STORAGE_KEYS.SETTINGS_INCLUDE_FEES_IN_SEND_AMOUNT,
        false
      ),
      nfcEncoding: useLocalStorage<string>(
        STORAGE_KEYS.SETTINGS_NFC_ENCODING,
        "weburl"
      ),
      useNumericKeyboard: useLocalStorage<boolean>(
        STORAGE_KEYS.SETTINGS_USE_NUMERIC_KEYBOARD,
        false
      ),
      enableReceiveSwaps: useLocalStorage<boolean>(
        STORAGE_KEYS.SETTINGS_ENABLE_RECEIVE_SWAPS,
        false
      ),
      showNfcButtonInDrawer: useLocalStorage(
        STORAGE_KEYS.UI_SHOW_NFC_BUTTON_IN_DRAWER,
        true
      ),
      autoPasteEcashReceive: useLocalStorage(
        STORAGE_KEYS.SETTINGS_AUTO_PASTE_ECASH_RECEIVE,
        true
      ),
      auditorEnabled: useLocalStorage<boolean>(
        STORAGE_KEYS.SETTINGS_AUDITOR_ENABLED,
        false
      ),
      auditorUrl: useLocalStorage<string>(
        STORAGE_KEYS.SETTINGS_AUDITOR_URL,
        "https://audit.8333.space"
      ),
      auditorApiUrl: useLocalStorage<string>(
        STORAGE_KEYS.SETTINGS_AUDITOR_API_URL,
        "https://api.audit.8333.space"
      ),
    };
  },
});
