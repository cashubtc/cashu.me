<template>
  <q-header class="bg-marginal-bg">
    <q-toolbar>
      <q-btn
        flat
        dense
        rounded
        icon="arrow_back_ios_new"
        to="/"
        color="primary"
        aria-label="Menu"
        @click="toggleLeftDrawer"
        no-caps
        ><span class="q-ml-md text-weight-bold">Wallet</span>
      </q-btn>
      <!-- <q-toolbar-title> </q-toolbar-title> -->
    </q-toolbar>
  </q-header>
</template>
<script>
import { defineComponent, ref } from "vue";

export default defineComponent({
  name: "FullscreenHeader",
  mixins: [windowMixin],
  props: {},
  components: {},
  setup() {
    return {};
  },
});
</script>
