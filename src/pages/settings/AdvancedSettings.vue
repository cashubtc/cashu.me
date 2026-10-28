<template>
  <SettingsPageShell
    :title="$t('Settings.menu.advanced.title')"
    :caption="$t('Settings.menu.advanced.caption')"
  >
    <SettingsSection
      :title="$t('Settings.advanced.developer.title')"
      :caption="$t('Settings.advanced.developer.description')"
    >
      <!-- remove spent proofs -->
      <!-- Runs straight away, so an action glyph like the export rows, not a chevron. -->
      <SettingsActionRow
        :label="$t('Settings.advanced.developer.remove_spent.button')"
        :caption="$t('Settings.advanced.developer.remove_spent.description')"
        @click="checkActiveProofsSpendable"
      >
        <template #side>
          <RefreshCwIcon :size="20" class="settings-menu-action" />
        </template>
      </SettingsActionRow>

      <!-- debug console -->
      <!-- On or off, so a switch bound to its saved state, like every other setting. -->
      <SettingsToggleRow
        :model-value="showDebugConsole"
        :label="$t('Settings.advanced.developer.debug_console.button')"
        :caption="$t('Settings.advanced.developer.debug_console.description')"
        @update:model-value="toggleTerminal"
      />

      <!-- The design system board (development builds only, like its route). -->
      <SettingsActionRow
        v-if="isDev"
        @click="$router.push('/design-system')"
        :label="$t('Settings.advanced.developer.design_system.title')"
        :caption="$t('Settings.advanced.developer.design_system.description')"
      />

      <!-- keyset counters: one row that opens the counters grouped by mint -->
      <KeysetCountersRow
        v-if="keysetGroups.length"
        :groups="keysetGroups"
        @increase="(id) => increaseKeysetCounter(id, 1)"
      />

      <!-- unset reserved proofs -->
      <SettingsActionRow
        :label="$t('Settings.advanced.developer.unset_reserved.button')"
        :caption="$t('Settings.advanced.developer.unset_reserved.description')"
        @click="unsetAllReservedProofs"
      >
        <template #side>
          <RotateCcwIcon :size="20" class="settings-menu-action" />
        </template>
      </SettingsActionRow>

      <!-- show onboarding -->
      <SettingsActionRow
        :label="$t('Settings.advanced.developer.show_onboarding.button')"
        :caption="$t('Settings.advanced.developer.show_onboarding.description')"
        @click="showOnboarding"
      />
    </SettingsSection>

    <SettingsSection :title="$t('Settings.advanced.backup_files_title')">
      <!-- export proofs -->
      <!-- Copies a token straight away, so a copy glyph instead of a navigation chevron. -->
      <SettingsActionRow
        :label="$t('Settings.advanced.developer.export_proofs.button')"
        :caption="$t('Settings.advanced.developer.export_proofs.description')"
        @click="exportActiveProofs"
      >
        <template #side>
          <CopyIcon :size="20" class="settings-menu-action" />
        </template>
      </SettingsActionRow>

      <!-- export wallet data -->
      <!-- Downloads a file straight away, so a download glyph instead of a navigation chevron. -->
      <SettingsActionRow
        :label="$t('Settings.advanced.developer.export_wallet.button')"
        :caption="$t('Settings.advanced.developer.export_wallet.description')"
        @click="exportWalletState"
      >
        <template #side>
          <DownloadIcon :size="20" class="settings-menu-action" />
        </template>
      </SettingsActionRow>

      <!-- import wallet backup -->
      <SettingsActionRow
        :label="$t('Settings.advanced.developer.import_wallet.button')"
        :caption="
          confirmImport
            ? ''
            : $t('Settings.advanced.developer.import_wallet.description')
        "
        @click="confirmImport = true"
      >
        <InlineConfirm
          v-if="confirmImport"
          :question="
            $t('Settings.advanced.developer.import_wallet.confirm_question')
          "
          :cancel-label="$t('Settings.advanced.developer.import_wallet.cancel')"
          :confirm-label="
            $t('Settings.advanced.developer.import_wallet.confirm')
          "
          @cancel="confirmImport = false"
          @confirm="
            confirmImport = false;
            browseBackupFile();
          "
        />
        <input
          type="file"
          ref="fileUpload"
          accept=".json"
          style="display: none"
          @change="onChangeFileUpload"
        />
      </SettingsActionRow>
    </SettingsSection>

    <SettingsSection :title="$t('Settings.advanced.danger_zone_title')">
      <!-- new seed -->
      <SettingsActionRow
        :label="$t('Settings.advanced.developer.new_seed.button')"
        :caption="
          confirmMnemonic
            ? ''
            : $t('Settings.advanced.developer.new_seed.description')
        "
        caution
        @click="confirmMnemonic = true"
      >
        <InlineConfirm
          v-if="confirmMnemonic"
          :question="
            $t('Settings.advanced.developer.new_seed.confirm_question')
          "
          :cancel-label="$t('Settings.advanced.developer.new_seed.cancel')"
          :confirm-label="$t('Settings.advanced.developer.new_seed.confirm')"
          @cancel="confirmMnemonic = false"
          @confirm="
            confirmMnemonic = false;
            generateNewMnemonic();
          "
        />
      </SettingsActionRow>

      <!-- reset wallet -->
      <SettingsActionRow
        :label="$t('Settings.advanced.developer.reset_wallet.button')"
        :caption="
          confirmNuke
            ? ''
            : $t('Settings.advanced.developer.reset_wallet.description')
        "
        danger
        @click="confirmNuke = true"
      >
        <InlineConfirm
          v-if="confirmNuke"
          :question="
            $t('Settings.advanced.developer.reset_wallet.confirm_question')
          "
          :cancel-label="$t('Settings.advanced.developer.reset_wallet.cancel')"
          :confirm-label="
            $t('Settings.advanced.developer.reset_wallet.confirm')
          "
          @cancel="confirmNuke = false"
          @confirm="
            confirmNuke = false;
            nukeWallet();
          "
        />
      </SettingsActionRow>
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
import SettingsActionRow from "src/components/ui/SettingsActionRow.vue";
import SettingsToggleRow from "src/components/ui/SettingsToggleRow.vue";
import KeysetCountersRow from "src/components/KeysetCountersRow.vue";
import InlineConfirm from "src/components/ui/InlineConfirm.vue";
import SettingsSection from "./SettingsSection.vue";
import {
  Copy as CopyIcon,
  Download as DownloadIcon,
  RefreshCw as RefreshCwIcon,
  RotateCcw as RotateCcwIcon,
} from "lucide-vue-next";

export default defineComponent({
  name: "AdvancedSettings",
  mixins: [windowMixin],
  components: {
    SettingsActionRow,
    SettingsToggleRow,
    KeysetCountersRow,
    InlineConfirm,
    SettingsPageShell,
    SettingsSection,
    CopyIcon,
    DownloadIcon,
    RefreshCwIcon,
    RotateCcwIcon,
  },
  data: function () {
    return {
      confirmMnemonic: false,
      confirmNuke: false,
      confirmImport: false,
      isDev: Boolean(process.env.DEV),
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
    // Mints that have keyset counters, for the counter sheet.
    keysetGroups() {
      return Object.entries(this.keysetCountersByMint)
        .filter(([, counters]) => counters.length)
        .map(([url, counters]) => {
          const mint = this.mintFor(url);
          return {
            url,
            name: mint?.nickname || mint?.info?.name || this.shortUrl(url),
            iconUrl: mint?.info?.icon_url ?? null,
            keysets: counters.map((c) => ({ id: c.id, counter: c.counter })),
          };
        });
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
