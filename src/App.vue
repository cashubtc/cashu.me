<template>
  <router-view v-slot="{ Component }">
    <transition name="layout-fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<script lang="ts">
import { defineComponent, watch } from "vue";
import { notifyError } from "src/js/notify";

export default defineComponent({
  name: "App",
  async created() {
    // Wallet modules contain legacy eager store access. Load them only after
    // Quasar has installed Pinia, not while the root component is imported.
    const [
      { usePRStore },
      { useWalletStore },
      { useNostrStore },
      { startPaymentReceiver, stopPaymentReceiver },
    ] = await Promise.all([
      import("src/stores/payment-request"),
      import("src/stores/wallet"),
      import("src/stores/nostr"),
      import("src/js/paymentReceiver"),
    ]);
    if (this.paymentInboxDisposed) return;
    this.paymentInboxStop = stopPaymentReceiver;
    const pr = usePRStore();
    const wallet = useWalletStore();
    const nostr = useNostrStore();
    const sync = () =>
      startPaymentReceiver().catch(() =>
        notifyError(
          "Payment inbox could not start. Check wallet storage and relay settings."
        )
      );
    this.paymentInboxStopWatch = watch(
      () => [
        pr.enablePaymentRequest,
        wallet.mnemonic,
        JSON.stringify(nostr.relays),
      ],
      sync
    );
    this.paymentInboxResume = () => {
      if (document.visibilityState === "visible") {
        stopPaymentReceiver();
        sync();
      }
    };
    document.addEventListener("visibilitychange", this.paymentInboxResume);
  },
  beforeUnmount() {
    this.paymentInboxDisposed = true;
    this.paymentInboxStopWatch?.();
    document.removeEventListener("visibilitychange", this.paymentInboxResume);
    this.paymentInboxStop?.();
  },
  data() {
    return {
      paymentInboxDisposed: false,
      paymentInboxStop: undefined as (() => void) | undefined,
      paymentInboxStopWatch: undefined as (() => void) | undefined,
      paymentInboxResume: (() => {}) as () => void,
    };
  },
  mounted() {
    const splash = document.getElementById("app-splash");
    if (!splash) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        splash.classList.add("app-splash-fade");
        window.setTimeout(() => splash.remove(), 500);
      });
    });
  },
});
</script>

<style>
.layout-fade-enter-active,
.layout-fade-leave-active {
  transition: opacity 0.15s ease;
}

.layout-fade-enter-from,
.layout-fade-leave-to {
  opacity: 0;
}
</style>
