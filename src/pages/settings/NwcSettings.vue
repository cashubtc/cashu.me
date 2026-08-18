<template>
  <SettingsPageShell
    :title="$t('Settings.menu.nwc.title')"
    :caption="$t('Settings.menu.nwc.caption')"
  >
    <SettingsSection
      :title="$t('Settings.nostr_wallet_connect.title')"
      :caption="$t('Settings.nostr_wallet_connect.description')"
    >
      <q-item tag="label">
        <q-item-section>
          <q-item-label>{{
            $t("Settings.nostr_wallet_connect.enable_toggle")
          }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-toggle v-model="enableNwc" color="primary" />
        </q-item-section>
      </q-item>
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
              rounded
              dense
              v-model="connection.allowanceLeft"
              :label="
                $t('Settings.nostr_wallet_connect.connection.allowance_label')
              "
            >
            </q-input>
          </q-item-section>
          <q-item-section side>
            <div class="row items-center no-wrap q-gutter-sm">
              <q-icon
                name="content_copy"
                @click="copyText(getConnectionString(connection))"
                size="xs"
                color="grey"
                class="cursor-pointer"
                ><q-tooltip>{{
                  $t("Settings.nostr_wallet_connect.connection.copy_tooltip")
                }}</q-tooltip></q-icon
              >
              <q-icon
                name="qr_code"
                @click="showNWCEntry(connection)"
                size="xs"
                color="grey"
                class="cursor-pointer"
              >
                <q-tooltip>{{
                  $t("Settings.nostr_wallet_connect.connection.qr_tooltip")
                }}</q-tooltip>
              </q-icon>
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
import { defineComponent } from "vue";
import { mapActions, mapWritableState } from "pinia";
import { useNWCStore } from "src/stores/nwc";
import NWCDialog from "src/components/NWCDialog.vue";
import SettingsPageShell from "./SettingsPageShell.vue";
import SettingsSection from "./SettingsSection.vue";

export default defineComponent({
  name: "NwcSettings",
  mixins: [windowMixin],
  components: {
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
