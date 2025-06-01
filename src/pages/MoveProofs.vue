<template>
  <div class="q-pa-md">
    <h5 class="q-my-none q-mb-md">{{ $t("MoveProofs.title") }}</h5>
    <q-select
      dense
      outlined
      v-model="targetBucketId"
      :options="bucketOptions"
      :label="$t('BucketDetail.inputs.target_bucket.label')"
      emit-value
      map-options
      class="q-mb-md"
    />
    <q-btn
      color="primary"
      :disable="!selectedSecrets.length || !targetBucketId"
      @click="moveSelected"
      class="q-mb-lg"
    >
      {{ $t("BucketDetail.move") }}
    </q-btn>
    <div v-for="bucket in bucketList" :key="bucket.id" class="q-mb-md">
      <q-expansion-item :label="bucket.name">
        <q-list bordered>
          <q-item
            v-for="proof in proofsByBucket[bucket.id]"
            :key="proof.secret"
          >
            <q-item-section side>
              <q-checkbox
                :model-value="selectedSecrets.includes(proof.secret)"
                @update:model-value="(val) => toggleProof(proof.secret, val)"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{
                formatCurrency(proof.amount, activeUnit)
              }}</q-item-label>
              <q-item-label caption v-if="proof.label">{{
                proof.label
              }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item v-if="!proofsByBucket[bucket.id].length">
            <q-item-section>{{ $t("MoveProofs.empty") }}</q-item-section>
          </q-item>
        </q-list>
      </q-expansion-item>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useBucketsStore } from "stores/buckets";
import { useProofsStore } from "stores/proofs";
import { useMintsStore, WalletProof } from "stores/mints";
import { useUiStore } from "stores/ui";
import { storeToRefs } from "pinia";
import { notifyError } from "src/js/notify";

const bucketsStore = useBucketsStore();
const proofsStore = useProofsStore();
const mintsStore = useMintsStore();
const uiStore = useUiStore();
const { activeUnit } = storeToRefs(mintsStore);

const bucketList = computed(() => bucketsStore.bucketList);

const proofsByBucket = computed<Record<string, WalletProof[]>>(() => {
  const map: Record<string, WalletProof[]> = {};
  bucketList.value.forEach((b) => {
    map[b.id] = proofsStore.proofs.filter(
      (p) => p.bucketId === b.id && !p.reserved,
    );
  });
  return map;
});

const selectedSecrets = ref<string[]>([]);
const targetBucketId = ref<string | null>(null);

function toggleProof(secret: string, val: boolean) {
  if (val) {
    if (!selectedSecrets.value.includes(secret))
      selectedSecrets.value.push(secret);
  } else {
    selectedSecrets.value = selectedSecrets.value.filter((s) => s !== secret);
  }
}

const bucketOptions = computed(() =>
  bucketsStore.bucketList.map((b) => ({ label: b.name, value: b.id })),
);

function formatCurrency(amount: number, unit: string) {
  return uiStore.formatCurrency(amount, unit);
}

async function moveSelected() {
  if (!targetBucketId.value) {
    notifyError("Please select a bucket");
    return;
  }
  const bucketExists = bucketsStore.bucketList.find(
    (b) => b.id === targetBucketId.value,
  );
  if (!bucketExists) {
    notifyError(`Bucket not found: ${targetBucketId.value}`);
    return;
  }
  await proofsStore.moveProofs(selectedSecrets.value, targetBucketId.value);
  selectedSecrets.value = [];
}
</script>
