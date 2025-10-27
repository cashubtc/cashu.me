<template>
  <q-card style="min-width: 360px; max-width: 640px; width: 100%">
    <q-card-section class="row items-center justify-between">
      <div class="row items-center">
        <div class="text-h6">{{ $t("CreateMintReview.title") }}</div>
      </div>
      <q-btn flat round dense icon="close" @click="$emit('close')" />
    </q-card-section>
    <q-separator />

    <q-card-section class="q-pt-sm">
      <div class="row items-center q-mb-md">
        <MintInfoContainer
          :iconUrl="mintInfo?.icon_url"
          :name="mintInfo?.name"
          :url="mintUrl"
        />
      </div>

      <div class="q-my-sm text-caption text-grey-6 row items-center">
        <q-avatar v-if="publisherPicture" size="24px" class="q-mr-xs">
          <q-img
            :src="publisherPicture"
            spinner-color="white"
            spinner-size="xs"
          />
        </q-avatar>
        <div class="row items-center">
          <span>{{ $t("CreateMintReview.publishing_as") }}:</span>
          <span v-if="publisherName" class="text-white q-ml-xs">{{
            publisherName
          }}</span>
          <span class="monospace q-ml-xs">{{ shortDisplayNpub }}</span>
          <q-icon
            v-if="displayNpub"
            name="content_copy"
            size="16px"
            class="q-ml-xs cursor-pointer"
            @click="copyText(displayNpub)"
          />
        </div>
      </div>

      <div class="q-mt-sm">
        <div class="text-subtitle2 q-mb-xs">
          {{ $t("CreateMintReview.inputs.rating.label") }}
        </div>
        <q-rating
          v-model="rating"
          max="5"
          size="32px"
          color="amber"
          icon-half="star_half"
          icon="star"
          icon-selected="star"
          :disable="prefilling || submitting"
        />
      </div>

      <div class="q-mt-md">
        <div class="text-subtitle2 q-mb-xs">
          {{ $t("CreateMintReview.inputs.review.label") }}
        </div>
        <q-input
          v-model="review"
          type="textarea"
          autogrow
          outlined
          :placeholder="'Share your experience'"
          :disable="prefilling || submitting"
        />
      </div>
    </q-card-section>

    <q-separator />

    <q-card-actions align="right">
      <q-btn
        flat
        rounded
        class="q-px-md"
        :label="$t('global.actions.cancel.label')"
        @click="$emit('close')"
      />
      <q-btn
        color="primary"
        :disable="!canPublish || prefilling"
        :loading="submitting"
        @click="publishReview"
        rounded
        class="q-px-md publish-btn"
        style="min-width: 140px"
      >
        <span class="nowrap">{{
          $t("CreateMintReview.actions.publish.label")
        }}</span>
        <template v-slot:loading>
          <q-spinner-hourglass class="on-left" />
          <span class="nowrap">{{
            $t("CreateMintReview.actions.publish.in_progress")
          }}</span>
        </template>
      </q-btn>
    </q-card-actions>
    <q-inner-loading :showing="prefilling">
      <q-spinner-hourglass size="32px" />
    </q-inner-loading>
  </q-card>
</template>

<script lang="ts">
import { defineComponent, computed, ref, onMounted } from "vue";
import { useNostrStore } from "src/stores/nostr";
import NDK, { NDKEvent, NDKKind } from "@nostr-dev-kit/ndk";
import { notifyError, notifySuccess } from "src/js/notify";
import { nip19 } from "nostr-tools";
import { useMintRecommendationsStore } from "src/stores/mintRecommendations";
import MintInfoContainer from "./MintInfoContainer.vue";

export default defineComponent({
  name: "CreateMintReview",
  components: { MintInfoContainer },
  props: {
    mintUrl: { type: String, required: true },
    mintInfo: { type: Object, required: false },
  },
  emits: ["close", "published"],
  setup(props, { emit }) {
    const nostr = useNostrStore();
    const rating = ref<number>(0);
    const review = ref<string>("");
    const submitting = ref(false);
    const prefilling = ref(false);
    const publisherName = ref<string>("");
    const publisherPicture = ref<string>("");

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
      () => rating.value >= 1 && rating.value <= 5 && !!props.mintUrl,
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
            "Please connect a Nostr account in Settings to publish a review.",
          );
          return;
        }
        const ndk: NDK = nostr.ndk as any;
        const event = new NDKEvent(ndk);
        event.kind = 38000 as NDKKind;
        event.content = buildContent();
        event.tags = [];
        event.tags.push(["k", "38172"]);
        event.tags.push(["u", props.mintUrl, "cashu"]);
        const dIdentifier =
          (props.mintInfo as any)?.pubkey ||
          (props.mintInfo as any)?.mintPubkey ||
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
          // No full rebuild here; handleReviewEvent performs targeted upserts
        } catch {}
        notifySuccess("Review published");
        emit("published");
        emit("close");
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
          "#u": [props.mintUrl],
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
            /\s*\[(\d)\s*\/\s*5\]\s*(.*)$/s,
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

    onMounted(async () => {
      await loadPublisherProfile();
      await prefillExisting();
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
.monospace {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    "Liberation Mono", "Courier New", monospace;
}
.nowrap {
  white-space: nowrap;
}
.publish-btn .q-btn__content {
  white-space: nowrap;
}
</style>
