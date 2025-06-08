<template>
  <q-item
    clickable
    class="conversation-item"
    @click="handleClick"
  >
    <q-item-section avatar>
      <q-avatar size="48px">
        <template v-if="loaded && profile?.picture">
          <img :src="profile.picture" />
        </template>
        <template v-else-if="loaded">
          <div class="placeholder text-white text-body1">{{ initials }}</div>
        </template>
        <q-skeleton v-else type="circle" size="48px" />
      </q-avatar>
    </q-item-section>

    <q-item-section class="full-width">
      <div class="row items-center no-wrap">
        <template v-if="loaded">
          <span
            :class="['text-subtitle1 ellipsis', { 'text-weight-bold': unreadCount > 0 }]"
            >{{ displayName }}</span
          >
          <span class="timestamp text-caption q-ml-auto">{{ timeAgo }}</span>
        </template>
        <template v-else>
          <q-skeleton type="text" width="60%" />
        </template>
      </div>
      <div :class="['text-caption ellipsis', { 'text-weight-bold': unreadCount > 0 }]">
        <template v-if="loaded">{{ snippet }}</template>
        <template v-else><q-skeleton type="text" width="80%" /></template>
      </div>
    </q-item-section>

    <q-item-section side v-if="unreadCount > 0">
      <q-badge color="primary" rounded>{{ unreadCount }}</q-badge>
    </q-item-section>
  </q-item>
</template>

<script lang="ts"> 
import { defineComponent, computed } from 'vue';
import { QBadge } from 'quasar';
import { useMessengerStore } from 'src/stores/messenger';
import { formatDistanceToNow } from 'date-fns';

export default defineComponent({
  name: 'ConversationListItem',
  components: { QBadge },
  props: {
    pubkey: { type: String, required: true },
    profile: { type: Object as () => any, default: () => ({}) },
    snippet: { type: String, default: '' },
    timestamp: { type: Number, default: 0 },
  },
  emits: ['click'],
  setup(props, { emit }) {
    const messenger = useMessengerStore();
    const unreadCount = computed(
      () => messenger.unreadCounts[props.pubkey] || 0
    );
    const displayName = computed(() => {
      const p: any = props.profile;
      return (
        p?.display_name ||
        p?.name ||
        props.pubkey.slice(0, 8) + '...' + props.pubkey.slice(-4)
      );
    });

    const initials = computed(() => {
      const name = displayName.value;
      const words = name.split(/\s+/).filter(Boolean);
      const letters = words.slice(0, 2).map((w) => w[0]);
      return letters.join('').toUpperCase();
    });

    // consider profile fetched once the key exists, even if it has no fields
    const loaded = computed(() => props.profile !== undefined);

    const timeAgo = computed(() => {
      if (!props.timestamp) return '';
      return formatDistanceToNow(props.timestamp * 1000, { addSuffix: true });
    });

    const handleClick = () => emit('click', props.pubkey);

    return {
      displayName,
      initials,
      timeAgo,
      handleClick,
      loaded,
      unreadCount,
    };
  }
});
</script>

<style scoped>
.conversation-item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
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
</style>

