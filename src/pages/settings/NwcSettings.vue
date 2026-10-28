<template>
  <SettingsPageShell
    :title="$t('Settings.menu.nwc.title')"
    :caption="$t('Settings.menu.nwc.caption')"
  >
    <SettingsSection>
      <SettingsToggleRow
        v-model="enableNwc"
        :label="$t('Settings.nostr_wallet_connect.enable_toggle')"
        :caption="$t('Settings.nostr_wallet_connect.description')"
      />
      <template v-if="enableNwc">
        <q-item class="q-pt-none">
          <q-item-section>
            <q-item-label caption>{{
              $t("Settings.nostr_wallet_connect.payments_note")
            }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item
          v-for="connection in connections"
          :key="getConnectionString(connection)"
          class="settings-control-item"
        >
          <q-item-section>
            <q-input
              type="number"
              outlined
              v-model="connection.allowanceLeft"
              :label="
                $t('Settings.nostr_wallet_connect.connection.allowance_label')
              "
            >
            </q-input>
          </q-item-section>
          <q-item-section side>
            <div class="row items-center no-wrap q-gutter-sm">
              <CopyButton
                :value="getConnectionString(connection)"
                :icon-size="18"
                :tooltip="
                  $t('Settings.nostr_wallet_connect.connection.copy_tooltip')
                "
              />
              <IconButton
                :label="
                  $t('Settings.nostr_wallet_connect.connection.qr_tooltip')
                "
                tooltip
                @click="showNWCEntry(connection)"
              >
                <QrCodeIcon :size="20" />
              </IconButton>
            </div>
          </q-item-section>
        </q-item>
      </template>
    </SettingsSection>

    <!-- NWC DIALOG -->
    <NWCDialog v-model="showNWCDialog" />
  </SettingsPageShell>
</template>

<script lang="ts">
import IconButton from "src/components/ui/IconButton.vue";
import { QrCode as QrCodeIcon } from "lucide-vue-next";
import { defineComponent } from "vue";
import { mapActions, mapWritableState } from "pinia";
import { useNWCStore } from "src/stores/nwc";
import NWCDialog from "src/components/NWCDialog.vue";
import SettingsPageShell from "./SettingsPageShell.vue";
import CopyButton from "src/components/ui/CopyButton.vue";
import SettingsToggleRow from "src/components/ui/SettingsToggleRow.vue";
import SettingsSection from "./SettingsSection.vue";

export default defineComponent({
  name: "NwcSettings",
  mixins: [windowMixin],
  components: {
    IconButton,
    QrCodeIcon,
    CopyButton,
    SettingsToggleRow,
    SettingsPageShell,
    SettingsSection,
    NWCDialog,
  },
  computed: {
    ...mapWritableState(useNWCStore, [
      "nwcEnabled",
      "connections",
      "showNWCDialog",
      "showNWCData",
    ]),
    enableNwc: {
      get() {
        return this.nwcEnabled;
      },
      set(value) {
        this.nwcEnabled = value;
      },
    },
  },
  watch: {
    enableNwc: function () {
      if (this.enableNwc) {
        this.listenToNWCCommands();
      } else {
        this.unsubscribeNWC();
      }
    },
  },
  methods: {
    ...mapActions(useNWCStore, [
      "generateNWCConnection",
      "listenToNWCCommands",
      "unsubscribeNWC",
      "getConnectionString",
    ]),
    showNWCEntry: async function (connection) {
      this.showNWCData = {
        connection,
        connectionString: this.getConnectionString(connection),
      };
      this.showNWCDialog = true;
    },
  },
});
</script>
