<template>
  <q-dialog
    v-model="showP2PKDialog"
    maximized
    transition-show="fade"
    transition-hide="fade"
    no-backdrop-dismiss
  >
    <q-card v-if="p2pkData.publicKey" class="q-pa-none qcard">
      <div
        :class="$q.dark.isActive ? 'bg-dark' : 'bg-white'"
        class="display-token-fullscreen"
      >
        <!-- Header -->
        <FullscreenDialogHeader :title="$t('P2PKDialog.p2pk.caption')" />

        <!-- Content -->
        <div class="content-area">
          <q-card-section class="q-pa-none">
            <div v-if="p2pkData.publicKey" class="row justify-center q-mb-md">
              <div class="col-12 q-px-md p2pk-qr">
                <QrBlock :value="p2pkData.publicKey" />
                <QrCopyLine
                  :text="shortKey(p2pkData.publicKey)"
                  @copy="onCopyPublicKey"
                />
              </div>
            </div>

            <q-card-section class="q-pa-sm">
              <div v-if="p2pkData.used" class="row justify-center">
                <q-item-label
                  caption
                  class="text-weight-bold text-warning"
                  style="font-size: 14px"
                >
                  {{ $t("P2PKDialog.p2pk.used_warning_text") }}
                </q-item-label>
              </div>
              <div v-else class="row justify-center">
                <q-item-label
                  caption
                  class="text-app-muted"
                  style="font-size: 14px"
                >
                  {{ $t("P2PKDialog.p2pk.description") }}
                </q-item-label>
              </div>

              <!-- New key button -->
              <div class="row justify-center q-pt-sm q-pb-md">
                <q-btn flat size="md" rounded @click="newKeys">
                  <RefreshCwIcon :size="18" class="q-mr-sm" />
                  {{ $t("P2PKDialog.actions.new_key.label") }}
                </q-btn>
              </div>
            </q-card-section>
          </q-card-section>
        </div>

        <!-- Bottom panel action -->
        <FlowFooter>
          <q-btn
            class="full-width"
            unelevated
            size="lg"
            color="primary"
            rounded
            @click="onCopyPublicKey"
          >
            {{ $t("P2PKDialog.actions.copy.label") }}
          </q-btn>
        </FlowFooter>
      </div>
    </q-card>
  </q-dialog>
</template>
<script lang="ts">
import FlowFooter from "src/components/ui/FlowFooter.vue";
import { RefreshCw as RefreshCwIcon } from "lucide-vue-next";
import { defineComponent } from "vue";
import { mapActions, mapState, mapWritableState } from "pinia";
import QrBlock from "src/components/QrBlock.vue";
import QrCopyLine from "src/components/ui/QrCopyLine.vue";
import FullscreenDialogHeader from "src/components/ui/FullscreenDialogHeader.vue";

import { useP2PKStore } from "src/stores/p2pk";
// type hint for global mixin
declare const windowMixin: any;

export default defineComponent({
  name: "P2PKDialog",
  mixins: [windowMixin],
  components: {
    FlowFooter,
    RefreshCwIcon,
    QrBlock,
    QrCopyLine,
    FullscreenDialogHeader,
  },
  data: function () {
    return {};
  },
  computed: {
    ...mapState(useP2PKStore, ["p2pkKeys", "showP2PKData"]),
    ...mapWritableState(useP2PKStore, ["showP2PKDialog"]),
    p2pkData() {
      return this.showP2PKData as any;
    },
  },
  methods: {
    shortKey(key: string) {
      return key.length > 20 ? `${key.slice(0, 10)}…${key.slice(-8)}` : key;
    },
    ...mapActions(useP2PKStore, [
      "generateKeypair",
      "showKeyDetails",
      "showLastKey",
    ]),
    newKeys: function () {
      this.generateKeypair();
      this.showLastKey();
    },
    onCopyPublicKey() {
      const data = this.p2pkData;
      if (data?.publicKey) {
        (this as any).copyText(data.publicKey);
      }
    },
  },
});
</script>

<style scoped>
/* One QR size on every screen: about the width of a phone column, never the window. */
.p2pk-qr {
  max-width: 392px;
}
</style>
