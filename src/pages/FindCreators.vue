<template>
  <div class="bg-dark text-white text-center q-pa-md flex flex-center">
    <FindCreatorsView />
  </div>
</template>

<script>
import { defineComponent } from "vue";
import FindCreatorsView from "components/FindCreatorsView.vue";

export default defineComponent({
  name: "FindCreatorsPage",
  components: {
    FindCreatorsView,
  },
});
</script>
