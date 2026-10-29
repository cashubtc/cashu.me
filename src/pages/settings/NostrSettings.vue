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
      <SettingsRadioRow
        :selected="signerType === 'SEED'"
        :label="$t('Settings.nostr_keys.wallet_seed.title')"
        :caption="$t('Settings.nostr_keys.wallet_seed.description')"
        top
        @select="handleSeedClick"
      >
        <q-item-label
          caption
          v-if="signerType === 'SEED' && seedSignerPrivateKeyNsec"
        >
          <q-btn
            outline
            rounded
            class="q-mt-sm"
            @click.stop="copyText(seedSignerPrivateKeyNsec)"
          >
            <CopyIcon :size="18" class="q-mr-sm" />
            <span>{{ $t("Settings.nostr_keys.wallet_seed.copy_nsec") }}</span>
          </q-btn>
        </q-item-label>
      </SettingsRadioRow>
      <!-- Nip46Signer -->
      <SettingsRadioRow
        v-if="false"
        :selected="signerType === 'NIP46'"
        :label="$t('Settings.nostr_keys.nsec_bunker.title')"
        :caption="$t('Settings.nostr_keys.nsec_bunker.description')"
        top
        @select="handleBunkerClick"
      >
        <template v-if="signerType === 'NIP46'" #side>
          <IconButton
            :label="$t('Settings.nostr_keys.nsec_bunker.delete_tooltip')"
            tooltip
            @click.stop="handleResetNip46Signer"
            ><Trash2Icon :size="20"
          /></IconButton>
        </template>
      </SettingsRadioRow>
      <!-- PrivateKeySigner -->
      <SettingsRadioRow
        :selected="signerType === 'PRIVATEKEY'"
        :label="$t('Settings.nostr_keys.use_nsec.title')"
        :caption="$t('Settings.nostr_keys.use_nsec.description')"
        top
        @select="handleNsecClick"
      >
        <template v-if="signerType === 'PRIVATEKEY'" #side>
          <IconButton
            :label="$t('Settings.nostr_keys.use_nsec.delete_tooltip')"
            tooltip
            @click.stop="handleResetPrivateKeySigner"
            ><Trash2Icon :size="20"
          /></IconButton>
        </template>
      </SettingsRadioRow>
      <!-- Nip07Signer -->
      <SettingsRadioRow
        v-if="nip07SignerAvailable"
        :selected="signerType === 'NIP07'"
        :label="$t('Settings.nostr_keys.signing_extension.title')"
        :caption="
          nip07SignerAvailable
            ? $t('Settings.nostr_keys.signing_extension.description')
            : $t('Settings.nostr_keys.signing_extension.not_found')
        "
        top
        @select="handleExtensionClick"
      />
    </SettingsSection>

    <!-- relays: one quiet row per relay (tap to copy, trash to remove), and the add field on
         the page under the list rather than inside the card. -->
    <SettingsSection
      :title="$t('Settings.sections.nostr.relays.list.title')"
      :caption="$t('Settings.sections.nostr.relays.add.description')"
    >
      <q-item
        v-for="relay in displayRelays"
        :key="relay"
        clickable
        class="relay-row"
        :aria-label="`${$t(
          'Settings.sections.nostr.relays.list.copy_tooltip'
        )}: ${relay}`"
        @click="copyText(relay)"
      >
        <q-item-section>
          <q-item-label class="relay-url ellipsis" dir="ltr"
            ><span class="relay-scheme">{{ relayScheme(relay) }}</span
            >{{ relayHost(relay) }}</q-item-label
          >
        </q-item-section>
        <q-item-section side>
          <IconButton
            class="relay-remove"
            :label="$t('Settings.sections.nostr.relays.list.remove_tooltip')"
            tooltip
            @click.stop="removeRelay(relay)"
            ><Trash2Icon :size="20"
          /></IconButton>
        </q-item-section>
      </q-item>
    </SettingsSection>
    <div class="relay-add">
      <q-input
        outlined
        v-model="newRelay"
        dir="ltr"
        :label="$t('Settings.sections.nostr.relays.add.title')"
        @keydown.enter.prevent="addRelay"
      >
        <template v-slot:append>
          <IconButton
            :disable="!newRelay.trim()"
            :label="$t('Settings.sections.nostr.relays.add.title')"
            @click="addRelay"
            ><PlusIcon :size="20"
          /></IconButton>
        </template>
      </q-input>
    </div>

    <!-- web of trust -->
    <SettingsSection
      :title="$t('Settings.web_of_trust.title')"
      :caption="$t('Settings.web_of_trust.known_pubkeys', { wotCount })"
    >
      <q-item>
        <q-item-section>
          <div class="row items-center q-gutter-sm">
            <q-btn
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
              <template #loading
                ><BusyLabel>{{
                  hasCrawlCheckpoint && !wotLoading
                    ? $t("Settings.web_of_trust.continue_crawl")
                    : signerType === "SEED"
                    ? $t("Settings.web_of_trust.crawl_odell")
                    : $t("Settings.web_of_trust.crawl_wot")
                }}</BusyLabel></template
              >
            </q-btn>
            <q-btn
              v-if="wotLoading"
              rounded
              outline
              class="q-px-md"
              color="negative"
              @click="cancelCrawl"
            >
              {{ $t("Settings.web_of_trust.pause") }}
            </q-btn>
            <q-btn
              v-if="!wotLoading && wotCount > 0"
              flat
              rounded
              class="q-px-md"
              color="negative"
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
          <div class="text-caption text-app-muted q-mt-xs">
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
import IconButton from "src/components/ui/IconButton.vue";
import BusyLabel from "src/components/ui/BusyLabel.vue";
import {
  Copy as CopyIcon,
  Plus as PlusIcon,
  Trash2 as Trash2Icon,
} from "lucide-vue-next";
import { defineComponent } from "vue";
import { mapActions, mapState, mapWritableState } from "pinia";
import { useNostrStore } from "src/stores/nostr";
import { useNostrUserStore } from "src/stores/nostrUser";
import { useNpubCashStore } from "src/stores/npubcash";
import SettingsPageShell from "./SettingsPageShell.vue";
import SettingsRadioRow from "src/components/ui/SettingsRadioRow.vue";
import SettingsSection from "./SettingsSection.vue";

export default defineComponent({
  name: "NostrSettings",
  mixins: [windowMixin],
  components: {
    IconButton,
    BusyLabel,
    SettingsRadioRow,
    CopyIcon,
    PlusIcon,
    Trash2Icon,
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
    // One row per relay: stored lists can hold the same URL twice (e.g. with a trailing space).
    displayRelays() {
      return [...new Set(this.relays.map((r) => r.trim()))];
    },
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
    ...mapActions(useNpubCashStore, ["refreshNpubCashConnection"]),
    ...mapActions(useNostrUserStore, [
      "crawlWebOfTrust",
      "cancelCrawl",
      "resetWebOfTrust",
    ]),
    handleSeedClick: async function () {
      await this.initWalletSeedPrivateKeySigner();
      await this.refreshNpubCashConnection();
      const nostr = useNostrStore();
      const nostrUser = useNostrUserStore();
      nostrUser.setPubkey(nostr.pubkey);
      await nostrUser.updateUserProfile(true);
    },
    handleExtensionClick: async function () {
      await this.initNip07Signer();
      await this.refreshNpubCashConnection();
      const nostr = useNostrStore();
      const nostrUser = useNostrUserStore();
      nostrUser.setPubkey(nostr.pubkey);
      await nostrUser.updateUserProfile(true);
    },
    handleBunkerClick: async function () {
      await this.initNip46Signer();
      await this.refreshNpubCashConnection();
      const nostr = useNostrStore();
      const nostrUser = useNostrUserStore();
      nostrUser.setPubkey(nostr.pubkey);
      await nostrUser.updateUserProfile(true);
    },
    handleNsecClick: async function () {
      await this.initPrivateKeySigner();
      await this.refreshNpubCashConnection();
      const nostr = useNostrStore();
      const nostrUser = useNostrUserStore();
      nostrUser.setPubkey(nostr.pubkey);
      await nostrUser.updateUserProfile(true);
    },
    handleResetPrivateKeySigner: async function () {
      await this.resetPrivateKeySigner();
      await this.refreshNpubCashConnection();
    },
    handleResetNip46Signer: async function () {
      await this.resetNip46Signer();
      await this.refreshNpubCashConnection();
    },
    addRelay: function () {
      if (this.newRelay) {
        this.newRelay = this.newRelay.trim();
        // if relay is already in relays, don't add it, send notification
        if (this.relays.includes(this.newRelay)) {
          this.notifyWarning(
            this.$t("Settings.sections.nostr.relays.already_added")
          );
        } else {
          this.relays.push(this.newRelay);
          this.newRelay = "";
        }
      }
    },
    relayScheme: function (relay) {
      return relay.match(/^[a-z]+:\/\//i)?.[0] ?? "";
    },
    relayHost: function (relay) {
      return relay.slice(this.relayScheme(relay).length);
    },
    removeRelay: function (relay) {
      this.relays = this.relays.filter((r) => r.trim() !== relay);
    },
  },
  created: async function () {
    this.nip07SignerAvailable = await this.checkNip07Signer();
  },
});
</script>

<style scoped>
.relay-scheme {
  color: var(--app-text-muted);
}
.relay-remove {
  color: var(--app-text-muted);
}
/* The add field sits 12px under the relay card (the section's 24px bottom margin, pulled up),
   then the usual 24px before the next section. */
.relay-add {
  margin-top: -12px;
  margin-bottom: 24px;
}
</style>
