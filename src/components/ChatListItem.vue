<template>
  <q-item clickable class="chat-list-item" @click="handleClick">
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
          <span :class="['text-subtitle1 ellipsis', { 'text-weight-bold': unread > 0 }]">
            {{ displayName }}
          </span>
          <span class="timestamp text-caption q-ml-auto">{{ timeAgo }}</span>
        </template>
        <template v-else>
          <q-skeleton type="text" width="60%" />
        </template>
      </div>
      <div :class="['text-caption ellipsis', { 'text-weight-bold': unread > 0 }]">
        <template v-if="loaded">{{ snippet }}</template>
        <template v-else><q-skeleton type="text" width="80%" /></template>
      </div>
    </q-item-section>

    <q-item-section side v-if="unread > 0">
      <q-badge color="primary" rounded>{{ unread }}</q-badge>
    </q-item-section>
  </q-item>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { formatDistanceToNow } from 'date-fns';

export default defineComponent({
  name: 'ChatListItem',
  props: {
    pubkey: { type: String, required: true },
    profile: { type: Object as () => any, default: () => ({}) },
    snippet: { type: String, default: '' },
    timestamp: { type: Number, default: 0 },
    unread: { type: Number, default: 0 },
  },
  emits: ['click'],
  setup(props, { emit }) {
    const displayName = computed(() => {
      const p = props.profile as any;
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

    const loaded = computed(() => {
      return Object.keys(props.profile || {}).length > 0;
    });

    const timeAgo = computed(() => {
      if (!props.timestamp) return '';
      return formatDistanceToNow(props.timestamp * 1000, { addSuffix: true });
    });

    const handleClick = () => {
      emit('click', props.pubkey);
    };

    return { displayName, initials, timeAgo, handleClick, loaded };
  },
});
</script>

<style scoped>
.chat-list-item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}
.placeholder {
  background: #9ca3af;
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
