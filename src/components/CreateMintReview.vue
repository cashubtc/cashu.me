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

      <div class="q-mb-sm text-caption text-grey-6">
        Publishing as: <span class="monospace">{{ displayPubkey }}</span>
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
      <q-btn flat label="Cancel" @click="$emit('close')" />
      <q-btn
        color="primary"
        :disable="!canPublish"
        :loading="submitting"
        @click="publishReview"
      >
        Publish
        <template v-slot:loading>
          <q-spinner-hourglass class="on-left" /> Publishing…
        </template>
      </q-btn>
    </q-card-actions>
  </q-card>
</template>

<script lang="ts">
import { defineComponent, computed, ref, watch } from "vue";
import { useNostrStore } from "src/stores/nostr";
import NDK, { NDKEvent, NDKKind, NostrEvent } from "@nostr-dev-kit/ndk";

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

    const displayPubkey = computed(() => {
      const pk = nostr.pubkey || nostr.seedSignerPublicKey || "";
      return pk ? `${pk.slice(0, 8)}…${pk.slice(-4)}` : "";
    });

    const canPublish = computed(
      () => rating.value >= 1 && rating.value <= 5 && !!props.mintUrl
    );

    const ensureSigner = async () => {
      if (!nostr.initialized) {
        await nostr.initSigner();
      }
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
        await ensureSigner();
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
        await event.sign();
        ndk.connect();
        await event.publish();
        emit("published");
        emit("close");
      } catch (e) {
        console.error(e);
      } finally {
        submitting.value = false;
      }
    };

    return {
      rating,
      review,
      submitting,
      canPublish,
      publishReview,
      displayPubkey,
    };
  },
});
</script>

<style scoped>
.monospace {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    "Liberation Mono", "Courier New", monospace;
}
</style>
