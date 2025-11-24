<template>
  <div class="bg-dark text-white text-center q-pa-md flex flex-center">
    <RestoreView />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import RestoreView from "components/RestoreView.vue";

export default defineComponent({
  name: "ErrorNotFound",
  components: {
    RestoreView,
  },
});
</script>
