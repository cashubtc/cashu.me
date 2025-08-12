<template>
  <div
    :class="[
      $q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-dark',
      'q-pa-md',
    ]"
  >
    <div class="q-mb-md">
      <q-btn flat color="primary" to="/creator-hub">
        {{ $t("CreatorHub.profile.back") }}
      </q-btn>
    </div>
    <div class="text-h5 q-mb-md">{{ profile.display_name || npub }}</div>
    <div v-if="profile.picture" class="q-mb-md">
      <img :src="profile.picture" style="max-width: 150px" />
    </div>
    <div v-if="profile.about" class="q-mb-md">{{ profile.about }}</div>

    <q-expansion-item
      class="q-mb-md"
      dense
      dense-toggle
      icon="edit"
      :label="$t('CreatorHub.profile.edit')"
    >
      <CreatorProfileForm />
      <div class="text-center q-mt-md">
        <q-btn color="primary" :disable="!isDirty" @click="saveProfile"
          >Save Changes</q-btn
        >
      </div>
    </q-expansion-item>

    <q-expansion-item
      class="q-mb-md"
      dense
      dense-toggle
      icon="account_circle"
      label="Profile Details"
      v-model="expandProfileDetails"
    >
      <div class="text-caption">
        <div class="row items-center q-gutter-x-sm">
          <div><strong>npub:</strong> {{ npub }}</div>
          <q-btn
            v-if="npub"
            flat
            dense
            icon="content_copy"
            @click="copy(npub)"
          />
        </div>
        <div
          v-if="seedSignerPrivateKeyNsecComputed"
          class="row items-center q-gutter-x-sm q-mt-xs"
        >
          <div>
            <strong>nsec:</strong> {{ seedSignerPrivateKeyNsecComputed }}
          </div>
          <q-btn
            flat
            dense
            icon="content_copy"
            @click="copy(seedSignerPrivateKeyNsecComputed)"
          />
        </div>
        <div
          v-if="privateKeySignerPrivateKey"
          class="row items-center q-gutter-x-sm q-mt-xs"
        >
          <div><strong>hex:</strong> {{ privateKeySignerPrivateKey }}</div>
          <q-btn
            flat
            dense
            icon="content_copy"
            @click="copy(privateKeySignerPrivateKey)"
          />
        </div>
        <div class="q-mt-sm">
          <strong>Wallet balance:</strong>
          {{ walletBalanceFormatted }}
        </div>
        <div><strong>Buckets:</strong> {{ bucketCount }}</div>
        <div><strong>Tiers:</strong> {{ tiers.length }}</div>
      </div>
    </q-expansion-item>

    <q-expansion-item
      class="q-mb-md"
      dense
      dense-toggle
      icon="vpn_key"
      label="P2PK Keys"
      v-model="expandP2PKKeys"
    >
      <div>
        <q-btn color="primary" dense @click="openP2PKDialog"
          >Show P2PK Key</q-btn
        >
        <q-list v-if="p2pkKeys.length" dense bordered class="q-mt-sm">
          <q-item
            v-for="key in p2pkKeys"
            :key="key.publicKey"
            clickable
            @click="showP2PKKeyEntry(key.publicKey)"
          >
            <q-item-section>{{
              shortenString(key.publicKey, 16, 6)
            }}</q-item-section>
            <q-item-section side>
              <q-badge v-if="key.used" color="primary" label="used" />
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </q-expansion-item>

    <q-expansion-item
      v-if="tiers.length"
      class="q-mb-md"
      dense
      dense-toggle
      icon="format_list_bulleted"
      :label="$t('CreatorHub.profile.tiers')"
      v-model="expandTierList"
    >
      <div v-for="tier in tiers" :key="tier.id" class="q-mb-md">
        <div class="text-subtitle1">
          {{ tier.name }} - {{ tier.price_sats }} sats/month
          <span v-if="bitcoinPrice" class="text-caption">
            ({{ formatFiat(tier.price_sats) }})
          </span>
        </div>
        <div
          class="text-caption"
          v-html="renderMarkdown(tier.description)"
        ></div>
        <q-btn color="primary" dense class="q-mt-sm" @click="editProfile">
          {{ $t("CreatorHub.profile.edit") }}
        </q-btn>
      </div>
    </q-expansion-item>
  </div>
  <P2PKDialog v-model="showP2PKDialog" />
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from "vue";
import { storeToRefs } from "pinia";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
import { useClipboard } from "src/composables/useClipboard";
import { useI18n } from "vue-i18n";
import { useNostrStore, publishDiscoveryProfile } from "stores/nostr";
import { useCreatorHubStore } from "stores/creatorHub";
import { useCreatorProfileStore } from "stores/creatorProfile";
import { useP2PKStore } from "stores/p2pk";
import { usePriceStore } from "stores/price";
import { useUiStore } from "stores/ui";
import { useMintsStore } from "stores/mints";
import { useBucketsStore } from "stores/buckets";
import { renderMarkdown as renderMarkdownFn } from "src/js/simple-markdown";
import { notifySuccess, notifyError } from "src/js/notify";
import { shortenString } from "src/js/string-utils";
import CreatorProfileForm from "components/CreatorProfileForm.vue";
import P2PKDialog from "components/P2PKDialog.vue";

