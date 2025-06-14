<template>
  <div
    :class="[
      $q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-dark',
      'text-center q-pa-md flex flex-center',
    ]"
  >
    <RestoreView />
  </div>
</template>

<script>
import { defineComponent } from "vue";
import RestoreView from "components/RestoreView.vue";

export default defineComponent({
  name: "ErrorNotFound",
  components: {
    RestoreView,
  },
});
</script>
