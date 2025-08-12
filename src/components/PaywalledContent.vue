<template>
  <div>
    <div v-if="hasAccess">
      <slot />
    </div>
    <div v-else class="q-pa-md text-center">
      <slot name="fallback">
        <div class="q-mb-sm">Subscribe to access this content.</div>
      </slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { useLockedTokensStore } from "stores/lockedTokens";

export default defineComponent({
  name: "PaywalledContent",
  props: {
    creatorNpub: { type: String, required: true },
    tierId: { type: String, required: true },
  },
  setup(props) {
    const store = useLockedTokensStore();
    const validTokens = computed(() =>
      store.validTokensForTier(props.creatorNpub, props.tierId),
    );
    const hasAccess = computed(() => validTokens.value.length > 0);
    return { hasAccess };
  },
});
</script>

<style scoped></style>
