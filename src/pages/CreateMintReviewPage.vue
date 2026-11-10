<template>
  <SettingsPageShell :title="$t('CreateMintReview.title')">
    <!-- The same mint header as the reviews page. -->
    <MintIdentityHeader
      v-if="mintUrl"
      :url="mintUrl"
      :info="mintInfo"
      class="q-mb-lg"
    />
    <div class="review-form">
      <!-- One container level: the label, stars and text box sit straight on the page (the outlined text box inside a bordered card read as a box in a box). -->
      <div>
        <SectionDivider
          align="start"
          :label="$t('CreateMintReview.inputs.rating.label')"
        />
        <AppRating
          v-model="rating"
          :size="32"
          :label="$t('CreateMintReview.inputs.rating.label')"
          class="q-mb-md"
          :disable="prefilling || submitting"
        />
        <!-- Says why Publish is off until there is a rating. -->
        <div v-if="!rating" class="review-rating-hint">
          {{ $t("CreateMintReview.inputs.rating.hint") }}
        </div>
        <!-- The outlined field carries its own label, which stays visible with content. -->
        <q-input
          v-model="review"
          type="textarea"
          autogrow
          outlined
          :label="$t('CreateMintReview.inputs.review.label')"
          :disable="prefilling || submitting"
          class="review-input"
          :input-style="{ minHeight: '72px' }"
        />
      </div>

      <div
        class="publisher-info row items-center no-wrap q-mt-md text-body2 text-app-muted"
      >
        <q-avatar v-if="publisherPicture" size="20px" class="q-mr-xs">
          <q-img
            :src="publisherPicture"
            spinner-color="white"
            spinner-size="xs"
          />
        </q-avatar>
        <span>{{ $t("CreateMintReview.publishing_as") }}</span>
        <span v-if="publisherName" class="publisher-name q-ml-xs">{{
          publisherName
        }}</span>
        <span class="q-ml-xs ellipsis">{{ shortDisplayNpub }}</span>
        <CopyButton
          v-if="displayNpub"
          class="publisher-copy"
          :value="displayNpub"
        />
      </div>

      <q-btn
        color="primary"
        rounded
        unelevated
        :disable="!canPublish || prefilling"
        :loading="submitting"
        @click="publishReview"
        class="full-width submit-btn q-mt-lg"
      >
        <span>{{ $t("CreateMintReview.actions.publish.label") }}</span>
        <template #loading
          ><BusyLabel
            ><span>{{
              $t("CreateMintReview.actions.publish.in_progress")
            }}</span></BusyLabel
          ></template
        >
      </q-btn>

      <q-inner-loading :showing="prefilling">
        <PendingDots size="32px" />
      </q-inner-loading>
    </div>
  </SettingsPageShell>
</template>

<script lang="ts">
import BusyLabel from "src/components/ui/BusyLabel.vue";
import PendingDots from "src/components/ui/PendingDots.vue";
import CopyButton from "src/components/ui/CopyButton.vue";
import { defineComponent, computed, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useNostrStore } from "src/stores/nostr";
import NDK, { NDKEvent, NDKKind } from "@nostr-dev-kit/ndk";
import { notifyError, notifySuccess } from "src/js/notify";
import { i18n } from "src/boot/i18n";
import { nip19 } from "nostr-tools";
import { useMintRecommendationsStore } from "src/stores/mintRecommendations";
import { useMintsStore } from "src/stores/mints";
import SettingsPageShell from "src/pages/settings/SettingsPageShell.vue";
import AppRating from "src/components/ui/AppRating.vue";
import SectionDivider from "src/components/ui/SectionDivider.vue";
import MintIdentityHeader from "src/components/MintIdentityHeader.vue";

export default defineComponent({
  name: "CreateMintReviewPage",
  components: {
    BusyLabel,
    PendingDots,
    AppRating,
    SectionDivider,
    CopyButton,
    SettingsPageShell,
    MintIdentityHeader,
  },
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
          notifyError(i18n.global.t("CreateMintReview.connect_nostr"));
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
        notifySuccess(i18n.global.t("CreateMintReview.published"));
        router.back();
      } catch (e) {
        console.error(e);
        notifyError(i18n.global.t("CreateMintReview.publish_failed"));
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
    };
  },
});
</script>

<style scoped>
.review-form {
  position: relative;
}

/* The name reads in ink beside the muted caption, in both modes. */
.publisher-name {
  color: var(--app-text);
}

/* A 44px copy target that doesn't push the caption line taller. */
.publisher-copy {
  height: 44px;
  margin-block: -12px;
  width: 44px;
}

.review-input :deep(.q-field__native) {
  color: var(--app-text);
}
.review-rating-hint {
  color: var(--app-text-muted);
  font-size: 14px;
  line-height: 20px;
  margin: -8px 0 24px;
}
</style>
