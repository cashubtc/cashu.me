<template>
  <SettingsPageShell
    :title="$t('Settings.menu.payment_requests.title')"
    :caption="$t('Settings.menu.payment_requests.caption')"
  >
    <div class="q-py-sm q-px-xs text-left" on-left>
      <q-item class="q-pt-lg">
        <q-item-section>
          <q-item-label overline class="text-weight-bold">{{
            $t("Settings.payment_requests.title")
          }}</q-item-label>
          <q-item-label caption>{{
            $t("Settings.payment_requests.description")
          }}</q-item-label>
        </q-item-section>
      </q-item>
      <q-item>
        <q-toggle
          v-model="enablePaymentRequest"
          :label="$t('Settings.payment_requests.enable_toggle')"
          color="primary"
        />
      </q-item>
    </div>
    <div v-if="enablePaymentRequest" class="q-pb-sm q-px-xs text-left" on-left>
      <q-item>
        <q-toggle
          v-model="receivePaymentRequestsAutomatically"
          color="primary"
        />
        <q-item-section>
          <q-item-label title>{{
            $t("Settings.payment_requests.claim_automatically.toggle")
          }}</q-item-label>
          <q-item-label caption
            >{{
              $t("Settings.payment_requests.claim_automatically.description")
            }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </div>
  </SettingsPageShell>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapWritableState } from "pinia";
import { usePRStore } from "src/stores/payment-request";
import SettingsPageShell from "./SettingsPageShell.vue";

export default defineComponent({
  name: "PaymentRequestsSettings",
  mixins: [windowMixin],
  components: {
    SettingsPageShell,
  },
  computed: {
    ...mapWritableState(usePRStore, [
      "enablePaymentRequest",
      "receivePaymentRequestsAutomatically",
    ]),
  },
});
</script>
