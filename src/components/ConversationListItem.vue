<template>
  <q-item
    clickable
    class="conversation-item"
    :class="{ selected: props.selected }"
    @click="handleClick"
  >
    <q-item-section avatar>
      <q-avatar size="48px" class="relative-position">
        <template v-if="loaded && profile?.picture">
          <img :src="profile.picture" />
        </template>
        <template v-else-if="loaded">
          <div class="placeholder text-white text-body1">{{ initials }}</div>
        </template>
        <q-skeleton v-else type="circle" size="48px" />
        <q-badge
          class="status-dot"
          rounded
          :color="isOnline ? 'positive' : 'grey'"
        />
      </q-avatar>
    </q-item-section>

    <q-item-section class="full-width">
      <div class="row items-center no-wrap">
        <template v-if="loaded">
          <span
            :class="[
              'text-subtitle1 ellipsis',
              { 'text-weight-bold': unreadCount > 0 },
            ]"
            >{{ showRaw ? props.pubkey : displayName }}</span
          >
          <span class="timestamp text-caption q-ml-auto">{{ timeAgo }}</span>
          <q-btn
            flat
            dense
            round
            icon="visibility"
            class="q-ml-xs"
            @click.stop="showRaw = !showRaw"
            aria-label="Toggle pubkey"
          />
        </template>
        <template v-else>
          <q-skeleton type="text" width="60%" />
        </template>
      </div>
      <div
        :class="[
          'text-caption ellipsis',
          { 'text-weight-bold': unreadCount > 0 },
        ]"
      >
        <template v-if="loaded">{{ snippet }}</template>
        <template v-else><q-skeleton type="text" width="80%" /></template>
      </div>
    </q-item-section>

    <q-item-section side>
      <q-badge v-if="unreadCount > 0" color="primary" rounded class="q-mr-sm">{{
        unreadCount
      }}</q-badge>
      <q-btn
        flat
        dense
        round
        size="sm"
        :icon="isPinned ? 'star' : 'star_outline'"
        @click.stop="togglePin"
      />
    </q-item-section>
  </q-item>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { QBadge, QBtn } from "quasar";
import { useMessengerStore } from "src/stores/messenger";
import { useNostrStore } from "src/stores/nostr";
import { formatDistanceToNow } from "date-fns";

export default defineComponent({
  name: "ConversationListItem",
  components: { QBadge, QBtn },
  props: {
    pubkey: { type: String, required: true },
    lastMsg: { type: Object as () => any, default: () => ({}) },
    selected: { type: Boolean, default: false },
  },
  emits: ["click", "pin"],
  setup(props, { emit }) {
    const messenger = useMessengerStore();
    const nostr = useNostrStore();
    const isOnline = computed(() => messenger.connected);
    const isPinned = computed(() => messenger.pinned[props.pubkey]);
    const unreadCount = computed(
      () => messenger.unreadCounts[props.pubkey] || 0,
    );
    const profile = computed(() => {
      const entry: any = (nostr.profiles as any)[props.pubkey];
      return entry?.profile ?? entry ?? {};
    });
    const displayName = computed(() => {
      const p: any = profile.value;
      return (
        p?.name ||
        p?.displayName ||
        p?.display_name ||
        props.pubkey.slice(0, 8) + "…"
      );
    });
    const showRaw = ref(false);

    const initials = computed(() => {
      const name = displayName.value;
      const words = name.split(/\s+/).filter(Boolean);
      const letters = words.slice(0, 2).map((w) => w[0]);
      return letters.join("").toUpperCase();
    });

    // consider profile fetched once the key exists, even if it has no fields
    const loaded = computed(() => profile.value !== undefined);

    const timeAgo = computed(() => {
      const ts = props.lastMsg?.created_at;
      if (!ts) return "";
      return formatDistanceToNow(ts * 1000, { addSuffix: true });
    });

    const snippet = computed(() => props.lastMsg?.content?.slice(0, 30) || "");

    const handleClick = () => emit("click", props.pubkey);
    const togglePin = () => emit("pin", props.pubkey);

    return {
      profile,
      displayName,
      initials,
      timeAgo,
      snippet,
      handleClick,
      togglePin,
      loaded,
      unreadCount,
      showRaw,
      isOnline,
      isPinned,
      props,
    };
  },
});
</script>

<style scoped>
.conversation-item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}
.conversation-item.selected {
  background: rgba(0, 0, 0, 0.05);
}
.conversation-item:hover {
  background: rgba(0, 0, 0, 0.03);
}
.conversation-item:focus {
  border-left: 2px solid var(--q-primary);
}
.placeholder {
  background: var(--divider-color);
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.timestamp {
  white-space: nowrap;
}
.status-dot {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid var(--q-color-white);
}
</style>
