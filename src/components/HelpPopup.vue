<template>
  <div class="help-popup">
    <q-icon
      name="help_outline"
      color="grey"
      size="sm"
      class="cursor-pointer"
      @click="show = true"
    />
    <q-dialog v-model="show">
      <q-card>
        <q-card-section>
          <slot>{{ text }}</slot>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat color="primary" v-close-popup>{{ closeLabel }}</q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
const props = defineProps({
  text: { type: String, default: "" },
  closeLabel: { type: String, default: "Close" },
});
const show = ref(false);
</script>
