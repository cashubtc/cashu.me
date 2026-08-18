<template>
  <SettingsPageShell
    :title="$t('Settings.backup_restore.restore_ecash.title')"
    :caption="$t('Settings.backup_restore.restore_ecash.description')"
  >
    <RestoreView />
  </SettingsPageShell>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import RestoreView from "components/RestoreView.vue";
import SettingsPageShell from "src/pages/settings/SettingsPageShell.vue";

export default defineComponent({
  name: "RestorePage",
  components: {
    RestoreView,
    SettingsPageShell,
  },
});
</script>
