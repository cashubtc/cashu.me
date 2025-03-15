<template>
  <q-dialog
    v-model="showEditMintDialogLocal"
    backdrop-filter="blur(4px) brightness(50%)"
    transition-show="fade"
    transition-hide="fade"
  >
    <q-card class="edit-mint-dialog">
      <!-- Header Section -->
      <div class="edit-mint-header q-pa-md">
        <div class="edit-mint-title-row">
          <h4 class="edit-mint-title q-my-none">Edit Mint</h4>
          <q-btn
            flat
            round
            dense
            icon="close"
            v-close-popup
            class="close-btn"
          />
        </div>
      </div>

      <!-- Content Section -->
      <div class="edit-mint-content q-px-md q-pb-md">
        <p class="edit-mint-description q-mb-lg">
          You can edit the mint's nickname to personalize it or change its URL
          if necessary.
        </p>

        <div class="q-mb-lg">
          <label class="input-label">Mint URL</label>
          <q-input
            v-model="editMintData.url"
            dense
            class="mint-input q-mb-md"
            filled
            style="font-family: monospace; font-size: 0.9em"
          ></q-input>

          <label class="input-label">Nickname</label>
          <q-input
            v-model="editMintData.nickname"
            dense
            class="mint-input"
            filled
            placeholder="e.g. Testnet"
          ></q-input>
        </div>

        <div class="action-buttons">
          <q-btn flat class="cancel-btn" v-close-popup> Cancel </q-btn>
          <q-btn
            color="primary"
            class="update-btn"
            @click="updateMintLocal"
            v-close-popup
          >
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
import { useQuasar } from "quasar";

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
    const $q = useQuasar();
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
      isDark: computed(() => $q.dark.isActive),
    };
  },
});
</script>

<style scoped>
.edit-mint-dialog {
  width: 100%;
  max-width: 450px;
  border-radius: 16px;
  overflow: hidden;
}

.edit-mint-header {
  position: relative;
  padding-top: 20px;
}

.edit-mint-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.edit-mint-title {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.edit-mint-content {
  padding-top: 0;
}

.edit-mint-description {
  font-size: 15px;
  line-height: 1.5;
  font-weight: 400;
  margin-top: 0;
  opacity: 0.7;
}

.input-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.7;
}

.mint-input {
  border-radius: 8px;
  height: 48px;
  font-size: 16px;
}

/* Completely remove all input animations */
:deep(.mint-input) {
  /* Disable all transitions on the input and its children except for background-color */
  * {
    transition: none !important;
    animation: none !important;
  }

  /* Add a smooth transition just for the background-color */
  transition: background-color 0.2s ease-in-out !important;
}

:deep(.mint-input .q-field__focus-target) {
  border-radius: 8px;
}

:deep(.mint-input .q-focus-helper) {
  /* Remove animation completely */
  opacity: 0 !important;
  display: none !important; /* Hide it completely */
}

/* Add subtle focus/active state - theme responsive */
:deep(.mint-input.q-field--focused) {
  background-color: rgba(255, 255, 255, 0.1);
}

/* For dark mode, adjust the focus color */
:deep(.body--dark .mint-input.q-field--focused) {
  background-color: rgba(255, 255, 255, 0.07);
}

/* For light mode, use a darker shade for contrast */
:deep(.body--light .mint-input.q-field--focused) {
  background-color: rgba(0, 0, 0, 0.05);
}

/* Remove any ripple effects */
:deep(.mint-input .q-ripple) {
  display: none !important;
}

/* Remove any before/after pseudo-elements that might animate */
:deep(.mint-input .q-field__control:before),
:deep(.mint-input .q-field__control:after) {
  display: none !important;
}

/* Ensure no border animations */
:deep(.mint-input .q-field__control) {
  height: 48px;
  border-radius: 8px;
  transition: none !important;
}

:deep(.mint-input .q-field__native) {
  padding: 12px;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
}

.cancel-btn {
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 8px;
}

.update-btn {
  font-weight: 700;
  padding: 8px 20px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.update-btn:hover {
  transform: translateY(-1px);
}

/* Subtle hover effects */
:deep(.close-btn:hover) {
  background: rgba(128, 128, 128, 0.2);
}
</style>
