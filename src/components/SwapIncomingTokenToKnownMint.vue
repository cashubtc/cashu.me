<template>
  <div class="swap-section q-mt-md">
    <!-- Header with cancel button -->
    <div class="row items-center q-mb-md">
      <div class="col text-h6" style="font-size: 18px">
        {{ $t("ReceiveTokenDialog.swap_section.title") }}
      </div>
      <!-- Processing/Error status -->
      <div v-if="swapProcessing || swapError" class="row items-center no-wrap">
        <span
          class="q-mr-sm text-subtitle2"
          :class="swapError ? 'text-red' : ''"
          style="font-size: 0.875rem"
        >
          {{
            swapError
              ? $t("ReceiveTokenDialog.actions.swap.failed")
              : $t("ReceiveTokenDialog.actions.swap.processing")
          }}
        </span>
        <q-spinner v-if="swapProcessing" color="primary" size="20px" />
        <q-btn
          v-if="swapError"
          flat
          round
          dense
          icon="close"
          @click="$emit('close')"
          color="grey-6"
        >
          <q-tooltip>{{
            $t("ReceiveTokenDialog.actions.cancel_swap.tooltip_text")
          }}</q-tooltip>
        </q-btn>
      </div>
      <!-- Normal close button (hidden during processing) -->
      <q-btn
        v-else
        flat
        round
        dense
        icon="close"
        @click="$emit('close')"
        :disable="swapBlocking"
        color="grey-6"
      >
        <q-tooltip>{{
          $t("ReceiveTokenDialog.actions.cancel_swap.tooltip_text")
        }}</q-tooltip>
      </q-btn>
    </div>

    <!-- Source Mint (Token Origin) -->
    <div class="swap-source-section">
      <div class="swap-section-label q-mb-sm">
        {{ $t("ReceiveTokenDialog.swap_section.source_label") }}
      </div>
      <div class="swap-mint-info">
        <div class="row items-center no-wrap">
          <!-- Mint Icon -->
          <q-avatar size="48px" class="q-mr-md">
            <q-img
              v-if="sourceMintInfo?.iconUrl"
              :src="sourceMintInfo.iconUrl"
              spinner-color="white"
              spinner-size="xs"
            >
              <template v-slot:error>
                <div class="row items-center justify-center full-height">
                  <q-icon name="account_balance" color="grey-7" size="24px" />
                </div>
              </template>
            </q-img>
            <q-icon v-else name="account_balance" color="grey-7" size="24px" />
          </q-avatar>

          <!-- Mint Info -->
          <div class="col text-left">
            <div class="swap-mint-name">
              {{ sourceMintInfo?.nickname || sourceMintInfo?.shorturl }}
            </div>
            <div class="swap-mint-url text-grey-6">
              {{ sourceMintInfo?.shorturl }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Arrow Indicator -->
    <div class="row justify-center q-my-sm">
      <ArrowDownIcon class="swap-arrow-icon" />
    </div>

    <!-- Destination Mint Selector -->
    <div class="swap-destination-section">
      <div class="swap-section-label q-mb-sm">
        {{ $t("ReceiveTokenDialog.swap_section.destination_label") }}
      </div>
      <ChooseMint
        v-model="selectedMintUrl"
        :dry-run="true"
        :exclude-mint="sourceMint"
      />
    </div>

    <!-- Info Tip about fees -->
    <ToolTipInfo
      class="q-mt-md"
      :text="$t('ReceiveTokenDialog.swap_section.fee_info')"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import ChooseMint from "src/components/ChooseMint.vue";
import { ArrowDown as ArrowDownIcon } from "lucide-vue-next";
import ToolTipInfo from "src/components/ToolTipInfo.vue";
import { useMintsStore } from "stores/mints";

export default defineComponent({
  name: "SwapIncomingTokenToKnownMint",
  components: {
    ChooseMint,
    ArrowDownIcon,
    ToolTipInfo,
  },
  props: {
    swapProcessing: {
      type: Boolean,
      required: true,
    },
    swapError: {
      type: Boolean,
      required: true,
    },
    swapBlocking: {
      type: Boolean,
      required: true,
    },
    sourceMintInfo: {
      type: Object as PropType<{
        nickname?: string | null;
        shorturl?: string | null;
        iconUrl?: string | null;
      } | null>,
      required: false,
      default: null,
    },
    sourceMint: {
      type: String,
      required: false,
      default: "",
    },
    targetMint: {
      type: String,
      required: false,
      default: "",
    },
  },
  emits: ["close", "update:targetMint"],
  data: function () {
    return {
      selectedMintUrl: this.targetMint || "",
    };
  },
  created() {
    const mintsStore = useMintsStore();
    const activeMintCandidate = mintsStore.activeMintUrl as unknown;
    let initialTarget = "";
    if (typeof activeMintCandidate === "string") {
      initialTarget = activeMintCandidate;
    } else if (
      activeMintCandidate &&
      typeof activeMintCandidate === "object" &&
      "value" in activeMintCandidate
    ) {
      const candidateValue = (activeMintCandidate as { value?: string }).value;
      if (typeof candidateValue === "string") {
        initialTarget = candidateValue;
      }
    }
    if (!this.selectedMintUrl && initialTarget) {
      this.selectedMintUrl = initialTarget;
    }
  },
  watch: {
    targetMint: {
      handler(newVal: string) {
        if (newVal !== this.selectedMintUrl) {
          this.selectedMintUrl = newVal || "";
        }
      },
      immediate: true,
    },
    selectedMintUrl(newVal: string) {
      this.$emit("update:targetMint", newVal);
    },
    sourceMint(newVal: string) {
      if (newVal && newVal === this.selectedMintUrl) {
        this.selectedMintUrl = "";
      }
    },
  },
});
</script>

<style lang="scss" scoped>
/* Swap Section Styles */
.swap-section {
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.swap-mint-info {
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.swap-mint-name {
  font-size: 16px;
  font-weight: 500;
  color: white;
  line-height: 1.3;
}

.swap-mint-url {
  font-size: 14px;
  line-height: 1.3;
  margin-top: 2px;
}

.swap-arrow-icon {
  width: 24px;
  height: 24px;
  color: rgba(255, 255, 255, 0.5);
}

.swap-destination-section {
  margin-top: 8px;
}

.swap-section-label {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
}

.swap-info-tip {
  display: flex;
  align-items: center;
  padding: 12px;
  background: rgba(33, 150, 243, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(33, 150, 243, 0.2);
}

.swap-info-text {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.4;
}
</style>
