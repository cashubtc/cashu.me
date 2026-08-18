<template>
  <q-dialog
    v-model="showAddMintDialogLocal"
    position="bottom"
    backdrop-filter="blur(4px) brightness(50%)"
    transition-show="slide-up"
    transition-hide="slide-down"
    @keydown.enter.prevent="addMintLocal"
  >
    <q-card class="add-mint-sheet" :class="isDark ? 'bg-dark' : 'bg-white'">
      <!-- Drag handle -->
      <div class="sheet-handle-container">
        <div class="sheet-handle" />
      </div>

      <!-- Header Section -->
      <div class="sheet-header q-px-lg">
        <h4 class="sheet-title q-my-none">
          {{ $t("AddMintDialog.title") }}
        </h4>
        <q-btn flat round dense icon="close" class="close-btn" v-close-popup />
      </div>

      <!-- Scrollable Content Section -->
      <div class="sheet-content q-px-lg scroll">
        <transition name="fade-slide" mode="out-in">
          <p
            v-if="mintInfoError"
            key="error"
            class="sheet-description sheet-error q-mb-lg"
          >
            <q-icon
              name="error_outline"
              color="negative"
              size="18px"
              class="q-mr-xs sheet-error-icon"
            />
            {{ $t("AddMintDialog.unreachable_error_text") }}
          </p>
          <p v-else key="description" class="sheet-description q-mb-lg">
            {{ $t("AddMintDialog.description") }}
          </p>
        </transition>

        <!-- Mint preview pill -->
        <div class="mint-preview-pill q-mb-lg">
          <MintInfoContainer
            :url="mintUrl"
            :name="mintDisplayName"
            :iconUrl="mintIconUrl"
            :loading="mintInfoLoading"
            avatarSize="48px"
          />
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
      </div>

      <!-- Fixed Action Buttons Section -->
      <div class="sheet-actions q-px-lg">
        <q-btn flat class="cancel-btn" v-close-popup>
          {{ $t("AddMintDialog.actions.cancel.label") }}
        </q-btn>
        <q-btn
          color="primary"
          class="add-btn"
          data-testid="confirm-add-mint"
          @click="addMintLocal"
          v-close-popup
          :loading="addMintBlocking"
          :disable="addMintDisabled"
          icon="check"
        >
          {{ $t("AddMintDialog.actions.add_mint.label") }}
          <template v-slot:loading>
            <q-spinner />
            {{ $t("AddMintDialog.actions.add_mint.in_progress") }}
          </template>
        </q-btn>
      </div>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, computed, ref, watch } from "vue";
import { useQuasar } from "quasar";
import { useSettingsStore } from "src/stores/settings";
import { useMintRecommendationsStore } from "src/stores/mintRecommendations";
import { getShortUrl } from "src/js/wallet-helpers";
import MintAuditInfo from "./MintAuditInfo.vue";
import MintInfoContainer from "./MintInfoContainer.vue";
import { Info as InfoIcon } from "lucide-vue-next";

