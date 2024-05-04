<template>
  <q-header class="bg-marginal-bg">
    <q-toolbar>
      <q-btn
        flat
        dense
        round
        icon="arrow_back_ios_new"
        to="/"
        color="primary"
        aria-label="Menu"
        @click="toggleLeftDrawer"
      />
      <q-toolbar-title>
        Wallet
        <!-- <span><strong>Cashu.me</strong></span> -->
      </q-toolbar-title>
      <q-badge color="yellow" text-color="black" class="q-mr-none">
        <span>Beta</span>
      </q-badge>
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
