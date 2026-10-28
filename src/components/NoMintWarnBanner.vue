<template>
  <!-- The standard empty state (src/css/elements.scss): no mint yet, two ways forward. -->
  <EmptyState
    class="q-mx-md q-my-lg"
    :icon="LandmarkIcon"
    :title="$t('NoMintWarnBanner.title')"
    :text="$t('NoMintWarnBanner.subtitle')"
  >
    <template #actions>
      <q-btn
        unelevated
        rounded
        color="primary"
        class="full-width app-empty__action"
        :label="$t('NoMintWarnBanner.actions.add_mint.label')"
        @click="handleAddMintClick"
      />
      <q-btn
        flat
        rounded
        color="primary"
        class="full-width"
        :label="$t('NoMintWarnBanner.actions.receive.label')"
        @click="handleReceiveEcash"
      />
    </template>
  </EmptyState>
</template>
<script lang="ts">
import { Landmark as LandmarkIcon } from "lucide-vue-next";
import { defineComponent, markRaw } from "vue";
import EmptyState from "src/components/ui/EmptyState.vue";
import { getShortUrl } from "src/js/wallet-helpers";
import { useUiStore } from "src/stores/ui";
import { mapWritableState } from "pinia";
import { useReceiveTokensStore } from "src/stores/receiveTokensStore";
import { EventBus } from "../js/eventBus";
import { sumProofAmounts } from "src/js/proofs";

export default defineComponent({
  name: "NoMintWarnBanner",
  components: { EmptyState },
  mixins: [windowMixin],
  props: {
    proofs: Array,
    activeProofs: Array,
    mints: Array,
    tickerShort: String,
    activeMintUrl: String,
  },
  data() {
    return { LandmarkIcon: markRaw(LandmarkIcon) };
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
