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
import { defineComponent, computed } from 'vue';
import { useDexieLockedTokensStore } from 'stores/lockedTokensDexie';

export default defineComponent({
  name: 'PaywalledContent',
  props: {
    creatorNpub: { type: String, required: true },
    tierId: { type: String, required: true },
  },
  setup(props) {
    const store = useDexieLockedTokensStore();
    const validTokens = computed(() => {
      const now = Math.floor(Date.now() / 1000);
      return store.lockedTokens.filter(
        (t) =>
          t.tierId === props.tierId &&
          t.creatorNpub === props.creatorNpub &&
          (!t.unlockTs || t.unlockTs <= now)
      );
    });
    const hasAccess = computed(() => validTokens.value.length > 0);
    return { hasAccess };
  },
});
</script>

<style scoped></style>
