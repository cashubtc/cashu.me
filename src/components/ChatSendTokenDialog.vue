<template>
  <q-dialog v-model="show" persistent ref="dialog">
    <q-card class="q-pa-md qcard" style="min-width: 300px">
      <q-card-section class="text-h6">Send Tokens</q-card-section>
      <q-card-section>
        <div class="text-caption q-mb-sm">
          Balance: {{ formattedTotalBalance }}
        </div>
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
        <q-input v-model="memo" label="Memo" outlined dense class="q-mt-md" />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat color="primary" @click="cancel">Cancel</q-btn>
        <q-btn flat color="primary" :disable="!amount" @click="confirm"
          >Send</q-btn
        >
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import { storeToRefs } from "pinia";
import { useBucketsStore } from "src/stores/buckets";
import { useMessengerStore } from "src/stores/messenger";
import { useMintsStore } from "src/stores/mints";
import { useUiStore } from "src/stores/ui";

const props = defineProps<{ recipient: string }>();

const bucketsStore = useBucketsStore();
const mintsStore = useMintsStore();
const uiStore = useUiStore();
const messenger = useMessengerStore();

const { bucketList, bucketBalances } = storeToRefs(bucketsStore);
const { activeUnit } = storeToRefs(mintsStore);

const show = ref(false);
const amount = ref<number | null>(null);
const memo = ref("");
const bucketId = ref("");

const bucketOptions = computed(() =>
  bucketList.value.map((b) => ({
    label: `${b.name} (${uiStore.formatCurrency(
      bucketBalances.value[b.id] ?? 0,
      activeUnit.value,
    )})`,
    value: b.id,
  })),
);

const totalBalance = computed(() =>
  Object.values(bucketBalances.value).reduce((sum, v) => sum + v, 0),
);

const formattedTotalBalance = computed(() =>
  uiStore.formatCurrency(totalBalance.value, activeUnit.value),
);

function reset() {
  amount.value = null;
  memo.value = "";
  bucketId.value = bucketList.value[0]?.id || "";
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
    memo.value.trim() || undefined,
  );
  hideDialog();
}
</script>
