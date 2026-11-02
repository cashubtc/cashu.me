<template>
  <!-- The standard empty state (src/css/elements.scss): no mint yet, two ways forward.
       Add mint is tonal: it leads to the Mints form below, where Discover mints is the one
       filled action while the URL is empty (owner 2026-10-29, item 2; council R91). -->
  <EmptyState
    class="q-mx-md q-my-lg"
    :icon="MintIcon"
    :title="$t('NoMintWarnBanner.title')"
    :text="$t('NoMintWarnBanner.subtitle')"
  >
    <template #actions>
      <q-btn
        outline
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
import { Building2 as MintIcon } from "lucide-vue-next";
import { defineComponent, markRaw } from "vue";
import EmptyState from "src/components/ui/EmptyState.vue";
import { useUiStore } from "src/stores/ui";
import { mapWritableState } from "pinia";
import { EventBus } from "../js/eventBus";

export default defineComponent({
  name: "NoMintWarnBanner",
  components: { EmptyState },
  mixins: [windowMixin],
  data() {
    return { MintIcon: markRaw(MintIcon) };
  },
  computed: {
    ...mapWritableState(useUiStore, [
      "tab",
      "expandHistory",
      "showReceiveEcashDrawer",
    ]),
  },
  methods: {
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
