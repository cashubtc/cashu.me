<template>
  <div
    :class="[$q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-dark', 'text-center q-pa-md flex flex-center']"
  >
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
