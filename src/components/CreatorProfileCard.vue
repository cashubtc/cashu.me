<template>
  <q-card ref="card" class="q-pa-md q-mb-md qcard creator-card shadow-2 rounded-borders">
    <q-card-section class="row items-center no-wrap">
      <q-avatar size="56px" class="creator-avatar">
        <template v-if="loaded">
          <img
            v-if="profile?.picture"
            :src="profile.picture"
            alt="Creator image"
          />
          <div v-else class="placeholder-avatar text-white flex flex-center">
            {{ initials }}
          </div>
        </template>
        <q-skeleton v-else type="circle" size="56px" />
      </q-avatar>
      <div class="q-ml-sm">
        <div class="text-subtitle1 ellipsis">
          {{
            profile?.display_name ||
            profile?.name ||
            shortPubkey
          }}
        </div>
        <div class="text-caption ellipsis">{{ shortPubkey }}</div>
      </div>
    </q-card-section>
    <q-card-section>
      <template v-if="loaded && profile?.about">
        <div class="truncated-text">{{ truncatedAbout }}</div>
      </template>
      <template v-else-if="!loaded">
        <q-skeleton type="text" width="90%" class="q-mb-xs" />
        <q-skeleton type="text" width="80%" />
      </template>
    </q-card-section>
    <q-card-section v-if="profile?.lud16">
      <div class="row items-center">
        <q-icon name="bolt" size="xs" class="q-mr-xs" />
        <span>{{ profile.lud16 }}</span>
      </div>
    </q-card-section>
    <q-card-section class="text-caption">
      <template v-if="loaded">
        {{ $t("FindCreators.labels.view_profile_stats") }}
      </template>
      <template v-else>
        <q-skeleton type="text" width="60%" />
      </template>
    </q-card-section>
    <q-card-section class="text-caption">
      <template v-if="loaded && joinedDateFormatted">
        {{ $t("FindCreators.labels.joined") }}: {{ joinedDateFormatted }}
      </template>
      <template v-else-if="!loaded">
        <q-skeleton type="text" width="40%" />
      </template>
    </q-card-section>
    <q-card-actions class="q-mt-sm">
      <q-btn color="primary" unelevated class="full-width" :to="profileLink">
        <q-icon name="chevron_right" size="16px" class="q-mr-xs" />
        {{ $t("FindCreators.actions.view_profile.label") }}
      </q-btn>
    </q-card-actions>
    <q-card-actions align="right" class="q-gutter-sm">
      <q-btn color="primary" flat @click="$emit('donate', creator)">
        {{ $t("FindCreators.actions.donate.label") }}
      </q-btn>
      <q-btn color="primary" flat @click="$emit('message', creator)">
        {{ $t("FindCreators.actions.message.label") }}
      </q-btn>
    </q-card-actions>
  </q-card>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  ref,
  onMounted,
  onBeforeUnmount,
} from "vue";
import { CreatorProfile } from "stores/creators";
import { date } from "quasar";
import { useNostrStore } from "stores/nostr";

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
    const nostr = useNostrStore();
    const MAX_LENGTH = 160;
    const loaded = ref(!!props.creator.profile);
    const card = ref<HTMLElement | null>(null);
    let observer: IntersectionObserver | null = null;

    const profile = ref(props.creator.profile);
    const followers = ref(props.creator.followers);
    const following = ref(props.creator.following);
    const joined = ref(props.creator.joined);

    const loadProfile = async () => {
      if (loaded.value) return;
      try {
        const [profileData, followersCount, followingCount, joinedDate] =
          await Promise.all([
            nostr.getProfile(props.creator.pubkey),
            nostr.fetchFollowerCount(props.creator.pubkey),
            nostr.fetchFollowingCount(props.creator.pubkey),
            nostr.fetchJoinDate(props.creator.pubkey),
          ]);
        profile.value = profileData;
        followers.value = followersCount;
        following.value = followingCount;
        joined.value = joinedDate;
        loaded.value = true;
      } catch (e) {
        console.error(e);
      }
    };

    onMounted(() => {
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadProfile();
            observer && observer.disconnect();
          }
        });
      }, { threshold: 0.1 });
      if (card.value) observer.observe(card.value);
    });

    onBeforeUnmount(() => {
      observer && observer.disconnect();
    });
    const shortPubkey = computed(() =>
      props.creator.pubkey.length > 16
        ? `${props.creator.pubkey.slice(0, 8)}…${props.creator.pubkey.slice(-8)}`
        : props.creator.pubkey,
    );
    const initials = computed(() => {
      const name =
        profile.value?.display_name ||
        profile.value?.name ||
        "";
      if (!name) return "?";
      return name
        .split(" ")
        .map((p) => p.charAt(0))
        .join("")
        .slice(0, 2)
        .toUpperCase();
    });
    const profileLink = computed(() => `/creators/${props.creator.pubkey}`);
    const truncatedAbout = computed(() => {
      const about = profile.value?.about || "";
      return about.length > MAX_LENGTH
        ? about.slice(0, MAX_LENGTH) + "…"
        : about;
    });
    const joinedDateFormatted = computed(() => {
      if (joined.value === null || joined.value === undefined) {
        return "";
      }
      return date.formatDate(
        new Date(joined.value * 1000),
        "YYYY-MM-DD",
      );
    });
    return {
      truncatedAbout,
      joinedDateFormatted,
      shortPubkey,
      profileLink,
      profile,
      followers,
      following,
      joined,
      initials,
      loaded,
      card,
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
  overflow: hidden;
}
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.placeholder-avatar {
  background: #9ca3af;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}
.truncated-text {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
</style>
