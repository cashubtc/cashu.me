<template>
  <SettingsPageShell
    :title="$t('Settings.menu.privacy.title')"
    :caption="$t('Settings.menu.privacy.caption')"
  >
    <!-- Each group names what it covers, like the other settings pages. -->
    <SettingsSection
      :title="$t('Settings.privacy.network_title')"
      :caption="$t('Settings.privacy.description')"
    >
      <!-- nostr mint backup -->
      <SettingsToggleRow
        v-model="nostrMintBackupEnabled"
        :label="$t('Settings.experimental.nostr_mint_backup.toggle')"
        :caption="$t('Settings.experimental.nostr_mint_backup.description')"
        @update:model-value="onNostrMintBackupToggle"
      />

      <!-- check incoming invoices -->
      <SettingsToggleRow
        v-model="checkIncomingInvoices"
        :label="$t('Settings.privacy.check_incoming.toggle')"
        :caption="$t('Settings.privacy.check_incoming.description')"
      />

      <!-- check pending invoices on startup -->
      <SettingsToggleRow
        v-model="checkInvoicesOnStartup"
        :label="$t('Settings.privacy.check_startup.toggle')"
        :caption="$t('Settings.privacy.check_startup.description')"
      />

      <!-- periodically check incoming invoices -->
      <SettingsToggleRow
        v-model="periodicallyCheckIncomingInvoices"
        :label="$t('Settings.privacy.check_all.toggle')"
        :caption="$t('Settings.privacy.check_all.description')"
      />

      <!-- check outgoing token state -->
      <SettingsToggleRow
        v-model="checkSentTokens"
        :label="$t('Settings.privacy.check_sent.toggle')"
        :caption="$t('Settings.privacy.check_sent.description')"
      />

      <!-- websockets -->
      <SettingsToggleRow
        v-if="checkIncomingInvoices || checkSentTokens"
        v-model="useWebsockets"
        :label="$t('Settings.privacy.websockets.toggle')"
        :caption="$t('Settings.privacy.websockets.description')"
      />
    </SettingsSection>

    <!-- bitcoin price -->
    <SettingsSection
      :title="$t('Settings.privacy.bitcoin_price.title')"
      :caption="$t('Settings.privacy.bitcoin_price.description')"
    >
      <SettingsToggleRow
        v-model="getBitcoinPrice"
        :label="$t('Settings.privacy.bitcoin_price.toggle')"
      />
      <template v-if="getBitcoinPrice">
        <SheetSelect
          row
          v-model="bitcoinPriceCurrency"
          :options="currencyOptions"
          :label="$t('Settings.privacy.bitcoin_price.currency.title')"
          :caption="$t('Settings.privacy.bitcoin_price.currency.description')"
          @update:model-value="onCurrencyChange"
        />
      </template>
    </SettingsSection>
  </SettingsPageShell>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapActions, mapWritableState } from "pinia";
import { useSettingsStore } from "src/stores/settings";
import { useNostrMintBackupStore } from "src/stores/nostrMintBackup";
import { usePriceStore } from "src/stores/price";
import SettingsPageShell from "./SettingsPageShell.vue";
import SettingsToggleRow from "src/components/ui/SettingsToggleRow.vue";
import SettingsSection from "./SettingsSection.vue";
import SheetSelect from "src/components/SheetSelect.vue";

export default defineComponent({
  name: "PrivacySettings",
  mixins: [windowMixin],
  components: {
    SettingsToggleRow,
    SettingsPageShell,
    SettingsSection,
    SheetSelect,
  },
  data: function () {
    return {
      currencyCodes: [
        "USD",
        "EUR",
        "AUD",
        "BRL",
        "CAD",
        "CHF",
        "CNY",
        "CZK",
        "DKK",
        "GBP",
        "HKD",
        "HUF",
        "ILS",
        "INR",
        "JPY",
        "KRW",
        "MXN",
        "NZD",
        "NOK",
        "PLN",
        "RUB",
        "SEK",
        "SGD",
        "THB",
        "TRY",
        "ZAR",
      ],
    };
  },
  computed: {
    // Currency names in the app's language (e.g. "美元 (USD)"), from the browser's CLDR data.
    currencyOptions() {
      const names = new Intl.DisplayNames([this.$i18n.locale, "en"], {
        type: "currency",
      });
      return this.currencyCodes.map((code) => ({
        label: `${names.of(code) ?? code} (${code})`,
        short: code,
        value: code,
      }));
    },
    ...mapWritableState(useSettingsStore, [
      "getBitcoinPrice",
      "bitcoinPriceCurrency",
      "checkSentTokens",
      "useWebsockets",
      "periodicallyCheckIncomingInvoices",
      "checkIncomingInvoices",
      "checkInvoicesOnStartup",
      "nostrMintBackupEnabled",
    ]),
  },
  methods: {
    ...mapActions(usePriceStore, [
      "fetchBitcoinPrice",
      "updateBitcoinPriceForCurrentCurrency",
    ]),
    onNostrMintBackupToggle: async function (enabled) {
      const nostrMintBackupStore = useNostrMintBackupStore();

      if (enabled) {
        try {
          await nostrMintBackupStore.enableBackup();
          this.notifySuccess(
            this.$t(
              "Settings.experimental.nostr_mint_backup.notifications.enabled"
            )
          );
        } catch (error) {
          console.error("Failed to enable Nostr mint backup:", error);
          this.notifyError(
            this.$t(
              "Settings.experimental.nostr_mint_backup.notifications.failed"
            )
          );
          // Revert the toggle
          this.nostrMintBackupEnabled = false;
        }
      } else {
        nostrMintBackupStore.disableBackup();
        this.notifySuccess(
          this.$t(
            "Settings.experimental.nostr_mint_backup.notifications.disabled"
          )
        );
      }
    },
    onCurrencyChange: async function (currency) {
      // Fetch fresh rates if they're stale, since we get all currencies at once
      const priceStore = usePriceStore();
      if (
        Date.now() - priceStore.bitcoinPriceLastUpdated >
        priceStore.bitcoinPriceMinRefreshInterval
      ) {
        await this.fetchBitcoinPrice();
      } else {
        // Update the main bitcoinPrice to reflect the new currency selection
        this.updateBitcoinPriceForCurrentCurrency();
      }
    },
  },
});
</script>
