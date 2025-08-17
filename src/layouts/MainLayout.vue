<template>
  <q-layout view="lHh Lpr lFf">
    <MainHeader />
    <MessengerDrawer
      v-if="route.meta.messengerUI"
      v-model="uiStore.showMessengerDrawer"
    />
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent } from "vue";
import { useRoute } from "vue-router";
import MainHeader from "components/MainHeader.vue";
import MessengerDrawer from "components/MessengerDrawer.vue";
import { useUiStore } from "src/stores/ui";

export default defineComponent({
  name: "MainLayout",
  mixins: [windowMixin],
  components: {
    MainHeader,
    MessengerDrawer,
  },
  setup() {
    const route = useRoute();
    const uiStore = useUiStore();
    return { route, uiStore };
  },
});
</script>
