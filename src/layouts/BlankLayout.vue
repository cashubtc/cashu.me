<template>
  <q-layout view="lHh Lpr lFf" class="bg-dark">
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
  name: "BlankLayout",
  mixins: [windowMixin],
  components: {
    MainHeader,
  },
});
</script>
