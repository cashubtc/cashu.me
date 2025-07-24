<template>
  <q-layout
    view="lHh Lpr lFf"
    :class="$q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-dark'"
  >
    <MainHeader />
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent } from "vue";
import MainHeader from "components/MainHeader.vue";

export default defineComponent({
  name: "FullscreenLayout",
  mixins: [windowMixin],
  components: {
    MainHeader,
  },
});
</script>
