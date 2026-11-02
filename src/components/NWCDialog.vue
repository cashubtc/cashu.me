<template>
  <q-dialog v-model="showNWCDialog" position="top">
    <q-card
      v-if="showNWCData.connectionString"
      class="q-px-lg q-pt-md q-pb-md qcard"
    >
      <div class="text-center q-mb-md q-mt-none q-pt-none">
        <a :href="showNWCData.connectionString">
          <QrBlock :value="showNWCData.connectionString" />
        </a>
        <div class="row justify-center">
          <q-card-section class="q-pa-sm">
            <div class="row justify-center">
              <q-item-label class="q-mb-sm q-pt-md sheet-title">{{
                $t("NWCDialog.nwc.caption")
              }}</q-item-label>
            </div>
            <div class="row justify-center q-pt-md">
              <q-item-label
                caption
                class="text-weight-light"
                style="font-size: 12px"
              >
                {{ $t("NWCDialog.nwc.description") }}
              </q-item-label>
              <q-item-label caption class="text-weight-bold q-pt-md">
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
import { mapState, mapWritableState } from "pinia";
import QrBlock from "src/components/QrBlock.vue";

import { useNWCStore } from "src/stores/nwc";

export default defineComponent({
  name: "NWCDialog",
  mixins: [windowMixin],
  components: {
    QrBlock,
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
