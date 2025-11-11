<template>
  <div class="bg-dark text-white q-pa-md flex flex-center">
    <div class="review-page-content">
      <div class="review-content-container">
        <!-- Mint Header - Matching MintDetailsPage and MintRatingsPage style -->
        <div class="mint-header-container q-mb-lg">
          <div class="mint-header q-pa-md">
            <q-avatar size="56px" class="q-mb-sm">
              <img
                v-if="mintInfo?.icon_url"
                :src="mintInfo.icon_url"
                alt="Mint Profile"
              />
              <q-icon
                v-else
                name="account_balance"
                size="36px"
                color="grey-7"
              />
            </q-avatar>
            <div class="mint-name q-mb-xs">
              {{ mintInfo?.name || "Mint" }}
            </div>
            <div class="mint-url text-grey-6">
              {{ mintUrl }}
            </div>
          </div>
        </div>

        <!-- Rating Section -->
        <div class="rating-section q-mb-lg">
          <div class="section-card q-pa-lg">
            <div class="text-body1 text-grey-5 q-mb-md text-center">
              {{ $t("CreateMintReview.inputs.rating.label") }}
            </div>
            <div class="row justify-center">
              <q-rating
                v-model="rating"
                max="5"
                size="42px"
                color="amber"
                icon-half="star_half"
                icon="star"
                icon-selected="star"
                :disable="prefilling || submitting"
              />
            </div>
          </div>
        </div>

        <!-- Review Text Section -->
        <div class="review-text-section q-mb-lg">
          <div class="section-card q-pa-lg">
            <div class="text-body1 text-weight-medium q-mb-md">
              Write a public review (optional)
            </div>
            <q-input
              v-model="review"
              type="textarea"
              autogrow
              outlined
              placeholder="Share your experience with this mint..."
              :disable="prefilling || submitting"
              class="review-input"
              :input-style="{ minHeight: '120px' }"
            />
          </div>
        </div>

        <!-- Publishing Info -->
        <div class="publisher-info q-mb-lg text-center">
          <div class="row items-center justify-center text-caption text-grey-6">
            <q-avatar v-if="publisherPicture" size="20px" class="q-mr-xs">
              <q-img
                :src="publisherPicture"
                spinner-color="white"
                spinner-size="xs"
              />
            </q-avatar>
            <span>{{ $t("CreateMintReview.publishing_as") }}:</span>
            <span v-if="publisherName" class="text-white q-ml-xs">{{
              publisherName
            }}</span>
            <span class="monospace q-ml-xs">{{ shortDisplayNpub }}</span>
            <q-icon
              v-if="displayNpub"
              name="content_copy"
              size="14px"
              class="q-ml-xs cursor-pointer"
              @click="copyText(displayNpub)"
            />
          </div>
        </div>

        <!-- Submit Button -->
        <div class="submit-section">
          <q-btn
            color="primary"
            size="lg"
            rounded
            unelevated
            :disable="!canPublish || prefilling"
            :loading="submitting"
            @click="publishReview"
            class="full-width submit-btn"
            style="min-height: 56px; font-size: 1rem; font-weight: 600"
          >
            <span>{{ $t("CreateMintReview.actions.publish.label") }}</span>
            <template v-slot:loading>
              <q-spinner class="on-left" />
              <span>{{
                $t("CreateMintReview.actions.publish.in_progress")
              }}</span>
            </template>
          </q-btn>
        </div>
      </div>

      <q-inner-loading :showing="prefilling">
        <q-spinner size="32px" color="primary" />
      </q-inner-loading>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useNostrStore } from "src/stores/nostr";
import NDK, { NDKEvent, NDKKind } from "@nostr-dev-kit/ndk";
import { notifyError, notifySuccess } from "src/js/notify";
import { nip19 } from "nostr-tools";
import { useMintRecommendationsStore } from "src/stores/mintRecommendations";
import { useMintsStore } from "src/stores/mints";

