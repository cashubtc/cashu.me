<template>
  <q-dialog
    v-model="showNWCDialog"
    position="top"
    backdrop-filter="blur(2px) brightness(60%)"
  >
    <q-card
      v-if="showNWCData.connectionString"
      class="q-px-lg q-pt-md q-pb-md qcard"
    >
      <div class="text-center q-mb-md q-mt-none q-pt-none">
        <q-responsive :ratio="1" class="q-mx-md q-mt-none q-pt-none">
          <a :href="showNWCData.connectionString">
            <vue-qrcode
              :value="showNWCData.connectionString"
              :options="{ width: 340 }"
              class="rounded-borders"
            >
            </vue-qrcode>
          </a>
        </q-responsive>
        <div class="row justify-center">
          <q-card-section class="q-pa-sm">
            <div class="row justify-center">
              <q-item-label overline class="q-mb-sm q-pt-md text-white">
                Nostr Wallet Connect</q-item-label
              >
            </div>
            <div class="row justify-center q-pt-sm">
              <q-item-label caption class="text-white" style="font-size: 14px"
                >Control your wallet remotely.</q-item-label
              >
            </div>
            <div class="row justify-center q-pt-md">
              <q-item-label
                caption
                class="text-weight-light text-white"
                style="font-size: 14px"
              >
                <q-icon
                  name="warning"
                  color="warning"
                  size="xs"
                  class="q-pb-md"
                />
                <br />
                Warning: anyone with access to this connection string can
                initiate payments from your wallet.</q-item-label
              >
            </div>
          </q-card-section>
        </div>
        <div class="row q-mt-lg">
          <q-btn
            class="q-mx-xs"
            size="md"
            flat
            @click="copyText(showNWCData.connectionString)"
            >Copy</q-btn
          >
          <q-btn v-close-popup flat color="grey" class="q-ml-auto">Close</q-btn>
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>
<script>
import { defineComponent } from "vue";
import { mapActions, mapState, mapWritableState } from "pinia";
import VueQrcode from "@chenfengyuan/vue-qrcode";

import { useNWCStore } from "src/stores/nwc";

export default defineComponent({
  name: "NWCDialog",
  mixins: [windowMixin],
  components: {
    VueQrcode,
  },
  data: function () {
    return {};
  },
  computed: {
    ...mapState(useNWCStore, ["showNWCData"]),
    ...mapWritableState(useNWCStore, ["showNWCDialog"]),
  },
  methods: {},
});
</script>
