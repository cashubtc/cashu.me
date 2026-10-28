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
        <PendingDots v-if="swapProcessing" />
        <IconButton
          v-if="swapError"
          :label="$t('ReceiveTokenDialog.actions.cancel_swap.tooltip_text')"
          tooltip
          @click="$emit('close')"
        >
          <XIcon :size="20" />
        </IconButton>
      </div>
      <!-- Normal close button (hidden during processing) -->
      <IconButton
        v-else
        :label="$t('ReceiveTokenDialog.actions.cancel_swap.tooltip_text')"
        tooltip
        :disable="swapBlocking"
        @click="$emit('close')"
      >
        <XIcon :size="20" />
      </IconButton>
    </div>

    <!-- Source Mint (Token Origin) -->
    <div class="swap-source-section">
      <div class="swap-section-label q-mb-sm">
        {{ $t("ReceiveTokenDialog.swap_section.source_label") }}
      </div>
      <MintCard
        :url="sourceMint"
        :name="sourceMintInfo?.nickname || null"
        :icon-url="sourceMintInfo?.iconUrl || null"
      />
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
    <AppCallout
      variant="info"
      class="q-mt-md"
      :text="$t('ReceiveTokenDialog.swap_section.fee_info')"
    />
  </div>
</template>

<script lang="ts">
import IconButton from "src/components/ui/IconButton.vue";
import MintCard from "src/components/MintCard.vue";
import PendingDots from "src/components/ui/PendingDots.vue";
import { defineComponent, PropType } from "vue";
import ChooseMint from "src/components/ChooseMint.vue";
import { ArrowDown as ArrowDownIcon, X as XIcon } from "lucide-vue-next";
import AppCallout from "src/components/AppCallout.vue";
import { useMintsStore } from "stores/mints";

export default defineComponent({
  name: "SwapIncomingTokenToKnownMint",
  components: {
    IconButton,
    MintCard,
    PendingDots,
    XIcon,
    ChooseMint,
    ArrowDownIcon,
    AppCallout,
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
  background: var(--app-tint);
  border-radius: var(--app-radius-lg);
  border: 1px solid var(--app-border);
}

.swap-arrow-icon {
  width: 24px;
  height: 24px;
  color: var(--app-text-muted);
}

.swap-destination-section {
  margin-top: 8px;
}

.swap-section-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--app-text-muted);
}
</style>
