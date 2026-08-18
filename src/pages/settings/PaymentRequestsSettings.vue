<template>
  <SettingsPageShell
    :title="$t('Settings.menu.payment_requests.title')"
    :caption="$t('Settings.menu.payment_requests.caption')"
  >
    <SettingsSection
      :title="$t('Settings.payment_requests.title')"
      :caption="$t('Settings.payment_requests.description')"
    >
      <q-item tag="label">
        <q-item-section>
          <q-item-label>{{
            $t("Settings.payment_requests.enable_toggle")
          }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-toggle v-model="enablePaymentRequest" color="primary" />
        </q-item-section>
      </q-item>
      <q-item tag="label" v-if="enablePaymentRequest">
        <q-item-section>
          <q-item-label>{{
            $t("Settings.payment_requests.claim_automatically.toggle")
          }}</q-item-label>
          <q-item-label caption>{{
            $t("Settings.payment_requests.claim_automatically.description")
          }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-toggle
            v-model="receivePaymentRequestsAutomatically"
            color="primary"
          />
        </q-item-section>
      </q-item>
    </SettingsSection>
  </SettingsPageShell>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapWritableState } from "pinia";
import { usePRStore } from "src/stores/payment-request";
import SettingsPageShell from "./SettingsPageShell.vue";
import SettingsSection from "./SettingsSection.vue";

export default defineComponent({
  name: "PaymentRequestsSettings",
  mixins: [windowMixin],
  components: {
    SettingsPageShell,
    SettingsSection,
  },
  computed: {
    ...mapWritableState(usePRStore, [
      "enablePaymentRequest",
      "receivePaymentRequestsAutomatically",
    ]),
  },
});
</script>