export default defineComponent({
  name: "AddMintDialog",
  components: {
    MintAuditInfo,
    MintInfoContainer,
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
    const $q = useQuasar();
    const settings = useSettingsStore();
    const mintRecommendations = useMintRecommendationsStore();
    const showAuditInfo = ref(false);
    // "idle" | "loading" | "ok" | "error"
    const mintFetchState = ref("idle");
    const MINT_INFO_TIMEOUT_MS = 8000;

    const showAddMintDialogLocal = computed({
      get: () => props.showAddMintDialog,
      set: (value) => emit("update:showAddMintDialog", value),
    });

    const addMintLocal = () => {
      emit("add", props.addMintData, true); // Pass verbose = true
    };

    const mintUrl = computed(() => props.addMintData.url);

    const mintHttpInfo = computed(() => {
      if (!mintUrl.value) return undefined;
      return mintRecommendations.getHttpInfoForUrl(mintUrl.value);
    });

    const mintDisplayName = computed(() => {
      return (
        props.addMintData.nickname ||
        mintHttpInfo.value?.name ||
        (mintUrl.value ? getShortUrl(mintUrl.value) : "")
      );
    });

    const mintIconUrl = computed(
      () => mintHttpInfo.value?.icon_url || undefined
    );

    const mintInfoLoading = computed(() => mintFetchState.value === "loading");
    const mintInfoError = computed(() => mintFetchState.value === "error");
    const addMintDisabled = computed(
      () =>
        props.addMintBlocking || mintInfoLoading.value || mintInfoError.value
    );

    // Fetch the mint's info (name, icon) when the sheet opens so the user
    // sees a rich preview instead of a bare URL. If the mint cannot be
    // reached, we show an error and disable the add button.
    const fetchMintPreview = async (url: string) => {
      if (!url) {
        mintFetchState.value = "idle";
        return;
      }
      if (mintRecommendations.hasHttpInfo(url)) {
        mintFetchState.value = "ok";
        return;
      }
      mintFetchState.value = "loading";
      const timeout = new Promise((resolve) =>
        setTimeout(() => resolve("timeout"), MINT_INFO_TIMEOUT_MS)
      );
      const fetch = mintRecommendations
        .requestMintHttpInfo(url, MINT_INFO_TIMEOUT_MS)
        .then(() => "done")
        .catch(() => "done");
      await Promise.race([fetch, timeout]);
      // Bail out if the sheet was closed or the URL changed meanwhile;
      // the watcher on mintHttpInfo still flips the state if the info
      // arrives late.
      if (mintUrl.value !== url || !showAddMintDialogLocal.value) return;
      mintFetchState.value = mintRecommendations.hasHttpInfo(url)
        ? "ok"
        : "error";
    };

    // Fire on every open and URL change — and immediately on mount, because
    // the sheet can be mounted *after* the open flag was set (deep link and
    // QR scan flows set the store state before the sheet's host mounts).
    watch(
      [showAddMintDialogLocal, mintUrl],
      ([isOpen, url]) => {
        if (isOpen && url) {
          showAuditInfo.value = false;
          mintFetchState.value = "idle";
          fetchMintPreview(url);
        }
      },
      { immediate: true }
    );

    // If the mint info arrives late (e.g. the fetch outlived our local
    // timeout), recover from the error/loading state automatically.
    watch(mintHttpInfo, (info) => {
      if (info && showAddMintDialogLocal.value) {
        mintFetchState.value = "ok";
      }
    });

    return {
      addMintLocal,
      showAddMintDialogLocal,
      mintUrl,
      mintDisplayName,
      mintIconUrl,
      mintInfoLoading,
      mintInfoError,
      addMintDisabled,
      settings,
      showAuditInfo,
      isDark: computed(() => $q.dark.isActive),
    };
  },
});
</script>

<style scoped>
.add-mint-sheet {
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  border-radius: 20px 20px 0 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding-bottom: env(safe-area-inset-bottom);
}

/* Drag handle */
.sheet-handle-container {
  display: flex;
  justify-content: center;
  padding-top: 10px;
  padding-bottom: 4px;
  flex-shrink: 0;
}

.sheet-handle {
  width: 40px;
  height: 4px;
  border-radius: 2px;
  background-color: rgba(128, 128, 128, 0.4);
}

/* Header */
.sheet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
  padding-bottom: 16px;
  flex-shrink: 0;
}

.sheet-title {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.5px;
  font-family: "Inter", sans-serif;
}

.close-btn {
  opacity: 0.7;
}

/* Content */
.sheet-content {
  padding-top: 0;
  flex: 1;
  overflow-y: auto;
}

.sheet-description {
  font-size: 15px;
  line-height: 1.5;
  font-weight: 400;
  margin-top: 0;
  opacity: 0.7;
  font-family: "Inter", sans-serif;
}

.sheet-error {
  opacity: 1;
  color: var(--q-negative);
  font-weight: 500;
}

.sheet-error-icon {
  vertical-align: -3px;
}

/* Smooth swap between description and unreachable-mint error */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(-6px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

/* Mint preview pill (styled like the mint selector pill, but static) */
.mint-preview-pill {
  width: 100%;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid rgba(128, 128, 128, 0.25);
  background-color: rgba(128, 128, 128, 0.08);
}

.body--dark .mint-preview-pill {
  border-color: rgba(255, 255, 255, 0.1);
  background-color: rgba(255, 255, 255, 0.05);
}

.body--light .mint-preview-pill {
  border-color: rgba(0, 0, 0, 0.12);
  background-color: rgba(0, 0, 0, 0.03);
}

.mint-preview-pill :deep(.q-avatar) {
  margin-right: 16px !important;
}

/* Audit info */
.audit-info-btn {
  font-family: "Inter", sans-serif;
}

/* Action buttons */
.sheet-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
  padding-bottom: 16px;
  flex-shrink: 0;
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
