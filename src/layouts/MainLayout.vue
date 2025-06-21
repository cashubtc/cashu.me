<template>
  <q-layout view="lHh Lpr lFf">
    <MainHeader />
    <q-page-container>
      <router-view />
    </q-page-container>
    <NdkErrorDialog />
  </q-layout>
</template>

<script>
import { defineComponent, ref } from "vue";
import MainHeader from "components/MainHeader.vue";
import NdkErrorDialog from "components/NdkErrorDialog.vue";
import { useNostrStore } from "src/stores/nostr";
import { useNutzapStore } from "src/stores/nutzap";

export default defineComponent({
  name: "MainLayout",
  mixins: [windowMixin],
  components: {
    MainHeader,
    NdkErrorDialog,
  },
  async mounted() {
    const myHex = useNostrStore().pubkey;
    await useNutzapStore().initListener(myHex);
  },
});
</script>
