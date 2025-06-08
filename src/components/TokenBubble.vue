<template>
  <span class="token-bubble row items-center no-wrap">
    <TokenInformation :encodedToken="token" :showAmount="true" />
    <q-btn
      size="sm"
      flat
      color="primary"
      class="q-ml-xs"
      @click="redeem"
    >
      Redeem
    </q-btn>
  </span>
</template>

<script lang="ts" setup>
import TokenInformation from './TokenInformation.vue'
import { useReceiveTokensStore } from 'src/stores/receiveTokensStore'

const props = defineProps<{ token: string }>()

const receiveStore = useReceiveTokensStore()

function redeem() {
  receiveStore.receiveData.tokensBase64 = props.token
  receiveStore.showReceiveTokens = true
}
</script>

<style scoped>
.token-bubble {
  display: inline-flex;
  align-items: center;
}
</style>
