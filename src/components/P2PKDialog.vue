<template>
  <q-dialog
    v-model="showP2PKDialog"
    position="top"
    backdrop-filter="blur(2px) brightness(60%)"
  >
    <q-card v-if="showP2PKData.publicKey" class="q-px-lg q-pt-md q-pb-md qcard">
      <div class="text-center q-mb-md q-mt-none q-pt-none">
        <q-responsive :ratio="1" class="q-mx-md q-mt-none q-pt-none">
          <vue-qrcode
            :value="showP2PKData.publicKey"
            :options="{ width: 340 }"
            class="rounded-borders"
          >
          </vue-qrcode>
        </q-responsive>
        <div class="row justify-center">
          <q-card-section class="q-pa-sm">
            <div class="row justify-center">
              <q-item-label overline class="q-mb-sm q-pt-md text-white">
                P2PK Key</q-item-label
              >
            </div>
            <div v-if="showP2PKData.used" class="row justify-center q-pt-sm">
              <q-item-label
                caption
                class="text-weight-light text-white"
                style="font-size: 14px"
                >Warning: You have already used this lock before</q-item-label
              >
            </div>
            <div v-else class="row justify-center q-pt-sm">
              <q-item-label
                caption
                class="text-weight-light text-white"
                style="font-size: 14px"
                >Receive ecash locked to this key</q-item-label
              >
            </div>
          </q-card-section>
        </div>
        <q-btn
          class="q-mx-xs q-px-md q-mt-md"
          size="md"
          color="primary"
          flat
          rounded
          dense
          @click="newKeys"
        >
          <q-icon name="refresh" class="q-pr-sm" size="xs" />
          Generate new key</q-btn
        >
        <div class="row q-mt-lg">
          <q-btn
            class="q-mx-xs"
            size="md"
            flat
            @click="copyText(showP2PKData.publicKey)"
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

import { useP2PKStore } from "src/stores/p2pk";

export default defineComponent({
  name: "P2PKDialog",
  mixins: [windowMixin],
  components: {
    VueQrcode,
  },
  data: function () {
    return {};
  },
  computed: {
    ...mapState(useP2PKStore, ["p2pkKeys", "showP2PKData"]),
    ...mapWritableState(useP2PKStore, ["showP2PKDialog"]),
  },
  methods: {
    ...mapActions(useP2PKStore, ["generateKeypair", "showKeyDetails"]),
    newKeys: function () {
      this.generateKeypair();
      const newPubkey = this.p2pkKeys[this.p2pkKeys.length - 1].publicKey;
      this.showP2PKData.publicKey = newPubkey;
    },
  },
});
</script>
