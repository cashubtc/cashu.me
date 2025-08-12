<template>
  <q-dialog
    v-model="showEditMintDialogLocal"
    backdrop-filter="blur(2px) brightness(60%)"
  >
    <q-card class="q-pa-lg" style="max-width: 500px; width: 100%">
      <h6 class="q-mt-none q-mb-md">{{ $t("EditMintDialog.title") }}</h6>
      <q-input
        outlined
        v-model="editMintData.url"
        type="textarea"
        autogrow
        class="q-mb-xs"
        style="font-family: monospace; font-size: 0.9em"
      >
        <template #label>
          <div class="row items-center no-wrap">
            <span>{{ $t("EditMintDialog.inputs.mint_url.label") }}</span>
            <InfoTooltip
              class="q-ml-xs"
              :text="$t('EditMintDialog.tooltips.mint_url')"
            />
          </div>
        </template>
      </q-input>
      <q-input
        outlined
        v-model="editMintData.nickname"
        type="textarea"
        autogrow
        class="q-mb-xs"
      >
        <template #label>
          <div class="row items-center no-wrap">
            <span>{{ $t("EditMintDialog.inputs.nickname.label") }}</span>
            <InfoTooltip
              class="q-ml-xs"
              :text="$t('EditMintDialog.tooltips.nickname')"
            />
          </div>
        </template>
      </q-input>
      <div class="row q-mt-lg">
        <q-btn
          class="float-left"
          v-close-popup
          rounded
          color="primary"
          @click="updateMintLocal"
          >{{ $t("EditMintDialog.actions.update.label") }}</q-btn
        >
        <q-btn v-close-popup flat class="q-ml-auto" color="grey">{{
          $t("EditMintDialog.actions.cancel.label")
        }}</q-btn>
      </div>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent, ref, watch, computed } from "vue";
import { useMintsStore } from "src/stores/mints";

export default defineComponent({
  name: "EditMintDialog",
  props: {
    mint: {
      type: Object,
      required: true,
    },
    showEditMintDialog: {
      type: Boolean,
      required: true,
    },
  },
  setup(props, { emit }) {
    const editMintData = ref({
      url: "",
      nickname: "",
    });
    const mintToEdit = ref({});
    const showEditMintDialogLocal = computed({
      get: () => props.showEditMintDialog,
      set: (value) => emit("update:showEditMintDialog", value),
    });

    watch(
      () => props.mint,
      (newMint) => {
        mintToEdit.value = { ...newMint };
        editMintData.value = { ...newMint };
      },
      { immediate: true },
    );

    const updateMintLocal = () => {
      const mintStore = useMintsStore();
      mintStore.updateMint(mintToEdit.value, editMintData.value);
      mintStore.showMintInfoData = { ...editMintData.value };
      showEditMintDialogLocal.value = false;
    };

    return {
      editMintData,
      mintToEdit,
      updateMintLocal,
      showEditMintDialogLocal,
    };
  },
});
</script>
