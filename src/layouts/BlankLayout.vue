<template>
  <q-layout
    view="lHh Lpr lFf"
    :class="$q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-dark'"
  >
    <MainHeader />
    <q-page-container class="text-body1">
      <div class="max-w-7xl mx-auto">
        <router-view />
      </div>
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent } from "vue";
import MainHeader from "components/MainHeader.vue";

export default defineComponent({
  name: "BlankLayout",
  mixins: [windowMixin],
  components: {
    MainHeader,
  },
});
</script>
