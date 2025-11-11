<template>
  <div class="column q-mt-md">
    <!-- Input field with paste button -->
    <div class="input-with-paste-wrapper">
      <q-input
        ref="inputRef"
        filled
        borderless
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
    <div v-if="hasCamera" class="qr-scanner-row q-mt-md" @click="$emit('scan')">
      <div class="row items-center no-wrap">
        <div class="qr-icon-circle">
          <ScanIcon :size="24" />
        </div>
        <div class="col q-ml-md">
          <div class="text-body1 text-weight-medium">
            {{ $t("ParseInputComponent.qr_scanner.title") }}
          </div>
          <div class="text-caption text-grey-6">
            {{ $t("ParseInputComponent.qr_scanner.description") }}
          </div>
        </div>
      </div>
    </div>

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
      <template v-slot:loading>
        <q-spinner />
      </template>
    </q-btn>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Scan as ScanIcon, Nfc as NfcIcon } from "lucide-vue-next";

export default defineComponent({
  name: "ParseInputComponent",
  components: {
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
  ::v-deep .q-field__control {
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.06);
    min-height: 120px;
    max-height: 120px;
    padding: 16px;

    &:before,
    &:after {
      border: none !important;
    }
  }

  ::v-deep .q-field__native {
    padding: 0;
    font-size: 16px;
    color: white;
    min-height: 88px;
  }

  &.has-paste-button ::v-deep .q-field__native {
    padding: 0 70px 0 0;
  }

  ::v-deep .q-placeholder {
    color: rgba(255, 255, 255, 0.5);
    font-size: 16px;
  }

  ::v-deep .q-field__control:before,
  ::v-deep .q-field__control:after {
    display: none !important;
  }

  ::v-deep .q-field__bottom {
    display: none;
  }
}

.paste-text-btn {
  position: absolute;
  right: 20px;
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

.qr-scanner-row {
  background: rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s ease;

  &:active {
    background: rgba(255, 255, 255, 0.1);
  }
}

.qr-icon-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
</style>
