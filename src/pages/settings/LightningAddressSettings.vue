<template>
  <SettingsPageShell
    :title="$t('Settings.menu.lightning_address.title')"
    :caption="$t('Settings.menu.lightning_address.caption')"
  >
    <SettingsSection
      :title="$t('Settings.lightning_address.title')"
      :caption="$t('Settings.lightning_address.description')"
    >
      <q-item tag="label">
        <q-item-section>
          <q-item-label>{{
            $t("Settings.lightning_address.enable.toggle")
          }}</q-item-label>
          <q-item-label caption>{{
            $t("Settings.lightning_address.enable.description")
          }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-toggle v-model="enabled" color="primary" />
        </q-item-section>
      </q-item>
      <template v-if="enabled">
        <q-item class="settings-control-item">
          <q-item-section>
            <q-input outlined v-model="address" dense rounded readonly>
              <template v-slot:append>
                <q-spinner size="sm" v-if="loading" />
                <q-icon
                  name="content_copy"
                  @click="copyText(address)"
                  size="xs"
                  color="grey"
                  class="cursor-pointer"
                >
                  <q-tooltip>{{
                    $t("Settings.lightning_address.address.copy_tooltip")
                  }}</q-tooltip>
                </q-icon>
              </template>
            </q-input>
          </q-item-section>
        </q-item>
        <q-item class="settings-control-item">
          <q-item-section>
            <q-item-label caption class="q-mb-sm">{{
              $t("Settings.lightning_address.mint.label")
            }}</q-item-label>
            <ChooseMint
              v-model="mintUrl"
              :title="$t('Settings.lightning_address.mint.choose_title')"
              :placeholder="
                $t('Settings.lightning_address.mint.choose_placeholder')
              "
              :show-balances="false"
              :dense="true"
              :rounded="true"
              :require-active-mint="false"
            />
          </q-item-section>
        </q-item>
        <q-item tag="label">
          <q-item-section>
            <q-item-label>{{
              $t("Settings.lightning_address.automatic_claim.toggle")
            }}</q-item-label>
            <q-item-label caption>{{
              $t("Settings.lightning_address.automatic_claim.description")
            }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle v-model="claimAutomatically" color="primary" />
          </q-item-section>
        </q-item>
      </template>
    </SettingsSection>
  </SettingsPageShell>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapActions, mapState, mapWritableState } from "pinia";
import ChooseMint from "src/components/ChooseMint.vue";
import { useNostrStore } from "src/stores/nostr";
import { useNpubCashStore } from "src/stores/npubcash";
import SettingsPageShell from "src/pages/settings/SettingsPageShell.vue";
import SettingsSection from "src/pages/settings/SettingsSection.vue";

export default defineComponent({
  name: "LightningAddressSettings",
  mixins: [windowMixin],
  components: {
    SettingsPageShell,
    SettingsSection,
    ChooseMint,
  },
  computed: {
    ...mapState(useNpubCashStore, ["loading"]),
    ...mapWritableState(useNpubCashStore, [
      "enabled",
      "address",
      "mintUrl",
      "claimAutomatically",
    ]),
  },
  watch: {
    enabled: async function () {
      if (this.enabled) {
        await this.initSigner();
        await this.refreshNpubCashConnection();
      } else {
        this.address = "";
      }
    },
    mintUrl: async function (newMintUrl, oldMintUrl) {
      if (this.enabled && newMintUrl && newMintUrl !== oldMintUrl) {
        await this.changeMintUrl(newMintUrl);
      }
    },
  },
  methods: {
    ...mapActions(useNostrStore, ["initSigner"]),
    ...mapActions(useNpubCashStore, [
      "refreshNpubCashConnection",
      "changeMintUrl",
    ]),
  },
});
</script>
