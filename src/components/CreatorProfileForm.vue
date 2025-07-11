<template>
  <div class="q-gutter-md">
    <q-input v-model="display_nameLocal" label="Display Name" dense outlined />
    <q-input v-model="pictureLocal" label="Profile Picture URL" dense outlined />
    <q-input v-model="aboutLocal" label="About" type="textarea" autogrow dense outlined />
    <div>
      <q-select
        v-if="hasP2PK"
        v-model="profilePubLocal"
        filled
        dense
        map-options
        emit-value
        :options="p2pkOptions"
        use-input
        fill-input
        input-debounce="0"
        label="P2PK Public Key"
      >
        <template #append>
          <q-btn flat dense icon="add" @click="generateP2PK" />
        </template>
        <template #after-options>
          <q-item clickable @click="generateP2PK">
            <q-item-section>Generate new key</q-item-section>
          </q-item>
        </template>
      </q-select>
      <div v-else class="row items-center q-gutter-sm">
        <div class="text-caption">You don't have a P2PK Public key.</div>
        <q-btn flat dense color="primary" label="Generate" @click="generateP2PK" />
      </div>
      <div v-if="profilePubLocal" class="text-caption q-mt-xs">{{ selectedKeyShort }}</div>
    </div>
    <q-select
      v-model="profileMintsLocal"
      multiple
      use-input
      use-chips
      hide-dropdown-icon
      new-value-mode="add-unique"
      :options="[]"
      dense
      outlined
      persistent-hint
      hint="Press Enter after typing each URL"
    >
      <template #label>
        <div class="row items-center no-wrap">
          <span>Trusted Mints</span>
          <InfoTooltip class="q-ml-xs" text="Type a mint URL and press Enter" />
        </div>
      </template>
    </q-select>
    <q-select
      v-model="profileRelaysLocal"
      multiple
      use-input
      use-chips
      hide-dropdown-icon
      new-value-mode="add-unique"
      :options="[]"
      dense
      outlined
      persistent-hint
      hint="Press Enter after typing each URL"
    >
      <template #label>
        <div class="row items-center no-wrap">
          <span>Relays</span>
          <InfoTooltip class="q-ml-xs" text="Type a relay URL and press Enter" />
        </div>
      </template>
    </q-select>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import InfoTooltip from './InfoTooltip.vue';

const props = defineProps<{
  display_name: string;
  picture: string;
  about: string;
  profilePub: string | null;
  profileMints: string[];
  profileRelays: string[];
  hasP2PK: boolean;
  p2pkOptions: any[];
  selectedKeyShort: string;
  generateP2PK: () => void;
}>();

const emit = defineEmits<{
  (e: 'update:display_name', val: string): void;
  (e: 'update:picture', val: string): void;
  (e: 'update:about', val: string): void;
  (e: 'update:profilePub', val: string | null): void;
  (e: 'update:profileMints', val: string[]): void;
  (e: 'update:profileRelays', val: string[]): void;
}>();

const display_nameLocal = computed({
  get: () => props.display_name,
  set: (val: string) => emit('update:display_name', val),
});
const pictureLocal = computed({
  get: () => props.picture,
  set: (val: string) => emit('update:picture', val),
});
const aboutLocal = computed({
  get: () => props.about,
  set: (val: string) => emit('update:about', val),
});
const profilePubLocal = computed({
  get: () => props.profilePub,
  set: (val: string | null) => emit('update:profilePub', val),
});
const profileMintsLocal = computed({
  get: () => props.profileMints,
  set: (val: string[]) => emit('update:profileMints', val),
});
const profileRelaysLocal = computed({
  get: () => props.profileRelays,
  set: (val: string[]) => emit('update:profileRelays', val),
});
</script>

