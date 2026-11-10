<template>
  <SettingsPageShell
    :title="$t('Settings.menu.backup.title')"
    :caption="$t('Settings.menu.backup.caption')"
  >
    <!-- seed phrase -->
    <SettingsSection
      flat
      :title="$t('Settings.backup_restore.backup_seed.title')"
      :caption="$t('Settings.backup_restore.backup_seed.description')"
    >
      <SeedPhraseField
        :mnemonic="mnemonic"
        :label="$t('Settings.backup_restore.backup_seed.seed_phrase_label')"
      />
    </SettingsSection>

    <!-- restore -->
    <SettingsSection>
      <SettingsActionRow
        to="/restore"
        label-class="text-weight-regular"
        :label="$t('Settings.backup_restore.restore_ecash.title')"
        :caption="$t('Settings.backup_restore.restore_ecash.description')"
      />
    </SettingsSection>
  </SettingsPageShell>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapState } from "pinia";
import { useWalletStore } from "src/stores/wallet";
import SettingsPageShell from "./SettingsPageShell.vue";
import SettingsSection from "./SettingsSection.vue";
import SeedPhraseField from "src/components/ui/SeedPhraseField.vue";
import SettingsActionRow from "src/components/ui/SettingsActionRow.vue";

export default defineComponent({
  name: "BackupRestoreSettings",
  mixins: [windowMixin],
  components: {
    SeedPhraseField,
    SettingsActionRow,
    SettingsPageShell,
    SettingsSection,
  },
  computed: {
    ...mapState(useWalletStore, ["mnemonic"]),
  },
});
</script>
