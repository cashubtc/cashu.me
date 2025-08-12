<template>
  <q-card-section class="q-gutter-md">
    <div class="text-h6 q-mb-sm">{{ $t("creatorHub.profileHeader") }}</div>
    <q-input
      v-model="display_nameLocal"
      label="Display Name"
      dense
      outlined
      :rules="[(v) => !!v || 'Required']"
    />
    <q-input
      v-model="pictureLocal"
      label="Profile Picture URL"
      dense
      outlined
      :rules="[urlRule]"
    />
    <q-img
      :src="pictureLocal"
      v-if="validUrl"
      class="q-mt-sm rounded-borders"
      ratio="1"
    />
    <q-input
      v-model="aboutLocal"
      label="About"
      type="textarea"
      autogrow
      dense
      outlined
    />
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
        <q-btn
          flat
          dense
          color="primary"
          label="Generate"
          @click="generateP2PK"
        />
      </div>
      <div v-if="profilePubLocal" class="text-caption q-mt-xs">
        {{ selectedKeyShort }}
      </div>
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
      :rules="[urlListRule]"
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
      :rules="[urlListRule]"
      hint="Press Enter after typing each URL"
    >
      <template #label>
        <div class="row items-center no-wrap">
          <span>Relays</span>
          <InfoTooltip
            class="q-ml-xs"
            text="Type a relay URL and press Enter"
          />
        </div>
      </template>
    </q-select>
  </q-card-section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import InfoTooltip from "./InfoTooltip.vue";
import { useCreatorProfileStore } from "stores/creatorProfile";
import { useP2PKStore } from "stores/p2pk";
import { shortenString } from "src/js/string-utils";

const profileStore = useCreatorProfileStore();
const p2pkStore = useP2PKStore();

const {
  display_name,
  picture,
  about,
  pubkey: profilePub,
  mints: profileMints,
  relays: profileRelays,
} = storeToRefs(profileStore);

const hasP2PK = computed(() => p2pkStore.p2pkKeys.length > 0);
const p2pkOptions = computed(() =>
  p2pkStore.p2pkKeys.map((k) => ({
    label: shortenString(k.publicKey, 16, 6),
    value: k.publicKey,
  }))
);
const selectedKeyShort = computed(() =>
  profilePub.value ? shortenString(profilePub.value, 16, 6) : ""
);

async function generateP2PK() {
  await p2pkStore.createAndSelectNewKey();
  if (p2pkStore.firstKey) {
    profilePub.value = p2pkStore.firstKey.publicKey;
  }
}

const display_nameLocal = computed({
  get: () => display_name.value,
  set: (val: string) => (display_name.value = val),
});
const pictureLocal = computed({
  get: () => picture.value,
  set: (val: string) => (picture.value = val),
});
const aboutLocal = computed({
  get: () => about.value,
  set: (val: string) => (about.value = val),
});
const profilePubLocal = computed({
  get: () => profilePub.value,
  set: (val: string | null) => (profilePub.value = val || ""),
});
const profileMintsLocal = computed({
  get: () => profileMints.value,
  set: (val: string[]) => (profileMints.value = val),
});
const profileRelaysLocal = computed({
  get: () => profileRelays.value,
  set: (val: string[]) => (profileRelays.value = val),
});

const validUrl = computed(() => /^https?:\/\/.+/.test(pictureLocal.value));
const urlRule = (val: string) => /^https?:\/\/.+/.test(val) || "Invalid URL";
const urlListRule = (val: string[]) =>
  val.every((u) => /^wss?:\/\//.test(u)) || "Invalid URL";
</script>
