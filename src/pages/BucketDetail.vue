<template>
  <div class="q-pa-md" v-if="bucket">
    <div class="q-mb-lg">
      <h5 class="q-my-none">{{ bucket.name }}</h5>
      <div v-if="bucket.description" class="text-caption q-mt-xs">{{ bucket.description }}</div>
      <div class="text-secondary q-mt-sm">
        <span>{{ formatCurrency(bucketBalance, activeUnit) }}</span>
        <span v-if="bucket.goal"> / {{ formatCurrency(bucket.goal, activeUnit) }}</span>
      </div>
    </div>

    <q-list bordered>
      <q-item v-for="proof in bucketProofs" :key="proof.secret">
        <q-item-section side>
          <q-checkbox v-model="selectedSecrets" :val="proof.secret"/>
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ formatCurrency(proof.amount, activeUnit) }}</q-item-label>
          <q-item-label caption>{{ proof.secret.slice(0,8) }}...</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>

    <div class="q-mt-lg">
      <q-select
        dense outlined
        v-model="targetBucketId"
        :options="bucketOptions"
        :label="$t('BucketDetail.inputs.target_bucket.label')"
        emit-value map-options
        class="q-mb-md"
      />
      <div class="row q-gutter-sm">
        <q-btn color="primary" :disable="!selectedSecrets.length" @click="moveSelected">
          {{ $t('BucketDetail.move') }}
        </q-btn>
        <q-btn color="primary" outline :disable="!selectedSecrets.length" @click="sendSelected">
          {{ $t('BucketDetail.send') }}
        </q-btn>
      </div>
    </div>

    <SendTokenDialog v-model="showSendTokens" />
  </div>
  <div v-else class="q-pa-md">{{ $t('BucketDetail.not_found') }}</div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useBucketsStore, DEFAULT_BUCKET_ID } from 'stores/buckets';
import { useProofsStore } from 'stores/proofs';
import { useMintsStore } from 'stores/mints';
import { useUiStore } from 'stores/ui';
import { storeToRefs } from 'pinia';
import { useSendTokensStore } from 'stores/sendTokensStore';
import SendTokenDialog from 'components/SendTokenDialog.vue';

const route = useRoute();
const bucketsStore = useBucketsStore();
const proofsStore = useProofsStore();
const mintsStore = useMintsStore();
const uiStore = useUiStore();
const sendTokensStore = useSendTokensStore();

const bucketId = route.params.id as string;
const bucket = computed(() => bucketsStore.bucketList.find(b => b.id === bucketId));
const bucketProofs = computed(() => proofsStore.proofs.filter(p => p.bucketId === bucketId && !p.reserved));
const bucketBalance = computed(() => bucketProofs.value.reduce((s,p)=>s+p.amount,0));
const { activeUnit } = storeToRefs(mintsStore);
const showSendTokens = storeToRefs(sendTokensStore).showSendTokens;

const selectedSecrets = ref<string[]>([]);
const targetBucketId = ref<string | null>(null);

const bucketOptions = computed(() =>
  bucketsStore.bucketList
    .filter(b => b.id !== bucketId)
    .map(b => ({ label: b.name, value: b.id }))
);

function formatCurrency(amount:number, unit:string){
  return uiStore.formatCurrency(amount, unit);
}

async function moveSelected(){
  await proofsStore.moveProofs(selectedSecrets.value, targetBucketId.value as string);
  selectedSecrets.value = [];
}

function sendSelected(){
  const proofs = bucketProofs.value.filter(p => selectedSecrets.value.includes(p.secret));
  const token = proofsStore.serializeProofs(proofs);
  sendTokensStore.clearSendData();
  sendTokensStore.sendData.tokensBase64 = token;
  showSendTokens.value = true;
}
</script>
