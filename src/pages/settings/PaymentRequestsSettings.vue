<template>
  <SettingsPageShell
    :title="$t('Settings.menu.payment_requests.title')"
    :caption="$t('Settings.menu.payment_requests.caption')"
  >
    <SettingsSection>
      <SettingsToggleRow
        v-model="enablePaymentRequest"
        :label="$t('Settings.payment_requests.enable_toggle')"
        :caption="$t('Settings.payment_requests.description')"
      />
      <SettingsToggleRow
        v-if="enablePaymentRequest"
        v-model="receivePaymentRequestsAutomatically"
        :label="$t('Settings.payment_requests.claim_automatically.toggle')"
        :caption="
          $t('Settings.payment_requests.claim_automatically.description')
        "
      />
    </SettingsSection>
  </SettingsPageShell>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapWritableState } from "pinia";
import { usePRStore } from "src/stores/payment-request";
import SettingsPageShell from "./SettingsPageShell.vue";
import SettingsSection from "./SettingsSection.vue";
import SettingsToggleRow from "src/components/ui/SettingsToggleRow.vue";

export default defineComponent({
  name: "PaymentRequestsSettings",
  mixins: [windowMixin],
  components: {
    SettingsPageShell,
    SettingsSection,
    SettingsToggleRow,
  },
  computed: {
    ...mapWritableState(usePRStore, [
      "enablePaymentRequest",
      "receivePaymentRequestsAutomatically",
    ]),
  },
});
</script>
