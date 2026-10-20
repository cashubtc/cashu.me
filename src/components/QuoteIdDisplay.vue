<template>
  <div
    class="quote-id-display cursor-pointer"
    role="button"
    tabindex="0"
    @click="$emit('copy')"
    @keydown.enter.prevent="$emit('copy')"
    @keydown.space.prevent="$emit('copy')"
  >
    <div v-if="showQr" class="qr-container">
      <q-responsive :ratio="1" class="q-mx-none">
        <vue-qrcode
          :value="quoteId"
          :options="{ width: 340 }"
          class="rounded-borders"
          style="width: 100%"
        />
      </q-responsive>
    </div>
    <div class="text-center" :class="{ 'q-mt-sm': showQr }">
      <div
        class="quote-id-caption text-caption text-uppercase q-mb-xs text-grey-6"
      >
        <q-icon
          :name="copied ? 'check' : 'content_copy'"
          size="xs"
          class="q-mr-xs"
        />
        {{ label }}
      </div>
      <div class="quote-id-value">
        <span class="text-grey-6">{{ quoteId.slice(0, -6) }}</span
        ><span class="quote-id-tail text-weight-bold text-primary">{{
          quoteId.slice(-6)
        }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import VueQrcode from "@chenfengyuan/vue-qrcode";

export default defineComponent({
  name: "QuoteIdDisplay",
  components: { VueQrcode },
  props: {
    quoteId: { type: String, required: true },
    label: { type: String, required: true },
    copied: Boolean,
    showQr: Boolean,
  },
  emits: ["copy"],
});
</script>

<style lang="scss" scoped>
.quote-id-display {
  overflow-wrap: anywhere;
  word-break: break-all;
}

.qr-container {
  border-radius: 8px;
  overflow: hidden;
}

.quote-id-caption {
  letter-spacing: 0.08em;
}

.quote-id-value {
  font-family: monospace;
  font-size: 1.1em;
}

.quote-id-tail {
  font-size: 1.35em;
}
</style>
