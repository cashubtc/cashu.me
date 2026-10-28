<template>
  <ConfirmDialog
    v-model="showRemoveMintDialogLocal"
    class="remove-mint-dialog"
    danger
    :title="$t('RemoveMintDialog.title')"
    :summary="summary"
    :note="$t('RemoveMintDialog.warning_text')"
    :cancel-label="$t('RemoveMintDialog.actions.cancel.label')"
    :confirm-label="$t('RemoveMintDialog.actions.confirm.label')"
    @confirm="removeMintLocal"
  />
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { MintClass } from "src/stores/mints";
import { useMintsStore } from "src/stores/mints";
import { i18n } from "src/boot/i18n";
import ConfirmDialog from "src/components/ui/ConfirmDialog.vue";

export default defineComponent({
  name: "RemoveMintDialog",
  components: { ConfirmDialog },
  props: {
    mintToRemove: {
      type: Object,
      required: true,
    },
    showRemoveMintDialog: {
      type: Boolean,
      required: true,
    },
  },
  emits: ["remove", "update:showRemoveMintDialog"],
  setup(props, { emit }) {
    const mintsStore = useMintsStore();
    const showRemoveMintDialogLocal = computed({
      get: () => props.showRemoveMintDialog,
      set: (value) => emit("update:showRemoveMintDialog", value),
    });

    const removeMintLocal = () => {
      emit("remove", props.mintToRemove.url);
      mintsStore.showMintInfoDialog = false;
      mintsStore.showEditMintDialog = false;

      // If we're on the mint details page, navigate back to home
      if (window.location.pathname === "/mintdetails") {
        window.history.back();
      }
    };
    const mintClass = (mint) => {
      return new MintClass(mint);
    };
    const formatCurrency = (amount, unit) => {
      return window.windowMixin.methods.formatCurrency.call(
        window.windowMixin.methods,
        amount,
        unit
      );
    };

    // What is being removed: its nickname (when it has one), host and holdings.
    const summary = computed(() => {
      const t = i18n.global.t;
      const mint = props.mintToRemove as any;
      const rows = [];
      if (!mint?.url) return rows;
      if (mint.nickname) {
        rows.push({
          label: t("RemoveMintDialog.nickname.label"),
          value: mint.nickname,
        });
      }
      rows.push({
        label: t("RemoveMintDialog.inputs.mint_url.label"),
        value: String(mint.url).replace(/^https?:\/\//, ""),
      });
      rows.push({
        label: t("RemoveMintDialog.balances.label"),
        value: mintClass(mint)
          .units.map((unit) =>
            formatCurrency(mintClass(mint).unitBalance(unit), unit)
          )
          .join(" + "),
      });
      return rows;
    });

    return {
      summary,
      removeMintLocal,
      showRemoveMintDialogLocal,
      mintClass,
      formatCurrency,
    };
  },
});
</script>
