<template>
  <q-dialog
    v-model="showRemoveMintDialogLocal"
    backdrop-filter="blur(2px) brightness(60%)"
  >
    <q-card class="q-pa-lg">
      <h6 class="q-my-md">Are you sure you want to delete this mint?</h6>
      <div v-if="mintToRemove.nickname">
        <span class="text-weight-bold"> Nickname: </span>
        <span class="text-weight-light"> {{ mintToRemove.nickname }}</span>
      </div>
      <div class="row q-my-md">
        <div class="col">
          <span class="text-weight-bold">Balances:</span>
          <q-badge
            v-for="unit in mintClass(mintToRemove).units"
            :key="unit"
            color="primary"
            :label="
              formatCurrency(mintClass(mintToRemove).unitBalance(unit), unit)
            "
            class="q-mx-xs"
          />
        </div>
      </div>
      <q-input
        outlined
        readonly
        :model-value="mintToRemove.url"
        label="Mint URL"
        type="textarea"
        autogrow
        class="q-mb-xs"
      ></q-input>
      <div class="row q-my-md">
        <div class="col">
          <span class="text-caption"
            >Note: Because this wallet is paranoid, your ecash from this mint
            will not be actually deleted but will remain stored on your device.
            You will see it reappear if you re-add this mint later again.</span
          >
        </div>
      </div>
      <div class="row q-mt-lg">
        <div class="col">
          <q-btn
            v-close-popup
            class="float-left"
            color="primary"
            @click="removeMintLocal"
            >Remove mint</q-btn
          >
        </div>
        <div class="col">
          <q-btn v-close-popup flat color="grey" class="float-right"
            >Cancel</q-btn
          >
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent, computed } from "vue";
import { MintClass } from "src/stores/mints";
import { useUiStore } from "src/stores/ui";
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
    };
    const mintClass = (mint) => {
      return new MintClass(mint);
    };
    const formatCurrency = (amount, unit) => {
      return useUiStore().formatCurrency(amount, unit);
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
