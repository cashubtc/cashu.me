<template>
  <q-dialog
    v-model="showAddMintDialogLocal"
    @keydown.enter.prevent="addMintLocal"
    backdrop-filter="blur(4px) brightness(50%)"
    transition-show="fade"
    transition-hide="fade"
    scrollable
  >
    <q-card class="add-mint-dialog">
      <!-- Header Section -->
      <q-card-section class="add-mint-header q-pa-md">
        <div class="add-mint-title-row">
          <h4 class="add-mint-title q-my-none">
            {{ $t("AddMintDialog.title") }}
          </h4>
        </div>
      </q-card-section>

      <!-- Scrollable Content Section -->
      <q-card-section
        class="add-mint-content q-px-md scroll"
        style="max-height: 60vh"
      >
        <p class="add-mint-description q-mb-lg">
          {{ $t("AddMintDialog.description") }}
        </p>

        <div class="q-mb-lg">
          <label class="input-label">{{
            $t("AddMintDialog.inputs.mint_url.label")
          }}</label>
          <q-input
            outlined
            readonly
            :model-value="mintUrl"
            dense
            class="mint-input"
            filled
            type="textarea"
            autogrow
            style="font-family: monospace; font-size: 0.9em"
          ></q-input>
        </div>

        <!-- Audit Info Section -->
        <div v-if="mintUrl" class="q-mb-lg">
          <div class="audit-info-section">
            <q-btn
              flat
              class="audit-info-btn"
              @click="showAuditInfo = !showAuditInfo"
            >
              <info-icon size="16" class="q-mr-xs" />
              {{
                showAuditInfo ? "Hide Mint Audit Info" : "View Mint Audit Info"
              }}
            </q-btn>

            <!-- Audit Info Component -->
            <transition
              enter-active-class="animated fadeIn"
              leave-active-class="animated fadeOut"
            >
              <MintAuditInfo
                v-if="showAuditInfo"
                :mintUrl="mintUrl"
                class="q-mt-md"
              />
            </transition>
          </div>
        </div>
      </q-card-section>

      <!-- Fixed Action Buttons Section -->
      <q-card-actions class="action-buttons flex q-pa-md">
        <q-btn flat class="cancel-btn" v-close-popup>
          {{ $t("AddMintDialog.actions.cancel.label") }}
        </q-btn>
        <q-spacer></q-spacer>
        <q-btn
          color="primary"
          class="add-btn"
          @click="addMintLocal"
          v-close-popup
          :loading="addMintBlocking"
          icon="check"
        >
          {{ $t("AddMintDialog.actions.add_mint.label") }}
          <template v-slot:loading>
            <q-spinner />
            {{ $t("AddMintDialog.actions.add_mint.in_progress") }}
          </template>
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { useSettingsStore } from "src/stores/settings";
import MintAuditInfo from "./MintAuditInfo.vue";
import { Info as InfoIcon } from "lucide-vue-next";

export default defineComponent({
  name: "AddMintDialog",
  components: {
    MintAuditInfo,
    InfoIcon,
  },
  props: {
    addMintData: {
      type: Object,
      required: true,
    },
    showAddMintDialog: {
      type: Boolean,
      required: true,
    },
    addMintBlocking: {
      type: Boolean,
      required: true,
    },
  },
  emits: ["add", "update:showAddMintDialog"],
  setup(props, { emit }) {
    const settings = useSettingsStore();
    const showAuditInfo = ref(false);

    const showAddMintDialogLocal = computed({
      get: () => props.showAddMintDialog,
      set: (value) => emit("update:showAddMintDialog", value),
    });

    const addMintLocal = () => {
      emit("add", props.addMintData, true); // Pass verbose = true
    };

    const mintUrl = computed(() => props.addMintData.url);

    return {
      addMintLocal,
      showAddMintDialogLocal,
      mintUrl,
      settings,
      showAuditInfo,
    };
  },
});
</script>

<style scoped>
.add-mint-dialog {
  width: 100%;
  max-width: 450px;
  max-height: 80vh;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.add-mint-header {
  position: relative;
  padding-top: 20px;
  flex-shrink: 0;
}

.add-mint-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.add-mint-title {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.5px;
  font-family: "Inter", sans-serif;
}

.add-mint-content {
  padding-top: 0;
  flex: 1;
  overflow-y: auto;
}

.add-mint-description {
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
  height: 48px;
  font-size: 16px;
  font-family: "Inter", sans-serif;
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

.add-btn {
  font-weight: 700;
  padding: 8px 20px;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-family: "Inter", sans-serif;
}

.add-btn:hover {
  transform: translateY(-1px);
}
</style>
