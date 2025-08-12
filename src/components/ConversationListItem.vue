<template>
  <q-item
    clickable
    class="conversation-item hover:bg-grey-2 dark:hover:bg-grey-8"
    :class="{ selected: props.selected }"
    :style="{
      borderLeft:
        '3px solid ' + (props.selected ? 'var(--q-primary)' : 'transparent'),
    }"
    @click="handleClick"
  >
    <q-item-section avatar>
      <q-avatar size="40px" class="relative-position">
        <template v-if="loaded && profile?.picture">
          <img :src="profile.picture" />
        </template>
        <template v-else-if="loaded">
          <div class="placeholder text-white text-body1">{{ initials }}</div>
        </template>
        <q-skeleton v-else type="circle" size="40px" />
        <q-badge
          class="status-dot"
          rounded
          :color="isOnline ? 'positive' : 'grey'"
        />
      </q-avatar>
    </q-item-section>

    <q-item-section class="q-hoverable name-section">
      <template v-if="loaded">
        <q-item-label
          class="text-subtitle1 ellipsis"
          :class="{ 'text-weight-bold': unreadCount > 0 }"
          :title="displayName"
        >
          <q-icon
            v-if="isPinned"
            name="star"
            size="xs"
            color="warning"
            class="q-mr-xs"
          />
          {{ displayName }}
        </q-item-label>
        <q-item-label
          v-if="secondaryName"
          caption
          class="text-grey ellipsis"
          :title="secondaryName"
        >
          {{ secondaryName }}
        </q-item-label>
      </template>
      <template v-else>
        <q-skeleton type="text" width="60%" />
      </template>
    </q-item-section>

    <q-item-section class="q-hoverable snippet-section">
      <q-item-label
        caption
        class="snippet ellipsis"
        :class="{ 'text-weight-bold': unreadCount > 0 }"
        :title="snippet.text"
      >
        <template v-if="loaded">
          <q-icon
            v-if="snippet.icon"
            :name="snippet.icon"
            size="xs"
            class="q-mr-xs"
          />
          {{ snippet.text }}
        </template>
        <template v-else><q-skeleton type="text" width="80%" /></template>
      </q-item-label>
    </q-item-section>

    <q-item-section side top class="timestamp-section text-right">
      <span class="timestamp text-caption">{{ timeAgo }}</span>
    </q-item-section>

    <q-item-section side class="items-center">
      <q-badge
        v-if="unreadCount > 0"
        color="primary"
        rounded
        class="q-mr-sm unread-badge"
        >{{ unreadCount }}</q-badge
      >
      <q-btn
        flat
        dense
        round
        size="sm"
        :icon="isPinned ? 'star' : 'star_outline'"
        @click.stop="togglePin"
      >
        <q-tooltip>{{ isPinned ? "Unpin" : "Pin" }}</q-tooltip>
      </q-btn>
      <q-btn
        flat
        dense
        round
        icon="more_vert"
        class="q-ml-sm"
        @click.stop="menu = true"
        aria-label="Conversation options"
      >
        <q-tooltip>Options</q-tooltip>
      </q-btn>
      <q-menu v-model="menu" anchor="bottom right" self="top right">
        <q-list style="min-width: 120px">
          <q-item clickable v-close-popup @click.stop="togglePin">
            <q-item-section avatar>
              <q-icon :name="isPinned ? 'star' : 'star_outline'" />
            </q-item-section>
            <q-item-section>
              {{ isPinned ? "Unpin" : "Pin" }}
            </q-item-section>
          </q-item>
          <q-item clickable v-close-popup @click.stop="showRaw = !showRaw">
            <q-item-section avatar>
              <q-icon name="vpn_key" />
            </q-item-section>
            <q-item-section>View Raw Key</q-item-section>
          </q-item>
          <q-item clickable v-close-popup @click.stop="deleteItem">
            <q-item-section avatar>
              <q-icon name="delete" />
            </q-item-section>
            <q-item-section>Delete</q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </q-item-section>
  </q-item>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { QBadge, QBtn } from "quasar";
import { useMessengerStore } from "src/stores/messenger";
import { useNostrStore } from "src/stores/nostr";
import { formatDistanceToNow } from "date-fns";
import { parseMessageSnippet } from "src/utils/message-snippet";

export default defineComponent({
  name: "ConversationListItem",
  components: { QBadge, QBtn },
  props: {
    pubkey: { type: String, required: true },
    lastMsg: { type: Object as () => any, default: () => ({}) },
    selected: { type: Boolean, default: false },
  },
  emits: ["click", "pin", "delete"],
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
    const alias = computed(() => messenger.aliases[props.pubkey]);
    const profileName = computed(() => {
      const p: any = profile.value;
      return (
        p?.name ||
        p?.displayName ||
        p?.display_name ||
        props.pubkey.slice(0, 8) + "…"
      );
    });
    const displayName = computed(() => alias.value || profileName.value);
    const showRaw = ref(false);
    const menu = ref(false);
    const secondaryName = computed(() => {
      if (!alias.value) return showRaw.value ? props.pubkey : "";
      return showRaw.value ? props.pubkey : profileName.value;
    });

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

    const snippet = computed(() =>
      parseMessageSnippet(props.lastMsg?.content || ""),
    );

    const handleClick = () => emit("click", nostr.resolvePubkey(props.pubkey));
    const togglePin = () => emit("pin", nostr.resolvePubkey(props.pubkey));
    const deleteItem = () => emit("delete", nostr.resolvePubkey(props.pubkey));

    return {
      profile,
      displayName,
      initials,
      timeAgo,
      snippet,
      handleClick,
      togglePin,
      deleteItem,
      loaded,
      unreadCount,
      showRaw,
      menu,
      secondaryName,
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
  padding: 10px 16px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
  display: flex;
  gap: 10px;
  border-left: 3px solid transparent;
}
.conversation-item.selected {
  background-color: color-mix(in srgb, var(--q-primary), transparent 92%);
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
  font-size: 0.75rem;
}
.snippet {
  font-size: 0.7rem;
  line-height: 1.2;
  white-space: normal;
}

.name-section {
  max-width: 40%;
}

.snippet-section {
  max-width: 35%;
}

.conversation-item .ellipsis {
  flex: 1;
  min-width: 0;
}

.drawer-collapsed .conversation-item .ellipsis {
  display: none;
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

.unread-badge {
  font-weight: bold;
  font-size: 0.75rem;
  padding: 0 6px;
  box-shadow:
    0 0 0 2px var(--q-color-white),
    0 2px 4px rgba(0, 0, 0, 0.15);
}

.timestamp-section {
  min-width: 56px;
  text-align: right;
}
</style>
