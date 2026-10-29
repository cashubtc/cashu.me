<template>
  <div class="column" :data-testid="testId">
    <!-- The outlined text field (textarea variant): its label stays visible with content,
         and Paste sits inside it, replaced by Clear once there is text (owner, 2026-10-29).
         Scanning is the labelled row under the field (owner batch 2, item 3). -->
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
        <IconButton
          v-if="!modelValue && canPasteFromClipboard"
          :label="$t('ParseInputComponent.paste_button.label')"
          @click="$emit('paste')"
        >
          <ClipboardPasteIcon :size="20" />
        </IconButton>
        <IconButton
          v-else-if="modelValue"
          :label="$t('global.actions.clear.label')"
          @click="$emit('update:modelValue', '')"
        >
          <XIcon :size="20" />
        </IconButton>
      </template>
    </q-input>

    <!-- The one scan affordance, as on main: hidden without a camera. -->
    <OptionRow
      v-if="hasCamera"
      class="q-mt-md"
      data-testid="parse-input-scan"
      @click="$emit('scan')"
    >
      <template #icon><ScanIcon :size="24" /></template>
      <template #label>{{
        $t("ParseInputComponent.qr_scanner.title")
      }}</template>
      <template #caption>{{ computedScanCaption }}</template>
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
import IconButton from "src/components/ui/IconButton.vue";
import OptionRow from "src/components/ui/OptionRow.vue";
import { defineComponent } from "vue";
import {
  ClipboardPaste as ClipboardPasteIcon,
  Nfc as NfcIcon,
  Scan as ScanIcon,
  X as XIcon,
} from "lucide-vue-next";

export default defineComponent({
  name: "ParseInputComponent",
  components: {
    BusyLabel,
    ClipboardPasteIcon,
    IconButton,
    NfcIcon,
    OptionRow,
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
    /** The scan row's caption; Pay's "Tap to scan an address" by default. */
    scanCaption: {
      type: String,
      default: "",
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
    computedScanCaption(): string {
      return (
        this.scanCaption ||
        (this.$t("ParseInputComponent.qr_scanner.caption_address") as string)
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
