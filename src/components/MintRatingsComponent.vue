<template>
  <q-card style="min-width: 360px; max-width: 700px; width: 100%">
    <q-card-section class="row items-center justify-between">
      <div class="text-h6">Mint Reviews</div>
      <q-btn flat round dense icon="close" @click="$emit('close')" />
    </q-card-section>
    <q-separator />
    <q-card-section>
      <div class="text-subtitle2 text-grey-6">{{ url }}</div>
    </q-card-section>
    <q-separator />
    <q-card-section style="max-height: 60vh; overflow-y: auto">
      <div v-if="!reviews || reviews.length === 0" class="text-grey-6">
        No reviews yet.
      </div>
      <div v-else class="column q-gutter-md">
        <div v-for="r in reviews" :key="r.eventId" class="q-pa-md review">
          <div class="row items-center justify-between q-mb-xs">
            <div class="row items-center">
              <q-avatar size="28px" class="q-mr-sm">
                <q-icon name="account_circle" />
              </q-avatar>
              <div class="text-caption text-grey-7 monospace">
                {{ r.pubkey.slice(0, 8) }}…
              </div>
            </div>
            <div class="text-caption text-grey-6">
              {{ formatDate(r.created_at) }}
            </div>
          </div>
          <div class="q-mb-xs">
            <span v-if="r.rating !== null">⭐ {{ r.rating }}/5</span>
            <span v-else class="text-grey-6">No rating</span>
          </div>
          <div class="text-body2" style="white-space: pre-wrap">
            {{ r.comment || "\u00A0" }}
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "MintRatingsComponent",
  props: {
    url: { type: String, required: true },
    reviews: { type: Array, required: true },
  },
  emits: ["close"],
  methods: {
    formatDate(ts: number) {
      try {
        return new Date(ts * 1000).toLocaleString();
      } catch {
        return "";
      }
    },
  },
});
</script>

<style scoped>
.review {
  border: 1px solid rgba(128, 128, 128, 0.2);
  border-radius: 8px;
}
.monospace {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    "Liberation Mono", "Courier New", monospace;
}
</style>
