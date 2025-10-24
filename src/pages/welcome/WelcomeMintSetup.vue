<template>
  <div class="q-pa-md flex flex-center">
    <div style="max-width: 900px; width: 100%">
      <div class="text-center q-mb-md">
        <q-icon name="account_tree" size="4em" color="primary" />
        <h2 class="q-mt-xl">Add your mints</h2>
        <p class="q-mt-sm">
          Discover mints on Nostr or add manually. You need at least one mint.
        </p>
      </div>

      <!-- Your added mints -->
      <div class="q-px-md">
        <div class="section-divider q-mb-md">
          <div class="divider-line"></div>
          <div class="divider-text">Your mints</div>
          <div class="divider-line"></div>
        </div>
        <!-- Restoring indicator during recover + Nostr search -->
        <div
          v-if="welcome.onboardingPath === 'recover' && restoringMints"
          class="row items-center q-mb-md q-px-lg"
        >
          <q-spinner-dots size="24px" color="grey-5" class="q-mr-sm" />
          <div class="text-grey-6">Restoring mints…</div>
        </div>
        <div
          v-if="mints.mints.length === 0"
          class="text-left q-mb-sm text-grey-6"
        >
          No mints added yet.
        </div>
        <div
          v-for="mint in mints.mints"
          :key="mint.url"
          class="q-px-md q-mb-md"
        >
          <q-item
            class="mint-card cursor-pointer"
            :style="{
              'border-radius': '10px',
              border: '1px solid rgba(128,128,128,0.2)',
              padding: '0px',
              position: 'relative',
            }"
          >
            <div class="full-width" style="position: relative">
              <div class="row items-center q-pa-md">
                <div class="col">
                  <div class="row items-center">
                    <q-avatar
                      v-if="getMintIconUrlExisting(mint)"
                      size="34px"
                      class="q-mr-sm"
                    >
                      <q-img
                        spinner-color="white"
                        spinner-size="xs"
                        :src="getMintIconUrlExisting(mint)"
                        alt="Mint Icon"
                        style="height: 34px; max-width: 34px; font-size: 12px"
                      />
                    </q-avatar>
                    <div class="mint-info-container">
                      <div
                        v-if="mint.nickname || mint.info?.name"
                        class="mint-name"
                      >
                        {{ mint.nickname || mint.info?.name }}
                      </div>
                      <div class="text-grey-6 mint-url">{{ mint.url }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </q-item>
        </div>
      </div>

      <!-- Manual add mint -->
      <div class="q-pt-xs q-px-md">
        <div class="section-divider q-mb-md">
          <div class="divider-line"></div>
          <div class="divider-text">Add mint</div>
          <div class="divider-line"></div>
        </div>
        <div class="add-mint-inputs">
          <q-input
            rounded
            outlined
            v-model="addMintData.url"
            placeholder="https://"
            @keydown.enter.prevent="sanitizeMintUrlAndShowAddDialog"
            ref="mintInput"
            class="q-mb-md mint-input url-input"
          />
        </div>
        <div class="row justify-between items-center q-mt-xs">
          <q-btn
            flat
            :disable="addMintData.url.length === 0"
            @click="
              addMintData.url.length > 0
                ? sanitizeMintUrlAndShowAddDialog()
                : null
            "
            class="text-white"
            :class="{ 'text-grey-7': addMintData.url.length === 0 }"
          >
            <q-icon name="add" size="20px" class="q-mr-sm" />
            <span>Add mint</span>
          </q-btn>
        </div>
      </div>

      <!-- Recovery-specific: search user mints on nostr using seed -->
      <div v-if="welcome.onboardingPath === 'recover'">
        <NostrMintRestore
          :mnemonic="restore.mnemonicToRestore"
          :is-mnemonic-valid="isSeedValid"
          :auto-add="true"
        />
      </div>

      <!-- Discover mints on nostr (global) -->
      <div class="q-mt-lg q-px-md">
        <div class="section-divider q-mb-md">
          <div class="divider-line"></div>
          <div class="divider-text">Discover mints</div>
          <div class="divider-line"></div>
        </div>
        <div class="q-px-xs text-left">
          <div class="row justify-center q-mb-md q-px-xl">
            <q-btn
              class="q-ml-sm q-px-md full-width"
              color="primary"
              rounded
              :loading="discovering"
              @click="discover"
            >
              Discover
              <template v-slot:loading>
                <q-spinner-hourglass class="on-left" /> Discovering…
              </template>
            </q-btn>
          </div>
          <div v-if="discoverList.length > 0" class="q-my-lg">
            <q-item>
              <q-item-section>
                <q-item-label overline
                  >{{ discoverList.length }} recommendations</q-item-label
                >
                <q-item-label caption
                  >Popular mints other users recommended on Nostr.</q-item-label
                >
              </q-item-section>
            </q-item>
            <div class="q-pt-sm">
              <div
                v-for="rec in discoverList"
                :key="rec.url"
                class="q-px-md q-mb-md"
              >
                <q-item
                  class="mint-card"
                  :style="{
                    'border-radius': '10px',
                    border: '1px solid rgba(128,128,128,0.2)',
                    padding: '0px',
                    position: 'relative',
                  }"
                >
                  <div class="full-width" style="position: relative">
                    <div class="row items-center q-pa-md">
                      <div class="col">
                        <div class="row items-center">
                          <q-avatar
                            v-if="getMintIconUrl(rec.url)"
                            size="34px"
                            class="q-mr-sm"
                          >
                            <q-img
                              spinner-color="white"
                              spinner-size="xs"
                              :src="getMintIconUrl(rec.url)"
                              alt="Mint Icon"
                              style="
                                height: 34px;
                                max-width: 34px;
                                font-size: 12px;
                              "
                            />
                          </q-avatar>
                          <q-spinner-dots
                            v-else-if="isFetchingMintInfo(rec.url)"
                            size="34px"
                            color="grey-5"
                            class="q-mr-sm"
                          />
                          <div class="mint-info-container">
                            <div class="mint-name">
                              {{ getMintDisplayName(rec.url) }}
                            </div>
                            <div class="text-grey-6 mint-url">
                              {{ rec.url }}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="col-auto">
                        <q-badge
                          :label="rec.count"
                          color="primary"
                          class="q-mr-sm"
                        />
                        <q-btn
                          dense
                          round
                          flat
                          icon="add"
                          @click="addDiscovered(rec.url)"
                          :disable="isExistingMint(rec.url)"
                        />
                      </div>
                    </div>
                  </div>
                </q-item>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="q-mt-xl text-center">
        <q-btn
          color="primary"
          rounded
          @click="markDone"
          :disable="mints.mints.length === 0"
          >Continue</q-btn
        >
      </div>

      <AddMintDialog
        :addMintData="addMintData"
        :showAddMintDialog="showAddMintDialog"
        @update:showAddMintDialog="showAddMintDialog = $event"
        :addMintBlocking="addMintBlocking"
        @add="addMintInternal"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, ref, watch } from "vue";
