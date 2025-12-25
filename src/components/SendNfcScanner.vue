<template>
  <div class="nfc-scanner-overlay">
    <div class="nfc-scanner-container">
      <div class="nfc-scanner-content">
        <div
          class="nfc-card-outline"
          :class="{ 'writing-active': isWritingToken }"
        >
          <!-- Liquid fill container -->
          <div
            v-if="isWritingToken"
            class="liquid-fill"
            :style="{ height: `${writeProgress}%` }"
            :class="{ 'fill-complete': writeSuccess }"
          >
            <div class="liquid-wave"></div>
          </div>
          <!-- Success icon overlay -->
          <transition name="tada">
            <div v-if="writeSuccess" class="success-overlay">
              <q-icon name="check_circle" size="64px" color="white" />
            </div>
          </transition>
          <!-- NFC icon (shown when not writing or before success) -->
          <transition name="fade-icon">
            <NfcIcon
              v-if="!isWritingToken || !writeSuccess"
              :size="48"
              class="nfc-icon-content"
            />
          </transition>
        </div>

        <div class="nfc-scanner-text q-mt-md">
          {{
            writeSuccess
              ? "Payment successful!"
              : isWritingToken
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
      "writeProgress",
      "writeSuccess",
    ]),
    webNfcStore() {
      return useWebNfcStore();
    },
  },
  watch: {
    "webNfcStore.writeSuccess"(newVal) {
      if (newVal) {
        // After success animation completes, close the scanner
        setTimeout(() => {
          this.closeScanner();
        }, 2000); // Wait for tada animation + delay
      }
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
  overflow: hidden;
  animation: pulse 1.5s infinite;
  background: rgba(0, 0, 0, 0.2);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.nfc-card-outline.writing-active {
  animation: none;
  border-color: rgba(34, 197, 94, 0.6);
  box-shadow: 0 0 20px rgba(34, 197, 94, 0.2);
}

.nfc-icon-content {
  position: relative;
  z-index: 2;
  opacity: 0.9;
  transition: opacity 0.3s ease;
}

.liquid-fill {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(
    180deg,
    rgba(34, 197, 94, 0.85) 0%,
    rgba(22, 163, 74, 0.9) 50%,
    rgba(16, 185, 129, 0.95) 100%
  );
  border-radius: 0 0 14px 14px;
  transition: height 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  z-index: 1;
  overflow: hidden;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.1);
}

.liquid-fill.fill-complete {
  background: linear-gradient(
    180deg,
    rgba(34, 197, 94, 1) 0%,
    rgba(22, 163, 74, 1) 50%,
    rgba(16, 185, 129, 1) 100%
  );
  border-radius: 16px;
  box-shadow: 0 0 20px rgba(34, 197, 94, 0.4),
    inset 0 2px 8px rgba(0, 0, 0, 0.1);
}

.liquid-wave {
  position: absolute;
  top: -30px;
  left: -50%;
  right: -50%;
  width: 200%;
  height: 60px;
  background: radial-gradient(
    ellipse at center,
    rgba(255, 255, 255, 0.25) 0%,
    rgba(255, 255, 255, 0.15) 40%,
    transparent 70%
  );
  border-radius: 50%;
  animation: wave 3s ease-in-out infinite;
  transform-origin: center;
}

.liquid-fill.fill-complete .liquid-wave {
  animation: wave-complete 1.5s ease-out;
  opacity: 0.6;
}

@keyframes wave {
  0%,
  100% {
    transform: translateY(0) scaleX(1) rotate(0deg);
    opacity: 0.3;
  }
  25% {
    transform: translateY(-8px) scaleX(1.05) rotate(2deg);
    opacity: 0.4;
  }
  50% {
    transform: translateY(-15px) scaleX(1.1) rotate(-2deg);
    opacity: 0.5;
  }
  75% {
    transform: translateY(-8px) scaleX(1.05) rotate(1deg);
    opacity: 0.4;
  }
}

@keyframes wave-complete {
  0% {
    transform: translateY(0) scaleX(1) rotate(0deg);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-20px) scaleX(1.2) rotate(5deg);
    opacity: 0.8;
  }
  100% {
    transform: translateY(-30px) scaleX(1.3) rotate(0deg);
    opacity: 0;
  }
}

.success-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
  background: radial-gradient(
    circle at center,
    rgba(34, 197, 94, 0.15) 0%,
    rgba(34, 197, 94, 0.05) 50%,
    transparent 100%
  );
  border-radius: 16px;
}

.success-overlay .q-icon {
  filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.8))
    drop-shadow(0 0 40px rgba(34, 197, 94, 0.6));
}

/* Tada animation */
.tada-enter-active {
  animation: tada 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.tada-leave-active {
  transition: opacity 0.3s ease;
}

.tada-enter-from {
  opacity: 0;
  transform: scale(0.3) rotate(-10deg);
}

.tada-leave-to {
  opacity: 0;
}

@keyframes tada {
  0% {
    transform: scale(0.3) rotate(-15deg);
    opacity: 0;
  }
  30% {
    transform: scale(1.15) rotate(8deg);
    opacity: 0.9;
  }
  50% {
    transform: scale(0.9) rotate(-5deg);
    opacity: 1;
  }
  65% {
    transform: scale(1.05) rotate(3deg);
  }
  80% {
    transform: scale(0.98) rotate(-1deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

/* Fade icon transition */
.fade-icon-enter-active,
.fade-icon-leave-active {
  transition: opacity 0.3s ease;
}

.fade-icon-enter-from,
.fade-icon-leave-to {
  opacity: 0;
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