export default defineComponent({
  name: "MyProfilePage",
  components: { CreatorProfileForm, P2PKDialog },
  setup() {
    const $q = useQuasar();
    const { t } = useI18n();
    const { copy } = useClipboard();
    const router = useRouter();

    const nostr = useNostrStore();
    const {
      npub,
      seedSignerPrivateKeyNsecComputed,
      privateKeySignerPrivateKey,
    } = storeToRefs(nostr);
    const hub = useCreatorHubStore();
    const profileStore = useCreatorProfileStore();
    const p2pkStore = useP2PKStore();
    const { showP2PKDialog, p2pkKeys } = storeToRefs(p2pkStore);
    const priceStore = usePriceStore();
    const uiStore = useUiStore();
    const mints = useMintsStore();
    const buckets = useBucketsStore();
    const { expandProfileDetails, expandTierList, expandP2PKKeys } =
      storeToRefs(uiStore);
    const {
      display_name,
      picture,
      about,
      pubkey: profilePub,
      mints: profileMints,
      relays: profileRelays,
      isDirty,
    } = storeToRefs(profileStore);
    const bitcoinPrice = computed(() => priceStore.bitcoinPrice);
    const profile = ref<any>({});
    const tiers = ref(hub.getTierArray());
    const profileData = computed(() => ({
      display_name: display_name.value,
      picture: picture.value,
      about: about.value,
    }));
    const walletBalance = computed(() => mints.activeBalance);
    const activeUnit = computed(() => mints.activeUnit);
    const bucketCount = computed(() => buckets.bucketList.length);
    const walletBalanceFormatted = computed(() =>
      uiStore.formatCurrency(walletBalance.value, activeUnit.value)
    );

    async function initProfile() {
      if (!npub.value) return;
      const p = await nostr.getProfile(npub.value);
      if (p) {
        profile.value = { ...p };
        profileStore.setProfile(p);
        profileStore.markClean();
      }
      if (profileStore.mints.length) {
        profileMints.value = [...profileStore.mints];
      }
      if (profileStore.relays.length) {
        profileRelays.value = [...profileStore.relays];
      }
    }

    onMounted(() => {
      initProfile();
    });

    function renderMarkdown(text: string): string {
      return renderMarkdownFn(text || "");
    }

    function formatFiat(sats: number): string {
      if (!priceStore.bitcoinPrice) return "";
      const value = (priceStore.bitcoinPrice / 100000000) * sats;
      return uiStore.formatCurrency(value, "USD", true);
    }

    function editProfile() {
      router.push("/creator-hub");
    }

    async function saveProfile() {
      try {
        await publishDiscoveryProfile({
          profile: profileData.value,
          p2pkPub: profilePub.value,
          mints: profileMints.value,
          relays: profileRelays.value,
        });
        notifySuccess("Profile updated");
        profileStore.markClean();
      } catch (e: any) {
        notifyError(e?.message || "Failed to publish profile");
      }
    }

    function openP2PKDialog() {
      if (!p2pkStore.p2pkKeys.length) {
        p2pkStore.createAndSelectNewKey().then(() => p2pkStore.showLastKey());
      } else {
        p2pkStore.showLastKey();
      }
    }

    function showP2PKKeyEntry(pubKey: string) {
      p2pkStore.showKeyDetails(pubKey);
    }

    return {
      npub,
      seedSignerPrivateKeyNsecComputed,
      privateKeySignerPrivateKey,
      profile,
      tiers,
      display_name,
      picture,
      about,
      profilePub,
      profileMints,
      profileRelays,
      isDirty,
      bitcoinPrice,
      walletBalance,
      activeUnit,
      bucketCount,
      walletBalanceFormatted,
      shortenString,
      renderMarkdown,
      formatFiat,
      openP2PKDialog,
      showP2PKKeyEntry,
      saveProfile,
      copy,
      editProfile,
      showP2PKDialog,
      p2pkKeys,
      expandProfileDetails,
      expandTierList,
      expandP2PKKeys,
    };
  },
});
</script>
