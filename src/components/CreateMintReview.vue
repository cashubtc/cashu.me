<template>
  <q-card style="min-width: 360px; max-width: 640px; width: 100%">
    <q-card-section class="row items-center justify-between">
      <div class="row items-center">
        <q-icon name="rate_review" size="sm" color="primary" class="q-mr-sm" />
        <div class="text-h6">Review Mint</div>
      </div>
      <q-btn flat round dense icon="close" @click="$emit('close')" />
    </q-card-section>
    <q-separator />

    <q-card-section class="q-pt-sm">
      <div class="text-subtitle2 text-grey-6 q-mb-xs">{{ mintUrl }}</div>
      <div class="row items-center q-gutter-sm q-mb-md">
        <q-avatar v-if="mintInfo?.icon_url" size="28px">
          <q-img
            :src="mintInfo.icon_url"
            spinner-color="white"
            spinner-size="xs"
          />
        </q-avatar>
        <div class="text-body1">{{ mintInfo?.name || "Mint" }}</div>
      </div>

      <div class="q-mb-sm text-caption text-grey-6 row items-center">
        <q-avatar v-if="publisherPicture" size="24px" class="q-mr-xs">
          <q-img
            :src="publisherPicture"
            spinner-color="white"
            spinner-size="xs"
          />
        </q-avatar>
        <div>
          Publishing as:
          <span v-if="publisherName" class="text-white">{{
            publisherName
          }}</span>
          <span v-else class="monospace q-ml-xs">{{ displayPubkey }}</span>
        </div>
      </div>

      <div class="q-mt-sm">
        <div class="text-subtitle2 q-mb-xs">Rating</div>
        <q-rating
          v-model="rating"
          max="5"
          size="32px"
          color="amber"
          icon-half="star_half"
          icon="star"
          icon-selected="star"
        />
      </div>

      <div class="q-mt-md">
        <div class="text-subtitle2 q-mb-xs">Review (optional)</div>
        <q-input
          v-model="review"
          type="textarea"
          autogrow
          outlined
          :placeholder="'Share your experience'"
        />
      </div>
    </q-card-section>

    <q-separator />

    <q-card-actions align="right">
      <q-btn
        flat
        rounded
        class="q-px-md"
        label="Cancel"
        @click="$emit('close')"
      />
      <q-btn
        color="primary"
        :disable="!canPublish"
        :loading="submitting"
        @click="publishReview"
        rounded
        class="q-px-md publish-btn"
        style="min-width: 140px"
      >
        <span class="nowrap">Publish</span>
        <template v-slot:loading>
          <q-spinner-hourglass class="on-left" />
          <span class="nowrap">Publishing…</span>
        </template>
      </q-btn>
    </q-card-actions>
  </q-card>
</template>

<script lang="ts">
import { defineComponent, computed, ref, onMounted } from "vue";
import { useNostrStore } from "src/stores/nostr";
import NDK, { NDKEvent, NDKKind } from "@nostr-dev-kit/ndk";
import { notifyError, notifySuccess } from "src/js/notify";

export default defineComponent({
  name: "CreateMintReview",
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
    const publisherName = ref<string>("");
    const publisherPicture = ref<string>("");

    const displayPubkey = computed(() => {
      const pk = nostr.pubkey || nostr.seedSignerPublicKey || "";
      return pk ? `${pk.slice(0, 8)}…${pk.slice(-4)}` : "";
    });

    const canPublish = computed(
      () => rating.value >= 1 && rating.value <= 5 && !!props.mintUrl
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
        event.tags.push(["u", props.mintUrl, "cashu"]);
        const dIdentifier =
          (props.mintInfo as any)?.pubkey ||
          (props.mintInfo as any)?.mintPubkey ||
          "";
        if (dIdentifier) event.tags.push(["d", dIdentifier]);
        await event.sign(nostr.signer as any);
        if ((ndk as any).pool?.size === 0) ndk.connect();
        await event.publish();
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
      } catch {}
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
      canPublish,
      publishReview,
      displayPubkey,
      publisherName,
      publisherPicture,
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
