<template>
  <BottomSheet
    v-model="showReceiveEcashDrawer"
    :title="$t('ReceiveEcashDrawer.title')"
    :back="$t('ReceiveDialog.title')"
    @back="goBack"
  >
    <div>
      <div class="q-gutter-y-md">
        <OptionRow data-testid="receive-ecash-paste" @click="handlePasteBtn">
          <template #icon><ClipboardPasteIcon :size="24" /></template>
          <template #label>{{
            $t("ReceiveEcashDrawer.actions.paste.label")
          }}</template>
        </OptionRow>

        <OptionRow @click="showCamera">
          <template #icon><ScanIcon :size="24" /></template>
          <template #label>{{
            $t("ReceiveEcashDrawer.actions.scan.label")
          }}</template>
        </OptionRow>

        <OptionRow v-if="enablePaymentRequest" @click="handlePaymentRequestBtn">
          <template #icon><FileTextIcon :size="24" /></template>
          <template #label>{{
            $t("ReceiveEcashDrawer.actions.request.label")
          }}</template>
        </OptionRow>

        <OptionRow v-if="showP2PkButtonInDrawer" @click="handleLockBtn">
          <template #icon><LockIcon :size="24" /></template>
          <template #label>{{
            $t("ReceiveEcashDrawer.actions.lock.label")
          }}</template>
        </OptionRow>

        <OptionRow
          v-if="ndefSupported && showNfcButtonInDrawer"
          @click="handleNFCBtn"
        >
          <template #icon
            ><PendingDots v-if="scanningCard" /> <NfcIcon v-else :size="24"
          /></template>
          <template #label
            >{{ $t("ReceiveEcashDrawer.actions.nfc.label") }}
            {{
              scanningCard
                ? $t("ReceiveEcashDrawer.actions.nfc.scanning_text")
                : ""
            }}</template
          >
        </OptionRow>
      </div>
    </div>
  </BottomSheet>
  <P2PKDialog v-model="showP2PKDialog" />
  <PRDialog v-model="showPRDialog" />
</template>

<script lang="ts">
import PendingDots from "src/components/ui/PendingDots.vue";
import OptionRow from "src/components/ui/OptionRow.vue";
import { defineComponent } from "vue";
import BottomSheet from "src/components/BottomSheet.vue";
import { useReceiveTokensStore } from "src/stores/receiveTokensStore";
import { useUiStore } from "src/stores/ui";
import { useCameraStore } from "src/stores/camera";
import { useP2PKStore } from "src/stores/p2pk";
import { usePRStore } from "src/stores/payment-request";
import { useSettingsStore } from "../stores/settings";
import P2PKDialog from "./P2PKDialog.vue";
import PRDialog from "./PaymentRequestDialog.vue";

import { mapActions, mapState, mapWritableState } from "pinia";
import {
  ClipboardPaste as ClipboardPasteIcon,
  FileText as FileTextIcon,
  Lock as LockIcon,
  Nfc as NfcIcon,
  ScanLine as ScanIcon,
} from "lucide-vue-next";

export default defineComponent({
  name: "ReceiveEcashDrawer",
  mixins: [windowMixin],
  components: {
    PendingDots,
    OptionRow,
    BottomSheet,
    P2PKDialog,
    PRDialog,
    ClipboardPasteIcon,
    FileTextIcon,
    LockIcon,
    ScanIcon,
    NfcIcon,
  },
  data: function () {
    return {
      showP2PKDialog: false,
    };
  },
  computed: {
    ...mapWritableState(useReceiveTokensStore, [
      "showReceiveTokens",
      "receiveData",
      "scanningCard",
      "watchClipboardPaste",
    ]),
    ...mapState(useUiStore, ["ndefSupported"]),
    ...mapState(useSettingsStore, [
      "showNfcButtonInDrawer",
      "autoPasteEcashReceive",
    ]),
    ...mapWritableState(useUiStore, ["showReceiveEcashDrawer"]),
    ...mapWritableState(usePRStore, ["showPRDialog"]),
    ...mapState(useP2PKStore, ["p2pkKeys", "showP2PkButtonInDrawer"]),
    ...mapState(usePRStore, ["enablePaymentRequest"]),
    ...mapWritableState(useUiStore, ["showReceiveDialog"]),
  },
  methods: {
    ...mapActions(useCameraStore, ["showCamera"]),
    ...mapActions(useP2PKStore, ["generateKeypair", "showLastKey"]),
    ...mapActions(useReceiveTokensStore, ["toggleScanner"]),
    handlePasteBtn: function () {
      this.receiveData.tokensBase64 = "";
      this.showReceiveTokens = true;
      this.showReceiveEcashDrawer = false;
      if (this.autoPasteEcashReceive) {
        this.watchClipboardPaste = true;
      }
    },
    handleLockBtn: function () {
      this.showP2PKDialog = !this.showP2PKDialog;
      if (!this.p2pkKeys.length || !this.showP2PKDialog) {
        this.generateKeypair();
      }
      this.showLastKey();
      this.showReceiveEcashDrawer = false;
    },
    handlePaymentRequestBtn: function () {
      const prStore = usePRStore();
      this.showPRDialog = !this.showPRDialog;
      if (this.showPRDialog) {
        prStore.newPaymentRequest();
      }
      this.showReceiveEcashDrawer = false;
    },
    handleNFCBtn: function () {
      this.toggleScanner();
    },
    goBack: function () {
      this.showReceiveEcashDrawer = false;
      this.showReceiveDialog = true;
    },
  },
});
</script>
