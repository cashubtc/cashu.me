<template>
  <div
    class="row justify-center q-mb-none"
    style="position: absolute; top: 60px; left: 0; width: 100%"
  >
    <div>
      <transition
        appear
        enter-active-class="animated fadeIn"
        leave-active-class="animated fadeOut"
      >
        <q-icon
          v-if="enableSpinner"
          name="adjust"
          color="primary"
          size="1.5em"
        />
      </transition>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { mapState, mapWritableState } from "pinia";
import { useUiStore } from "stores/ui";
import { useWalletStore } from "../stores/wallet";
import { useReceiveTokensStore } from "src/stores/receiveTokensStore";
import { set } from "@vueuse/core";

export default defineComponent({
  name: "ActivityOrb",
  mixins: [windowMixin],
  components: {},
  props: {},
  data: function () {
    return {
      enableSpinner: false,
    };
  },
  mounted() {},
  computed: {
    ...mapWritableState(useUiStore, ["activityOrb"]),
    ...mapState(useWalletStore, ["activeWebsocketConnections"]),
    ...mapState(useReceiveTokensStore, ["scanningCard"]),
  },
  watch: {
    activityOrb: function () {
      if (this.activityOrb) {
        this.enableSpinner = true;
        setTimeout(() => {
          this.activityOrb = false;
          this.enableSpinner = false;
        }, 2000);
      } else {
        this.enableSpinner = false;
      }
    },
    scanningCard: function () {
      if (this.scanningCard) {
        this.enableSpinner = true;
      } else {
        this.enableSpinner = false;
      }
    },
  },
  methods: {},
});
</script>
<style scoped>
.animated.pulse {
  animation-duration: 0.5s;
}
.animated.fadeInDown {
  animation-duration: 0.3s;
}
.animated.fadeOut {
  animation-duration: 1s;
}
.animated.fadeIn {
  animation-duration: 1s;
}
</style>
