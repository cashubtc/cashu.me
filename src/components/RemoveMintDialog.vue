<template>
  <q-dialog
    v-model="showRemoveMintDialogLocal"
    backdrop-filter="blur(4px) brightness(50%)"
    transition-show="fade"
    transition-hide="fade"
  >
    <q-card class="remove-mint-dialog">
      <!-- Header Section -->
      <div class="remove-mint-header q-pa-md">
        <div class="remove-mint-title-row">
          <h4 class="remove-mint-title q-my-none">
            {{ $t("RemoveMintDialog.title") }}
          </h4>
        </div>
      </div>

      <!-- Content Section -->
      <div class="remove-mint-content q-px-md q-pb-md">
        <div class="q-mb-lg">
          <div v-if="mintToRemove.nickname" class="q-mb-md">
            <label class="input-label">{{
              $t("RemoveMintDialog.nickname.label")
            }}</label>
            <div class="mint-data-display">{{ mintToRemove.nickname }}</div>
          </div>

          <div class="q-mb-md">
            <label class="input-label">{{
              $t("RemoveMintDialog.balances.label")
            }}</label>
            <div class="mint-data-display">
              <q-badge
                v-for="unit in mintClass(mintToRemove).units"
                :key="unit"
                color="primary"
                :label="
                  formatCurrency(
                    mintClass(mintToRemove).unitBalance(unit),
                    unit
                  )
                "
                class="q-mr-sm"
              />
            </div>
          </div>

          <label class="input-label">{{
            $t("RemoveMintDialog.inputs.mint_url.label")
          }}</label>
          <q-input
            outlined
            readonly
            :model-value="mintToRemove.url"
            dense
            class="mint-input"
            filled
            type="textarea"
            autogrow
            style="font-family: monospace; font-size: 0.9em"
          ></q-input>
        </div>

        <div class="q-mb-lg">
          <span class="remove-mint-description">
            {{ $t("RemoveMintDialog.warning_text") }}
          </span>
        </div>

        <div class="action-buttons">
          <q-btn flat class="cancel-btn" v-close-popup>
            {{ $t("RemoveMintDialog.actions.cancel.label") }}
          </q-btn>
          <q-spacer></q-spacer>
          <q-btn
            color="negative"
            class="remove-btn"
            @click="removeMintLocal"
            v-close-popup
          >
            {{ $t("RemoveMintDialog.actions.confirm.label") }}
          </q-btn>
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
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

      // If we're on the mint details page, navigate back to home
      if (window.location.pathname === "/mintdetails") {
        window.history.back();
      }
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

<style scoped>
.remove-mint-dialog {
  width: 100%;
  max-width: 450px;
  border-radius: 16px;
  overflow: hidden;
}

.remove-mint-header {
  position: relative;
  padding-top: 20px;
}

.remove-mint-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.remove-mint-title {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.5px;
  font-family: "Inter", sans-serif;
}

.remove-mint-content {
  padding-top: 0;
}

.remove-mint-description {
  font-size: 15px;
  line-height: 1.5;
  font-weight: 400;
  margin-top: 0;
  opacity: 0.7;
  font-family: "Inter", sans-serif;
}

.input-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.7;
  font-family: "Inter", sans-serif;
}

.mint-data-display {
  padding: 12px;
  background-color: rgba(0, 0, 0, 0.03);
  border-radius: 8px;
  min-height: 48px;
  display: flex;
  align-items: center;
  font-family: "Inter", sans-serif;
}

.body--dark .mint-data-display {
  background-color: rgba(255, 255, 255, 0.05);
}

.mint-input {
  border-radius: 8px;
  font-size: 16px;
  font-family: "Inter", sans-serif;
}

.mint-note {
  background-color: rgba(0, 0, 0, 0.03);
  padding: 12px;
  border-radius: 8px;
  font-family: "Inter", sans-serif;
}

.body--dark .mint-note {
  background-color: rgba(255, 255, 255, 0.05);
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
  border-radius: 8px;
  transition: none !important;
}

:deep(.mint-input .q-field__native) {
  padding: 12px;
  font-family: "Inter", sans-serif;
}

/* Make sure input placeholders use Inter font */
:deep(.mint-input .q-field__native),
:deep(.mint-input .q-field__input),
:deep(.mint-input .q-placeholder) {
  font-family: "Inter", sans-serif;
}

.action-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 32px;
}

.cancel-btn {
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 8px;
  font-family: "Inter", sans-serif;
}

.remove-btn {
  font-weight: 700;
  padding: 8px 20px;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-family: "Inter", sans-serif;
}

.remove-btn:hover {
  transform: translateY(-1px);
}
</style>
