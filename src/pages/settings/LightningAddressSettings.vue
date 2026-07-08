<template>
  <SettingsPageShell
    :title="$t('Settings.menu.lightning_address.title')"
    :caption="$t('Settings.menu.lightning_address.caption')"
  >
    <!-- npub.cash -->
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
          <q-toggle v-model="npcEnabled" color="primary" />
        </q-item-section>
      </q-item>
      <template v-if="npcEnabled">
        <q-item class="settings-control-item">
          <q-item-section>
            <q-input outlined v-model="npcAddress" dense rounded readonly>
              <template v-slot:append>
                <q-spinner size="sm" v-if="npcLoading" />
                <q-icon
                  name="content_copy"
                  @click="copyText(npcAddress)"
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
            <q-toggle v-model="automaticClaim" color="primary" />
          </q-item-section>
        </q-item>
      </template>
    </SettingsSection>

    <!-- npub.cash v2 -->
    <SettingsSection :title="$t('Settings.npub_cash.use_npubx')">
      <template v-slot:badge>
        <q-badge
          color="primary"
          :label="$t('Settings.experimental.receive_swaps.badge')"
          class="q-ml-sm"
        ></q-badge>
      </template>
      <q-item tag="label">
        <q-item-section>
          <q-item-label>{{ $t("Settings.npub_cash.use_npubx") }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-toggle v-model="npcV2Enabled" color="primary" />
        </q-item-section>
      </q-item>
      <template v-if="npcV2Enabled">
        <q-item class="settings-control-item">
          <q-item-section>
            <q-input outlined v-model="npcV2Address" dense rounded readonly>
              <template v-slot:append>
                <q-icon
                  name="content_copy"
                  @click="copyText(npcV2Address)"
                  size="xs"
                  color="grey"
                  class="cursor-pointer"
                >
                  <q-tooltip>{{
                    $t("Settings.npub_cash.copy_lightning_address")
                  }}</q-tooltip>
                </q-icon>
              </template>
            </q-input>
          </q-item-section>
        </q-item>
        <q-item class="settings-control-item">
          <q-item-section>
            <q-item-label caption class="q-mb-sm">{{
              $t("Settings.npub_cash.v2_mint")
            }}</q-item-label>
            <q-input outlined v-model="npcV2Mint" dense rounded readonly>
            </q-input>
            <div class="q-mt-sm">
              <ChooseMint
                v-model="npcV2Mint"
                :title="
                  $t('Settings.lightning_address.npc_v2.choose_mint_title')
                "
                :placeholder="
                  $t(
                    'Settings.lightning_address.npc_v2.choose_mint_placeholder'
                  )
                "
                :show-balances="false"
                :dense="true"
                :rounded="true"
                :require-active-mint="false"
              />
            </div>
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
            <q-toggle v-model="npcV2ClaimAutomatically" color="primary" />
          </q-item-section>
        </q-item>
      </template>
    </SettingsSection>
  </SettingsPageShell>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapActions, mapState, mapWritableState } from "pinia";
import { useNostrStore } from "src/stores/nostr";
import { useNPCStore } from "src/stores/npubcash";
import { useNPCV2Store } from "src/stores/npcv2";
import ChooseMint from "src/components/ChooseMint.vue";
import SettingsPageShell from "./SettingsPageShell.vue";
import SettingsSection from "./SettingsSection.vue";

export default defineComponent({
  name: "LightningAddressSettings",
  mixins: [windowMixin],
  components: {
    SettingsPageShell,
    SettingsSection,
    ChooseMint,
  },
  computed: {
    ...mapState(useNPCStore, ["npcLoading"]),
    ...mapWritableState(useNPCStore, [
      "npcAddress",
      "npcEnabled",
      "automaticClaim",
    ]),
    ...mapWritableState(useNPCV2Store, [
      "npcV2Loading",
      "npcV2Enabled",
      "npcV2Address",
      "npcV2Mint",
      "npcV2ClaimAutomatically",
    ]),
  },
  watch: {
    npcEnabled: async function () {
      if (this.npcEnabled) {
        await this.initSigner();
        await this.generateNPCConnection();
      } else {
        this.npcAddress = "";
      }
    },
    npcV2Enabled: async function () {
      if (this.npcV2Enabled) {
        await this.initSigner();
        await this.generateNPCV2Connection();
      } else {
        this.npcV2Address = "";
      }
    },
    npcV2Mint: async function (newMintUrl, oldMintUrl) {
      if (this.npcV2Enabled && newMintUrl && newMintUrl !== oldMintUrl) {
        await this.changeMintUrl(newMintUrl);
      }
    },
  },
  methods: {
    ...mapActions(useNostrStore, ["initSigner"]),
    ...mapActions(useNPCStore, ["generateNPCConnection"]),
    ...mapActions(useNPCV2Store, ["generateNPCV2Connection", "changeMintUrl"]),
  },
});
</script>
