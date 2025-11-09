<template>
  <div class="token-string-render">
    {{ truncatedToken }}
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";

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
    const truncatedToken = computed(() => {
      if (!props.tokenString) {
        return "";
      }
      return props.tokenString.length > props.maxLength
        ? `${props.tokenString.slice(0, props.maxLength)}...`
        : props.tokenString;
    });

    return {
      truncatedToken,
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
