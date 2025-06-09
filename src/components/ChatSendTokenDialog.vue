<template>
  <q-dialog v-model="show" persistent ref="dialog">
    <q-card class="q-pa-md qcard" style="min-width: 300px">
      <q-card-section class="text-h6">Send Tokens</q-card-section>
      <q-card-section>
        <q-select
          v-model="bucketId"
          :options="bucketOptions"
          emit-value
          map-options
          label="Bucket"
          outlined
          dense
        />
        <q-input
          v-model.number="amount"
          type="number"
          label="Amount"
          outlined
          dense
          class="q-mt-md"
        />
        <q-input
          v-model="memo"
          label="Memo"
          outlined
          dense
          class="q-mt-md"
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat color="primary" @click="cancel">Cancel</q-btn>
        <q-btn flat color="primary" :disable="!amount" @click="confirm">Send</q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { ref, computed, defineExpose } from 'vue';
import { useBucketsStore } from 'src/stores/buckets';
import { useMessengerStore } from 'src/stores/messenger';

const props = defineProps<{ recipient: string }>();

const bucketsStore = useBucketsStore();
const messenger = useMessengerStore();

const show = ref(false);
const amount = ref<number | null>(null);
const memo = ref('');
const bucketId = ref('');

const bucketOptions = computed(() =>
  bucketsStore.bucketList.map((b) => ({ label: b.name, value: b.id }))
);

function reset() {
  amount.value = null;
  memo.value = '';
  bucketId.value = bucketsStore.bucketList[0]?.id || '';
}

function showDialog() {
  reset();
  show.value = true;
}

function hideDialog() {
  show.value = false;
}

defineExpose({ show: showDialog, hide: hideDialog });

function cancel() {
  hideDialog();
}

async function confirm() {
  if (!props.recipient || !amount.value) {
    hideDialog();
    return;
  }
  await messenger.sendToken(
    props.recipient,
    amount.value,
    bucketId.value,
    memo.value.trim() || undefined
  );
  hideDialog();
}
</script>

