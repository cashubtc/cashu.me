<template>
  <SettingsPageShell
    :title="$t('Settings.menu.backup.title')"
    :caption="$t('Settings.menu.backup.caption')"
  >
    <!-- seed phrase -->
    <SettingsSection
      :title="$t('Settings.backup_restore.backup_seed.title')"
      :caption="$t('Settings.backup_restore.backup_seed.description')"
    >
      <q-item class="settings-control-item">
        <q-item-section>
          <q-input
            readonly
            v-model="hiddenMnemonic"
            :label="$t('Settings.backup_restore.backup_seed.seed_phrase_label')"
            :input-style="{ direction: 'ltr', textAlign: 'left' }"
            autogrow
          >
            <template v-slot:append>
              <q-btn
                flat
                dense
                round
                color="primary"
                data-testid="reveal-seed"
                @click="toggleMnemonicVisibility"
                ><EyeIcon :size="20"
              /></q-btn>
              <CopyButton
                :value="mnemonic"
                color="primary"
                size="md"
                data-testid="copy-seed"
              />
            </template>
          </q-input>
        </q-item-section>
      </q-item>
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
import { Eye as EyeIcon } from "lucide-vue-next";
import { defineComponent } from "vue";
import { mapState } from "pinia";
import { useWalletStore } from "src/stores/wallet";
import SettingsPageShell from "./SettingsPageShell.vue";
import SettingsSection from "./SettingsSection.vue";
import CopyButton from "src/components/ui/CopyButton.vue";
import SettingsActionRow from "src/components/ui/SettingsActionRow.vue";

export default defineComponent({
  name: "BackupRestoreSettings",
  mixins: [windowMixin],
  components: {
    CopyButton,
    EyeIcon,
    SettingsActionRow,
    SettingsPageShell,
    SettingsSection,
  },
  data: function () {
    return {
      hideMnemonic: true,
    };
  },
  computed: {
    ...mapState(useWalletStore, ["mnemonic"]),
    hiddenMnemonic() {
      if (this.hideMnemonic) {
        return this.mnemonic
          .split(" ")
          .map((w) => "*".repeat(6))
          .join(" ");
      } else {
        return this.mnemonic;
      }
    },
  },
  methods: {
    toggleMnemonicVisibility: function () {
      this.hideMnemonic = !this.hideMnemonic;
    },
  },
});
</script>
