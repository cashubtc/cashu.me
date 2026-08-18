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
                icon="visibility"
                color="primary"
                @click="toggleMnemonicVisibility"
              ></q-btn>
              <q-btn
                flat
                dense
                round
                icon="content_copy"
                color="primary"
                @click="copyText(mnemonic)"
              ></q-btn>
            </template>
          </q-input>
        </q-item-section>
      </q-item>
    </SettingsSection>

    <!-- restore -->
    <SettingsSection
      :title="$t('Settings.backup_restore.restore_ecash.title')"
      :caption="$t('Settings.backup_restore.restore_ecash.description')"
    >
      <q-item>
        <q-item-section>
          <q-item-label>{{
            $t("Settings.backup_restore.restore_ecash.title")
          }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn
            class="q-px-md"
            color="primary"
            size="sm"
            rounded
            outline
            to="/restore"
            >{{ $t("Settings.backup_restore.restore_ecash.button") }}</q-btn
          >
        </q-item-section>
      </q-item>
    </SettingsSection>
  </SettingsPageShell>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapState } from "pinia";
import { useWalletStore } from "src/stores/wallet";
import SettingsPageShell from "./SettingsPageShell.vue";
import SettingsSection from "./SettingsSection.vue";

export default defineComponent({
  name: "BackupRestoreSettings",
  mixins: [windowMixin],
  components: {
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
