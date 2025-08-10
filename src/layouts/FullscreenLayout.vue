<template>
  <q-layout
    view="lHh Lpr lFf"
    :class="$q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-dark'"
  >
    <MainHeader />
    <q-page-container class="text-body1">
      <router-view />
    </q-page-container>
    <PublishBar
      v-if="loggedIn && showPublishBar"
      :publishing="publishing"
      @publish="publishFullProfile"
    />
  </q-layout>
</template>

<script>
import { defineComponent, computed } from "vue";
import { useRoute } from "vue-router";
import MainHeader from "components/MainHeader.vue";
import PublishBar from "components/PublishBar.vue";
import { useCreatorHub } from "src/composables/useCreatorHub";

export default defineComponent({
  name: "FullscreenLayout",
  mixins: [windowMixin],
  components: {
    MainHeader,
    PublishBar,
  },
  setup() {
    const { loggedIn, publishFullProfile, publishing } = useCreatorHub();
    const route = useRoute();
    const showPublishBar = computed(() => route.path === "/creator-hub");
    return { loggedIn, publishFullProfile, publishing, showPublishBar };
  },
});
</script>
