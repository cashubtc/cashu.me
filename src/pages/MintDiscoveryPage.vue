<template>
  <SettingsPageShell
    :title="$t('MintSettings.discover.title')"
    :caption="$t('MintSettings.discover.caption')"
  >
    <MintDiscovery :autoDiscover="true" :allowCreateReview="false" />
  </SettingsPageShell>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import MintDiscovery from "src/components/MintDiscovery.vue";
import SettingsPageShell from "src/pages/settings/SettingsPageShell.vue";

export default defineComponent({
  name: "MintDiscoveryPage",
  components: { MintDiscovery, SettingsPageShell },
});
</script>
