<template>
  <q-dialog
    v-model="show"
    position="top"
    backdrop-filter="blur(2px) brightness(60%)"
    :persistent="isProcessing"
    @hide="onDialogHide"
  >
    <q-card class="cairo-dialog-card">
      <q-card-section class="cairo-dialog-header">
        <div class="row items-center q-mb-md">
          <q-icon name="code" size="md" color="primary" class="q-mr-md" />
          <div>
            <div class="text-h6 text-white">Unlock Cairo Token</div>
            <div class="text-caption text-grey-6">Provide executable and inputs to unlock your token</div>
          </div>
        </div>
      </q-card-section>

      <q-card-section class="q-pa-lg">
        <!-- Browser Compatibility Indicator -->
        <div class="q-mb-lg">
          <q-banner 
            :class="compatibilityMessage.type === 'success' ? 'bg-positive text-white' : 'bg-warning text-black'"
            rounded
            dense
            class="compatibility-banner"
          >
            <template v-slot:avatar>
              <q-icon 
                :name="compatibilityMessage.type === 'success' ? 'check_circle' : 'warning'" 
                size="sm"
              />
            </template>
            <div class="text-body2 text-weight-medium">{{ compatibilityMessage.message }}</div>
            <div v-if="compatibilityMessage.details" class="text-caption q-mt-xs">
              <div>{{ compatibilityMessage.details.reason }}</div>
              <div v-if="compatibilityMessage.details.recommendation" class="text-weight-bold">
                {{ compatibilityMessage.details.recommendation }}
              </div>
            </div>
            <!-- Debug info (collapsible) -->
            <q-expansion-item 
              v-if="compatibilityMessage.debugInfo"
              class="q-mt-sm debug-expansion"
              dense
              header-class="text-caption"
              label="Debug Info"
            >
              <div class="q-pa-sm bg-grey-9 rounded-borders text-caption">
                <div><strong>Browser:</strong> {{ compatibilityMessage.debugInfo.browser }}</div>
                <div><strong>Version:</strong> {{ compatibilityMessage.debugInfo.version }}</div>
                <div><strong>Version Number:</strong> {{ compatibilityMessage.debugInfo.versionNumber }}</div>
                <div><strong>OS:</strong> {{ compatibilityMessage.debugInfo.os }}</div>
                <div><strong>Architecture:</strong> {{ compatibilityMessage.debugInfo.arch }}</div>
                <div><strong>Platform:</strong> {{ compatibilityMessage.debugInfo.platform }}</div>
                <div class="text-wrap"><strong>User Agent:</strong> {{ compatibilityMessage.debugInfo.userAgent }}</div>
              </div>
            </q-expansion-item>
          </q-banner>
        </div>

        <!-- Input Fields -->
        <div v-if="!isProcessing" class="cairo-inputs">
            <!-- Executable Input -->
            <div class="col-12 q-mb-md">
              <div class="input-section">
                <div class="input-header">
                  <q-icon name="description" size="sm" color="primary" class="q-mr-sm" />
                  <span class="text-subtitle2 text-weight-medium">Cairo Executable</span>
                </div>
                <q-input
                  v-model="cairoExecutable"
                  outlined
                  clearable
                  placeholder="Paste executable.json content or upload file"
                  type="textarea"
                  rows="4"
                  class="cairo-executable-input"
                  bg-color="grey-10"
                  color="primary"
                >
                  <template v-slot:append>
                    <q-btn
                      flat
                      round
                      dense
                      icon="upload_file"
                      color="primary"
                      @click="browseExecutableFile"
                      class="upload-btn"
                    >
                      <q-tooltip class="bg-primary">Upload executable.json file</q-tooltip>
                    </q-btn>
                  </template>
                </q-input>
                <input
                  type="file"
                  ref="executableFileUpload"
                  accept=".json"
                  @change="onExecutableFileUpload"
                  style="display: none;"
                />
              </div>
            </div>

            <!-- Program Inputs -->
            <div class="col-12">
              <div class="input-section">
                <div class="input-header">
                  <q-icon name="functions" size="sm" color="primary" class="q-mr-sm" />
                  <span class="text-subtitle2 text-weight-medium">Program Inputs</span>
                </div>
                <q-input
                  v-model="cairoInput"
                  outlined
                  clearable
                  placeholder="Enter comma-separated numbers (e.g., 123,456,789)"
                  bg-color="grey-10"
                  color="primary"
                  class="cairo-input-field"
                >
                  <template v-slot:hint>
                    <div class="text-caption text-grey-6">
                      <q-icon name="info" size="xs" class="q-mr-xs" />
                      Optional: Provide inputs if your Cairo program requires them
                    </div>
                  </template>
                </q-input>
              </div>
            </div>
        </div>

        <!-- Loading state for Cairo proving -->
        <div v-else class="cairo-loading-state">
          <div class="loading-content">
            <q-spinner-gears size="4rem" color="primary" class="q-mb-lg" />
            <div class="text-h6 text-white q-mb-sm">{{ loadingStatus }}</div>
            <div class="text-body2 text-grey-6">{{ loadingSubtext }}</div>
            <q-linear-progress
              indeterminate
              color="primary"
              class="q-mt-lg loading-progress"
            />
          </div>
        </div>
      </q-card-section>

      <!-- Action Buttons -->
      <q-card-actions v-if="!isProcessing" align="between" class="cairo-dialog-actions">
        <q-btn
          flat
          color="grey-6"
          @click="closeDialog"
          class="close-btn"
        >
          <q-icon name="close" class="q-mr-sm" />
          Close
        </q-btn>
        
        <q-btn
          unelevated
          color="primary"
          @click="unlockCairoToken"
          :disable="!cairoExecutable.trim() || compatibilityMessage.type !== 'success'"
          class="unlock-btn"
        >
          <q-icon name="lock_open" class="q-mr-sm" />
          Unlock Token
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent } from "vue";
import { useCairoStore } from "src/stores/cairo";
import { useReceiveTokensStore } from "src/stores/receiveTokensStore";
import {
  notifyError,
  notifySuccess,
} from "src/js/notify.ts";
import { getCairoCompatibilityMessage } from "src/js/browser-compatibility.js";

