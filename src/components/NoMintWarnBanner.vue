<template>
  <div class="no-mint-card q-mx-md q-my-lg q-pa-md">
    <q-card-section>
      <div class="row items-center justify-center">
        <LandmarkIcon :size="48" class="q-pb-md mint-glyph" />
      </div>
      <div class="row items-center justify-center">
        <div class="text-h6 text-weight-bold">
          {{ $t("NoMintWarnBanner.title") }}
        </div>
      </div>
      <div class="row items-center justify-center">
        <div class="no-mint-subtitle q-mt-xs">
          {{ $t("NoMintWarnBanner.subtitle") }}
        </div>
      </div>
      <div class="row items-center justify-center q-pt-lg">
        <q-btn
          unelevated
          rounded
          color="primary"
          class="q-px-lg no-mint-btn"
          :label="$t('NoMintWarnBanner.actions.add_mint.label')"
          @click="handleAddMintClick"
        />
      </div>
      <div class="row items-center justify-center q-pt-md">
        <q-btn
          flat
          rounded
          color="primary"
          class="q-px-lg no-mint-btn"
          :label="$t('NoMintWarnBanner.actions.receive.label')"
          @click="handleReceiveEcash"
        />
      </div>
    </q-card-section>
  </div>
</template>
<script lang="ts">
import { Landmark as LandmarkIcon } from "lucide-vue-next";
import { defineComponent, ref } from "vue";
import { getShortUrl } from "src/js/wallet-helpers";
import { useUiStore } from "src/stores/ui";
import { mapWritableState } from "pinia";
import { useReceiveTokensStore } from "src/stores/receiveTokensStore";
import { EventBus } from "../js/eventBus";
import { sumProofAmounts } from "src/js/proofs";

export default defineComponent({
  name: "NoMintWarnBanner",
  components: { LandmarkIcon },
  mixins: [windowMixin],
  props: {
    proofs: Array,
    activeProofs: Array,
    mints: Array,
    tickerShort: String,
    activeMintUrl: String,
  },
  computed: {
    ...mapWritableState(useUiStore, [
      "tab",
      "expandHistory",
      "showReceiveEcashDrawer",
    ]),
    ...mapWritableState(useReceiveTokensStore, [
      "showReceiveTokens",
      "receiveData",
    ]),
    balance: function () {
      return sumProofAmounts(this.activeProofs.flat());
    },
    getActiveMintUrlShort: function () {
      return getShortUrl(this.activeMintUrl);
    },
    getBalance: function () {
      return sumProofAmounts(this.activeProofs.flat());
    },
  },
  methods: {
    // showReceiveTokensDialog: function () {
    //   this.receiveData.tokensBase64 = "";
    //   this.showReceiveTokens = true;
    // },
    handleReceiveEcash: function () {
      this.showReceiveEcashDrawer = true;
    },
    handleAddMintClick: function () {
      this.expandHistory = true;
      this.tab = "mints";
      EventBus.emit("scrollToAddMintDiv");
    },
  },
});
</script>
<style scoped>
.q-dialog__inner {
  height: 100%;
  width: 100%;
  margin: 0; /* Align dialog to cover the entire viewport */
}

.no-mint-card {
  background: var(--app-tint);
  border: 1px solid var(--app-border);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
}

.no-mint-subtitle {
  color: var(--app-text-muted);
  font-size: 15px;
  line-height: 1.45;
  max-width: 30ch;
  text-align: center;
}

.no-mint-btn {
  min-height: 44px;
  min-width: 180px;
}
</style>
