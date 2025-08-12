<template>
  <q-dialog v-model="showLocal">
    <q-card class="q-pa-md bucket-modal" style="max-width: 800px">
      <h5 class="q-my-none q-mb-md bucket-accent">
        {{ $t("MoveTokens.title") }}
      </h5>
      <div class="row q-col-gutter-md">
        <div class="col-7">
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
                      @update:model-value="
                        (val) => toggleProof(proof.secret, val)
                      "
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
                  <q-item-section>{{ $t("MoveTokens.empty") }}</q-item-section>
                </q-item>
              </q-list>
            </q-expansion-item>
          </div>
        </div>
        <div class="col-5">
          <div class="text-body2 q-mb-md">{{ $t("MoveTokens.helper") }}</div>
          <q-select
            dense
            outlined
            v-model="targetBucketId"
            :options="bucketOptions"
            emit-value
            map-options
            option-value="value"
            option-label="label"
            class="q-mb-md"
          >
            <template #option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section avatar>
                  <q-avatar
                    size="sm"
                    :style="{ backgroundColor: scope.opt.color }"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ scope.opt.label }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
            <template #selected-item="scope">
              <div class="row items-center no-wrap">
                <q-avatar
                  size="sm"
                  :style="{ backgroundColor: scope.opt.color }"
                  class="q-mr-sm"
                />
                <span>{{ scope.opt.label }}</span>
              </div>
            </template>
            <template #label>
              <div class="row items-center no-wrap">
                <span>{{ $t("BucketDetail.inputs.target_bucket.label") }}</span>
                <InfoTooltip
                  class="q-ml-xs"
                  :text="$t('BucketDetail.inputs.target_bucket.tooltip')"
                />
              </div>
            </template>
          </q-select>
          <q-btn
            color="primary"
            :disable="!selectedSecrets.length || !targetBucketId"
            @click="moveSelected"
          >
            {{ $t("BucketDetail.move") }}
          </q-btn>
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useBucketsStore } from "stores/buckets";
import { useProofsStore } from "stores/proofs";
import { useMintsStore, WalletProof } from "stores/mints";
import { useUiStore } from "stores/ui";
import { useI18n } from "vue-i18n";
import { DEFAULT_COLOR } from "src/js/constants";
import { storeToRefs } from "pinia";
import { notifyError } from "src/js/notify";

const props = defineProps<{ modelValue: boolean; bucketIds?: string[] }>();
const emit = defineEmits(["update:modelValue", "move"]);

const { t } = useI18n();

const showLocal = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val),
});

const bucketsStore = useBucketsStore();
const proofsStore = useProofsStore();
const mintsStore = useMintsStore();
const uiStore = useUiStore();
const { activeUnit } = storeToRefs(mintsStore);
const { bucketBalances } = storeToRefs(bucketsStore);

const bucketList = computed(() => {
  if (props.bucketIds && props.bucketIds.length) {
    return bucketsStore.bucketList.filter((b) =>
      props.bucketIds!.includes(b.id)
    );
  }
  return bucketsStore.bucketList;
});

const proofsByBucket = computed<Record<string, WalletProof[]>>(() => {
  const map: Record<string, WalletProof[]> = {};
  bucketList.value.forEach((b) => {
    map[b.id] = proofsStore.proofs.filter(
      (p) => p.bucketId === b.id && !p.reserved
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
  bucketList.value.map((b) => ({
    label: b.name,
    value: b.id,
    color: b.color || DEFAULT_COLOR,
    balance: bucketBalances.value[b.id] ?? 0,
  }))
);

function formatCurrency(amount: number, unit: string) {
  return uiStore.formatCurrency(amount, unit);
}

async function moveSelected() {
  if (!targetBucketId.value) {
    notifyError(t("MoveTokens.errors.select_bucket"));
    return;
  }
  const bucketExists = bucketsStore.bucketList.find(
    (b) => b.id === targetBucketId.value
  );
  if (!bucketExists) {
    notifyError(`Bucket not found: ${targetBucketId.value}`);
    return;
  }
  emit("move", {
    secrets: [...selectedSecrets.value],
    bucketId: targetBucketId.value,
  });
  selectedSecrets.value = [];
  emit("update:modelValue", false);
}
</script>
