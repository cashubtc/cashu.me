<template>
  <q-card class="q-pa-md q-mb-md qcard">
    <q-card-section class="row items-center no-wrap">
      <q-avatar v-if="creator.profile?.picture">
        <img :src="creator.profile.picture" />
      </q-avatar>
      <div class="q-ml-sm">
        <div class="text-subtitle1">
          {{
            creator.profile?.display_name ||
            creator.profile?.name ||
            creator.pubkey
          }}
        </div>
        <div class="text-caption">{{ creator.pubkey }}</div>
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
  </q-card>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { CreatorProfile } from "stores/creators";

export default defineComponent({
  name: "CreatorProfileCard",
  props: {
    creator: {
      type: Object as () => CreatorProfile,
      required: true,
    },
  },
  setup(props) {
    const MAX_LENGTH = 160;
    const truncatedAbout = computed(() => {
      const about = props.creator.profile?.about || "";
      return about.length > MAX_LENGTH
        ? about.slice(0, MAX_LENGTH) + "…"
        : about;
    });
    return {
      truncatedAbout,
    };
  },
});
</script>
