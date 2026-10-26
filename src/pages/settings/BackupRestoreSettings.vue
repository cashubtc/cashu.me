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
            outlined
            readonly
            v-model="hiddenMnemonic"
            :label="$t('Settings.backup_restore.backup_seed.seed_phrase_label')"
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
              <q-btn
                flat
                dense
                round
                color="primary"
                data-testid="copy-seed"
                @click="copyText(mnemonic)"
                ><CopyIcon :size="20"
              /></q-btn>
            </template>
          </q-input>
        </q-item-section>
      </q-item>
    </SettingsSection>

    <!-- restore -->
    <SettingsSection
      :caption="$t('Settings.backup_restore.restore_ecash.description')"
    >
      <q-item clickable v-ripple to="/restore">
        <q-item-section>
          <q-item-label>{{
            $t("Settings.backup_restore.restore_ecash.title")
          }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon name="chevron_right" class="settings-menu-chevron" />
        </q-item-section>
      </q-item>
    </SettingsSection>
  </SettingsPageShell>
</template>

<script lang="ts">
import { Copy as CopyIcon, Eye as EyeIcon } from "lucide-vue-next";
import { defineComponent } from "vue";
import { mapState } from "pinia";
import { useWalletStore } from "src/stores/wallet";
import SettingsPageShell from "./SettingsPageShell.vue";
import SettingsSection from "./SettingsSection.vue";

export default defineComponent({
  name: "BackupRestoreSettings",
  mixins: [windowMixin],
  components: { CopyIcon, EyeIcon, SettingsPageShell, SettingsSection },
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
