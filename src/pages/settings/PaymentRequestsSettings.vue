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
      <q-item tag="label">
        <q-item-section>
          <q-item-label>Public inbox discovery</q-item-label>
          <q-item-label caption
            >Publish your wallet's receiving public key and relay list. Existing
            requests also work with their embedded relay
            addresses.</q-item-label
          >
        </q-item-section>
        <q-item-section side
          ><q-toggle v-model="advertiseInbox"
        /></q-item-section>
      </q-item>
      <q-btn
        v-if="advertiseInbox"
        flat
        label="Publish inbox relay list"
        :loading="publishing"
        @click="publishInbox"
      />
      <q-btn
        flat
        label="Reconnect and resume recovery"
        @click="resumeRecovery"
      />
      <div class="text-caption q-pa-md">
        History recovery scans all messages available on your relays. Relay
        retention may limit recovery. Unmatched payments require review.
      </div>
      <q-list v-if="checkpoints.length" dense>
        <q-item v-for="checkpoint in checkpoints" :key="checkpoint.id">
          <q-item-section>
            <q-item-label>{{ checkpoint.relay }}</q-item-label>
            <q-item-label caption>{{
              checkpoint.error ||
              (checkpoint.complete
                ? "Available history synchronized"
                : "Recovering available history…")
            }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
      <PaymentJobsList />
    </SettingsSection>
  </SettingsPageShell>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapWritableState } from "pinia";
import { usePRStore } from "src/stores/payment-request";
import PaymentJobsList from "src/components/PaymentJobsList.vue";
import {
  publishInboxRelayList,
  initializePaymentReceiver,
  stopPaymentReceiver,
} from "src/js/paymentReceiver";
import { liveQuery } from "dexie";
import { cashuDb, useDexieStore } from "src/stores/dexie";
import { useTokensStore } from "src/stores/tokens";
import { useNostrStore } from "src/stores/nostr";
import type { RelayCheckpoint } from "src/js/paymentRequestRepository";
import { notifyError, notifySuccess } from "src/js/notify";
import SettingsPageShell from "./SettingsPageShell.vue";
import SettingsSection from "./SettingsSection.vue";

export default defineComponent({
  name: "PaymentRequestsSettings",
  mixins: [windowMixin],
  components: {
    SettingsPageShell,
    SettingsSection,
    PaymentJobsList,
  },
  computed: {
    ...mapWritableState(usePRStore, [
      "enablePaymentRequest",
      "receivePaymentRequestsAutomatically",
      "advertiseInbox",
    ]),
  },
  data: () => ({
    publishing: false,
    checkpoints: [] as RelayCheckpoint[],
    stopCheckpoints: undefined as (() => void) | undefined,
  }),
  async mounted() {
    const subscription = liveQuery(() =>
      cashuDb.paymentCheckpoints.toArray()
    ).subscribe((rows) => {
      this.checkpoints = rows.filter(
        (row) => row.identity === useNostrStore().seedSignerPublicKey
      );
    });
    this.stopCheckpoints = () => subscription.unsubscribe();
    // Settings can be opened directly, without mounting WalletPage first.
    try {
      await useDexieStore().migrateToDexie();
      await useTokensStore().migrateHistoryTokensFromLocalStorage();
      await initializePaymentReceiver();
    } catch {
      notifyError("Could not start payment recovery");
    }
  },
  beforeUnmount() {
    this.stopCheckpoints?.();
  },
  methods: {
    async publishInbox() {
      this.publishing = true;
      try {
        await publishInboxRelayList();
        notifySuccess("Inbox relay list published");
      } catch {
        notifyError("Inbox relay list was not acknowledged");
      } finally {
        this.publishing = false;
      }
    },
    async resumeRecovery() {
      stopPaymentReceiver();
      try {
        await initializePaymentReceiver();
        notifySuccess("Payment recovery started");
      } catch {
        notifyError("Could not start payment recovery");
      }
    },
  },
});
</script>
