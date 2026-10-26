<template>
  <div class="bg-dark text-white q-pa-md flex flex-center">
    <div class="page-content q-px-md">
      <div class="section-header q-mb-md">
        <div class="divider-line"></div>
        <div class="divider-text">{{ $t("MintSettings.discover.title") }}</div>
        <div class="divider-line"></div>
      </div>
      <MintDiscovery :autoDiscover="true" :allowCreateReview="false" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import MintDiscovery from "src/components/MintDiscovery.vue";

export default defineComponent({
  name: "MintDiscoveryPage",
  components: { MintDiscovery },
});
</script>

<style scoped>
.page-content {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.section-header {
  display: flex;
  align-items: center;
  width: 100%;
}
</style>
