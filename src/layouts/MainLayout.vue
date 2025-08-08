<template>
  <q-layout
    view="lHh Lpr lFf"
    :class="$q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-dark'"
  >
    <!-- global utility dialogs – mount once -->
    <MissingSignerModal />
    <NdkErrorDialog />

    <MainHeader />
    <q-page-container class="text-body1">
      <div class="max-w-7xl mx-auto">
        <router-view />
      </div>
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from "vue";
import MainHeader from "components/MainHeader.vue";
import NdkErrorDialog from "components/NdkErrorDialog.vue";
import MissingSignerModal from "components/MissingSignerModal.vue";
import { useNostrStore } from "src/stores/nostr";
import { useNutzapStore } from "src/stores/nutzap";

export default defineComponent({
  name: "MainLayout",
  mixins: [windowMixin],
  components: {
    MainHeader,
    NdkErrorDialog,
    MissingSignerModal,
  },
  async mounted() {
    const nostr = useNostrStore();
    await nostr.initSignerIfNotSet();
    const myHex = nostr.pubkey;
    useNutzapStore().initListener(myHex);
  },
});
</script>
