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
      default: 1000, // Animation duration in milliseconds
    },
    format: {
      type: Function,
      required: true, // Function to format the number
    },
  },
  setup(props) {
    const displayedValue = ref(props.value);

    watch(
      () => props.value,
      (newValue, oldValue) => {
        const startTime = performance.now();
        const startValue = oldValue !== undefined ? oldValue : newValue;
        const endValue = newValue;

        const animate = (currentTime: number) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / props.duration, 1);
          const currentValue = startValue + (endValue - startValue) * progress;
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
