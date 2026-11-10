<template>
  <!-- A mint's identity in its own tinted card, as in the original mint details design: the
       header of the mint details, reviews and write-a-review pages, so all three read as the
       same mint. The default slot holds page extras such as the QR toggle. -->
  <!-- One centred header on all three pages. -->
  <div class="mint-header">
    <IconCircle
      size="lg"
      class="q-mb-sm"
      :src="info?.icon_url"
      :icon="MintIcon"
    />
    <div class="mint-header__text">
      <div class="mint-name">{{ displayName }}</div>
      <div v-if="host !== displayName" class="mint-host" dir="ltr">
        {{ host }}
      </div>
    </div>
    <slot />
  </div>
</template>

<script lang="ts">
import IconCircle from "src/components/ui/IconCircle.vue";
import { defineComponent } from "vue";
import { mapState } from "pinia";
import { Building2 as MintIcon } from "lucide-vue-next";
import { useMintsStore } from "src/stores/mints";
import { getShortUrl } from "src/js/wallet-helpers";

export default defineComponent({
  name: "MintIdentityHeader",
  components: { IconCircle },
  setup() {
    return { MintIcon };
  },
  props: {
    url: { type: String, required: true },
    info: { type: Object, required: false },
  },
  computed: {
    ...mapState(useMintsStore, ["mints"]),
    // The host with its path, so two mints on one host read apart.
    host(): string {
      return getShortUrl(this.url);
    },
    // The same name everywhere: the user's nickname, then the mint's own name, then its host.
    displayName(): string {
      const nickname = this.mints.find((m) => m.url === this.url)?.nickname;
      if (nickname) return nickname;
      if (this.info?.name) return this.info.name;
      return this.host;
    },
  },
});
</script>

<style scoped>
.mint-header {
  align-items: center;
  background-color: var(--app-tint);
  border-radius: var(--app-radius-lg);
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

.mint-host {
  color: var(--app-text-muted);
  font-size: 14px;
  margin-top: 2px;
}
.mint-header__text {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 0;
}
</style>
