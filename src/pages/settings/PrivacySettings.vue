<template>
  <SettingsPageShell
    :title="$t('Settings.menu.privacy.title')"
    :caption="$t('Settings.menu.privacy.caption')"
  >
    <div class="q-py-sm q-px-xs text-left" on-left>
      <q-item>
        <q-item-section>
          <q-item-label overline class="text-weight-bold q-pt-sm">{{
            $t("Settings.privacy.title")
          }}</q-item-label>
          <q-item-label caption>
            {{ $t("Settings.privacy.description") }}
          </q-item-label>
        </q-item-section>
      </q-item>
      <div>
        <!-- nostr mint backup settings -->
        <q-item>
          <q-toggle
            v-model="nostrMintBackupEnabled"
            :label="$t('Settings.experimental.nostr_mint_backup.toggle')"
            color="primary"
            @update:model-value="onNostrMintBackupToggle"
          >
          </q-toggle>
        </q-item>
        <q-item class="q-pt-none">
          <q-item-label caption>
            {{ $t("Settings.experimental.nostr_mint_backup.description") }}
          </q-item-label>
        </q-item>

        <!-- periodically check incoming invoices -->
        <q-item>
          <q-toggle
            v-model="checkIncomingInvoices"
            :label="$t('Settings.privacy.check_incoming.toggle')"
            color="primary"
          >
          </q-toggle>
        </q-item>
        <q-item class="q-pt-none">
          <q-item-label caption
            >{{ $t("Settings.privacy.check_incoming.description") }}
          </q-item-label>
        </q-item>
        <!-- check pending invoices on startup -->
        <q-item>
          <q-toggle
            v-model="checkInvoicesOnStartup"
            :label="$t('Settings.privacy.check_startup.toggle')"
            color="primary"
          >
          </q-toggle>
        </q-item>
        <q-item class="q-pt-none">
          <q-item-label caption
            >{{ $t("Settings.privacy.check_startup.description") }}
          </q-item-label>
        </q-item>
        <!-- periodically check incoming invoices -->
        <q-item>
          <q-toggle
            v-model="periodicallyCheckIncomingInvoices"
            :label="$t('Settings.privacy.check_all.toggle')"
            color="primary"
          >
          </q-toggle>
        </q-item>
        <q-item class="q-pt-none">
          <q-item-label caption
            >{{ $t("Settings.privacy.check_all.description") }}
          </q-item-label>
        </q-item>

        <!-- check outgoing token state setting -->
        <q-item>
          <q-toggle
            v-model="checkSentTokens"
            :label="$t('Settings.privacy.check_sent.toggle')"
            color="primary"
          /> </q-item
        ><q-item class="q-pt-none">
          <q-item-label caption
            >{{ $t("Settings.privacy.check_sent.description") }}
          </q-item-label>
        </q-item>
        <!-- websockets -->
        <q-item v-if="checkIncomingInvoices || checkSentTokens">
          <q-toggle
            v-if="checkIncomingInvoices || checkSentTokens"
            v-model="useWebsockets"
            :label="$t('Settings.privacy.websockets.toggle')"
            color="primary"
          >
          </q-toggle> </q-item
        ><q-item
          class="q-pt-none"
          v-if="checkIncomingInvoices || checkSentTokens"
        >
          <q-item-label caption
            >{{ $t("Settings.privacy.websockets.description") }}
          </q-item-label>
        </q-item>
        <!-- price check setting -->
        <q-item>
          <q-toggle
            v-model="getBitcoinPrice"
            :label="$t('Settings.privacy.bitcoin_price.toggle')"
            color="primary"
          /> </q-item
        ><q-item class="q-pt-none">
          <q-item-label caption
            >{{ $t("Settings.privacy.bitcoin_price.description") }}
          </q-item-label>
        </q-item>
        <!-- currency selection -->
        <q-item v-if="getBitcoinPrice">
          <q-item-section>
            <q-item-label overline class="text-weight-bold">{{
              $t("Settings.privacy.bitcoin_price.currency.title")
            }}</q-item-label>
            <q-item-label caption>{{
              $t("Settings.privacy.bitcoin_price.currency.description")
            }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item v-if="getBitcoinPrice">
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
      </div>
    </div>
  </SettingsPageShell>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapActions, mapWritableState } from "pinia";
import { useSettingsStore } from "src/stores/settings";
import { useNostrMintBackupStore } from "src/stores/nostrMintBackup";
import { usePriceStore } from "src/stores/price";
import SettingsPageShell from "./SettingsPageShell.vue";

export default defineComponent({
  name: "PrivacySettings",
  mixins: [windowMixin],
  components: {
    SettingsPageShell,
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
