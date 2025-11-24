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
        <a :href="showNWCData.connectionString">
          <q-responsive :ratio="1" class="q-mx-md q-mt-none q-pt-none">
            <vue-qrcode
              :value="showNWCData.connectionString"
              :options="{ width: 340 }"
              class="rounded-borders"
            >
            </vue-qrcode>
          </q-responsive>
        </a>
        <div class="row justify-center">
          <q-card-section class="q-pa-sm">
            <div class="row justify-center">
              <q-item-label
                overline
                class="q-mb-sm q-pt-md text-white"
                style="font-size: 14px"
                >{{ $t("NWCDialog.nwc.caption") }}</q-item-label
              >
            </div>
            <div class="row justify-center q-pt-md">
              <q-item-label
                caption
                class="text-weight-light text-white"
                style="font-size: 12px"
              >
                {{ $t("NWCDialog.nwc.description") }}
              </q-item-label>
              <q-item-label caption class="text-weight-bold text-white q-pt-md">
                {{ $t("NWCDialog.nwc.warning_text") }}
              </q-item-label>
            </div>
          </q-card-section>
        </div>
        <div class="row q-mt-lg">
          <q-btn
            class="q-mx-xs"
            size="md"
            flat
            @click="copyText(showNWCData.connectionString)"
            >{{ $t("NWCDialog.actions.copy.label") }}</q-btn
          >
          <q-btn v-close-popup flat color="grey" class="q-ml-auto">{{
            $t("NWCDialog.actions.close.label")
          }}</q-btn>
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>
<script lang="ts">
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
