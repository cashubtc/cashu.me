<!-- The one-line warning under an amount being typed ("Balance too low", an on-chain
     minimum): muted, centred on the amount, and wobbling each time the amount changes so a
     new keystroke that is still wrong is noticed. Sits in AmountInputComponent's overlay
     slot; the owner decides when it shows. Styles: src/css/elements.scss .amount-warning. -->
<template>
  <div class="amount-warning" role="status">
    <transition name="wobble" mode="out-in" appear>
      <span :key="String(amountKey)" class="amount-warning__text">{{
        text
      }}</span>
    </transition>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "AmountWarning",
  props: {
    text: { type: String, required: true },
    /** The amount it warns about: a new value replays the wobble. */
    amountKey: { type: [String, Number], default: "" },
  },
});
</script>
