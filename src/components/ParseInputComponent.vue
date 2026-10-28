<template>
  <div class="column q-mt-md">
    <!-- Input field with paste button -->
    <div class="input-with-paste-wrapper" :data-testid="testId">
      <q-input
        ref="inputRef"
        :aria-label="computedPlaceholder"
        :class="[
          'parse-input',
          { 'has-paste-button': canPasteFromClipboard && !modelValue },
        ]"
        spellcheck="false"
        autocorrect="off"
        autocapitalize="off"
        :model-value="modelValue"
        @update:model-value="$emit('update:modelValue', $event)"
        type="textarea"
        :placeholder="computedPlaceholder"
        :autofocus="autofocus"
        @keyup.enter="$emit('enter')"
      />
      <div
        v-if="canPasteFromClipboard && !modelValue"
        class="paste-text-btn"
        @click="$emit('paste')"
      >
        {{ $t("ParseInputComponent.paste_button.label") }}
      </div>
    </div>

    <!-- QR Scanner row -->
    <OptionRow v-if="hasCamera" @click="$emit('scan')" class="q-mt-md">
      <template #icon><ScanIcon :size="24" /></template>
      <template #label>{{
        $t("ParseInputComponent.qr_scanner.title")
      }}</template>
      <template #caption>{{
        $t("ParseInputComponent.qr_scanner.description")
      }}</template>
    </OptionRow>

    <!-- NFC button (if supported) -->
    <q-btn
      v-if="ndefSupported"
      flat
      class="q-mt-md"
      :loading="scanningCard"
      :disabled="scanningCard"
      @click="$emit('nfc')"
    >
      <NfcIcon class="q-mr-sm" :size="20" />
      {{ nfcLabel }}
      <q-tooltip>{{ nfcTooltip }}</q-tooltip>
      <template #loading
        ><BusyLabel>{{ nfcLabel }}</BusyLabel></template
      >
    </q-btn>
  </div>
</template>

<script lang="ts">
import BusyLabel from "src/components/ui/BusyLabel.vue";
import OptionRow from "src/components/ui/OptionRow.vue";
import { defineComponent } from "vue";
import { ScanLine as ScanIcon, Nfc as NfcIcon } from "lucide-vue-next";

export default defineComponent({
  name: "ParseInputComponent",
  components: {
    BusyLabel,
    OptionRow,
    ScanIcon,
    NfcIcon,
  },
  props: {
    modelValue: {
      type: String,
      default: "",
    },
    placeholder: {
      type: String,
      default: "",
    },
    autofocus: {
      type: Boolean,
      default: true,
    },
    testId: {
      type: String,
      default: "parse-input",
    },
    hasCamera: {
      type: Boolean,
      default: false,
    },
    ndefSupported: {
      type: Boolean,
      default: false,
    },
    scanningCard: {
      type: Boolean,
      default: false,
    },
    nfcLabel: {
      type: String,
      default: "Scan NFC",
    },
    nfcTooltip: {
      type: String,
      default: "Tap to scan NFC card",
    },
  },
  emits: ["update:modelValue", "enter", "paste", "scan", "nfc"],
  computed: {
    canPasteFromClipboard() {
      return (
        window.isSecureContext &&
        navigator.clipboard &&
        navigator.clipboard.readText
      );
    },
    computedPlaceholder() {
      return (
        this.placeholder || this.$t("ParseInputComponent.placeholder.default")
      );
    },
  },
});
</script>

<style lang="scss" scoped>
/* Input area styles */
.input-with-paste-wrapper {
  position: relative;
}

.parse-input {
  :deep(.q-field__control) {
    border-radius: var(--app-radius-lg);
    background: var(--app-tint);
    min-height: 120px;
    max-height: 120px;
    padding: 16px;

    &:before,
    &:after {
      border: none !important;
    }
  }

  :deep(.q-field__native) {
    padding: 0;
    font-size: 16px;
    color: var(--app-text);
    min-height: 88px;
  }

  // Room for Paste on the inline end, so in right-to-left it is kept on the left.
  &.has-paste-button :deep(.q-field__native) {
    padding: 0;
    padding-inline-end: 70px;
  }

  :deep(.q-placeholder) {
    color: var(--app-text-muted);
    font-size: 16px;
  }

  :deep(.q-field__control:before),
  :deep(.q-field__control:after) {
    display: none !important;
  }

  :deep(.q-field__bottom) {
    display: none;
  }
}

.paste-text-btn {
  position: absolute;
  inset-inline-end: 20px;
  top: 16px;
  font-size: 16px;
  font-weight: 500;
  color: var(--q-primary);
  cursor: pointer;
  user-select: none;
  line-height: 1.5;

  &:active {
    opacity: 0.7;
  }
}
</style>
