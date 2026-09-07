<template>
  <div v-if="visibleJobs.length" class="q-mt-md" data-testid="payment-jobs">
    <div class="text-subtitle2 q-mb-sm">Saved payments</div>
    <q-list bordered separator class="rounded-borders">
      <q-item
        v-for="job in visibleJobs"
        :key="job.id"
        :data-testid="`payment-job-${job.state}`"
      >
        <q-item-section>
          <q-item-label
            >{{ job.direction === "incoming" ? "Incoming" : "Outgoing" }} ·
            {{ status(job) }}</q-item-label
          >
          <q-item-label caption
            >{{ job.amount ?? "Unverified amount" }}
            {{ job.unit }}</q-item-label
          >
          <q-item-label v-if="job.reason" caption>{{
            job.reason
          }}</q-item-label>
        </q-item-section>
        <q-item-section
          side
          v-if="!['confirmed', 'published'].includes(job.state)"
        >
          <q-btn
            flat
            dense
            :loading="busy === job.id"
            :label="
              job.direction === 'incoming' ? 'Review' : 'Retry publication'
            "
            @click="act(job)"
          />
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { mapState } from "pinia";
import { usePaymentJobsStore } from "src/stores/paymentJobs";
import { useReceiveTokensStore } from "src/stores/receiveTokensStore";
import { usePRStore } from "src/stores/payment-request";
import { useNostrStore } from "src/stores/nostr";
import type { PaymentJob } from "src/js/paymentRequestRepository";
import { notifyError, notifySuccess } from "src/js/notify";

export default defineComponent({
  name: "PaymentJobsList",
  props: { requestId: { type: String, default: "" } },
  data: () => ({ busy: "" }),
  computed: {
    ...mapState(usePaymentJobsStore, ["jobs"]),
    visibleJobs(): PaymentJob[] {
      return this.jobs.filter(
        (job) =>
          job.identity === useNostrStore().seedSignerPublicKey &&
          (!this.requestId || job.requestId === this.requestId) &&
          (!this.requestId || job.state !== "confirmed")
      );
    },
  },
  async mounted() {
    try {
      await useNostrStore().walletSeedGenerateKeyPair();
      await usePaymentJobsStore().init();
    } catch {
      notifyError("Could not load saved payments");
    }
  },
  methods: {
    status(job: PaymentJob) {
      if (job.state === "published")
        return "Published to relay / endpoint (not a recipient receipt)";
      if (job.state === "confirmed") return "Claimed";
      if (job.state === "review") return "Needs review";
      return job.reason ? "Retry needed" : "Pending";
    },
    async act(job: PaymentJob) {
      this.busy = job.id;
      try {
        if (job.direction === "outgoing") {
          await usePaymentJobsStore().publishPayment(job.id);
          notifySuccess("Publication acknowledged");
        } else {
          const receive = useReceiveTokensStore();
          receive.receiveData.tokensBase64 = job.token ?? "";
          usePRStore().showPRDialog = false;
          receive.showReceiveTokens = true;
          if (this.$route.path !== "/") await this.$router.push("/");
        }
      } catch {
        notifyError(
          "Payment remains saved. Check connectivity, mint approval, and retry."
        );
      } finally {
        this.busy = "";
      }
    },
  },
});
</script>
