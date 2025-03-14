<template>
  <q-dialog
    v-model="showEditMintDialogLocal"
    backdrop-filter="blur(2px) brightness(60%)"
  >
    <q-card class="edit-mint-dialog">
      <!-- Header Section -->
      <div class="edit-mint-header q-pa-lg">
        <div class="edit-mint-title">
          <h4 class="q-my-none">Edit Mint</h4>
        </div>
        <q-icon name="settings" size="120px" class="edit-mint-icon" />
      </div>

      <!-- Content Section -->
      <div class="edit-mint-content q-pa-lg">
        <p class="edit-mint-description q-mb-lg">
          You can edit the mint's nickname to personalize it or change its URL
          if necessary. Make sure the new URL is accurate for continued use.
        </p>

        <div class="q-mb-md">
          <q-input
            outlined
            v-model="editMintData.url"
            label="Mint URL"
            type="textarea"
            autogrow
            class="q-mb-md"
            style="font-family: monospace; font-size: 0.9em"
          ></q-input>

          <q-input
            outlined
            v-model="editMintData.nickname"
            label="Nickname (e.g. Testnet)"
            type="textarea"
            autogrow
          ></q-input>
        </div>

        <div class="row justify-between q-mt-xl">
          <q-btn flat color="white" v-close-popup>Cancel</q-btn>
          <q-btn rounded color="primary" @click="updateMintLocal" v-close-popup>
            Update
          </q-btn>
        </div>
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
      { immediate: true }
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

<style scoped>
.edit-mint-dialog {
  width: 100%;
  max-width: 550px;
  border-radius: 8px;
  overflow: hidden;
}

.edit-mint-header {
  background-color: #272727;
  position: relative;
  height: 180px;
  display: flex;
  align-items: flex-start;
  overflow: hidden;
}

.edit-mint-title {
  position: relative;
  z-index: 2;
}

.edit-mint-title h4 {
  font-size: 28px;
  font-weight: 600;
  color: white;
}

.edit-mint-icon {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0.25;
  color: white;
}

.edit-mint-content {
  background-color: #1b1b1b;
  color: white;
}

.edit-mint-description {
  color: #aeaeb2;
  font-size: 16px;
  line-height: 1.5;
}

/* Override Quasar input styles to match design */
:deep(.q-field__control) {
  border-radius: 8px;
}

:deep(.q-field__label) {
  font-weight: 500;
}
</style>