import { useWelcomeStore } from "src/stores/welcome";
import { useRestoreStore } from "src/stores/restore";
import { useMintsStore, MintClass } from "src/stores/mints";
import { useNostrStore } from "src/stores/nostr";
import { useUiStore } from "src/stores/ui";
import { notifyError, notifySuccess } from "src/js/notify";
import AddMintDialog from "src/components/AddMintDialog.vue";
import NostrMintRestore from "src/components/NostrMintRestore.vue";
import { useNostrMintBackupStore } from "src/stores/nostrMintBackup";

export default {
  name: "WelcomeMintSetup",
  components: { AddMintDialog, NostrMintRestore },
  setup() {
    const welcome = useWelcomeStore();
    const restore = useRestoreStore();
    const mints = useMintsStore();
    const nostr = useNostrStore();
    const nostrMintBackup = useNostrMintBackupStore();
    const ui = useUiStore();

    const discovering = ref(false);

    const isSeedValid = computed(() => {
      const s = restore.mnemonicToRestore?.trim() || "";
      return s.split(/\s+/).length >= 12;
    });

    // Show spinner while the Nostr mint search is in progress in recover flow
    const restoringMints = computed(
      () => isSeedValid.value && nostrMintBackup.searchInProgress
    );

    const addMintData = mints.addMintData; // reactive from store
    const showAddMintDialog = computed({
      get: () => mints.showAddMintDialog,
      set: (v: boolean) => (mints.showAddMintDialog = v),
    });
    const addMintBlocking = computed(() => mints.addMintBlocking);

    const sanitizeMintUrlAndShowAddDialog = () => {
      mints.showAddMintDialog = true;
    };
    const addMintInternal = async (data: {
      url: string;
      nickname?: string;
    }) => {
      await mints.addMint(data, true);
      mints.addMintData = { url: "", nickname: "" } as any;
    };

    const mintRecommendations = computed(() => nostr.mintRecommendations);
    const isExistingMint = (url: string) =>
      mints.mints.some((m) => m.url === url);
    const discoverList = computed(() =>
      mintRecommendations.value.filter((r) => !isExistingMint(r.url))
    );
    // Fetch mint info and cache it for discovered mints
    const mintInfoCache = ref(new Map<string, any>());
    const fetchingMintInfo = ref(new Set<string>());
    const getMintInfo = (url: string) => mintInfoCache.value.get(url);
    const getMintIconUrl = (url: string) => {
      const info = getMintInfo(url);
      return info && info.icon_url ? info.icon_url : null;
    };
    const getMintDisplayName = (url: string) => {
      const info = getMintInfo(url);
      return info && info.name ? info.name : url.replace(/^https?:\/\//, "");
    };
    const isFetchingMintInfo = (url: string) => fetchingMintInfo.value.has(url);
    const fetchMintInfo = async (url: string) => {
      try {
        const tempMint = { url, keys: [], keysets: [] } as any;
        const info = await new MintClass(tempMint).api.getInfo();
        mintInfoCache.value.set(url, info);
      } catch (e) {
        mintInfoCache.value.set(url, null);
      } finally {
        fetchingMintInfo.value.delete(url);
      }
    };
    const fetchMintInfoForDiscovered = () => {
      discoverList.value.forEach((rec) => {
        if (
          !mintInfoCache.value.has(rec.url) &&
          !fetchingMintInfo.value.has(rec.url)
        ) {
          fetchingMintInfo.value.add(rec.url);
          fetchMintInfo(rec.url);
        }
      });
    };
    watch(discoverList, () => fetchMintInfoForDiscovered(), {
      immediate: true,
    });
    const discover = async () => {
      discovering.value = true;
      try {
        await nostr.initNdkReadOnly();
        let tries = 0;
        let found: any[] = [];
        while (found.length === 0 && tries < 5) {
          try {
            found = await nostr.fetchMints();
          } catch {}
          tries++;
        }
        if (found.length === 0) notifyError("No mints found");
        else notifySuccess(`Found ${found.length} mints`);
      } finally {
        discovering.value = false;
      }
    };
    const addDiscovered = async (url: string) => {
      await mints.addMint({ url }, true);
      // remove from discovered list to avoid duplicates
      nostr.mintRecommendations = nostr.mintRecommendations.filter(
        (r) => r.url !== url
      );
    };

    const mintClass = (mint: any) => new MintClass(mint);
    const formatCurrency = (amount: number, unit: string) =>
      ui.formatCurrency(amount, unit);
    const getMintIconUrlExisting = (mint: any) =>
      mint?.info?.icon_url || undefined;

    const markDone = () => {
      welcome.mintSetupCompleted = true;
    };

    return {
      welcome,
      restore,
      mints,
      isSeedValid,
      addMintData,
      showAddMintDialog,
      addMintBlocking,
      sanitizeMintUrlAndShowAddDialog,
      addMintInternal,
      mintRecommendations,
      discover,
      discovering,
      discoverList,
      isExistingMint,
      addDiscovered,
      getMintIconUrl,
      getMintDisplayName,
      isFetchingMintInfo,
      getMintInfo,
      mintClass,
      formatCurrency,
      getMintIconUrlExisting,
      markDone,
      restoringMints,
    };
  },
};
</script>

<style scoped>
@import "src/css/mintlist.css";
.section-divider {
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: 16px;
}
.divider-line {
  flex: 1;
  height: 1px;
  background-color: #48484a;
}
.divider-text {
  padding: 0 10px;
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  text-transform: uppercase;
}
.mint-input .q-field__control {
  height: 54px;
  border-radius: 100px;
}
.mint-card {
  border: 1px solid rgba(128, 128, 128, 0.2);
  border-radius: 10px;
}
</style>
