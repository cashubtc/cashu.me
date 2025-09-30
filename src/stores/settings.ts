import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";

const defaultNostrRelays = [
  "wss://relay.damus.io",
  "wss://relay.8333.space/",
  "wss://nos.lol",
];

export const useSettingsStore = defineStore("settings", {
  state: () => {
    return {
      getBitcoinPrice: useLocalStorage<boolean>(
        "cashu.settings.getBitcoinPrice",
        false
      ),
      bitcoinPriceCurrency: useLocalStorage<string>(
        "cashu.settings.bitcoinPriceCurrency",
        "USD"
      ),
      checkSentTokens: useLocalStorage<boolean>(
        "cashu.settings.checkSentTokens",
        true
      ),
      checkIncomingInvoices: useLocalStorage<boolean>(
        "cashu.settings.checkIncomingInvoices",
        true
      ),
      periodicallyCheckIncomingInvoices: useLocalStorage<boolean>(
        "cashu.settings.periodicallyCheckIncomingInvoices",
        true
      ),
      checkInvoicesOnStartup: useLocalStorage<boolean>(
        "cashu.settings.checkInvoicesOnStartup",
        true
      ),
      useWebsockets: useLocalStorage<boolean>(
        "cashu.settings.useWebsockets",
        true
      ),
      defaultNostrRelays: useLocalStorage<string[]>(
        "cashu.settings.defaultNostrRelays",
        defaultNostrRelays
      ),
      includeFeesInSendAmount: useLocalStorage<boolean>(
        "cashu.settings.includeFeesInSendAmount",
        false
      ),
      nfcEncoding: useLocalStorage<string>(
        "cashu.settings.nfcEncoding",
        "weburl"
      ),
      useNumericKeyboard: useLocalStorage<boolean>(
        "cashu.settings.useNumericKeyboard",
        false
      ),
      enableReceiveSwaps: useLocalStorage<boolean>(
        "cashu.settings.enableReceiveSwaps",
        false
      ),
      showNfcButtonInDrawer: useLocalStorage(
        "cashu.ui.showNfcButtonInDrawer",
        true
      ),
      autoPasteEcashReceive: useLocalStorage(
        "cashu.settings.autoPasteEcashReceive",
        true
      ),
      auditorEnabled: useLocalStorage<boolean>(
        "cashu.settings.auditorEnabled",
        false
      ),
      auditorUrl: useLocalStorage<string>(
        "cashu.settings.auditorUrl",
        "https://audit.8333.space"
      ),
      auditorApiUrl: useLocalStorage<string>(
        "cashu.settings.auditorApiUrl",
        "https://api.audit.8333.space"
      ),
      bip177BitcoinSymbol: useLocalStorage<boolean>(
        "cashu.settings.bip177",
        false
      ),
      multinutEnabled: useLocalStorage<boolean>(
        "cashu.settings.multinutEnabled",
        false
      ),
      nostrMintBackupEnabled: useLocalStorage<boolean>(
        "cashu.settings.nostrMintBackupEnabled",
        false
      ),

      // Automatic Load Balancer (Auto-rebalance) settings
      autoRebalanceEnabled: useLocalStorage<boolean>(
        "cashu.settings.autoRebalanceEnabled",
        false
      ),
      autoRebalanceTolerancePct: useLocalStorage<number>(
        "cashu.settings.autoRebalanceTolerancePct",
        3
      ),
      autoRebalanceMinAmount: useLocalStorage<number>(
        "cashu.settings.autoRebalanceMinAmount",
        1000
      ),
      autoRebalanceFeeCapPct: useLocalStorage<number>(
        "cashu.settings.autoRebalanceFeeCapPct",
        1
      ),
      autoRebalanceThrottleSec: useLocalStorage<number>(
        "cashu.settings.autoRebalanceThrottleSec",
        60
      ),
      reliableMintsByUnit: useLocalStorage<
        Record<string, Array<{ url: string; targetPct: number; enabled: boolean }>>
      >("cashu.settings.reliableMintsByUnit", {}),
      lastRebalanceAt: useLocalStorage<number>(
        "cashu.settings.lastRebalanceAt",
        0
      ),
      rebalanceBlocking: useLocalStorage<boolean>(
        "cashu.settings.rebalanceBlocking",
        false
      ),
    };
  },
});
