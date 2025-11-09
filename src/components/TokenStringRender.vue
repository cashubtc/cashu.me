<template>
  <div class="token-string-render">
    {{ displayedToken }}
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeUnmount, ref, watch } from "vue";

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
    const displayedToken = ref("");
    const truncatedToken = computed(() => {
      if (!props.tokenString) {
        return "";
      }
      return props.tokenString.length > props.maxLength
        ? `${props.tokenString.slice(0, props.maxLength)}...`
        : props.tokenString;
    });
    const scrambleChars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}<>?/\\|~";
    let animationFrameId: number | null = null;

    const stopAnimation = () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    };

    const animateToken = (token: string) => {
      stopAnimation();

      if (!token) {
        displayedToken.value = "";
        return;
      }

      if (typeof window === "undefined") {
        displayedToken.value = token;
        return;
      }

      const targetLength = token.length;
      const duration = Math.max(600, Math.min(1200, targetLength * 12));
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
            result += token[i];
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
          displayedToken.value = token;
          animationFrameId = null;
        }
      };

      animationFrameId = requestAnimationFrame(step);
    };

    watch(
      truncatedToken,
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
    };
  },
});
</script>

<style lang="scss" scoped>
.token-string-render {
  display: block;
  background-color: var(--q-color-grey-2);
  color: var(--q-color-grey-9);
  font-family: monospace;
  font-size: 0.9em;
  padding: 12px;
  border-radius: 8px;
  word-break: break-all;
  white-space: pre-wrap;
}
</style>
