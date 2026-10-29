<!-- Dev-only: a static, store-free copy of a full-screen amount flow (Receive Lightning,
     Receive on-chain, Send ecash) for judging an exploration in context: the real header,
     column and footer components, the mint picker lookalike, the big amount with its fiat
     line, and the keypad's geometry (NumericKeyboard needs the ui and settings stores).
     Slots let a variation put its element anywhere on the screen; `body` replaces the amount
     step (the address QR). -->
<template>
  <div class="xa-screen flow-surface column no-wrap">
    <FullscreenDialogHeader :title="title" balanced>
      <template #actions>
        <div class="row items-center no-wrap sheet-header-actions">
          <slot name="actions" />
        </div>
      </template>
    </FullscreenDialogHeader>

    <FlowColumn class="q-px-md q-mb-sm">
      <slot name="picker"><ExploreMintPicker /></slot>
      <slot name="under-picker" />
    </FlowColumn>

    <div class="col column items-center q-px-lg amount-area">
      <slot name="body">
        <div class="column justify-center full-width q-my-auto xa-amount">
          <slot name="above-amount" />
          <slot name="amount">
            <div class="amount-display text-weight-bold text-center">
              {{ amount }}
            </div>
          </slot>
          <slot name="fiat">
            <div class="xa-fiat">
              <span class="xa-fiat__inner">
                <span class="fiat-display text-app-muted">{{ fiat }}</span>
                <ArrowDownUpIcon
                  :size="24"
                  class="xa-fiat__swap text-app-muted"
                  role="button"
                  :aria-label="$t('common.swap_input_mode')"
                />
              </span>
            </div>
          </slot>
          <slot name="under-amount" />
        </div>
      </slot>
    </div>

    <FlowFooter class="column justify-end">
      <template #above>
        <slot name="above-keypad" />
        <div v-if="keypad" class="keypad-wrapper">
          <div class="xa-keypad q-pa-md q-pb-lg q-pt-lg">
            <div class="xa-keys">
              <q-btn
                v-for="d in ['1', '2', '3', '4', '5', '6', '7', '8', '9']"
                :key="d"
                flat
                class="text-h5 xa-key"
                >{{ d }}</q-btn
              >
              <slot name="keypad-start">
                <q-btn flat class="text-h5 xa-key invisible" disable>•</q-btn>
              </slot>
              <q-btn flat class="text-h5 xa-key">0</q-btn>
              <q-btn
                flat
                class="text-h5 xa-key"
                :aria-label="$t('common.backspace')"
              >
                <DeleteIcon :size="26" />
              </q-btn>
            </div>
          </div>
        </div>
        <slot name="above-button" />
      </template>
      <q-btn
        class="full-width"
        unelevated
        rounded
        color="primary"
        :disable="footerDisabled"
        >{{ footerLabel }}</q-btn
      >
    </FlowFooter>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  ArrowDownUp as ArrowDownUpIcon,
  Delete as DeleteIcon,
} from "lucide-vue-next";
import FlowColumn from "src/components/ui/FlowColumn.vue";
import FlowFooter from "src/components/ui/FlowFooter.vue";
import FullscreenDialogHeader from "src/components/ui/FullscreenDialogHeader.vue";
import ExploreMintPicker from "src/design-system/explorations/ExploreMintPicker.vue";

export default defineComponent({
  name: "ExploreAmountScreen",
  components: {
    ArrowDownUpIcon,
    DeleteIcon,
    ExploreMintPicker,
    FlowColumn,
    FlowFooter,
    FullscreenDialogHeader,
  },
  props: {
    title: { type: String, required: true },
    footerLabel: { type: String, required: true },
    footerDisabled: { type: Boolean, default: true },
    amount: { type: String, default: "₿0" },
    fiat: { type: String, default: "$0.00" },
    keypad: { type: Boolean, default: true },
  },
});
</script>

<style scoped>
.xa-screen {
  height: 100dvh;
  overflow: hidden;
}
.xa-amount {
  min-height: 120px;
}
/* The fiat line as AmountInputComponent draws it: the text centred, the swap glyph hanging
   off its end edge. */
.xa-fiat {
  display: flex;
  justify-content: center;
  margin-top: 37px;
  min-height: 18px;
}
.xa-fiat__inner {
  align-items: center;
  display: inline-flex;
  position: relative;
}
.xa-fiat__swap {
  box-sizing: content-box;
  inset-inline-start: 100%;
  margin-inline-start: -6px;
  padding: 10px;
  position: absolute;
}
/* NumericKeyboard's geometry (its scoped styles): 3 columns, 16px gaps, 56px keys. */
.xa-keypad {
  align-items: center;
  display: flex;
  flex-direction: column;
  width: 100%;
}
.xa-keys {
  direction: ltr;
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(3, 1fr);
  margin: 0 auto;
  max-width: 420px;
  width: 100%;
}
.xa-key {
  border-radius: var(--app-radius-md);
  font-weight: 600;
  min-height: 56px;
  padding: 12px 0;
  text-transform: capitalize;
}
@media (max-height: 700px) {
  .xa-keys {
    gap: 6px;
  }
}
.invisible {
  visibility: hidden;
}
</style>
