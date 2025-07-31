<template>
  <q-card flat bordered class="relative-position">
    <q-expansion-item expand-separator dense>
      <template #header>
        <div class="row items-center justify-between full-width">
          <div class="row items-center">
            <q-icon name="mdi-drag" class="q-mr-sm drag-handle" />
            <div class="text-subtitle2">{{ tierLocal.name || "Tier" }}</div>
            <div class="text-caption text-grey q-ml-sm">
              {{ tierLocal.price_sats }} sats
            </div>
          </div>
          <div class="row items-center">
            <q-btn flat dense round icon="edit" @click.stop="emitEdit" />
            <q-btn
              flat
              dense
              round
              icon="delete"
              color="negative"
              @click.stop="emitDelete"
            />
          </div>
        </div>
      </template>
      <q-card-section>
        {{ tierLocal.description }}
        <div v-if="tierLocal.media && tierLocal.media.length" class="q-mt-sm">
          <MediaPreview
            v-for="(m, idx) in tierLocal.media"
            :key="idx"
            :url="m.url"
            class="q-mt-sm"
          />
        </div>
      </q-card-section>
    </q-expansion-item>
  </q-card>
</template>

<script setup lang="ts">
import { reactive, watch } from "vue";
import type { Tier } from "stores/types";
import MediaPreview from "./MediaPreview.vue";

const props = defineProps<{ tier: Tier }>();
const emit = defineEmits(["edit", "delete", "update:tier"]);

const tierLocal = reactive<Tier>({ ...props.tier });

watch(
  () => props.tier,
  (val) => {
    Object.assign(tierLocal, val);
  },
  { immediate: true, deep: true },
);

watch(
  tierLocal,
  () => {
    emit("update:tier", { ...tierLocal });
  },
  { deep: true },
);

function emitEdit() {
  emit("edit");
}

function emitDelete() {
  emit("delete");
}
</script>

<style scoped>
.relative-position {
  position: relative;
}
</style>
