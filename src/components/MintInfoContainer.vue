<template>
  <div class="row items-center">
    <q-avatar v-if="iconUrl" :size="avatarSize" class="q-mr-sm">
      <q-img
        :src="iconUrl"
        spinner-color="white"
        spinner-size="xs"
        :style="`height: ${avatarSize}; max-width: ${avatarSize}; font-size: 12px;`"
      >
        <template v-slot:error>
          <div
            class="row items-center justify-center"
            style="height: 100%; width: 100%; padding: 0px"
          >
            <q-icon
              name="account_balance"
              color="grey-7"
              :size="fallbackIconSize"
            />
          </div>
        </template>
      </q-img>
    </q-avatar>

    <div class="mint-info-container">
      <div v-if="name" class="mint-name">{{ name }}</div>
      <div class="text-grey-6 mint-url">{{ url }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "MintInfoContainer",
  props: {
    url: { type: String, required: true },
    name: { type: String, required: false },
    iconUrl: { type: String, required: false },
    avatarSize: { type: String, default: "34px" },
  },
  computed: {
    fallbackIconSize(): string {
      // pick a slightly smaller icon inside the avatar
      const n = parseInt(String(this.avatarSize).replace(/px$/, "")) || 34;
      return Math.max(16, Math.floor(n * 0.6)) + "px";
    },
  },
});
</script>

<style scoped></style>
