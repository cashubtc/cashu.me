<template>
  <q-card class="q-pa-md q-mb-md qcard creator-card shadow-2 rounded-borders">
    <q-card-section class="row items-center no-wrap">
      <q-avatar
        v-if="creator.profile?.picture"
        size="56px"
        class="creator-avatar"
      >
        <img :src="creator.profile.picture" alt="Creator image" />
      </q-avatar>
      <div class="q-ml-sm">
        <div class="text-subtitle1 ellipsis">
          {{
            creator.profile?.display_name ||
            creator.profile?.name ||
            shortPubkey
          }}
        </div>
        <div class="text-caption">{{ shortPubkey }}</div>
      </div>
    </q-card-section>
    <q-card-section v-if="creator.profile?.about">
      <div>{{ truncatedAbout }}</div>
    </q-card-section>
    <q-card-section v-if="creator.profile?.lud16">
      <div class="row items-center">
        <q-icon name="bolt" size="xs" class="q-mr-xs" />
        <span>{{ creator.profile.lud16 }}</span>
      </div>
    </q-card-section>
    <q-card-section class="text-caption" v-if="creator.followers !== undefined">
      {{ $t('FindCreators.labels.followers') }}: {{ creator.followers }} |
      {{ $t('FindCreators.labels.following') }}: {{ creator.following }}
    </q-card-section>
    <q-card-section class="text-caption" v-if="joinedDateFormatted">
      {{ $t('FindCreators.labels.joined') }}: {{ joinedDateFormatted }}
    </q-card-section>
    <q-card-actions align="right">
      <q-btn color="primary" flat @click="$emit('donate', creator)">
        {{ $t('FindCreators.actions.donate.label') }}
      </q-btn>
      <q-btn color="primary" flat @click="$emit('message', creator)">
        {{ $t('FindCreators.actions.message.label') }}
      </q-btn>
    </q-card-actions>
  </q-card>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { CreatorProfile } from "stores/creators";
import { date } from "quasar";

export default defineComponent({
  name: "CreatorProfileCard",
  props: {
    creator: {
      type: Object as () => CreatorProfile,
      required: true,
    },
  },
  emits: ["donate", "message"],
  setup(props) {
    const MAX_LENGTH = 160;
    const shortPubkey = computed(() =>
      props.creator.pubkey.length > 16
        ? `${props.creator.pubkey.slice(0, 8)}…${props.creator.pubkey.slice(-8)}`
        : props.creator.pubkey,
    );
    const truncatedAbout = computed(() => {
      const about = props.creator.profile?.about || "";
      return about.length > MAX_LENGTH
        ? about.slice(0, MAX_LENGTH) + "…"
        : about;
    });
    const joinedDateFormatted = computed(() => {
      if (!props.creator.joined) return "";
      return date.formatDate(
        new Date(props.creator.joined * 1000),
        "YYYY-MM-DD"
      );
    });
    return {
      truncatedAbout,
      joinedDateFormatted,
      shortPubkey,
    };
  },
});
</script>

<style scoped>
.creator-avatar {
  border: 2px solid var(--q-primary);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.creator-avatar img {
  object-fit: cover;
}
.creator-card.qcard {
  width: 100%;
  max-width: 280px;
  border-radius: 8px;
}
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
