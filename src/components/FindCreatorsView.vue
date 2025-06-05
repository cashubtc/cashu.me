<template>
  <q-page
    class="creators-page q-pa-md"
    :class="$q.dark.isActive ? 'bg-dark text-white' : 'bg-gray-100 text-dark'"
  >
    <div
      class="creators-container"
      :class="$q.dark.isActive ? 'bg-gray-50 text-white' : 'bg-white text-dark'"
    >
      <q-input
        rounded
        outlined
        dense
        v-model="searchInput"
        :placeholder="$t('FindCreators.inputs.search.placeholder')"
        @keydown.enter.prevent="triggerSearch"
      >
        <template #label>
          <div class="row items-center no-wrap">
            <span>{{ $t("FindCreators.inputs.search.label") }}</span>
            <InfoTooltip
              class="q-ml-xs"
              :text="$t('FindCreators.inputs.search.tooltip')"
            />
          </div>
        </template>
        <template v-slot:append>
          <q-icon name="search" class="cursor-pointer" @click="triggerSearch" />
        </template>
      </q-input>

      <div class="text-h5 q-mt-md q-mb-sm text-center">Featured Creators</div>

      <div v-if="searching" class="q-mt-md flex flex-center">
        <q-spinner-dots color="primary" />
      </div>
      <div v-else-if="error" class="q-mt-md text-negative text-bold">
        {{ error }}
      </div>
      <div
        v-else-if="!searching && !searchResults.length"
        class="q-mt-md text-grey text-center"
      >
        No creators found
      </div>

      <q-virtual-scroll
        v-if="searchResults.length"
        class="q-mt-md creators-grid"
        :items="searchResults"
        :virtual-scroll-item-size="360"
      >
        <template #default="{ item }">
          <creator-profile-card
            :creator="item"
            @donate="openDonateDialog(item)"
            @message="openMessageDialog(item)"
          />
        </template>
      </q-virtual-scroll>
      <DonateDialog v-model="showDonateDialog" @confirm="handleDonate" />
      <q-dialog v-model="showActionDialog" persistent>
        <q-card class="q-pa-md qcard" style="min-width: 300px">
          <q-card-section class="text-h6">{{
            $t("FindCreators.choose_action.title")
          }}</q-card-section>
          <q-card-actions vertical>
            <q-btn flat color="primary" @click="chooseExisting">{{
              $t("FindCreators.choose_action.existing")
            }}</q-btn>
            <q-btn flat color="primary" @click="chooseNew">{{
              $t("FindCreators.choose_action.new")
            }}</q-btn>
            <q-btn flat color="primary" @click="backToBucket">{{
              $t("global.actions.cancel.label")
            }}</q-btn>
          </q-card-actions>
        </q-card>
      </q-dialog>
      <ChooseExistingTokenDialog
        v-model="showExistingDialog"
        :bucket-id="selectedBucketId"
        @selected="handleTokenSelect"
        @back="backToAction"
      />
      <SendMessageDialog v-model="showMessageDialog" @send="sendMessage" />
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, watch, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { useCreatorsStore } from "stores/creators";
import CreatorProfileCard from "components/CreatorProfileCard.vue";
import DonateDialog from "components/DonateDialog.vue";
import ChooseExistingTokenDialog from "components/ChooseExistingTokenDialog.vue";
import SendMessageDialog from "components/SendMessageDialog.vue";
import { storeToRefs } from "pinia";
import { useSendTokensStore } from "stores/sendTokensStore";
import { useDonationPresetsStore } from "stores/donationPresets";
import { useNostrStore } from "stores/nostr";
import { useDmChatsStore } from "stores/dmChats";
import { Dialog } from "quasar";
import { useI18n } from "vue-i18n";

