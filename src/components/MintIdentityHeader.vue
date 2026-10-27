<template>
  <!-- A mint's identity in its own tinted card, as in the original mint details design: the
       header of the mint details, reviews and write-a-review pages, so all three read as the
       same mint. The default slot holds page extras such as the QR toggle. -->
  <div class="mint-header">
    <q-avatar size="56px" class="q-mb-sm">
      <img v-if="info?.icon_url" :src="info.icon_url" alt="" />
      <LandmarkIcon v-else :size="36" :stroke-width="1.5" />
    </q-avatar>
    <div class="mint-name">{{ displayName }}</div>
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapState } from "pinia";
import { Landmark as LandmarkIcon } from "lucide-vue-next";
import { useMintsStore } from "src/stores/mints";

export default defineComponent({
  name: "MintIdentityHeader",
  components: { LandmarkIcon },
  props: {
    url: { type: String, required: true },
    info: { type: Object, required: false },
  },
  computed: {
    ...mapState(useMintsStore, ["mints"]),
    // The same name everywhere: the user's nickname, then the mint's own name, then its host.
    displayName(): string {
      const nickname = this.mints.find((m) => m.url === this.url)?.nickname;
      if (nickname) return nickname;
      if (this.info?.name) return this.info.name;
      try {
        return new URL(this.url).host;
      } catch {
        return this.url;
      }
    },
  },
});
</script>

<style scoped>
.mint-header {
  align-items: center;
  background-color: var(--app-tint);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 16px;
  width: 100%;
}

.mint-name {
  color: var(--app-text);
  font-size: 24px;
  font-weight: 600;
  line-height: 32px;
  overflow-wrap: anywhere;
  text-align: center;
}
</style>
