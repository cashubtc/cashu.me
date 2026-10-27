<template>
  <q-dialog
    v-model="showRemoveMintDialogLocal"
    transition-show="fade"
    transition-hide="fade"
  >
    <q-card class="council-dialog remove-mint-dialog">
      <div class="council-dialog__title">
        {{ $t("RemoveMintDialog.title") }}
      </div>
      <q-list class="council-dialog__summary">
        <q-item v-if="mintToRemove.nickname">
          <q-item-section>
            <q-item-label caption>{{
              $t("RemoveMintDialog.nickname.label")
            }}</q-item-label>
            <q-item-label>{{ mintToRemove.nickname }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label caption>{{
              $t("RemoveMintDialog.inputs.mint_url.label")
            }}</q-item-label>
            <q-item-label class="ellipsis">{{
              mintToRemove.url.replace(/^https?:\/\//, "")
            }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label caption>{{
              $t("RemoveMintDialog.balances.label")
            }}</q-item-label>
            <q-item-label>{{
              mintClass(mintToRemove)
                .units.map((unit) =>
                  formatCurrency(
                    mintClass(mintToRemove).unitBalance(unit),
                    unit
                  )
                )
                .join(" + ")
            }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
      <p class="council-dialog__note">
        {{ $t("RemoveMintDialog.warning_text") }}
      </p>
      <div class="council-dialog__actions">
        <q-btn flat rounded no-caps class="col" v-close-popup>
          {{ $t("RemoveMintDialog.actions.cancel.label") }}
        </q-btn>
        <q-btn
          unelevated
          rounded
          no-caps
          class="col remove-btn"
          @click="removeMintLocal"
          v-close-popup
        >
          {{ $t("RemoveMintDialog.actions.confirm.label") }}
        </q-btn>
      </div>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { MintClass } from "src/stores/mints";
import { useMintsStore } from "src/stores/mints";

export default defineComponent({
  name: "RemoveMintDialog",
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

    return {
      removeMintLocal,
      showRemoveMintDialogLocal,
      mintClass,
      formatCurrency,
    };
  },
});
</script>

<style scoped>
/* The destructive action is the filled pill; Cancel stays the quiet one. */
.remove-btn {
  background: var(--q-negative);
  color: var(--app-surface);
}
</style>