export default defineComponent({
  name: "FindCreatorsView",
  components: {
    CreatorProfileCard,
    DonateDialog,
    ChooseExistingTokenDialog,
    SendMessageDialog,
  },
  setup() {
    const creatorsStore = useCreatorsStore();
    const { searchResults, searching, error } = storeToRefs(creatorsStore);
    const searchInput = ref("");
    const sendTokensStore = useSendTokensStore();
    const donationStore = useDonationPresetsStore();
    const router = useRouter();
    const { t } = useI18n();
    const showDonateDialog = ref(false);
    const showActionDialog = ref(false);
    const showExistingDialog = ref(false);
    const showMessageDialog = ref(false);
    const donateCreator = ref<any>(null);
    const messageCreator = ref<any>(null);
    const selectedBucketId = ref<string>("");
    const selectedLocked = ref(false);

    onMounted(() => {
      creatorsStore.loadFeaturedCreators();
    });

    const triggerSearch = () => {
      if (searchInput.value.trim()) {
        creatorsStore.searchCreators(searchInput.value.trim());
      }
    };

    let debounceTimeout: number | undefined;
    watch(searchInput, (val) => {
      clearTimeout(debounceTimeout);
      if (val === "") {
        creatorsStore.error = "";
        creatorsStore.loadFeaturedCreators();
        return;
      }
      debounceTimeout = window.setTimeout(() => {
        creatorsStore.searchCreators(val);
      }, 500);
    });

    onBeforeUnmount(() => clearTimeout(debounceTimeout));

    const openDonateDialog = (creator: any) => {
      donateCreator.value = creator;
      showDonateDialog.value = true;
    };

    const openMessageDialog = (creator: any) => {
      messageCreator.value = creator;
      showMessageDialog.value = true;
    };

    const handleDonate = async ({
      bucketId,
      locked,
      type,
      amount,
      months,
      message,
    }: {
      bucketId: string;
      locked: boolean;
      type: string;
      amount: number;
      months: number;
      message: string;
    }) => {
      selectedBucketId.value = bucketId;
      selectedLocked.value = locked;
      if (type === "one-time") {
        sendTokensStore.clearSendData();
        sendTokensStore.recipientPubkey = donateCreator.value.pubkey;
        sendTokensStore.sendViaNostr = true;
        sendTokensStore.sendData.bucketId = bucketId;
        sendTokensStore.sendData.amount = amount;
        sendTokensStore.sendData.memo = message;
        sendTokensStore.sendData.p2pkPubkey = locked
          ? donateCreator.value.pubkey
          : "";
        sendTokensStore.showLockInput = locked;
        showDonateDialog.value = false;
        sendTokensStore.showSendTokens = true;
      } else {
        await donationStore.createDonationPreset(
          months,
          amount,
          donateCreator.value.pubkey,
          bucketId
        );
        showDonateDialog.value = false;
      }
    };

    const chooseExisting = () => {
      showActionDialog.value = false;
      showExistingDialog.value = true;
    };

    const chooseNew = () => {
      sendTokensStore.clearSendData();
      sendTokensStore.recipientPubkey = donateCreator.value.pubkey;
      sendTokensStore.sendViaNostr = true;
      sendTokensStore.sendData.bucketId = selectedBucketId.value;
      sendTokensStore.sendData.p2pkPubkey = selectedLocked.value
        ? donateCreator.value.pubkey
        : "";
      sendTokensStore.showLockInput = selectedLocked.value;
      showActionDialog.value = false;
      sendTokensStore.showSendTokens = true;
    };

    const backToBucket = () => {
      showActionDialog.value = false;
      showDonateDialog.value = true;
    };

    const backToAction = () => {
      showExistingDialog.value = false;
      showActionDialog.value = true;
    };

    const handleTokenSelect = (tokenStr: string) => {
      sendTokensStore.clearSendData();
      sendTokensStore.recipientPubkey = donateCreator.value.pubkey;
      sendTokensStore.sendViaNostr = true;
      sendTokensStore.sendData.bucketId = selectedBucketId.value;
      sendTokensStore.sendData.p2pkPubkey = selectedLocked.value
        ? donateCreator.value.pubkey
        : "";
      sendTokensStore.sendData.tokensBase64 = tokenStr;
      sendTokensStore.showLockInput = selectedLocked.value;
      showExistingDialog.value = false;
      sendTokensStore.showSendTokens = true;
    };

    const sendMessage = async (msg: string) => {
      if (!messageCreator.value) return;
      showMessageDialog.value = false;
      try {
        const ev = await useNostrStore().sendNip04DirectMessage(
          messageCreator.value.pubkey,
          msg
        );
        if (ev) {
          useDmChatsStore().addOutgoing(ev);
          Dialog.create({
            message: t("wallet.notifications.nostr_dm_sent") as string,
            ok: { label: t("FindCreators.actions.back_to_search") as string },
          }).onOk(() => router.push("/find-creators"));
        } else {
          Dialog.create({
            message: t("wallet.notifications.nostr_dm_failed") as string,
          });
        }
      } catch (e) {
        console.error(e);
        Dialog.create({
          message: t("wallet.notifications.nostr_dm_failed") as string,
        });
      }
    };

    return {
      searchInput,
      triggerSearch,
      searchResults,
      searching,
      error,
      showDonateDialog,
      showActionDialog,
      showExistingDialog,
      selectedBucketId,
      openDonateDialog,
      handleDonate,
      chooseExisting,
      chooseNew,
      backToBucket,
      backToAction,
      handleTokenSelect,
      showMessageDialog,
      openMessageDialog,
      sendMessage,
    };
  },
});
</script>

<style scoped>
.creators-page {
  min-height: 100%;
}
.creators-container {
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  padding: 16px;
  border-radius: 8px;
}
.creators-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
  justify-items: center;
}
</style>
