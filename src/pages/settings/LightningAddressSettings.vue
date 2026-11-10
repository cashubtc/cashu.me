<template>
  <SettingsPageShell
    :title="$t('Settings.menu.lightning_address.title')"
    :caption="$t('Settings.menu.lightning_address.caption')"
  >
    <SettingsSection>
      <SettingsToggleRow
        v-model="enabled"
        :label="$t('Settings.lightning_address.enable.toggle')"
        :caption="$t('Settings.lightning_address.enable.description')"
      />
      <template v-if="enabled">
        <q-item class="settings-control-item">
          <q-item-section>
            <CopyField
              :value="address"
              :label="$t('Settings.lightning_address.address.label')"
              :copy-label="
                $t('Settings.lightning_address.address.copy_tooltip')
              "
              :loading="loading"
            />
          </q-item-section>
        </q-item>
        <q-item class="settings-control-item">
          <q-item-section>
            <ChooseMint
              v-model="mintUrl"
              :label="$t('Settings.lightning_address.mint.label')"
              :title="$t('Settings.lightning_address.mint.choose_title')"
              :placeholder="
                $t('Settings.lightning_address.mint.choose_placeholder')
              "
              :show-balances="false"
              dense
              :require-active-mint="false"
            />
          </q-item-section>
        </q-item>
        <q-expansion-item :label="$t('Settings.menu.advanced.title')">
          <q-item class="settings-control-item">
            <q-item-section>
              <q-input
                outlined
                v-model="serverUrlInput"
                :label="$t('Settings.lightning_address.server_url.label')"
                :hint="$t('Settings.lightning_address.server_url.hint')"
                placeholder="https://npub.cash"
                :error="Boolean(serverUrlError)"
                :error-message="serverUrlError"
                @blur="applyServerUrl"
                @keyup.enter="applyServerUrl"
              />
            </q-item-section>
          </q-item>
          <SettingsToggleRow
            v-model="claimAutomatically"
            :label="$t('Settings.lightning_address.automatic_claim.toggle')"
            :caption="
              $t('Settings.lightning_address.automatic_claim.description')
            "
          />
          <SettingsToggleRow
            v-model="showAddressOnReceive"
            :label="$t('Settings.lightning_address.show_on_receive.toggle')"
            :caption="
              $t('Settings.lightning_address.show_on_receive.description')
            "
          />
        </q-expansion-item>
      </template>
    </SettingsSection>
  </SettingsPageShell>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapActions, mapState, mapWritableState } from "pinia";
import ChooseMint from "src/components/ChooseMint.vue";
import { useNpubCashStore } from "src/stores/npubcash";
import SettingsPageShell from "src/pages/settings/SettingsPageShell.vue";
import CopyField from "src/components/ui/CopyField.vue";
import SettingsToggleRow from "src/components/ui/SettingsToggleRow.vue";
import SettingsSection from "src/pages/settings/SettingsSection.vue";

export default defineComponent({
  name: "LightningAddressSettings",
  mixins: [windowMixin],
  components: {
    CopyField,
    SettingsToggleRow,
    SettingsPageShell,
    SettingsSection,
    ChooseMint,
  },
  data: function () {
    return {
      serverUrlInput: "",
      serverUrlError: "",
    };
  },
  computed: {
    ...mapState(useNpubCashStore, ["loading", "baseHost"]),
    ...mapWritableState(useNpubCashStore, [
      "enabled",
      "address",
      "mintUrl",
      "claimAutomatically",
      "showAddressOnReceive",
    ]),
  },
  watch: {
    baseHost: {
      immediate: true,
      handler(baseHost: string) {
        this.serverUrlInput = `https://${baseHost}`;
      },
    },
    enabled: async function () {
      if (this.enabled) {
        await this.initializeNpubCash();
      } else {
        this.stopQuoteUpdates();
        this.address = "";
      }
    },
    mintUrl: async function (newMintUrl, oldMintUrl) {
      if (this.enabled && newMintUrl && newMintUrl !== oldMintUrl) {
        await this.changeMintUrl(newMintUrl, oldMintUrl);
      }
    },
  },
  methods: {
    ...mapActions(useNpubCashStore, [
      "initializeNpubCash",
      "changeMintUrl",
      "setBaseHost",
      "stopQuoteUpdates",
    ]),
    applyServerUrl: async function () {
      try {
        this.serverUrlError = "";
        this.serverUrlInput = await this.setBaseHost(this.serverUrlInput);
      } catch {
        this.serverUrlError = this.$t(
          "Settings.lightning_address.server_url.invalid"
        );
      }
    },
  },
});
</script>
