<template>
  <SettingsPageShell
    :title="$t('Settings.menu.nwc.title')"
    :caption="$t('Settings.menu.nwc.caption')"
  >
    <div class="q-py-sm q-px-xs text-left" on-left>
      <q-list padding>
        <q-item class="q-pt-lg">
          <q-item-section>
            <q-item-label overline class="text-weight-bold">{{
              $t("Settings.nostr_wallet_connect.title")
            }}</q-item-label>
            <q-item-label caption>{{
              $t("Settings.nostr_wallet_connect.description")
            }}</q-item-label>
          </q-item-section>
        </q-item>
        <!-- use a q-toggle to turn nwc on and off -->
        <q-item>
          <q-toggle
            v-model="enableNwc"
            :label="$t('Settings.nostr_wallet_connect.enable_toggle')"
            color="primary"
          />
        </q-item>
        <q-item v-if="enableNwc">
          <q-item-section>
            <q-item-label caption
              >{{ $t("Settings.nostr_wallet_connect.payments_note") }}
            </q-item-label>
          </q-item-section>
        </q-item>
        <div v-if="enableNwc">
          <q-item
            v-for="connection in connections"
            :key="getConnectionString(connection)"
          >
            <q-item-section
              class="q-mx-none q-pl-none"
              style="max-width: 1.5em"
            >
              <q-icon
                name="content_copy"
                @click="copyText(getConnectionString(connection))"
                size="xs"
                color="grey"
                class="q-mr-sm cursor-pointer"
                ><q-tooltip>{{
                  $t("Settings.nostr_wallet_connect.connection.copy_tooltip")
                }}</q-tooltip></q-icon
              >
            </q-item-section>
            <q-item-section
              class="q-mx-none q-pl-none"
              style="max-width: 1.5em"
            >
              <q-icon
                name="qr_code"
                @click="showNWCEntry(connection)"
                size="1.3em"
                color="grey"
                class="q-mr-sm cursor-pointer"
              >
                <q-tooltip>{{
                  $t("Settings.nostr_wallet_connect.connection.qr_tooltip")
                }}</q-tooltip>
              </q-icon>
            </q-item-section>
            <q-item-section style="max-width: 10rem">
              <!-- input for allowanceleft -->
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
          </q-item>
        </div>
      </q-list>
    </div>

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

export default defineComponent({
  name: "NwcSettings",
  mixins: [windowMixin],
  components: {
    SettingsPageShell,
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
