<template>
  <SettingsPageShell
    :title="$t('Settings.menu.nostr.title')"
    :caption="$t('Settings.menu.nostr.caption')"
  >
    <!-- keys -->
    <SettingsSection
      :title="$t('Settings.nostr_keys.title')"
      :caption="$t('Settings.nostr_keys.description')"
    >
      <!-- initWalletSeedPrivateKeySigner -->
      <q-item
        :active="signerType === 'SEED'"
        active-class="text-weight-bold text-primary"
        clickable
        @click="handleSeedClick"
      >
        <q-item-section avatar>
          <q-icon
            :color="signerType === 'SEED' ? 'primary' : 'grey'"
            :name="
              signerType === 'SEED' ? 'check_circle' : 'radio_button_unchecked'
            "
          />
        </q-item-section>
        <q-item-section style="word-break: break-word">
          <q-item-label>{{
            $t("Settings.nostr_keys.wallet_seed.title")
          }}</q-item-label>
          <q-item-label caption>{{
            $t("Settings.nostr_keys.wallet_seed.description")
          }}</q-item-label>
          <q-item-label
            caption
            v-if="signerType === 'SEED' && seedSignerPrivateKeyNsec"
          >
            <q-badge
              class="cursor-pointer q-mt-xs"
              @click.stop="copyText(seedSignerPrivateKeyNsec)"
              outline
              color="grey"
            >
              <q-icon
                name="content_copy"
                size="0.8em"
                color="grey"
                class="q-mr-xs"
              ></q-icon
              >{{ $t("Settings.nostr_keys.wallet_seed.copy_nsec") }}
            </q-badge>
          </q-item-label>
        </q-item-section>
      </q-item>
      <!-- Nip46Signer -->
      <q-item
        :active="signerType === 'NIP46'"
        active-class="text-weight-bold text-primary"
        clickable
        @click="handleBunkerClick"
        v-if="false"
      >
        <q-item-section avatar>
          <q-icon
            :color="signerType === 'NIP46' ? 'primary' : 'grey'"
            :name="
              signerType === 'NIP46' ? 'check_circle' : 'radio_button_unchecked'
            "
          />
        </q-item-section>
        <q-item-section style="word-break: break-word">
          <q-item-label>{{
            $t("Settings.nostr_keys.nsec_bunker.title")
          }}</q-item-label>
          <q-item-label caption>{{
            $t("Settings.nostr_keys.nsec_bunker.description")
          }}</q-item-label>
        </q-item-section>
        <q-item-section side v-if="signerType === 'NIP46'">
          <q-icon
            name="delete_outline"
            @click.stop="handleResetNip46Signer"
            class="cursor-pointer"
            ><q-tooltip>{{
              $t("Settings.nostr_keys.nsec_bunker.delete_tooltip")
            }}</q-tooltip>
          </q-icon>
        </q-item-section>
      </q-item>
      <!-- PrivateKeySigner -->
      <q-item
        :active="signerType === 'PRIVATEKEY'"
        active-class="text-weight-bold text-primary"
        clickable
        @click="handleNsecClick"
      >
        <q-item-section avatar>
          <q-icon
            :color="signerType === 'PRIVATEKEY' ? 'primary' : 'grey'"
            :name="
              signerType === 'PRIVATEKEY'
                ? 'check_circle'
                : 'radio_button_unchecked'
            "
          />
        </q-item-section>
        <q-item-section style="word-break: break-word">
          <q-item-label>{{
            $t("Settings.nostr_keys.use_nsec.title")
          }}</q-item-label>
          <q-item-label caption>{{
            $t("Settings.nostr_keys.use_nsec.description")
          }}</q-item-label>
        </q-item-section>
        <q-item-section side v-if="signerType === 'PRIVATEKEY'">
          <q-icon
            name="delete_outline"
            @click.stop="handleResetPrivateKeySigner"
            class="cursor-pointer"
            ><q-tooltip>{{
              $t("Settings.nostr_keys.use_nsec.delete_tooltip")
            }}</q-tooltip></q-icon
          >
        </q-item-section>
      </q-item>
      <!-- Nip07Signer -->
      <q-item
        :active="signerType === 'NIP07'"
        active-class="text-weight-bold text-primary"
        clickable
        @click="handleExtensionClick"
        v-if="nip07SignerAvailable"
      >
        <q-item-section avatar>
          <q-icon
            :color="signerType === 'NIP07' ? 'primary' : 'grey'"
            :name="
              signerType === 'NIP07' ? 'check_circle' : 'radio_button_unchecked'
            "
          />
        </q-item-section>
        <q-item-section style="word-break: break-word">
          <q-item-label>{{
            $t("Settings.nostr_keys.signing_extension.title")
          }}</q-item-label>
          <q-item-label caption v-if="nip07SignerAvailable">{{
            $t("Settings.nostr_keys.signing_extension.description")
          }}</q-item-label>
          <q-item-label caption v-else>{{
            $t("Settings.nostr_keys.signing_extension.not_found")
          }}</q-item-label>
        </q-item-section>
      </q-item>
    </SettingsSection>

    <!-- relays -->
    <SettingsSection
      :title="$t('Settings.sections.nostr.relays.list.title')"
      :caption="$t('Settings.sections.nostr.relays.add.description')"
    >
      <q-item class="settings-control-item">
        <q-item-section>
          <q-input
            outlined
            rounded
            dense
            v-model="newRelay"
            :label="$t('Settings.sections.nostr.relays.add.title')"
          >
            <template v-slot:append>
              <q-btn
                flat
                dense
                round
                icon="add"
                color="primary"
                @click="addRelay"
              ></q-btn>
            </template>
          </q-input>
        </q-item-section>
      </q-item>
      <q-item v-for="relay in relays" :key="relay">
        <q-item-section>
          <q-item-label caption style="word-break: break-all">{{
            relay
          }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <div class="row items-center no-wrap q-gutter-sm">
            <q-icon
              name="content_copy"
              @click="copyText(relay)"
              size="xs"
              color="grey"
              class="cursor-pointer"
              ><q-tooltip>{{
                $t("Settings.sections.nostr.relays.list.copy_tooltip")
              }}</q-tooltip></q-icon
            >
            <q-icon
              name="delete_outline"
              @click="removeRelay(relay)"
              size="xs"
              color="grey"
              class="cursor-pointer"
              ><q-tooltip>{{
                $t("Settings.sections.nostr.relays.list.remove_tooltip")
              }}</q-tooltip></q-icon
            >
          </div>
        </q-item-section>
      </q-item>
    </SettingsSection>

    <!-- web of trust -->
    <SettingsSection
      :title="$t('Settings.web_of_trust.title')"
      :caption="$t('Settings.web_of_trust.known_pubkeys', { wotCount })"
    >
      <q-item>
        <q-item-section>
          <div class="row items-center q-gutter-sm">
            <q-btn
              size="sm"
              rounded
              outline
              color="primary"
              class="q-px-md"
              :loading="wotLoading"
              @click="crawlWebOfTrust(2)"
            >
              {{
                hasCrawlCheckpoint && !wotLoading
                  ? $t("Settings.web_of_trust.continue_crawl")
                  : signerType === "SEED"
                  ? $t("Settings.web_of_trust.crawl_odell")
                  : $t("Settings.web_of_trust.crawl_wot")
              }}
            </q-btn>
            <q-btn
              v-if="wotLoading"
              size="sm"
              rounded
              outline
              class="q-px-md"
              color="negative"
              @click="cancelCrawl"
            >
              {{ $t("Settings.web_of_trust.pause") }}
            </q-btn>
            <q-btn
              v-if="!wotLoading"
              size="sm"
              rounded
              outline
              class="q-px-md"
              color="grey"
              :disable="wotLoading"
              @click="resetWebOfTrust"
            >
              {{ $t("Settings.web_of_trust.reset") }}
            </q-btn>
          </div>
        </q-item-section>
      </q-item>
      <q-item v-if="wotLoading || crawlTotal > 0" class="settings-control-item">
        <q-item-section>
          <q-linear-progress
            rounded
            size="10px"
            color="primary"
            :value="crawlTotal > 0 ? crawlProcessed / crawlTotal : 0"
          />
          <div class="text-caption text-grey-6 q-mt-xs">
            {{
              $t("Settings.web_of_trust.progress", {
                crawlProcessed: crawlProcessed,
                crawlTotal: crawlTotal,
              })
            }}
          </div>
        </q-item-section>
      </q-item>
    </SettingsSection>
  </SettingsPageShell>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapActions, mapState, mapWritableState } from "pinia";
