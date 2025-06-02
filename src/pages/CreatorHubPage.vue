<template>
  <q-page
    :class="[
      $q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-dark',
      'q-pa-md',
    ]"
  >
    <div class="text-h5 q-mb-md">Creator Hub</div>

    <div v-if="!loggedIn" class="q-mt-md">
      <q-btn color="primary" to="/creator/login">Login</q-btn>
    </div>

    <div v-else>
      <div v-for="tier in tiers" :key="tier.id" class="q-mb-md">
        <q-card>
          <q-card-section>
            <div class="text-subtitle1">
              {{ tier.name }} - {{ tier.price }} sats
            </div>
            <div class="text-caption" v-html="renderMarkdown(tier.description)"></div>
          </q-card-section>
        </q-card>
      </div>
      <q-btn color="primary" to="/creator/dashboard">Edit Tiers</q-btn>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { useCreatorHubStore } from "stores/creatorHub";
import { renderMarkdown as renderMarkdownFn } from "src/js/simple-markdown";

export default defineComponent({
  name: "CreatorHubPage",
  setup() {
    const store = useCreatorHubStore();
    const tiers = computed(() => store.getTierArray());
    const loggedIn = computed(() => !!store.loggedInNpub);

    function renderMarkdown(text: string): string {
      return renderMarkdownFn(text || "");
    }

    return { tiers, loggedIn, renderMarkdown };
  },
});
</script>
