<template>
  <q-dialog
    v-model="showP2PKDialog"
    maximized
    backdrop-filter="blur(2px) brightness(60%)"
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
        <div class="row items-center q-pa-md" style="position: relative">
          <q-btn
            v-close-popup
            flat
            round
            icon="close"
            color="grey"
            class="floating-close-btn"
          />
          <div class="col text-center fixed-title-height">
            <q-item-label
              overline
              class="q-mt-sm text-white"
              style="font-size: 1rem"
            >
              {{ $t("P2PKDialog.p2pk.caption") }}
            </q-item-label>
          </div>
        </div>

        <!-- Content -->
        <div class="content-area">
          <q-card-section class="q-pa-none">
            <div v-if="p2pkData.publicKey" class="row justify-center q-mb-md">
              <div
                class="col-12 col-sm-11 col-md-8 q-px-md"
                style="max-width: 600px"
              >
                <q-responsive :ratio="1" class="q-mx-none">
                  <vue-qrcode
                    :value="p2pkData.publicKey"
                    :options="{ width: 400 }"
                    class="rounded-borders"
                    style="width: 100%"
                  >
                  </vue-qrcode>
                </q-responsive>
              </div>
            </div>

            <q-card-section class="q-pa-sm">
              <div v-if="p2pkData.used" class="row justify-center q-pt-md">
                <q-item-label
                  caption
                  class="text-weight-bold text-warning"
                  style="font-size: 14px"
                >
                  {{ $t("P2PKDialog.p2pk.used_warning_text") }}
                </q-item-label>
              </div>
              <div v-else class="row justify-center q-pt-md">
                <q-item-label
                  caption
                  class="text-weight-light text-white"
                  style="font-size: 14px"
                >
                  {{ $t("P2PKDialog.p2pk.description") }}
                </q-item-label>
              </div>

              <!-- New key button -->
              <div class="row justify-center q-pt-lg q-pb-md">
                <q-btn flat size="md" rounded @click="newKeys">
                  <q-icon name="refresh" class="q-pr-sm" size="xs" />
                  {{ $t("P2PKDialog.actions.new_key.label") }}
                </q-btn>
              </div>
            </q-card-section>
          </q-card-section>
        </div>

        <!-- Bottom panel action -->
        <div class="bottom-panel">
          <div class="row justify-center q-pb-lg q-pt-sm">
            <div
              class="col-12 col-sm-11 col-md-8 q-px-md"
              style="max-width: 600px"
            >
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
            </div>
          </div>
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { mapActions, mapState, mapWritableState } from "pinia";
import VueQrcode from "@chenfengyuan/vue-qrcode";

import { useP2PKStore } from "src/stores/p2pk";
// type hint for global mixin
declare const windowMixin: any;

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
    p2pkData() {
      return this.showP2PKData as any;
    },
  },
  methods: {
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
.display-token-fullscreen {
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.content-area {
  flex: 1;
  overflow-y: auto;
}
.floating-close-btn {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
}
.fixed-title-height {
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.bottom-panel {
  margin-top: auto;
  background: var(--q-color-grey-1);
  box-shadow: 0 -8px 16px rgba(0, 0, 0, 0.05);
  padding-bottom: env(safe-area-inset-bottom, 0px);
  position: sticky;
  bottom: 0;
  z-index: 2;
}
.qcard {
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
}
</style>
