<template>
  <q-card flat bordered class="q-mb-md creator-search-card">
    <q-card-section class="row items-center">
      <q-avatar size="48px" class="bg-grey-4 text-dark">
        <img v-if="profile.picture" :src="profile.picture" @error="onError" />
        <span v-else>{{ fallbackLetter }}</span>
      </q-avatar>
      <div class="q-ml-md" style="flex:1">
        <div class="text-subtitle1">
          {{ profile.name || (profile.nip05 ? profile.nip05.split('@')[0] : 'Unnamed User') }}
        </div>
        <div v-if="profile.nip05" class="text-caption">{{ profile.nip05 }}</div>
        <div v-if="profile.about" class="text-caption">{{ truncatedAbout }}</div>
      </div>
    </q-card-section>
    <q-card-actions align="left" class="q-gutter-sm">
      <q-btn flat dense size="sm" color="primary" @click="$emit('view', profile.pubkey)">
        {{ $t('FindCreators.actions.view_profile.label') }}
      </q-btn>
      <q-btn flat dense size="sm" color="primary" @click="$emit('message', profile.pubkey)">
        {{ $t('FindCreators.actions.message.label') }}
      </q-btn>
      <q-btn flat dense size="sm" color="primary" @click="$emit('donate', profile.pubkey)">
        {{ $t('FindCreators.actions.donate.label') }}
      </q-btn>
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Profile {
  pubkey: string;
  name?: string;
  nip05?: string;
  picture?: string;
  about?: string;
}

const props = defineProps<{ profile: Profile }>();
const emit = defineEmits(['view','message','donate']);

function onError(ev: Event) {
  (ev.target as HTMLImageElement).style.display = 'none';
}

const fallbackLetter = computed(() => (props.profile.name || 'N')[0]?.toUpperCase());
const truncatedAbout = computed(() => props.profile.about && props.profile.about.length > 120 ? props.profile.about.slice(0, 117) + '...' : props.profile.about);
</script>

<style scoped>
.creator-search-card:hover .q-card-actions{
  opacity: 1;
}
.q-card-actions{opacity:0;transition: opacity 0.3s;}
</style>
