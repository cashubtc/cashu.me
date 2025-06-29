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
              <q-item-label overline class="q-mb-sm q-pt-md text-white">{{
                $t("P2PKDialog.p2pk.caption")
              }}</q-item-label>
            </div>
            <div v-if="showP2PKData.used" class="row justify-center q-pt-sm">
              <q-item-label
                caption
                class="text-weight-bold text-warning"
                style="font-size: 14px"
                >{{ $t("P2PKDialog.p2pk.used_warning_text") }}</q-item-label
              >
            </div>
            <div v-else class="row justify-center q-pt-sm">
              <q-item-label
                caption
                class="text-weight-light text-white"
                style="font-size: 14px"
                >{{ $t("P2PKDialog.p2pk.description") }}</q-item-label
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
          @click="p2pk.createAndSelectNewKey()"
        >
          <q-icon name="refresh" class="q-pr-sm" size="xs" />
          {{ $t("P2PKDialog.actions.new_key.label") }}</q-btn
        >
        <div class="row q-mt-lg">
          <q-btn
            class="q-mx-xs"
            size="md"
            flat
            @click="copy(showP2PKData.publicKey)"
            >{{ $t("P2PKDialog.actions.copy.label") }}</q-btn
          >
          <q-btn v-close-popup flat color="grey" class="q-ml-auto">{{
            $t("P2PKDialog.actions.close.label")
          }}</q-btn>
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>
<script>
import { defineComponent } from "vue";
import { mapState, mapWritableState } from "pinia";
import { useClipboard } from "src/composables/useClipboard";
import { defineAsyncComponent } from "vue";
const VueQrcode = defineAsyncComponent(() =>
  import("@chenfengyuan/vue-qrcode")
);

import { useP2PKStore } from "src/stores/p2pk";

export default defineComponent({
  name: "P2PKDialog",
  mixins: [windowMixin],
  components: {
    VueQrcode,
  },
  setup() {
    const { copy } = useClipboard();
    const p2pk = useP2PKStore();
    return { copy, p2pk };
  },
  data: function () {
    return {};
  },
  computed: {
    ...mapState(useP2PKStore, ["p2pkKeys", "showP2PKData", "showLastKey"]),
    ...mapWritableState(useP2PKStore, ["showP2PKDialog"]),
  },
});
</script>