import { useNostrStore } from "src/stores/nostr";
import { useNostrUserStore } from "src/stores/nostrUser";
import { useNPCStore } from "src/stores/npubcash";
import { useNPCV2Store } from "src/stores/npcv2";
import SettingsPageShell from "./SettingsPageShell.vue";
import SettingsSection from "./SettingsSection.vue";

export default defineComponent({
  name: "NostrSettings",
  mixins: [windowMixin],
  components: {
    SettingsPageShell,
    SettingsSection,
  },
  data: function () {
    return {
      nip07SignerAvailable: false,
      newRelay: "",
    };
  },
  computed: {
    ...mapWritableState(useNostrStore, ["relays"]),
    ...mapState(useNostrStore, [
      "pubkey",
      "signerType",
      "seedSignerPrivateKeyNsec",
    ]),
    ...mapState(useNostrUserStore, [
      "wotCount",
      "wotLoading",
      "crawlProcessed",
      "crawlTotal",
      "hasCrawlCheckpoint",
    ]),
  },
  watch: {
    pubkey: {
      immediate: true,
      handler(newPk) {
        const nostrUser = useNostrUserStore();
        if (newPk) {
          nostrUser.setPubkey(newPk);
          nostrUser.updateUserProfile(true);
        }
      },
    },
  },
  methods: {
    ...mapActions(useNostrStore, [
      "initNip07Signer",
      "initNip46Signer",
      "initPrivateKeySigner",
      "initWalletSeedPrivateKeySigner",
      "checkNip07Signer",
      "resetPrivateKeySigner",
      "resetNip46Signer",
    ]),
    ...mapActions(useNPCStore, ["generateNPCConnection"]),
    ...mapActions(useNPCV2Store, ["generateNPCV2Connection"]),
    ...mapActions(useNostrUserStore, [
      "crawlWebOfTrust",
      "cancelCrawl",
      "resetWebOfTrust",
    ]),
    handleSeedClick: async function () {
      await this.initWalletSeedPrivateKeySigner();
      await this.generateNPCConnection();
      await this.generateNPCV2Connection();
      const nostr = useNostrStore();
      const nostrUser = useNostrUserStore();
      nostrUser.setPubkey(nostr.pubkey);
      await nostrUser.updateUserProfile(true);
    },
    handleExtensionClick: async function () {
      await this.initNip07Signer();
      await this.generateNPCConnection();
      await this.generateNPCV2Connection();
      const nostr = useNostrStore();
      const nostrUser = useNostrUserStore();
      nostrUser.setPubkey(nostr.pubkey);
      await nostrUser.updateUserProfile(true);
    },
    handleBunkerClick: async function () {
      await this.initNip46Signer();
      await this.generateNPCConnection();
      await this.generateNPCV2Connection();
      const nostr = useNostrStore();
      const nostrUser = useNostrUserStore();
      nostrUser.setPubkey(nostr.pubkey);
      await nostrUser.updateUserProfile(true);
    },
    handleNsecClick: async function () {
      await this.initPrivateKeySigner();
      await this.generateNPCConnection();
      await this.generateNPCV2Connection();
      const nostr = useNostrStore();
      const nostrUser = useNostrUserStore();
      nostrUser.setPubkey(nostr.pubkey);
      await nostrUser.updateUserProfile(true);
    },
    handleResetPrivateKeySigner: async function () {
      await this.resetPrivateKeySigner();
      await this.generateNPCConnection();
      await this.generateNPCV2Connection();
    },
    handleResetNip46Signer: async function () {
      await this.resetNip46Signer();
      await this.generateNPCConnection();
      await this.generateNPCV2Connection();
    },
    addRelay: function () {
      if (this.newRelay) {
        this.newRelay = this.newRelay.trim();
        // if relay is already in relays, don't add it, send notification
        if (this.relays.includes(this.newRelay)) {
          this.notifyWarning("Relay already added");
        } else {
          this.relays.push(this.newRelay);
          this.newRelay = "";
        }
      }
    },
    removeRelay: function (relay) {
      this.relays = this.relays.filter((r) => r !== relay);
    },
  },
  created: async function () {
    this.nip07SignerAvailable = await this.checkNip07Signer();
  },
});
</script>
