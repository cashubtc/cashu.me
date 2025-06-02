<template>
  <div style="max-width: 1200px; margin: 0 auto">
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
          <span>{{ $t('FindCreators.inputs.search.label') }}</span>
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

    <div v-if="searching" class="q-mt-md flex flex-center">
      <q-spinner-dots color="primary" />
    </div>
    <div v-else-if="error" class="q-mt-md text-negative text-bold">
      {{ error }}
    </div>

    <div v-if="searchResults.length" class="q-mt-md creators-grid">
      <creator-profile-card
        v-for="creator in searchResults"
        :key="creator.pubkey"
        :creator="creator"
        @donate="openDonateDialog(creator)"
        @message="openMessageDialog(creator)"
      />
    </div>
    <DonateDialog v-model="showDonateDialog" @confirm="handleDonate" />
    <q-dialog v-model="showActionDialog" persistent>
      <q-card class="q-pa-md qcard" style="min-width: 300px">
        <q-card-section class="text-h6">{{ $t('FindCreators.choose_action.title') }}</q-card-section>
        <q-card-actions vertical>
          <q-btn flat color="primary" @click="chooseExisting">{{ $t('FindCreators.choose_action.existing') }}</q-btn>
          <q-btn flat color="primary" @click="chooseNew">{{ $t('FindCreators.choose_action.new') }}</q-btn>
          <q-btn flat color="primary" @click="backToBucket">{{ $t('global.actions.cancel.label') }}</q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
    <ChooseExistingTokenDialog
      v-model="showExistingDialog"
      :bucket-id="selectedBucketId"
      @selected="handleTokenSelect"
      @back="backToAction"
    />
    <SendMessageDialog
      v-model="showMessageDialog"
      @send="sendMessage"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, onMounted } from "vue";
import { useCreatorsStore } from "stores/creators";
import CreatorProfileCard from "components/CreatorProfileCard.vue";
import DonateDialog from "components/DonateDialog.vue";
import ChooseExistingTokenDialog from "components/ChooseExistingTokenDialog.vue";
import SendMessageDialog from "components/SendMessageDialog.vue";
import { storeToRefs } from "pinia";
import { useSendTokensStore } from "stores/sendTokensStore";
import { useNostrStore } from "stores/nostr";
import { useDmChatsStore } from "stores/dmChats";
import { Dialog } from "quasar";
import { useI18n } from "vue-i18n";
import { nip19, ProfilePointer } from "nostr-tools";

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
      if (!val) {
        return;
      }
      clearTimeout(debounceTimeout);
      debounceTimeout = window.setTimeout(() => {
        creatorsStore.searchCreators(val);
      }, 500);
    });

    const openDonateDialog = (creator: any) => {
      donateCreator.value = creator;
      showDonateDialog.value = true;
    };

    const openMessageDialog = (creator: any) => {
      messageCreator.value = creator;
      showMessageDialog.value = true;
    };

    const handleDonate = ({ bucketId, locked }: { bucketId: string; locked: boolean }) => {
      selectedBucketId.value = bucketId;
      selectedLocked.value = locked;
      sendTokensStore.recipientPubkey = donateCreator.value.pubkey;
      sendTokensStore.sendViaNostr = true;
      showDonateDialog.value = false;
      showActionDialog.value = true;
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
      sendTokensStore.sendData.p2pkPubkey = selectedLocked.value ? donateCreator.value.pubkey : "";
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
      sendTokensStore.sendData.p2pkPubkey = selectedLocked.value ? donateCreator.value.pubkey : "";
      sendTokensStore.sendData.tokensBase64 = tokenStr;
      sendTokensStore.showLockInput = selectedLocked.value;
      showExistingDialog.value = false;
      sendTokensStore.showSendTokens = true;
    };

    const sendMessage = async (msg: string) => {
      if (!messageCreator.value) return;
      showMessageDialog.value = false;
      try {
        let recipient = messageCreator.value.pubkey;
        if (recipient.startsWith("npub") || recipient.startsWith("nprofile")) {
          try {
            const decoded = nip19.decode(recipient);
            recipient =
              decoded.type === "npub"
                ? (decoded.data as string)
                : (decoded.data as ProfilePointer).pubkey;
          } catch (e) {
            console.error(e);
          }
        }
        const ev = await useNostrStore().sendNip04DirectMessage(
          recipient,
          msg
        );
        if (ev) {
          useDmChatsStore().addOutgoing(ev);
          Dialog.create({
            message: t("wallet.notifications.nostr_dm_sent") as string,
          });
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
.creators-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  justify-items: center;
}
</style>
