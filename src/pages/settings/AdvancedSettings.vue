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
      <q-item
        clickable
        v-ripple
        @click="confirmMnemonic = true"
        :disable="confirmMnemonic"
      >
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
      </q-item>

      <!-- debug console -->
      <q-item clickable v-ripple @click="toggleTerminal">
        <q-item-section>
          <q-item-label>{{
            $t("Settings.advanced.developer.debug_console.button")
          }}</q-item-label>
          <q-item-label caption>{{
            $t("Settings.advanced.developer.debug_console.description")
          }}</q-item-label>
        </q-item-section>
      </q-item>

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
              <q-item-label class="keyset-mint-label" caption>
                {{ shortUrl(mintUrl) }}
              </q-item-label>
              <q-btn
                class="keyset-counter-btn"
                dense
                v-for="(counter, id) in mintCounter"
                :key="id"
                flat
                :title="counter.id"
                @click="increaseKeysetCounter(counter.id, 1)"
              >
                <span class="keyset-id">{{
                  abbreviateKeysetId(counter.id)
                }}</span>
                <span class="keyset-counter-separator">-</span>
                <span class="keyset-counter-text">
                  {{
                    $t("Settings.advanced.developer.keyset_counters.counter", {
                      count: counter.counter,
                    })
                  }}
                </span>
              </q-btn>
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
      </q-item>

      <!-- import wallet backup -->
      <q-item
        clickable
        v-ripple
        @click="confirmImport = true"
        :disable="confirmImport"
      >
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
      </q-item>

      <!-- reset wallet -->
      <q-item
        clickable
        v-ripple
        @click="confirmNuke = true"
        :disable="confirmNuke"
      >
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
import { useNPCStore } from "src/stores/npubcash";
import { useUiStore } from "src/stores/ui";
import { useProofsStore } from "src/stores/proofs";
import { useDexieStore } from "src/stores/dexie";
import { useWelcomeStore } from "src/stores/welcome";
import { useStorageStore } from "src/stores/storage";
import { useNostrUserStore } from "src/stores/nostrUser";
import SettingsPageShell from "./SettingsPageShell.vue";
import SettingsSection from "./SettingsSection.vue";

export default defineComponent({
  name: "AdvancedSettings",
  mixins: [windowMixin],
  components: {
    SettingsPageShell,
    SettingsSection,
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
    ...mapActions(useNPCStore, ["generateNPCConnection"]),
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
      await this.generateNPCConnection();
    },
    shortUrl: function (url) {
      return getShortUrl(url);
    },
    abbreviateKeysetId: function (id) {
      const value = String(id || "");
      if (value.length <= 24) {
        return value;
      }
      return `${value.slice(0, 8)}...${value.slice(-8)}`;
    },
    toggleTerminal: function () {
      useUiStore().toggleDebugConsole();
    },
    unsetAllReservedProofs: async function () {
      // mark all this.proofs as reserved=false
      const proofsStore = useProofsStore();
      await proofsStore.setReserved(await proofsStore.getProofs(), false);
      this.notifySuccess("All reserved proofs unset");
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
        this.notifySuccess("Removed " + spentProofs.length + " spent proofs");
      } else {
        this.notifySuccess("No spent proofs found");
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
      this.deleteAllTables();
      // clear nostr user databases
      useNostrUserStore().clearAllDatabases();
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
          this.notifyError("Invalid backup file format");
        }
      };
      reader.onerror = () => {
        this.notifyError("Error reading file");
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
  flex: 0 1 100%;
}

.keyset-counter-btn {
  min-height: 28px;
}

.keyset-id {
  font-family: monospace;
  overflow-wrap: normal;
}

.keyset-counter-separator {
  margin: 0 4px;
}

.keyset-counter-text {
  min-width: 0;
}
</style>
