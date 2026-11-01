<template>
  <FlowDialog v-model="showPRDialog">
    <template v-if="showPRKData">
      <div class="display-token-fullscreen">
        <FullscreenDialogHeader
          :title="$t('PaymentRequestDialog.payment_request.caption')"
          balanced
        />
        <PaymentRequestView
          :request="showPRKData"
          :payments="currentPayments"
          @change="applyChanges"
        >
          <!-- Earlier requests: the table's last row, once there is more than one. -->
          <template v-if="ownRequestIndices.length > 1" #rows>
            <DetailRow
              data-testid="pr-pager"
              :icon="HistoryIcon"
              :label="currentIndexDisplay"
              value-class="detail-value--controls"
            >
              <span class="pr-pager">
                <IconButton
                  :label="$t('PaymentRequestDialog.actions.previous.label')"
                  :icon="ChevronLeftIcon"
                  :icon-size="18"
                  :disable="requestPosition <= 0"
                  @click="stepRequest(-1)"
                />
                <IconButton
                  :label="$t('PaymentRequestDialog.actions.next.label')"
                  :icon="ChevronRightIcon"
                  :icon-size="18"
                  :disable="requestPosition >= ownRequestIndices.length - 1"
                  @click="stepRequest(1)"
                />
              </span>
            </DetailRow>
          </template>
          <!-- A fresh, open request: the secondary action over Share and Copy. -->
          <template #footer>
            <q-btn
              flat
              rounded
              color="primary"
              class="full-width q-mb-sm"
              data-testid="pr-new-request"
              @click="newRequest"
            >
              {{ $t("PaymentRequestDialog.actions.new_request.label") }}
            </q-btn>
          </template>
        </PaymentRequestView>
      </div>
    </template>
  </FlowDialog>
</template>

<script lang="ts">
import FlowDialog from "src/components/ui/FlowDialog.vue";
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  History as HistoryIcon,
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
import DetailRow from "src/components/ui/DetailRow.vue";
import PaymentRequestView from "src/components/PaymentRequestView.vue";

// The payment request screen: the header, the request itself (PaymentRequestView), a pager
// row over this wallet's earlier requests at the end of its table, and New request over its
// footer. Every change the
// view asks for becomes a new request with its own id, so one already shared keeps working.
export default defineComponent({
  name: "PRDialog",
  setup() {
    return { ChevronLeftIcon, ChevronRightIcon, HistoryIcon };
  },
  components: {
    FlowDialog,
    DetailRow,
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
    // The shown request's place among them (the newest when none is selected).
    requestPosition(): number {
      const own = this.ownRequestIndices;
      const position = own.indexOf(this.selectedPRIndex as number);
      return position < 0 ? own.length - 1 : position;
    },
    currentIndexDisplay(): string {
      const own = this.ownRequestIndices;
      if (!own.length) return "0/0";
      return this.$t("PaymentRequestDialog.request_index", {
        index: this.requestPosition + 1,
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
      // The pager stops at the first and last request (its arrows disable there).
      const next = this.requestPosition + step;
      if (next < 0 || next >= own.length) return;
      this.selectRequestByIndex(own[next]);
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
/* The pager row's arrows are the rows' 18px chevrons; the last one's box ends where theirs
   does, 4px past the value edge (13px of the 44px target lies beyond its glyph). */
.pr-pager {
  display: inline-flex;
  margin-block: -8px;
  margin-inline-end: -17px;
}
/* Hover and focus stay inside the 44px row: a 36px disc, the ring drawn just inside it. */
.pr-pager :deep(.q-focus-helper) {
  border-radius: 50%;
  height: auto !important;
  inset: 4px !important;
  width: auto !important;
}
.pr-pager :deep(.q-btn:focus-visible) {
  outline-offset: -4px !important;
}
/* Right to left, "previous" sits on the right and points that way. */
[dir="rtl"] .pr-pager :deep(svg) {
  transform: scaleX(-1);
}
</style>
