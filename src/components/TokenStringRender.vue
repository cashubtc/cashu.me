<template>
  <q-card class="token-card">
    <!-- Token string as background filling entire card -->
    <div class="token-background">
      {{ displayedToken }}
    </div>

    <q-card-section class="q-pa-md token-content">
      <!-- Bottom Row: Mint Name + Amount -->
      <div class="row items-end justify-between bottom-info">
        <div class="mint-name">{{ mintName }}</div>
        <div class="token-amount text-h4">{{ displayAmount }}</div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeUnmount, ref, watch } from "vue";
import token from "src/js/token";
import { getShortUrl } from "src/js/wallet-helpers";
import { useMintsStore } from "src/stores/mints";
import { useUiStore } from "src/stores/ui";

export default defineComponent({
  name: "TokenStringRender",
  props: {
    tokenString: {
      type: String,
      required: true,
    },
    maxLength: {
      type: Number,
      required: false,
      default: 200,
    },
  },
  setup(props) {
    const mintsStore = useMintsStore();
    const uiStore = useUiStore();
    const displayedToken = ref("");

    // Decode token and extract data
    const decodedToken = computed(() => {
      if (!props.tokenString) return null;
      try {
        return token.decode(props.tokenString);
      } catch {
        return null;
      }
    });

    const tokenAmount = computed(() => {
      if (!decodedToken.value) return 0;
      try {
        const proofs = token.getProofs(decodedToken.value);
        return proofs.reduce((sum, el) => sum + el.amount, 0);
      } catch {
        return 0;
      }
    });

    const tokenUnit = computed(() => {
      if (!decodedToken.value) return "";
      try {
        return token.getUnit(decodedToken.value);
      } catch {
        return "";
      }
    });

    const mintUrl = computed(() => {
      if (!decodedToken.value) return "";
      try {
        return token.getMint(decodedToken.value);
      } catch {
        return "";
      }
    });

    const mintName = computed(() => {
      if (!mintUrl.value) return "";
      const mint = mintsStore.mints.find((m) => m.url === mintUrl.value);
      return mint?.info?.name || getShortUrl(mintUrl.value);
    });

    const truncatedTokenString = computed(() => {
      if (!props.tokenString) {
        return "";
      }
      // Show the full token string, it will be wrapped and fill the card
      return props.tokenString;
    });

    const displayAmount = computed(() => {
      if (!tokenAmount.value || !tokenUnit.value) return "";
      return uiStore.formatCurrency(tokenAmount.value, tokenUnit.value, true);
    });

    // Animation for truncated token string
    const scrambleChars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}<>?/\\|~";
    let animationFrameId: number | null = null;

    const stopAnimation = () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    };

    const animateToken = (tokenStr: string) => {
      stopAnimation();

      if (!tokenStr) {
        displayedToken.value = "";
        return;
      }

      if (typeof window === "undefined") {
        displayedToken.value = tokenStr;
        return;
      }

      const targetLength = tokenStr.length;
      const duration = Math.max(2500, Math.min(1200, targetLength * 12));
      const start = performance.now();

      const step = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const growthProgress = Math.min(progress / 0.5, 1);
        const revealProgress = Math.min(Math.max((progress - 0.3) / 0.7, 0), 1);

        const currentLength = Math.max(
          1,
          Math.floor(growthProgress * targetLength)
        );
        const revealCount = Math.floor(revealProgress * targetLength);
        let result = "";

        for (let i = 0; i < currentLength; i += 1) {
          if (i < revealCount) {
            result += tokenStr[i];
          } else {
            const randomIndex = Math.floor(
              Math.random() * scrambleChars.length
            );
            result += scrambleChars[randomIndex];
          }
        }

        displayedToken.value = result;

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(step);
        } else {
          displayedToken.value = tokenStr;
          animationFrameId = null;
        }
      };

      animationFrameId = requestAnimationFrame(step);
    };

    watch(
      truncatedTokenString,
      (newValue) => {
        animateToken(newValue);
      },
      { immediate: true }
    );

    onBeforeUnmount(() => {
      stopAnimation();
    });

    return {
      displayedToken,
      truncatedTokenString,
      mintName,
      displayAmount,
    };
  },
});
</script>

<style lang="scss" scoped>
.token-card {
  background: linear-gradient(
    135deg,
    rgba(var(--q-primary-rgb), 0.18) 0%,
    rgba(var(--q-primary-rgb), 0.08) 40%,
    rgba(0, 0, 0, 0.15) 100%
  ) !important;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3) !important;
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
  min-height: 200px;
  height: 200px;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.3) 50%,
      transparent 100%
    );
    z-index: 1;
  }

  &::after {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(
      circle at 30% 30%,
      rgba(255, 255, 255, 0.08) 0%,
      transparent 50%
    );
    pointer-events: none;
    z-index: 0;
  }
}

.token-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 16px;
  font-size: 0.75rem;
  font-weight: 400;
  color: rgba(158, 158, 158, 0.817);
  word-break: break-all;
  font-family: monospace;
  line-height: 1.4;
  overflow: hidden;
  z-index: 1;
  mask-image: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 1) 0%,
    rgba(0, 0, 0, 1) 40%,
    rgba(0, 0, 0, 0.2) 65%,
    rgba(0, 0, 0, 0) 75%
  );
  -webkit-mask-image: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 1) 0%,
    rgba(0, 0, 0, 1) 40%,
    rgba(0, 0, 0, 0.2) 65%,
    rgba(0, 0, 0, 0) 75%
  );
}

.token-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 100%;
}

.bottom-info {
  width: 100%;
}

.mint-name {
  font-weight: 400;
  color: white;
  font-size: 14px;
}

.token-amount {
  font-weight: 700;
  color: white;
  line-height: 1.2;
}
</style>
