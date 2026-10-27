<template>
  <SettingsPageShell
    :title="$t('Settings.menu.advanced.title')"
    :caption="$t('Settings.menu.advanced.caption')"
  >
    <SettingsSection
      :title="$t('Settings.advanced.developer.title')"
      :caption="$t('Settings.advanced.developer.description')"
    >
      <!-- new seed -->
      <q-item clickable v-ripple @click="confirmMnemonic = true">
        <q-item-section>
          <q-item-label>{{
            $t("Settings.advanced.developer.new_seed.button")
          }}</q-item-label>
          <q-item-label caption v-if="!confirmMnemonic">{{
            $t("Settings.advanced.developer.new_seed.description")
          }}</q-item-label>
          <div v-if="confirmMnemonic" class="q-mt-xs">
            <span class="text-caption">{{
              $t("Settings.advanced.developer.new_seed.confirm_question")
            }}</span>
            <div class="row items-center q-gutter-sm q-mt-xs">
              <q-btn
                size="sm"
                rounded
                outline
                class="q-px-md"
                @click.stop="confirmMnemonic = false"
                >{{ $t("Settings.advanced.developer.new_seed.cancel") }}</q-btn
              >
              <q-btn
                size="sm"
                rounded
                outline
                class="q-px-md"
                color="negative"
                @click.stop="
                  confirmMnemonic = false;
                  generateNewMnemonic();
                "
                >{{ $t("Settings.advanced.developer.new_seed.confirm") }}</q-btn
              >
            </div>
          </div>
        </q-item-section>
        <q-item-section side>
          <q-icon name="chevron_right" class="settings-menu-chevron" />
        </q-item-section>
      </q-item>

      <!-- remove spent proofs -->
      <q-item clickable v-ripple @click="checkActiveProofsSpendable">
        <q-item-section>
          <q-item-label>{{
            $t("Settings.advanced.developer.remove_spent.button")
          }}</q-item-label>
          <q-item-label caption>{{
            $t("Settings.advanced.developer.remove_spent.description")
          }}</q-item-label>
        </q-item-section>
        <!-- Runs straight away, so an action glyph like the export rows, not a chevron. -->
        <q-item-section side>
          <RefreshCwIcon :size="20" class="settings-menu-action" />
        </q-item-section>
      </q-item>

      <!-- debug console -->
      <!-- On or off, so a switch bound to its saved state, like every other setting. -->
      <q-item tag="label">
        <q-item-section>
          <q-item-label>{{
            $t("Settings.advanced.developer.debug_console.button")
          }}</q-item-label>
          <q-item-label caption>{{
            $t("Settings.advanced.developer.debug_console.description")
          }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-toggle
            :model-value="showDebugConsole"
            color="primary"
            @update:model-value="toggleTerminal"
          />
        </q-item-section>
      </q-item>

      <!-- keyset counters -->
      <q-item>
        <q-item-section>
          <q-item-label>{{
            $t("Settings.advanced.developer.keyset_counters.title")
          }}</q-item-label>
          <q-item-label caption>{{
            $t("Settings.advanced.developer.keyset_counters.description")
          }}</q-item-label>
          <div class="keyset-counters q-mt-sm">
            <div
              class="keyset-counter-group"
              v-for="(mintCounter, mintUrl) in keysetCountersByMint"
              :key="mintUrl"
            >
              <!-- The mint as everywhere else: its icon (or the landmark glyph) and its name. -->
              <div class="keyset-mint-label row items-center no-wrap">
                <span class="mint-chip__avatar" aria-hidden="true">
                  <img
                    v-if="mintFor(mintUrl)?.info?.icon_url"
                    :src="mintFor(mintUrl).info.icon_url"
                    alt=""
                    class="keyset-mint-icon"
                  />
                  <LandmarkIcon v-else :size="14" class="keyset-mint-glyph" />
                </span>
                <span class="ellipsis">{{
                  mintFor(mintUrl)?.nickname ||
                  mintFor(mintUrl)?.info?.name ||
                  shortUrl(mintUrl)
                }}</span>
              </div>
              <!-- Each keyset is a stepper row: ID, its count, and the round + button that
                   presses like the wallet's scan and menu buttons (user direction, R46). -->
              <div class="keyset-counter-list">
                <div
                  v-for="(counter, id) in mintCounter"
                  :key="id"
                  class="keyset-counter-row"
                  :title="counter.id"
                  @click="increaseKeysetCounter(counter.id, 1)"
                >
                  <span class="keyset-id ellipsis">{{
                    abbreviateKeysetId(counter.id)
                  }}</span>
                  <span class="keyset-counter-text">
                    {{
                      $t(
                        "Settings.advanced.developer.keyset_counters.counter",
                        { count: counter.counter }
                      )
                    }}
                  </span>
                  <q-btn
                    flat
                    dense
                    round
                    class="keyset-counter-plus"
                    :aria-label="
                      $t(
                        'Settings.advanced.developer.keyset_counters.increase',
                        { id: abbreviateKeysetId(counter.id) }
                      )
                    "
                    @click.stop="increaseKeysetCounter(counter.id, 1)"
                  >
                    <PlusIcon :size="22" />
                  </q-btn>
                </div>
              </div>
            </div>
          </div>
        </q-item-section>
      </q-item>

      <!-- unset reserved proofs -->
      <q-item clickable v-ripple @click="unsetAllReservedProofs">
        <q-item-section>
          <q-item-label>{{
            $t("Settings.advanced.developer.unset_reserved.button")
          }}</q-item-label>
          <q-item-label caption>{{
            $t("Settings.advanced.developer.unset_reserved.description")
          }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <RotateCcwIcon :size="20" class="settings-menu-action" />
        </q-item-section>
      </q-item>

      <!-- show onboarding -->
      <q-item clickable v-ripple @click="showOnboarding">
        <q-item-section>
          <q-item-label>{{
            $t("Settings.advanced.developer.show_onboarding.button")
          }}</q-item-label>
          <q-item-label caption>{{
            $t("Settings.advanced.developer.show_onboarding.description")
          }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon name="chevron_right" class="settings-menu-chevron" />
        </q-item-section>
      </q-item>
    </SettingsSection>

    <SettingsSection>
      <!-- export proofs -->
      <q-item clickable v-ripple @click="exportActiveProofs">
        <q-item-section>
          <q-item-label>{{
            $t("Settings.advanced.developer.export_proofs.button")
          }}</q-item-label>
          <q-item-label caption>{{
            $t("Settings.advanced.developer.export_proofs.description")
          }}</q-item-label>
        </q-item-section>
        <!-- Copies a token straight away, so a copy glyph instead of a navigation chevron. -->
        <q-item-section side>
          <CopyIcon :size="20" class="settings-menu-action" />
        </q-item-section>
      </q-item>

      <!-- export wallet data -->
      <q-item clickable v-ripple @click="exportWalletState">
        <q-item-section>
          <q-item-label>{{
            $t("Settings.advanced.developer.export_wallet.button")
          }}</q-item-label>
          <q-item-label caption>{{
            $t("Settings.advanced.developer.export_wallet.description")
          }}</q-item-label>
        </q-item-section>
        <!-- Downloads a file straight away, so a download glyph instead of a navigation chevron. -->
        <q-item-section side>
          <DownloadIcon :size="20" class="settings-menu-action" />
        </q-item-section>
      </q-item>

      <!-- import wallet backup -->
      <q-item clickable v-ripple @click="confirmImport = true">
        <q-item-section>
          <q-item-label>{{
            $t("Settings.advanced.developer.import_wallet.button")
          }}</q-item-label>
          <q-item-label caption v-if="!confirmImport">{{
            $t("Settings.advanced.developer.import_wallet.description")
          }}</q-item-label>
          <div v-if="confirmImport" class="q-mt-xs">
            <span class="text-caption">{{
              $t("Settings.advanced.developer.import_wallet.confirm_question")
            }}</span>
            <div class="row items-center q-gutter-sm q-mt-xs">
              <q-btn
                size="sm"
                rounded
                outline
                class="q-px-md"
                @click.stop="confirmImport = false"
                >{{
                  $t("Settings.advanced.developer.import_wallet.cancel")
                }}</q-btn
              >
              <q-btn
                size="sm"
                rounded
                outline
                class="q-px-md"
                color="negative"
                @click.stop="
                  confirmImport = false;
                  browseBackupFile();
                "
                >{{
                  $t("Settings.advanced.developer.import_wallet.confirm")
                }}</q-btn
              >
            </div>
          </div>
          <input
            type="file"
            ref="fileUpload"
            accept=".json"
            style="display: none"
            @change="onChangeFileUpload"
          />
        </q-item-section>
        <q-item-section side>
          <q-icon name="chevron_right" class="settings-menu-chevron" />
        </q-item-section>
      </q-item>
    </SettingsSection>

    <SettingsSection>
      <!-- reset wallet -->
      <q-item clickable v-ripple @click="confirmNuke = true">
        <q-item-section>
          <q-item-label class="text-negative">{{
            $t("Settings.advanced.developer.reset_wallet.button")
          }}</q-item-label>
          <q-item-label caption v-if="!confirmNuke">{{
            $t("Settings.advanced.developer.reset_wallet.description")
          }}</q-item-label>
          <div v-if="confirmNuke" class="q-mt-xs">
            <span class="text-caption">{{
              $t("Settings.advanced.developer.reset_wallet.confirm_question")
            }}</span>
            <div class="row items-center q-gutter-sm q-mt-xs">
              <q-btn
                size="sm"
                rounded
                outline
                class="q-px-md"
                @click.stop="confirmNuke = false"
                >{{
                  $t("Settings.advanced.developer.reset_wallet.cancel")
                }}</q-btn
              >
              <q-btn
                size="sm"
                rounded
                outline
                class="q-px-md"
                color="negative"
                @click.stop="
                  confirmNuke = false;
                  nukeWallet();
                "
                >{{
                  $t("Settings.advanced.developer.reset_wallet.confirm")
                }}</q-btn
              >
            </div>
          </div>
        </q-item-section>
        <q-item-section side>
          <q-icon name="chevron_right" class="settings-menu-chevron" />
        </q-item-section>
      </q-item>
    </SettingsSection>
  </SettingsPageShell>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapActions, mapState, mapWritableState } from "pinia";
import { getShortUrl } from "src/js/wallet-helpers";
import { useMintsStore } from "src/stores/mints";
import { useWalletStore } from "src/stores/wallet";
import { useNostrStore } from "src/stores/nostr";
import { useNpubCashStore } from "src/stores/npubcash";
import { useUiStore } from "src/stores/ui";
import { useProofsStore } from "src/stores/proofs";
import { useDexieStore } from "src/stores/dexie";
import { useWelcomeStore } from "src/stores/welcome";
import { useStorageStore } from "src/stores/storage";
import { useNostrUserStore } from "src/stores/nostrUser";
import SettingsPageShell from "./SettingsPageShell.vue";
import SettingsSection from "./SettingsSection.vue";
import {
  Copy as CopyIcon,
  Download as DownloadIcon,
  RefreshCw as RefreshCwIcon,
  RotateCcw as RotateCcwIcon,
  Landmark as LandmarkIcon,
  Plus as PlusIcon,
} from "lucide-vue-next";

export default defineComponent({
  name: "AdvancedSettings",
  mixins: [windowMixin],
  components: {
    SettingsPageShell,
    SettingsSection,
    CopyIcon,
    DownloadIcon,
    RefreshCwIcon,
    RotateCcwIcon,
    PlusIcon,
    LandmarkIcon,
  },
  data: function () {
    return {
      confirmMnemonic: false,
      confirmNuke: false,
      confirmImport: false,
    };
  },
  computed: {
    ...mapState(useMintsStore, [
      "activeMintUrl",
      "activeUnit",
      "mints",
      "activeProofs",
    ]),
    ...mapWritableState(useWalletStore, ["keysetCounters"]),
    ...mapState(useUiStore, ["showDebugConsole"]),
    keysetCountersByMint() {
      const mints = this.mints;
      const keysetCountersByMint = {}; // {mintUrl: [keysetCounter: {id: string, count: number}, ...]}
      for (const mint of mints) {
        const mintIds = mint.keysets.map((keyset) => keyset.id);
        const keysetCounterThisMint = this.keysetCounters.filter((entry) =>
          mintIds.includes(entry.id)
        );
        keysetCountersByMint[mint.url] = keysetCounterThisMint;
      }
      return keysetCountersByMint;
    },
  },
  methods: {
    ...mapActions(useNostrStore, ["initSigner"]),
    ...mapActions(useNpubCashStore, ["refreshNpubCashConnection"]),
    ...mapActions(useWalletStore, [
      "newMnemonic",
      "checkProofsSpendable",
      "increaseKeysetCounter",
    ]),
    ...mapActions(useProofsStore, ["serializeProofs"]),
    ...mapActions(useDexieStore, ["deleteAllTables"]),
    ...mapActions(useStorageStore, ["restoreFromBackup", "exportWalletState"]),
    generateNewMnemonic: async function () {
      this.newMnemonic();
      await this.initSigner();
      await this.refreshNpubCashConnection();
    },
    shortUrl: function (url) {
      return getShortUrl(url);
    },
    mintFor: function (url) {
      return this.mints.find((m) => m.url === url);
    },
    abbreviateKeysetId: function (id) {
      const value = String(id || "");
      if (value.length <= 24) {
        return value;
      }
      return `${value.slice(0, 8)}…${value.slice(-8)}`;
    },
    toggleTerminal: function () {
      useUiStore().toggleDebugConsole();
    },
    unsetAllReservedProofs: async function () {
      // mark all this.proofs as reserved=false
      const proofsStore = useProofsStore();
      await proofsStore.setReserved(await proofsStore.getProofs(), false);
      this.notifySuccess(
        this.$t("Settings.advanced.notifications.reserved_unset")
      );
    },
    checkActiveProofsSpendable: async function () {
      // iterate over this.activeProofs in batches of 50 and check if they are spendable
      const wallet = await useWalletStore().mintWallet(
        this.activeMintUrl,
        this.activeUnit
      );
      const proofs = this.activeProofs.flat();
      console.log("Checking proofs", proofs);
      const allSpentProofs = [];
      const batch_size = 50;
      for (let i = 0; i < proofs.length; i += batch_size) {
        console.log("Checking proofs", i, i + batch_size);
        const batch = proofs.slice(i, i + batch_size);
        const spent = await this.checkProofsSpendable(batch, wallet, true);
        allSpentProofs.push(spent);
      }
      const spentProofs = allSpentProofs.flat();
      if (spentProofs.length > 0) {
        console.log("Spent proofs", spentProofs);
        this.notifySuccess(
          this.$t("Settings.advanced.notifications.removed_spent", {
            count: spentProofs.length,
          })
        );
      } else {
        this.notifySuccess(this.$t("Settings.advanced.notifications.no_spent"));
      }
    },
    exportActiveProofs: async function () {
      // export active proofs
      const token = await this.serializeProofs(this.activeProofs);
      this.copyText(token);
    },
    showOnboarding: function () {
      const welcomeStore = useWelcomeStore();
      welcomeStore.resetWelcome();
      this.$router.push("/welcome");
    },
    nukeWallet: async function () {
      // create a backup just in case
      await this.exportWalletState();
      // clear dexie tables
      await this.deleteAllTables();
      // clear nostr user databases
      await useNostrUserStore().clearAllDatabases();
      // clear mint reviews database
      try {
        const { useMintRecommendationsStore } = await import(
          "src/stores/mintRecommendations"
        );
        await useMintRecommendationsStore().clearAllDatabases();
      } catch {}
      localStorage.clear();
      window.location.href = "/";
    },
    browseBackupFile: function () {
      this.$refs.fileUpload.click();
    },
    onChangeFileUpload: function () {
      const file = this.$refs.fileUpload.files[0];
      if (file) {
        this.readBackupFile(file);
      }
    },
    readBackupFile: function (file) {
      const reader = new FileReader();
      reader.onload = (f) => {
        try {
          const content = f.target.result;
          const backup = JSON.parse(content);
          this.restoreFromBackup(backup);
        } catch (error) {
          console.error("Error reading backup file:", error);
          this.notifyError(
            this.$t("Settings.advanced.notifications.invalid_backup")
          );
        }
      };
      reader.onerror = () => {
        this.notifyError(this.$t("Settings.advanced.notifications.read_error"));
      };
      reader.readAsText(file);
    },
  },
});
</script>

<style>
.keyset-counters {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.keyset-counter-group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  width: 100%;
}

.keyset-mint-label {
  color: var(--app-text-muted);
  flex: 0 1 100%;
  font-size: 13px;
  gap: 8px;
  margin-top: 4px;
}

.keyset-mint-icon {
  height: 100%;
  object-fit: cover;
  width: 100%;
}

.keyset-mint-glyph {
  color: var(--app-text-muted);
}

/* Keysets of one mint sit in one tinted group, a hairline between rows. */
.keyset-counter-list {
  background: var(--app-group-fill);
  border-radius: 12px;
  overflow: hidden;
  width: 100%;
}

.keyset-counter-row {
  align-items: center;
  cursor: pointer;
  display: flex;
  gap: 12px;
  min-height: 56px;
  padding-block: 4px;
  padding-inline: 16px 6px;
}

.keyset-counter-row + .keyset-counter-row {
  border-top: 1px solid var(--app-border);
}

.keyset-counter-plus {
  color: var(--app-text);
  flex: none;
  height: 44px;
  width: 44px;
}

.keyset-id {
  color: var(--app-text);
  font-size: 15px;
  min-width: 0;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  overflow-wrap: normal;
}

.keyset-counter-text {
  color: var(--app-text-muted);
  flex: none;
  font-variant-numeric: tabular-nums;
  margin-inline-start: auto;
  white-space: nowrap;
}
</style>
