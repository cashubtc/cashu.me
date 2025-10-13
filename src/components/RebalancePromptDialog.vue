<template>
  <q-dialog
    v-model="showRebalancePrompt"
    persistent
    position="bottom"
    :maximized="$q.screen.lt.sm"
    transition-show="slide-up"
    transition-hide="slide-down"
    backdrop-filter="blur(2px) brightness(60%)"
  >
    <q-card class="bg-grey-10 text-white full-width-card q-pb-lg">
      <q-card-section class="row items-center q-pb-sm">
        <div class="col text-center">
          <span class="text-h6">{{ $t("rebalance.prompt.title") }}</span>
        </div>
        <q-btn
          v-if="!rebalanceInProgress"
          flat
          round
          dense
          v-close-popup
          class="q-mr-sm"
          color="primary"
        >
          <XIcon />
        </q-btn>
      </q-card-section>

      <q-card-section class="q-pa-md">
        <div v-if="!rebalanceInProgress">
          <div class="text-body2 q-mb-md">
            {{ $t("rebalance.prompt.description") }}
          </div>

          <!-- Show imbalance details -->
          <div v-if="rebalancePlan" class="q-mb-md">
            <div class="text-caption text-grey-5 q-mb-sm">
              {{ $t("rebalance.prompt.transfers_needed") }}
            </div>
            <div
              v-for="(transfer, idx) in rebalancePlan.transfers"
              :key="idx"
              class="q-mb-xs text-body2"
            >
              <div class="row items-center">
                <div class="col-5 ellipsis">
                  {{ getMintName(transfer.fromUrl) }}
                </div>
                <div class="col-2 text-center">→</div>
                <div class="col-5 ellipsis">
                  {{ getMintName(transfer.toUrl) }}
                </div>
              </div>
              <div class="text-caption text-grey-5 q-ml-sm">
                {{ formatCurrency(transfer.amount, rebalancePlan.unit) }}
              </div>
            </div>
          </div>

          <!-- Action buttons -->
          <div class="q-gutter-y-sm">
            <q-btn
              class="full-width"
              color="primary"
              :label="$t('rebalance.prompt.balance_now')"
              @click="startRebalance"
            />
            <q-btn
              class="full-width"
              flat
              color="grey-5"
              :label="$t('rebalance.prompt.skip')"
              v-close-popup
            />
          </div>
        </div>

        <!-- Rebalancing in progress -->
        <div v-else>
          <q-banner class="bg-orange-9 text-white q-mb-md" rounded>
            <template v-slot:avatar>
              <q-icon name="warning" color="white" />
            </template>
            <div class="text-weight-bold">
              {{ $t("rebalance.progress.warning") }}
            </div>
            <div class="text-caption">
              {{ $t("rebalance.progress.do_not_close") }}
            </div>
          </q-banner>

          <div class="text-center q-mb-md">
            <q-spinner-dots color="primary" size="50px" />
          </div>

          <div class="text-body2 text-center q-mb-sm">
            {{ $t("rebalance.progress.status") }}
          </div>
          <div class="text-caption text-grey-5 text-center">
            {{ currentTransferStatus }}
          </div>

          <q-linear-progress
            v-if="totalTransfers > 0"
            :value="transferProgress"
            color="primary"
            class="q-mt-md"
          />
          <div class="text-caption text-grey-5 text-center q-mt-xs">
            {{ completedTransfers }} / {{ totalTransfers }}
            {{ $t("rebalance.progress.transfers_complete") }}
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapActions, mapState, mapWritableState } from "pinia";
import { useRebalanceStore } from "src/stores/rebalance";
import { useMintsStore } from "src/stores/mints";
import { useUiStore } from "src/stores/ui";
import { X as XIcon } from "lucide-vue-next";

export default defineComponent({
  name: "RebalancePromptDialog",
  components: {
    XIcon,
  },
  computed: {
    ...mapWritableState(useRebalanceStore, [
      "showRebalancePrompt",
      "rebalancePlan",
      "rebalanceInProgress",
      "currentTransferStatus",
      "completedTransfers",
      "totalTransfers",
    ]),
    ...mapState(useMintsStore, ["mints"]),
    transferProgress(): number {
      if (this.totalTransfers === 0) return 0;
      return this.completedTransfers / this.totalTransfers;
    },
  },
  methods: {
    ...mapActions(useRebalanceStore, ["executeRebalance"]),
    ...mapActions(useUiStore, ["formatCurrency"]),
    getMintName(url: string): string {
      const mint = this.mints.find((m) => m.url === url);
      return mint?.nickname || mint?.info?.name || url;
    },
    async startRebalance() {
      await this.executeRebalance();
    },
  },
});
</script>

<style lang="scss" scoped>
.q-dialog__inner > div {
  border-top-left-radius: 20px !important;
  border-top-right-radius: 20px !important;
  border-bottom-left-radius: 0px !important;
  border-bottom-right-radius: 0px !important;
}

.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
