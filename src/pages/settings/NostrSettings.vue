<template>
  <SettingsPageShell
    :title="$t('Settings.menu.nostr.title')"
    :caption="$t('Settings.menu.nostr.caption')"
  >
    <!-- keys: one single-choice group. A key's own action (copy, delete) is a button beside
         or under its radio row, never inside it. -->
    <SettingsSection
      radiogroup
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
      />
      <div
        v-if="signerType === 'SEED' && seedSignerPrivateKeyNsec"
        class="nostr-key-action"
      >
        <q-btn outline rounded @click="copyText(seedSignerPrivateKeyNsec)">
          <CopyIcon :size="18" class="q-mr-sm" />
          <span>{{ $t("Settings.nostr_keys.wallet_seed.copy_nsec") }}</span>
        </q-btn>
      </div>
      <!-- Nip46Signer -->
      <div v-if="false" class="row no-wrap items-center">
        <SettingsRadioRow
          class="col"
          :selected="signerType === 'NIP46'"
          :label="$t('Settings.nostr_keys.nsec_bunker.title')"
          :caption="$t('Settings.nostr_keys.nsec_bunker.description')"
          top
          @select="handleBunkerClick"
        />
        <IconButton
          v-if="signerType === 'NIP46'"
          class="nostr-key-remove"
          :label="$t('Settings.nostr_keys.nsec_bunker.delete_tooltip')"
          tooltip
          @click="handleResetNip46Signer"
          ><Trash2Icon :size="20"
        /></IconButton>
      </div>
      <!-- PrivateKeySigner -->
      <div class="row no-wrap items-center">
        <SettingsRadioRow
          class="col"
          :selected="signerType === 'PRIVATEKEY'"
          :label="$t('Settings.nostr_keys.use_nsec.title')"
          :caption="$t('Settings.nostr_keys.use_nsec.description')"
          top
          @select="handleNsecClick"
        />
        <IconButton
          v-if="signerType === 'PRIVATEKEY'"
          class="nostr-key-remove"
          :label="$t('Settings.nostr_keys.use_nsec.delete_tooltip')"
          tooltip
          @click="handleResetPrivateKeySigner"
          ><Trash2Icon :size="20"
        /></IconButton>
      </div>
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

    <!-- relays: a card with one quiet row per relay (its address is a button that copies it,
         the trash beside it removes it), then the add field on the page. With no relays
         there is no card, only the field. -->
    <SettingsSection
      flat
      :title="$t('Settings.sections.nostr.relays.list.title')"
      :caption="$t('Settings.sections.nostr.relays.add.description')"
    >
      <q-list v-if="displayRelays.length" class="settings-card relay-list">
        <q-item v-for="relay in displayRelays" :key="relay" class="relay-row">
          <q-item-section>
            <button
              type="button"
              class="relay-copy"
              :aria-label="`${$t(
                'Settings.sections.nostr.relays.list.copy_tooltip'
              )}: ${relay}`"
              @click="copyText(relay)"
            >
              <span class="relay-url ellipsis" dir="ltr"
                ><span class="relay-scheme">{{ relayScheme(relay) }}</span
                >{{ relayHost(relay) }}</span
              >
            </button>
          </q-item-section>
          <q-item-section side>
            <IconButton
              class="relay-remove"
              :label="$t('Settings.sections.nostr.relays.list.remove_tooltip')"
              tooltip
              @click="removeRelay(relay)"
              ><Trash2Icon :size="20"
            /></IconButton>
          </q-item-section>
        </q-item>
      </q-list>
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
/* A key's copy action sits under its row's caption, on the label's edge (the row's 16px
   inset and 56px radio column), in the caption's muted ink. */
.nostr-key-action {
  color: var(--app-text-muted);
  padding: 2px 16px 10px;
  padding-inline-start: 72px;
}
/* A key's delete button ends on the card's 16px edge, beside its row. */
.nostr-key-remove {
  margin-inline-end: 16px;
}
/* The add field sits 12px under the relay card. */
.relay-list {
  margin-bottom: 12px;
}
/* The relay's address is a button filling the row's 44px box. It tints on hover and press
   and reaches 12px past the text, so the address stays on the card's 16px edge. */
.relay-copy {
  background: none;
  border: 0;
  border-radius: var(--app-radius-md);
  color: inherit;
  cursor: pointer;
  font: inherit;
  margin-inline: -12px;
  min-height: 44px;
  padding: 0 12px;
  text-align: start;
  transition: background 0.15s ease;
  width: calc(100% + 24px);
}
@media (hover: hover) {
  .relay-copy:hover {
    background: var(--app-tint);
  }
}
.relay-copy:active {
  background: var(--app-tint-strong);
}
.relay-url {
  display: block;
  font-size: 16px;
  line-height: 20px;
}
.relay-scheme {
  color: var(--app-text-muted);
}
.relay-remove {
  color: var(--app-text-muted);
}
</style>