export default defineComponent({
  name: "CairoReceiveDialog",
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue"],
  data() {
    return {
      cairoExecutable: "",
      cairoInput: "",
      isProcessing: false,
      loadingStatus: "",
      loadingSubtext: "",
    };
  },
  computed: {
    show: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit("update:modelValue", value);
      },
    },
    compatibilityMessage() {
      return getCairoCompatibilityMessage();
    },
  },
  methods: {
    browseExecutableFile() {
      this.$refs.executableFileUpload.click();
    },
    onExecutableFileUpload() {
      const file = this.$refs.executableFileUpload.files[0];
      if (!file) return;

      if (!file.name.endsWith('.json')) {
        notifyError('Please select a JSON file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target.result;
          JSON.parse(content);
          this.cairoExecutable = content;
          notifySuccess('Executable file loaded successfully');
        } catch (error) {
          console.error('Invalid JSON file:', error);
          notifyError('Invalid JSON file. Please check the file format.');
        }
      };
      reader.readAsText(file);
    },
    async unlockCairoToken() {
      if (!this.cairoExecutable.trim()) {
        notifyError('Please provide the executable');
        return;
      }

      // Check browser compatibility
      if (this.compatibilityMessage.type !== 'success') {
        notifyError('Your browser is not compatible with the Cairo prover. Please check the compatibility requirements.');
        return;
      }

      // Parse the input string into bigint array
      const programInput = [];
      if (this.cairoInput.trim()) {
        const inputParts = this.cairoInput.split(",").map(part => part.trim());
        for (const part of inputParts) {
          if (part) {
            try {
              programInput.push(BigInt(part));
            } catch (error) {
              console.error("Invalid input number:", part);
              notifyError(`Invalid input number: ${part}`);
              return;
            }
          }
        }
      }

      const cairoStore = useCairoStore();
      const receiveTokensStore = useReceiveTokensStore();
      
      // Set processing state
      this.isProcessing = true;
      this.loadingStatus = "Executing...";
      this.loadingSubtext = "Running Cairo program with provided inputs";

      try {
        // Set the Cairo data
        cairoStore.setCairoReceiveData(
          this.cairoExecutable, 
          programInput, 
          cairoStore.cairoReceiveData.lockedToken
        );

        // Simulate proving phase
        await new Promise(resolve => setTimeout(resolve, 1500));
        this.loadingStatus = "Proving...";
        this.loadingSubtext = "Generating cryptographic proof of execution";
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Attempt to receive the token
        await receiveTokensStore.receiveToken(cairoStore.cairoReceiveData.lockedToken);
        
        notifySuccess('Cairo token unlocked successfully!');
        cairoStore.hideCairoReceiveDialog();
        this.show = false;
      } catch (error) {
        console.error('Cairo unlock failed:', error);
        notifyError('Failed to unlock Cairo token. Please check your executable and inputs.');
        this.isProcessing = false;
      }
    },
    closeDialog() {
      const cairoStore = useCairoStore();
      cairoStore.hideCairoReceiveDialog();
      this.show = false;
    },
    onDialogHide() {
      // Ensure the store state is synced when dialog is hidden
      const cairoStore = useCairoStore();
      cairoStore.hideCairoReceiveDialog();
    },
  },
  watch: {
    show(newValue) {
      if (newValue) {
        // Reset form when dialog opens
        this.cairoExecutable = "";
        this.cairoInput = "";
        this.isProcessing = false;
        this.loadingStatus = "";
        this.loadingSubtext = "";
      }
    },
  },
});
</script>

