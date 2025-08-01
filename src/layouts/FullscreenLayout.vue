<template>
  <q-layout
    view="lHh Lpr lFf"
    :class="$q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-dark'"
  >
    <MainHeader />
    <q-page-container>
      <router-view />
    </q-page-container>
    <PublishBar
      v-if="loggedIn"
      :publishing="publishing"
      @publish="publishFullProfile"
    />
  </q-layout>
</template>

<script>
import { defineComponent } from "vue";
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
    return { loggedIn, publishFullProfile, publishing };
  },
});
</script>
