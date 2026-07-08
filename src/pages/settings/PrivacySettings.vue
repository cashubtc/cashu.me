<template>
  <SettingsPageShell
    :title="$t('Settings.menu.privacy.title')"
    :caption="$t('Settings.menu.privacy.caption')"
  >
    <SettingsSection
      :title="$t('Settings.privacy.title')"
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
      :title="$t('Settings.privacy.bitcoin_price.toggle')"
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
            <q-select
              v-model="bitcoinPriceCurrency"
              :options="currencyOptions"
              rounded
              outlined
              dense
              emit-value
              map-options
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

export default defineComponent({
  name: "PrivacySettings",
  mixins: [windowMixin],
  components: {
    SettingsPageShell,
    SettingsSection,
  },
  data: function () {
    return {
      currencyOptions: [
        { label: "US Dollar (USD)", value: "USD" },
        { label: "Euro (EUR)", value: "EUR" },

        { label: "Australian Dollar (AUD)", value: "AUD" },
        { label: "Brazilian Real (BRL)", value: "BRL" },
        { label: "Canadian Dollar (CAD)", value: "CAD" },
        { label: "Swiss Franc (CHF)", value: "CHF" },
        { label: "Chinese Yuan (CNY)", value: "CNY" },
        { label: "Czech Koruna (CZK)", value: "CZK" },
        { label: "Danish Krone (DKK)", value: "DKK" },
        { label: "British Pound (GBP)", value: "GBP" },
        { label: "Hong Kong Dollar (HKD)", value: "HKD" },
        { label: "Hungarian Forint (HUF)", value: "HUF" },
        { label: "Israeli Shekel (ILS)", value: "ILS" },
        { label: "Indian Rupee (INR)", value: "INR" },
        { label: "Japanese Yen (JPY)", value: "JPY" },
        { label: "South Korean Won (KRW)", value: "KRW" },
        { label: "Mexican Peso (MXN)", value: "MXN" },
        { label: "New Zealand Dollar (NZD)", value: "NZD" },
        { label: "Norwegian Krone (NOK)", value: "NOK" },
        { label: "Polish Zloty (PLN)", value: "PLN" },
        { label: "Russian Ruble (RUB)", value: "RUB" },
        { label: "Swedish Krona (SEK)", value: "SEK" },
        { label: "Singapore Dollar (SGD)", value: "SGD" },
        { label: "Thai Baht (THB)", value: "THB" },
        { label: "Turkish Lira (TRY)", value: "TRY" },
        { label: "South African Rand (ZAR)", value: "ZAR" },
      ],
    };
  },
  computed: {
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
