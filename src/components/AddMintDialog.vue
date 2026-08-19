<template>
  <BottomSheet
    v-model="showAddMintDialogLocal"
    :title="$t('AddMintDialog.title')"
    @enter="addMintLocal"
  >
    <div class="q-px-lg">
      <!--
        Status messages are stacked in the same grid cell, so the stack is
        always as tall as the tallest message and the sheet never resizes
        when the state swaps (description / already added / error).
      -->
      <div class="message-stack q-mb-lg">
        <p
          class="message sheet-added"
          :class="{ active: messageState === 'added' }"
          :aria-hidden="messageState !== 'added'"
        >
          <q-icon
            name="check_circle"
            color="positive"
            size="18px"
            class="q-mr-xs message-icon"
          />
          {{ $t("wallet.mint.notifications.already_added") }}
        </p>
        <p
          class="message sheet-error"
          :class="{ active: messageState === 'error' }"
          :aria-hidden="messageState !== 'error'"
        >
          <q-icon
            name="error_outline"
            color="negative"
            size="18px"
            class="q-mr-xs message-icon"
          />
          {{ $t("AddMintDialog.unreachable_error_text") }}
        </p>
        <p
          class="message"
          :class="{ active: messageState === 'description' }"
          :aria-hidden="messageState !== 'description'"
        >
          <span class="message-muted">{{
            $t("AddMintDialog.description")
          }}</span>
        </p>
      </div>

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
        <div class="detail-item">
          <div class="detail-label">
            <info-icon size="20" color="#9E9E9E" class="detail-icon" />
            <div class="detail-name">
              {{ $t("AddMintDialog.audit_info.label") }}
            </div>
          </div>
          <div
            class="detail-value audit-toggle"
            @click="showAuditInfo = !showAuditInfo"
          >
            {{
              showAuditInfo
                ? $t("AddMintDialog.audit_info.actions.hide.label")
                : $t("AddMintDialog.audit_info.actions.show.label")
            }}
          </div>
        </div>

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

    <template #actions>
      <q-btn
        class="full-width"
        unelevated
        size="lg"
        color="primary"
        rounded
        data-testid="confirm-add-mint"
        @click="addMintLocal"
        v-close-popup
        :loading="addMintBlocking"
        :disable="addMintDisabled"
      >
        {{ $t("AddMintDialog.actions.add_mint.label") }}
        <template v-slot:loading>
          <q-spinner class="q-mr-sm" />
          <span>{{ $t("AddMintDialog.actions.add_mint.in_progress") }}</span>
        </template>
      </q-btn>
    </template>
  </BottomSheet>
</template>

<script lang="ts">
import { defineComponent, computed, ref, watch } from "vue";
import { useMintsStore } from "src/stores/mints";
import { useMintRecommendationsStore } from "src/stores/mintRecommendations";
import { getShortUrl } from "src/js/wallet-helpers";
import BottomSheet from "./BottomSheet.vue";
import MintAuditInfo from "./MintAuditInfo.vue";
import MintInfoContainer from "./MintInfoContainer.vue";
import { Info as InfoIcon } from "lucide-vue-next";

export default defineComponent({
  name: "AddMintDialog",
  components: {
    BottomSheet,
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
    const mintsStore = useMintsStore();
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
      // Guard against Enter-key submits while the add button is disabled
      if (addMintDisabled.value) return;
      emit("add", props.addMintData, true); // Pass verbose = true
    };

    const mintUrl = computed(() => props.addMintData.url);

    // Mirrors the exact-match duplicate check in the mints store
    const mintAlreadyAdded = computed(() =>
      mintsStore.mints.some((m) => m.url === mintUrl.value)
    );

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
    // Which status message is shown in the stacked message area
    const messageState = computed(() =>
      mintAlreadyAdded.value
        ? "added"
        : mintInfoError.value
        ? "error"
        : "description"
    );
    const addMintDisabled = computed(
      // Gate on the resolved preview, not just the absence of loading:
      // there is a brief "idle" window between the sheet opening and the
      // watcher kicking off the fetch, and a click landing in it races the
      // probe (the button flips state mid-click and the close/add handlers
      // can be dropped).
      () =>
        props.addMintBlocking ||
        mintAlreadyAdded.value ||
        mintFetchState.value !== "ok"
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
      mintAlreadyAdded,
      messageState,
      addMintDisabled,
      showAuditInfo,
    };
  },
});
</script>

<style scoped>
/* All status messages occupy the same grid cell, so the stack's height is
   always the height of the tallest message: the sheet never resizes when
   the visible message changes. Inactive messages cross-fade out. */
.message-stack {
  display: grid;
}

.message {
  grid-area: 1 / 1;
  margin: 0;
  font-size: 15px;
  line-height: 1.5;
  font-weight: 400;
  font-family: "Inter", sans-serif;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.25s ease, visibility 0s linear 0.25s;
}

.message.active {
  opacity: 1;
  visibility: visible;
  transition: opacity 0.25s ease;
}

/* Muted look via a child span so it multiplies with the fade opacity */
.message-muted {
  opacity: 0.7;
}

.sheet-error {
  color: var(--q-negative);
  font-weight: 500;
}

.sheet-added {
  color: var(--q-positive);
  font-weight: 500;
}

.message-icon {
  vertical-align: -3px;
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

/* Audit info row (styled like the detail rows on the mint details page) */
.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.detail-label {
  display: flex;
  align-items: center;
}

.detail-icon {
  margin-right: 10px;
}

.detail-name {
  font-size: 16px;
  font-weight: 600;
  color: #9e9e9e;
}

.detail-value {
  font-size: 16px;
  font-weight: 600;
  text-align: right;
}

.audit-toggle {
  cursor: pointer;
  user-select: none;
}
</style>
