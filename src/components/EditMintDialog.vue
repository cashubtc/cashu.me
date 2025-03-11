<template>
  <q-dialog
    v-model="showEditMintDialogLocal"
    backdrop-filter="blur(2px) brightness(60%)"
  >
    <q-card class="q-pa-lg" style="max-width: 500px; width: 100%">
      <h6 class="q-mt-none q-mb-md">Edit mint</h6>
      <q-input
        outlined
        v-model="editMintData.url"
        label="Mint URL"
        type="textarea"
        autogrow
        class="q-mb-xs"
        style="font-family: monospace; font-size: 0.9em"
      ></q-input>
      <q-input
        outlined
        v-model="editMintData.nickname"
        label="Nickname"
        type="textarea"
        autogrow
        class="q-mb-xs"
      ></q-input>
      <div class="row q-mt-lg">
        <q-btn
          class="float-left"
          v-close-popup
          rounded
          color="primary"
          @click="updateMintLocal"
          >Update</q-btn
        >
        <q-btn
          icon="delete"
          flat
          class="float-left item-left text-left"
          @click="$emit('remove', mintToEdit.url)"
        />
        <q-btn v-close-popup flat class="q-ml-auto" color="grey">Cancel</q-btn>
      </div>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent, ref, watch, computed } from "vue";
import { useMintsStore } from "src/stores/mints";
import { mapActions } from "pinia";

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
  emits: ["update:mint", "remove", "update:showEditMintDialog"],
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
      { immediate: true }
    );

    const { updateMint } = mapActions(useMintsStore, ["updateMint"]);

    const updateMintLocal = () => {
      updateMint(mintToEdit.value, editMintData.value);
      emit("update:mint", { ...mintToEdit.value, ...editMintData.value });
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