export default defineComponent({
  name: "CreateMintReviewPage",
  setup() {
    const router = useRouter();
    const nostr = useNostrStore();
    const rating = ref<number>(0);
    const review = ref<string>("");
    const submitting = ref(false);
    const prefilling = ref(false);
    const publisherName = ref<string>("");
    const publisherPicture = ref<string>("");
    const mintUrl = ref<string>("");
    const mintInfo = ref<any>(null);

    const displayPubkey = computed(() => {
      const pk = nostr.pubkey || nostr.seedSignerPublicKey || "";
      return pk ? `${pk.slice(0, 8)}…${pk.slice(-4)}` : "";
    });

    const displayNpub = computed(() => {
      try {
        if (!nostr.pubkey) return "";
        return nip19.npubEncode(nostr.pubkey);
      } catch {
        return "";
      }
    });

    const shortDisplayNpub = computed(() => {
      const v = displayNpub.value;
      if (!v) return "";
      return `${v.slice(0, 12)}…${v.slice(-6)}`;
    });

    const canPublish = computed(
      () => rating.value >= 1 && rating.value <= 5 && !!mintUrl.value
    );

    const ensureNdk = async () => {
      if (!nostr.connected || !nostr.ndk) {
        nostr.initNdkReadOnly();
      }
    };

    const buildContent = () => {
      let content = "";
      if (rating.value) content += `[${rating.value}/5]`;
      if (review.value && review.value.trim().length > 0)
        content += ` ${review.value.trim()}`;
      return content;
    };

    const publishReview = async () => {
      if (!canPublish.value) return;
      submitting.value = true;
      try {
        await ensureNdk();
        if (!nostr.signer) {
          notifyError(
            "Please connect a Nostr account in Settings to publish a review."
          );
          return;
        }
        const ndk: NDK = nostr.ndk as any;
        const event = new NDKEvent(ndk);
        event.kind = 38000 as NDKKind;
        event.content = buildContent();
        event.tags = [];
        event.tags.push(["k", "38172"]);
        event.tags.push(["u", mintUrl.value, "cashu"]);
        const dIdentifier =
          (mintInfo.value as any)?.pubkey ||
          (mintInfo.value as any)?.mintPubkey ||
          "";
        if (dIdentifier) event.tags.push(["d", dIdentifier]);
        await event.sign(nostr.signer as any);
        if ((ndk as any).pool?.size === 0) ndk.connect();
        await event.publish();
        // Immediately update recommendations store so UI reflects our review
        try {
          const recs = useMintRecommendationsStore();
          // @ts-ignore NDKEvent
          recs.handleReviewEvent(event as any);
        } catch {}
        notifySuccess("Review published");
        router.back();
      } catch (e) {
        console.error(e);
        notifyError("Failed to publish review");
      } finally {
        submitting.value = false;
      }
    };

    const prefillExisting = async () => {
      try {
        prefilling.value = true;
        await ensureNdk();
        const ndk: NDK = nostr.ndk as any;
        if (!nostr.pubkey) return;
        const filter: any = {
          kinds: [38000 as NDKKind],
          authors: [nostr.pubkey],
          "#u": [mintUrl.value],
          "#k": ["38172"],
          limit: 1,
        };
        const events = await ndk.fetchEvents(filter);
        let latest: any = null;
        for (const ev of events) {
          if (!latest || (ev.created_at || 0) > (latest.created_at || 0))
            latest = ev;
        }
        if (latest) {
          const m = (latest.content || "").match(
            /\s*\[(\d)\s*\/\s*5\]\s*(.*)$/s
          );
          if (m) {
            const r = parseInt(m[1], 10);
            if (!isNaN(r)) rating.value = r;
            review.value = (m[2] || "").trim();
          } else {
            review.value = latest.content || "";
          }
        }
      } catch {
      } finally {
        prefilling.value = false;
      }
    };

    const loadPublisherProfile = async () => {
      try {
        await ensureNdk();
        const ndk: NDK = nostr.ndk as any;
        if (!nostr.pubkey) return;
        const user = ndk.getUser({ pubkey: nostr.pubkey });
        await user.fetchProfile();
        publisherName.value =
          (user.profile as any)?.name ||
          (user.profile as any)?.display_name ||
          "";
        publisherPicture.value =
          (user.profile as any)?.image || (user.profile as any)?.picture || "";
      } catch {}
    };

    const loadMintInfo = () => {
      // Try to get mint info from stores
      const recsStore = useMintRecommendationsStore();
      let info = recsStore.getHttpInfoForUrl(mintUrl.value);

      if (!info) {
        const mintsStore = useMintsStore();
        const mint = mintsStore.mints.find((m) => m.url === mintUrl.value);
        if (mint && mint.info) {
          info = mint.info;
        }
      }

      if (info) {
        mintInfo.value = info;
      }
    };

    onMounted(async () => {
      // Get mint URL from route query params
      const route = router.currentRoute.value;
      if (route.query.mintUrl) {
        mintUrl.value = route.query.mintUrl as string;
        loadMintInfo();
        await loadPublisherProfile();
        await prefillExisting();
      } else {
        // No mint URL, go back
        router.push("/");
      }
    });

    return {
      rating,
      review,
      submitting,
      prefilling,
      canPublish,
      publishReview,
      displayPubkey,
      displayNpub,
      shortDisplayNpub,
      publisherName,
      publisherPicture,
      mintUrl,
      mintInfo,
      copyText: (t: string) => {
        try {
          navigator.clipboard.writeText(t);
          notifySuccess("Copied to clipboard");
        } catch {}
      },
    };
  },
});
</script>

<style scoped>
.review-page-content {
  max-width: 640px;
  margin: 0 auto;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  position: absolute;
  top: 0;
}

.review-content-container {
  max-width: 640px;
  margin: 0 auto;
  padding: 0 16px;
  position: relative;
}

/* Mint Header - Matching MintDetailsPage and MintRatingsPage exactly */
.mint-header-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-top: 50px;
}

.mint-header {
  width: 100%;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.05);
}

.mint-name {
  font-size: 24px;
  font-weight: 600;
  text-align: center;
  color: white;
}

.mint-url {
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  word-break: break-all;
}

/* Section Cards */
.section-card {
  background-color: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.rating-section,
.review-text-section {
  width: 100%;
}

/* Review Input - Less rounded, more elegant */
.review-input :deep(.q-field__control) {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.review-input :deep(.q-field__control-container) {
  border-radius: 8px;
}

.review-input :deep(.q-field__native) {
  color: white;
}

/* Publisher Info */
.publisher-info {
  opacity: 0.8;
}

.monospace {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    "Liberation Mono", "Courier New", monospace;
}

/* Submit Button */
.submit-section {
  width: 100%;
  padding-bottom: 32px;
}

.submit-btn {
  text-transform: none;
}
</style>
