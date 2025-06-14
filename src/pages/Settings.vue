<template>
  <div
    :class="[
      $q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-dark',
      'text-center q-pa-md flex flex-center',
    ]"
  >
    <SettingsView />
  </div>
</template>

<script>
import { defineComponent } from "vue";
import SettingsView from "components/SettingsView.vue";

export default defineComponent({
  name: "ErrorNotFound",
  components: {
    SettingsView,
  },
});
</script>
