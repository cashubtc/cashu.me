<template>
  <div
    :class="[$q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-dark', 'text-center q-pa-md flex flex-center']"
  >
    <FindCreatorsView />
    <SendTokenDialog v-model="showSendTokens" />
  </div>
</template>

<script>
import { defineComponent } from "vue";
import FindCreatorsView from "components/FindCreatorsView.vue";
import SendTokenDialog from "components/SendTokenDialog.vue";
import { useSendTokensStore } from "stores/sendTokensStore";
import { storeToRefs } from "pinia";

export default defineComponent({
  name: "FindCreatorsPage",
  components: {
    FindCreatorsView,
    SendTokenDialog,
  },
  setup() {
    const sendTokensStore = useSendTokensStore();
    const { showSendTokens } = storeToRefs(sendTokensStore);
    return { showSendTokens };
  },
});
</script>
