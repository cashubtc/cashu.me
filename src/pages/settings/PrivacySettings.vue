<template>
  <SettingsPageShell
    :title="$t('Settings.menu.privacy.title')"
    :caption="$t('Settings.menu.privacy.caption')"
  >
    <!-- Each group names what it covers, like the other settings pages (R42). -->
    <SettingsSection
      :title="$t('Settings.privacy.network_title')"
      :caption="$t('Settings.privacy.description')"
    >
      <!-- nostr mint backup -->
      <q-item tag="label">
        <q-item-section>
          <q-item-label>{{
            $t("Settings.experimental.nostr_mint_backup.toggle")
          }}</q-item-label>
          <q-item-label caption>{{
            $t("Settings.experimental.nostr_mint_backup.description")
          }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-toggle
            v-model="nostrMintBackupEnabled"
            color="primary"
            @update:model-value="onNostrMintBackupToggle"
          />
        </q-item-section>
      </q-item>

      <!-- check incoming invoices -->
      <q-item tag="label">
        <q-item-section>
          <q-item-label>{{
            $t("Settings.privacy.check_incoming.toggle")
          }}</q-item-label>
          <q-item-label caption>{{
            $t("Settings.privacy.check_incoming.description")
          }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-toggle v-model="checkIncomingInvoices" color="primary" />
        </q-item-section>
      </q-item>

      <!-- check pending invoices on startup -->
      <q-item tag="label">
        <q-item-section>
          <q-item-label>{{
            $t("Settings.privacy.check_startup.toggle")
          }}</q-item-label>
          <q-item-label caption>{{
            $t("Settings.privacy.check_startup.description")
          }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-toggle v-model="checkInvoicesOnStartup" color="primary" />
        </q-item-section>
      </q-item>

      <!-- periodically check incoming invoices -->
      <q-item tag="label">
        <q-item-section>
          <q-item-label>{{
            $t("Settings.privacy.check_all.toggle")
          }}</q-item-label>
          <q-item-label caption>{{
            $t("Settings.privacy.check_all.description")
          }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-toggle
            v-model="periodicallyCheckIncomingInvoices"
            color="primary"
          />
        </q-item-section>
      </q-item>

      <!-- check outgoing token state -->
      <q-item tag="label">
        <q-item-section>
          <q-item-label>{{
            $t("Settings.privacy.check_sent.toggle")
          }}</q-item-label>
          <q-item-label caption>{{
            $t("Settings.privacy.check_sent.description")
          }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-toggle v-model="checkSentTokens" color="primary" />
        </q-item-section>
      </q-item>

      <!-- websockets -->
      <q-item tag="label" v-if="checkIncomingInvoices || checkSentTokens">
        <q-item-section>
          <q-item-label>{{
            $t("Settings.privacy.websockets.toggle")
          }}</q-item-label>
          <q-item-label caption>{{
            $t("Settings.privacy.websockets.description")
          }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-toggle v-model="useWebsockets" color="primary" />
        </q-item-section>
      </q-item>
    </SettingsSection>

    <!-- bitcoin price -->
    <SettingsSection
      :title="$t('Settings.privacy.bitcoin_price.title')"
      :caption="$t('Settings.privacy.bitcoin_price.description')"
    >
      <q-item tag="label">
        <q-item-section>
          <q-item-label>{{
            $t("Settings.privacy.bitcoin_price.toggle")
          }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-toggle v-model="getBitcoinPrice" color="primary" />
        </q-item-section>
      </q-item>
      <template v-if="getBitcoinPrice">
        <q-item>
          <q-item-section>
            <q-item-label>{{
              $t("Settings.privacy.bitcoin_price.currency.title")
            }}</q-item-label>
            <q-item-label caption>{{
              $t("Settings.privacy.bitcoin_price.currency.description")
            }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item class="settings-control-item">
          <q-item-section>
            <SheetSelect
              v-model="bitcoinPriceCurrency"
              :options="currencyOptions"
              :label="$t('Settings.privacy.bitcoin_price.currency.title')"
              hide-label
              @update:model-value="onCurrencyChange"
            />
          </q-item-section>
        </q-item>
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
import SettingsSection from "./SettingsSection.vue";
import SheetSelect from "src/components/SheetSelect.vue";

export default defineComponent({
  name: "PrivacySettings",
  mixins: [windowMixin],
  components: {
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
