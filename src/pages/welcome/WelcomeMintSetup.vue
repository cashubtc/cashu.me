<template>
  <div class="q-pa-md flex flex-center">
    <div style="max-width: 900px; width: 100%">
      <div class="text-center q-mb-md">
        <q-icon name="account_tree" size="4em" color="primary" />
        <h2 class="q-mt-xl">Add your mints</h2>
        <p class="q-mt-sm">Discover mints on Nostr or add manually. You need at least one mint.</p>
      </div>

      <!-- Recovery-specific: search user mints on nostr using seed -->
      <div v-if="welcome.onboardingPath === 'recover'">
        <NostrMintRestore :mnemonic="restore.mnemonicToRestore" :is-mnemonic-valid="isSeedValid" />
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
          <q-input
            rounded
            outlined
            v-model="addMintData.nickname"
            placeholder="Nickname (optional)"
            @keydown.enter.prevent="sanitizeMintUrlAndShowAddDialog"
            ref="mintNicknameInput"
            class="mint-input"
          />
        </div>
        <div class="row justify-between items-center q-mt-xs">
          <q-btn
            flat
            :disable="addMintData.url.length === 0"
            @click="addMintData.url.length > 0 ? sanitizeMintUrlAndShowAddDialog() : null"
            class="text-white"
            :class="{ 'text-grey-7': addMintData.url.length === 0 }"
          >
            <q-icon name="add" size="20px" class="q-mr-sm" />
            <span>Add mint</span>
          </q-btn>
        </div>
      </div>

      <!-- Discover mints on nostr (global) -->
      <div class="q-mt-lg q-px-md">
        <div class="section-divider q-mb-md">
          <div class="divider-line"></div>
          <div class="divider-text">Discover mints</div>
          <div class="divider-line"></div>
        </div>
        <div class="q-px-xs text-left">
          <q-btn class="q-ml-sm q-px-md" color="primary" rounded outline :loading="discovering" @click="discover">
            Discover
            <template v-slot:loading>
              <q-spinner-hourglass class="on-left" /> Discovering…
            </template>
          </q-btn>
          <div v-if="mintRecommendations.length > 0" class="q-mt-md">
            <q-item>
              <q-item-section>
                <q-item-label overline>{{ mintRecommendations.length }} recommendations</q-item-label>
                <q-item-label caption>Popular mints other users recommended on Nostr.</q-item-label>
              </q-item-section>
            </q-item>
            <q-list bordered separator class="q-mt-sm">
              <q-item v-for="mint in mintRecommendations" :key="mint.url">
                <q-item-section>
                  <q-item-label caption style="word-break: break-word">{{ mint.url }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-badge :label="mint.count" color="primary" class="q-mr-sm" />
                  <q-btn dense round flat icon="add" @click="addDiscovered(mint.url)" :disable="isExistingMint(mint.url)" />
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </div>
      </div>

      <div class="q-mt-xl text-center">
        <q-btn color="primary" rounded @click="markDone" :disable="mints.length === 0">Continue</q-btn>
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
import { computed, ref } from 'vue';
import { useWelcomeStore } from 'src/stores/welcome';
import { useRestoreStore } from 'src/stores/restore';
import { useMintsStore } from 'src/stores/mints';
import { useNostrStore } from 'src/stores/nostr';
import { useUiStore } from 'src/stores/ui';
import { notifyError, notifySuccess } from 'src/js/notify';
import AddMintDialog from 'src/components/AddMintDialog.vue';
import NostrMintRestore from 'src/components/NostrMintRestore.vue';

export default {
  name: 'WelcomeMintSetup',
  components: { AddMintDialog, NostrMintRestore },
  setup() {
    const welcome = useWelcomeStore();
    const restore = useRestoreStore();
    const mints = useMintsStore();
    const nostr = useNostrStore();
    const ui = useUiStore();

    const discovering = ref(false);

    const isSeedValid = computed(() => {
      const s = restore.mnemonicToRestore?.trim() || '';
      return s.split(/\s+/).length >= 12;
    });

    const addMintData = mints.addMintData; // reactive from store
    const showAddMintDialog = computed({
      get: () => mints.showAddMintDialog,
      set: (v: boolean) => (mints.showAddMintDialog = v),
    });
    const addMintBlocking = computed(() => mints.addMintBlocking);

    const sanitizeMintUrlAndShowAddDialog = () => {
      mints.showAddMintDialog = true;
    };
    const addMintInternal = async (data: { url: string; nickname?: string }) => {
      await mints.addMint(data, true);
      mints.addMintData = { url: '', nickname: '' } as any;
    };

    const mintRecommendations = computed(() => nostr.mintRecommendations);
    const discover = async () => {
      discovering.value = true;
      try {
        await nostr.initNdkReadOnly();
        let tries = 0;
        let found: any[] = [];
        while (found.length === 0 && tries < 5) {
          try { found = await nostr.fetchMints(); } catch {}
          tries++;
        }
        if (found.length === 0) notifyError('No mints found');
        else notifySuccess(`Found ${found.length} mints`);
      } finally {
        discovering.value = false;
      }
    };
    const isExistingMint = (url: string) => mints.mints.some(m => m.url === url);
    const addDiscovered = async (url: string) => {
      await mints.addMint({ url }, true);
    };

    const markDone = () => {
      welcome.mintSetupCompleted = true;
    };

    return {
      welcome, restore, mints,
      isSeedValid,
      addMintData, showAddMintDialog, addMintBlocking,
      sanitizeMintUrlAndShowAddDialog, addMintInternal,
      mintRecommendations, discover, discovering,
      isExistingMint, addDiscovered,
      markDone,
    };
  }
}
</script>

<style scoped>
@import "src/css/mintlist.css";
.section-divider { display: flex; align-items: center; width: 100%; margin-bottom: 16px; }
.divider-line { flex: 1; height: 1px; background-color: #48484a; }
.divider-text { padding: 0 10px; font-size: 14px; font-weight: 600; color: #ffffff; text-transform: uppercase; }
.mint-input .q-field__control { height: 54px; border-radius: 100px; }
</style>
