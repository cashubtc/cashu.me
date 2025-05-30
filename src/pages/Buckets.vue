<template>
  <div class="bg-dark text-white text-center q-pa-md flex flex-center">
    <BucketManager />
  </div>
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
