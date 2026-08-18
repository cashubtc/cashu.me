<template>
  <span @click="$emit('click')">{{ formattedValue }}</span>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed } from "vue";

export default defineComponent({
  name: "AnimatedNumber",
  props: {
    value: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number,
      default: 600, // Animation duration in milliseconds
    },
    format: {
      type: Function,
      required: true, // Function to format the number
    },
  },
  setup(props) {
    const displayedValue = ref(props.value);
    // value to remember that we do not want to animate the very first update (when the component is created)
    const initialized = ref(false);
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Ease-out cubic: the count starts fast and settles gently,
    // which feels responsive instead of mechanical (linear).
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    watch(
      () => props.value,
      (newValue, oldValue) => {
        if (!initialized.value) {
          displayedValue.value = newValue;
          if (newValue > 0) {
            // do not animate until we set the first value
            initialized.value = true;
          }
          return;
        }
        if (reduceMotion) {
          displayedValue.value = newValue;
          return;
        }
        const startTime = performance.now();
        const startValue = oldValue !== undefined ? oldValue : newValue;
        const endValue = newValue;

        const animate = (currentTime: number) => {
          const elapsed = currentTime - startTime;
          const progress = Math.max(Math.min(elapsed / props.duration, 1), 0);
          const currentValue =
            startValue + (endValue - startValue) * easeOutCubic(progress);
          displayedValue.value = currentValue;
          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };

        requestAnimationFrame(animate);
      },
      { immediate: true }
    );

    const formattedValue = computed(() => {
      return props.format(displayedValue.value);
    });

    return {
      formattedValue,
    };
  },
});
</script>