<style scoped>
.cairo-dialog-card {
  min-width: 500px;
  max-width: 600px;
  background: linear-gradient(135deg, #1e1e2e 0%, #2a2a3e 100%);
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.cairo-dialog-header {
  background: linear-gradient(135deg, #3b4cb8 0%, #5b6bc0 100%);
  border-radius: 16px 16px 0 0;
  padding: 20px 24px 16px 24px;
}

.compatibility-banner {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: none;
}

.debug-expansion {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.cairo-inputs {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  padding: 20px;
}

.input-section {
  margin-bottom: 24px;
}

.input-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  padding-left: 4px;
}

.cairo-executable-input, .cairo-input-field {
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
}

.cairo-executable-input :deep(.q-field__control) {
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
}

.cairo-input-field :deep(.q-field__control) {
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
}

.upload-btn {
  border-radius: 6px;
  transition: all 0.2s ease;
}

.upload-btn:hover {
  background: rgba(var(--q-primary), 0.2);
  transform: scale(1.05);
}

.cairo-loading-state {
  text-align: center;
  padding: 60px 40px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  margin: 20px 0;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.loading-progress {
  width: 200px;
  height: 6px;
  border-radius: 3px;
}

.cairo-dialog-actions {
  padding: 16px 24px 20px 24px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 0 0 16px 16px;
}

.close-btn {
  border-radius: 8px;
  padding: 8px 16px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.unlock-btn {
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(var(--q-primary), 0.3);
  transition: all 0.2s ease;
}

.unlock-btn:hover:not([disabled]) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(var(--q-primary), 0.4);
}

.unlock-btn[disabled] {
  opacity: 0.6;
  box-shadow: none;
}

@media (max-width: 600px) {
  .cairo-dialog-card {
    min-width: 90vw;
    max-width: 90vw;
    margin: 20px;
  }
  
  .cairo-inputs {
    padding: 16px;
  }
}
</style>
