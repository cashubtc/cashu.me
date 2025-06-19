<template>
  <q-page
    class="q-pa-md flex flex-center"
    :class="$q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-dark'"
  >
    <div style="width: 100%; max-width: 500px">
      <div class="text-h5 text-center q-mb-lg">Creator Hub</div>

      <div v-if="!loggedIn" class="text-center q-my-xl">
        <q-btn
          color="primary"
          to="/creator/login"
          rounded
          unelevated
          label="Login"
        />
      </div>

      <div v-else>
        <NutzapNotification class="q-mb-md" />
        <div v-for="tier in tiers" :key="tier.id" class="q-mb-md">
          <q-card flat bordered>
            <q-card-section>
              <div class="row items-center justify-between">
                <div class="text-subtitle1">{{ tier.name }}</div>
                <div class="text-subtitle2 text-primary">
                  {{ tier.price }} sats/month
                </div>
              </div>
              <div class="q-mt-sm" v-html="renderMarkdown(tier.description)" />
            </q-card-section>
          </q-card>
        </div>
        <div class="text-center q-mt-md">
          <q-btn
            color="primary"
            to="/creator/dashboard"
            rounded
            unelevated
            label="Edit Tiers"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { useCreatorHubStore } from "stores/creatorHub";
import { renderMarkdown as renderMarkdownFn } from "src/js/simple-markdown";
import NutzapNotification from "components/NutzapNotification.vue";

export default defineComponent({
  name: "CreatorHubPage",
  components: { NutzapNotification },
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
