<template>
  <div class="nfc-scanner-overlay">
    <div class="nfc-scanner-container">
      <div class="nfc-scanner-content">
        <div class="nfc-card-outline">
          <NfcIcon size="48px" />
        </div>

        <div class="nfc-scanner-text q-mt-md">
          {{
            webNfcStore.isWritingToken
              ? $t("SendNfcScanner.write_prompt_text")
              : $t("SendNfcScanner.prompt_text")
          }}
        </div>

        <q-btn
          flat
          rounded
          color="negative"
          class="q-mt-md"
          @click="closeScanner"
        >
          {{ $t("SendNfcScanner.cancel_button") }}
        </q-btn>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapState } from "pinia";
import { useWebNfcStore } from "src/stores/webNfcStore";
import { Nfc as NfcIcon } from "lucide-vue-next";

export default defineComponent({
  name: "SendNfcScanner",

  components: {
    NfcIcon,
  },

  computed: {
    ...mapState(useWebNfcStore, [
      "scanningCard",
      "isScanningPaymentRequest",
      "isWritingToken",
    ]),
    webNfcStore() {
      return useWebNfcStore();
    },
  },

  mounted() {
    // Only start scanning if we're scanning for payment request (not writing)
    const webNfcStore = useWebNfcStore();
    if (webNfcStore.isScanningPaymentRequest && !webNfcStore.scanningCard) {
      webNfcStore.toggleScanner("payment-request");
    }
    // If writing, we don't need to start scanning - the write operation handles it
  },

  beforeUnmount() {
    // Make sure scanning is stopped when component is unmounted (only if scanning)
    const webNfcStore = useWebNfcStore();
    if (webNfcStore.scanningCard && webNfcStore.isScanningPaymentRequest) {
      webNfcStore.stopScanning();
    }
  },

  methods: {
    closeScanner() {
      const webNfcStore = useWebNfcStore();
      // Stop any ongoing operations
      if (webNfcStore.isScanningPaymentRequest) {
        // Stop scanning and reset UI state
        webNfcStore.stopPaymentRequestScanner();
      }
      if (webNfcStore.isWritingToken) {
        // Stop writing and abort any ongoing write operations
        webNfcStore.stopWritingToken();
      }
    },
  },
});
</script>

<style scoped>
.nfc-scanner-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.85);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.nfc-scanner-container {
  width: 100%;
  max-width: 360px;
  padding: 24px;
}

.nfc-scanner-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.nfc-card-outline {
  width: 200px;
  height: 300px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  animation: pulse 1.5s infinite;
}

.nfc-icon {
  opacity: 0.9;
}

.nfc-scanner-text {
  font-size: 16px;
  font-weight: 500;
  color: #fff;
  text-align: center;
  line-height: 1.4;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(var(--q-primary), 0.5);
  }
  70% {
    box-shadow: 0 0 0 15px rgba(var(--q-primary), 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(var(--q-primary), 0);
  }
}
</style>
