<template>
  <div class="column" :data-testid="testId">
    <!-- The outlined text field (textarea variant): its label stays visible with content,
         and Paste and Scan sit inside it, replaced by Clear once there is text (owner,
         2026-10-29). -->
    <q-input
      ref="inputRef"
      outlined
      type="textarea"
      autogrow
      hide-bottom-space
      :label="computedPlaceholder"
      spellcheck="false"
      autocorrect="off"
      autocapitalize="off"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      :autofocus="autofocus"
      @keyup.enter="$emit('enter')"
    >
      <template #append>
        <template v-if="!modelValue">
          <IconButton
            v-if="canPasteFromClipboard"
            :label="$t('ParseInputComponent.paste_button.label')"
            @click="$emit('paste')"
          >
            <ClipboardPasteIcon :size="20" />
          </IconButton>
          <IconButton
            v-if="hasCamera"
            :label="$t('global.actions.scan.label')"
            @click="$emit('scan')"
          >
            <ScanIcon :size="20" />
          </IconButton>
        </template>
        <IconButton
          v-else
          :label="$t('global.actions.clear.label')"
          @click="$emit('update:modelValue', '')"
        >
          <XIcon :size="20" />
        </IconButton>
      </template>
    </q-input>

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
import IconButton from "src/components/ui/IconButton.vue";
import { defineComponent } from "vue";
import {
  ClipboardPaste as ClipboardPasteIcon,
  Nfc as NfcIcon,
  ScanLine as ScanIcon,
  X as XIcon,
} from "lucide-vue-next";

export default defineComponent({
  name: "ParseInputComponent",
  components: {
    BusyLabel,
    ClipboardPasteIcon,
    IconButton,
    NfcIcon,
    ScanIcon,
    XIcon,
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
