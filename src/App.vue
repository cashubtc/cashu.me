<template>
  <div>
    <!-- Authentication Prompt (shows when authentication is required) -->
    <AuthPrompt />

    <!-- Main app content -->
    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import AuthPrompt from "src/components/AuthPrompt.vue";

export default defineComponent({
  name: "App",
  components: {
    AuthPrompt,
  },
});
</script>
