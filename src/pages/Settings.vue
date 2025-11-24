<template>
  <div class="bg-dark text-white text-center q-pa-md flex flex-center">
    <SettingsView />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import SettingsView from "components/SettingsView.vue";

export default defineComponent({
  name: "ErrorNotFound",
  components: {
    SettingsView,
  },
});
</script>
