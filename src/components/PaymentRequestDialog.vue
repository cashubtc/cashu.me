<template>
  <FlowDialog v-model="showPRDialog">
    <template v-if="showPRKData">
      <div
        :class="$q.dark.isActive ? 'bg-dark' : 'bg-white'"
        class="display-token-fullscreen"
      >
        <!-- Header: close, title and "New request" (a fresh, open request). -->
        <FullscreenDialogHeader
          :title="$t('PaymentRequestDialog.payment_request.caption')"
          balanced
        >
          <template #actions>
            <div class="row items-center no-wrap sheet-header-actions">
              <IconButton
                data-testid="pr-new-request"
                :label="$t('PaymentRequestDialog.actions.new_request.label')"
                tooltip
                @click="newRequest"
              >
                <RefreshCwIcon :size="20" />
              </IconButton>
            </div>
          </template>
        </FullscreenDialogHeader>

        <!-- Earlier requests: a pager under the title, only once there is more than one. -->
        <div
          v-if="ownRequestIndices.length > 1"
          class="row items-center justify-center no-wrap pr-pager"
        >
          <q-btn
            flat
            round
            class="touch-target-44"
            color="grey"
            :aria-label="$t('PaymentRequestDialog.actions.previous.label')"
            @click="stepRequest(-1)"
          >
            <ChevronLeftIcon :size="24" />
          </q-btn>
          <div class="pr-pager__label">{{ currentIndexDisplay }}</div>
          <q-btn
            flat
            round
            class="touch-target-44"
            color="grey"
            :aria-label="$t('PaymentRequestDialog.actions.next.label')"
            @click="stepRequest(1)"
          >
            <ChevronRightIcon :size="24" />
          </q-btn>
        </div>

        <PaymentRequestView
          :request="showPRKData"
          :payments="currentPayments"
          @change="applyChanges"
        />
      </div>
    </template>
  </FlowDialog>
</template>

<script lang="ts">
import FlowDialog from "src/components/ui/FlowDialog.vue";
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  RefreshCw as RefreshCwIcon,
} from "lucide-vue-next";
import { defineComponent } from "vue";
import { mapActions, mapState, mapWritableState } from "pinia";
import {
  decodePaymentRequest,
  PaymentRequestTransportType,
} from "@cashu/cashu-ts";
import { nip19 } from "nostr-tools";
import { usePRStore } from "src/stores/payment-request";
import { useMintsStore } from "src/stores/mints";
import { useNostrStore } from "src/stores/nostr";
import { notifyError } from "src/js/notify";
import {
  requestFields,
  type RequestFields,
} from "src/js/payment-request-fields";
import FullscreenDialogHeader from "src/components/ui/FullscreenDialogHeader.vue";
import IconButton from "src/components/ui/IconButton.vue";
import PaymentRequestView from "src/components/PaymentRequestView.vue";

// The payment request screen: the header (close, title, New request), a pager over this
// wallet's earlier requests, and the request itself (PaymentRequestView). Every change the
// view asks for becomes a new request with its own id, so one already shared keeps working.
export default defineComponent({
  name: "PRDialog",
  components: {
    FlowDialog,
    ChevronLeftIcon,
    ChevronRightIcon,
    RefreshCwIcon,
    FullscreenDialogHeader,
    IconButton,
    PaymentRequestView,
  },
  computed: {
    ...mapState(usePRStore, [
      "showPRKData",
      "ourPaymentRequests",
      "selectedPRIndex",
      "currentPaymentRequest",
    ]),
    ...mapState(useMintsStore, ["activeUnit"]),
    ...mapState(useNostrStore, ["seedSignerPublicKey"]),
    ...mapWritableState(usePRStore, ["showPRDialog"]),
    // Requests this wallet receives on. Older versions also stored requests the user paid,
    // which carry someone else's address; those are never shown or copied here.
    ownRequestIndices(): number[] {
      return this.ourPaymentRequests
        .map((entry: any, index: number) => ({ entry, index }))
        .filter(({ entry }) => this.isOwnRequest(entry.encoded))
        .map(({ index }) => index);
    },
    currentIndexDisplay(): string {
      const own = this.ownRequestIndices;
      if (!own.length) return "0/0";
      const position = own.indexOf(this.selectedPRIndex as number);
      return this.$t("PaymentRequestDialog.request_index", {
        index: (position < 0 ? own.length - 1 : position) + 1,
        total: own.length,
      }) as string;
    },
    currentPayments(): any[] {
      const prStore = usePRStore();
      if (!this.currentPaymentRequest) return [];
      return prStore.getPaymentsForRequest(this.currentPaymentRequest.id);
    },
  },
  watch: {
    showPRDialog: {
      handler(open: boolean) {
        if (open) this.showOwnRequest();
      },
      immediate: true,
    },
  },
  methods: {
    ...mapActions(usePRStore, ["createPaymentRequest", "selectRequestByIndex"]),
    isOwnRequest(encoded: string): boolean {
      if (!this.seedSignerPublicKey) return true;
      try {
        return (decodePaymentRequest(encoded).transport || []).some((t) => {
          if (t.type !== PaymentRequestTransportType.NOSTR) return false;
          const target = nip19.decode(t.target);
          return (
            target.type === "nprofile" &&
            target.data.pubkey === this.seedSignerPublicKey
          );
        });
      } catch {
        return false;
      }
    },
    showOwnRequest() {
      const own = this.ownRequestIndices;
      if (own.includes(this.selectedPRIndex as number)) {
        this.selectRequestByIndex(this.selectedPRIndex as number);
      } else if (own.length) {
        this.selectRequestByIndex(own[own.length - 1]);
      } else {
        this.newRequest();
      }
    },
    stepRequest(step: number) {
      const own = this.ownRequestIndices;
      if (own.length <= 1) return;
      const position = Math.max(0, own.indexOf(this.selectedPRIndex as number));
      this.selectRequestByIndex(
        own[(position + step + own.length) % own.length]
      );
    },
    applyChanges(next: RequestFields) {
      try {
        this.createPaymentRequest(
          next.amount,
          next.description,
          next.mints?.[0],
          next.unit
        );
      } catch (error) {
        notifyError(String(error));
      }
    },
    // A fresh, open request: no amount, any mint, in the current request's unit.
    newRequest() {
      const { unit } = requestFields(this.showPRKData, this.activeUnit);
      this.applyChanges({ unit });
    },
  },
});
</script>

<style scoped>
/* The pager is quiet chrome under the title: muted "Request 2 of 3" between 44px arrows. */
.pr-pager {
  gap: 4px;
  margin-top: -8px;
  padding-bottom: 8px;
}
.pr-pager__label {
  color: var(--app-text-muted);
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  min-width: 96px;
  text-align: center;
}
</style>
