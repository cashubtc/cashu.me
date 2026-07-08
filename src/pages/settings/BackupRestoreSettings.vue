<template>
  <SettingsPageShell
    :title="$t('Settings.menu.backup.title')"
    :caption="$t('Settings.menu.backup.caption')"
  >
    <div class="q-py-sm q-px-xs text-left" on-left>
      <q-list padding>
        <q-item>
          <q-item-section>
            <q-item-label overline class="text-weight-bold">{{
              $t("Settings.backup_restore.backup_seed.title")
            }}</q-item-label>
            <q-item-label caption
              >{{ $t("Settings.backup_restore.backup_seed.description") }}
            </q-item-label>
            <div class="row q-pt-md">
              <div class="col-12">
                <q-input
                  outlined
                  readonly
                  v-model="hiddenMnemonic"
                  :label="
                    $t('Settings.backup_restore.backup_seed.seed_phrase_label')
                  "
                  class="seed-phrase"
                  autogrow
                >
                  <template v-slot:append>
                    <q-btn
                      flat
                      dense
                      icon="visibility"
                      color="primary"
                      class="cursor-pointer q-mt-md"
                      @click="toggleMnemonicVisibility"
                    ></q-btn>
                    <q-btn
                      flat
                      dense
                      icon="content_copy"
                      color="primary"
                      class="cursor-pointer q-mt-md"
                      @click="copyText(mnemonic)"
                    ></q-btn>
                  </template>
                </q-input>
              </div>
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <!-- restore -->
    <div class="q-py-sm q-px-xs text-left" on-left>
      <q-list padding>
        <q-item>
          <q-item-section>
            <q-item-label overline class="text-weight-bold">{{
              $t("Settings.backup_restore.restore_ecash.title")
            }}</q-item-label>
            <q-item-label caption>
              {{ $t("Settings.backup_restore.restore_ecash.description") }}
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-item>
          <q-btn
            class="q-ml-sm q-px-md"
            color="primary"
            size="sm"
            rounded
            outline
            to="/restore"
            >{{ $t("Settings.backup_restore.restore_ecash.button") }}</q-btn
          >
        </q-item>
      </q-list>
    </div>
  </SettingsPageShell>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapState } from "pinia";
import { useWalletStore } from "src/stores/wallet";
import SettingsPageShell from "./SettingsPageShell.vue";

export default defineComponent({
  name: "BackupRestoreSettings",
  mixins: [windowMixin],
  components: {
    SettingsPageShell,
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
