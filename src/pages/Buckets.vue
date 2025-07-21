<template>
  <q-page
    :class="[
      $q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-dark',
      'q-pa-md q-pb-xl',
    ]"
  >
    <BucketManager />
  </q-page>
</template>

<script>
import { defineComponent } from "vue";
import BucketManager from "components/BucketManager.vue";

export default defineComponent({
  name: "BucketsPage",
  components: {
    BucketManager,
  },
});
</script>
