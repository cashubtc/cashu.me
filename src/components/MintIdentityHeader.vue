<template>
  <!-- A mint's identity as one compact row (icon, name, host): the header of the reviews page
       and of the write-a-review page, so both read as the same mint. -->
  <div class="mint-header row items-center no-wrap">
    <q-avatar size="44px" class="mint-header__avatar">
      <img v-if="info?.icon_url" :src="info.icon_url" alt="" />
      <LandmarkIcon v-else :size="24" class="text-app-muted mint-glyph" />
    </q-avatar>
    <div class="mint-header__text">
      <div class="mint-name ellipsis">{{ info?.name || host }}</div>
      <div v-if="info?.name" class="mint-url">
        <bdi dir="ltr">{{ host }}</bdi>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Landmark as LandmarkIcon } from "lucide-vue-next";

export default defineComponent({
  name: "MintIdentityHeader",
  components: { LandmarkIcon },
  props: {
    url: { type: String, required: true },
    info: { type: Object, required: false },
  },
  computed: {
    host(): string {
      return this.url.replace(/^https?:\/\//, "");
    },
  },
});
</script>

<style scoped>
.mint-header {
  gap: 12px;
}

.mint-header__avatar {
  background: var(--app-tint-strong);
  flex: none;
}

.mint-header__text {
  min-width: 0;
}

.mint-name {
  font-size: 18px;
  font-weight: 600;
  line-height: 24px;
  text-align: start;
  color: var(--app-text);
}

.mint-url {
  color: var(--app-text-muted);
  font-size: 13px;
  line-height: 18px;
  text-align: start;
  word-break: break-all;
}
</style>
