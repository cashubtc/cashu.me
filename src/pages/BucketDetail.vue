<template>
  <div class="q-pa-md" v-if="bucket">
    <div class="q-mb-lg">
      <h5 class="q-my-none">{{ bucket.name }}</h5>
      <div v-if="bucket.description" class="text-caption q-mt-xs">
        {{ bucket.description }}
      </div>
      <div class="text-secondary q-mt-sm">
        <span>{{ formatCurrency(bucketBalance, activeUnit) }}</span>
        <span v-if="bucket.goal">
          / {{ formatCurrency(bucket.goal, activeUnit) }}</span
        >
      </div>
    </div>

    <q-list bordered>
      <q-item
        v-for="group in groupedProofs"
        :key="group.key"
        draggable="true"
        @dragstart="onDragStart($event, group)"
      >
        <q-item-section side>
          <q-checkbox
            :model-value="
              group.secrets.every((s) => selectedSecrets.includes(s))
            "
            @update:model-value="(val) => toggleGroup(group, val)"
          />
        </q-item-section>
        <q-item-section avatar>
          <q-icon name="circle" :style="{ color: group.color }" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-weight-bold">{{
            group.label || "(No label)"
          }}</q-item-label>
          <q-item-label caption v-if="group.tokens[0]?.description">
            {{ group.tokens[0]?.description }}
          </q-item-label>
          <q-item-label caption>
            {{ formatCurrency(group.total, activeUnit) }}
          </q-item-label>
        </q-item-section>
        <q-item-section side v-if="group.tokens.length">
          <q-btn
            flat
            dense
            icon="edit"
            @click.stop="openEditGroup(group)"
            aria-label="Edit"
            title="Edit"
          />
        </q-item-section>
      </q-item>
    </q-list>

    <div class="q-mt-lg">
      <q-select
        dense
        outlined
        v-model="targetBucketId"
        :options="bucketOptions"
        emit-value
        map-options
        class="q-mb-md"
      >
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
      <div class="row q-gutter-sm">
        <q-btn
          color="primary"
          :disable="!selectedSecrets.length"
          @click="moveSelected"
        >
          {{ $t("BucketDetail.move") }}
        </q-btn>
        <q-btn
          color="primary"
          outline
          :disable="!selectedSecrets.length"
          @click="sendSelected"
        >
          {{ $t("BucketDetail.send") }}
        </q-btn>
        <q-btn
          color="primary"
          outline
          :disable="!bucketProofs.length"
          @click="exportBucket"
        >
          {{ $t("BucketDetail.export") }}
        </q-btn>
        <q-btn
          v-if="bucket"
          color="primary"
          outline
          :disable="!bucketProofs.length"
          @click="openSendDmDialog"
        >
          {{ $t("BucketDetail.send_dm") }}
          <InfoTooltip
            class="q-ml-xs"
            :text="$t('BucketDetail.tooltips.send_dm')"
          />
        </q-btn>
      </div>
    </div>

    <SendTokenDialog />
    <SendBucketDmDialog ref="sendDmDialogRef" :bucket-id="bucketId" />
    <q-dialog v-model="editDialog.show">
      <q-card class="q-pa-md" style="max-width: 400px">
        <h6 class="q-mt-none q-mb-md">Edit token</h6>
        <q-input v-model="editDialog.label" outlined label="Label" />
        <q-input
          v-model="editDialog.color"
          outlined
          type="color"
          class="q-mt-md"
          label="Color"
        />
        <q-input
          v-model="editDialog.description"
          outlined
          class="q-mt-md"
          :label="$t('ReceiveTokenDialog.inputs.description.label')"
        />
        <div class="row q-mt-md">
          <q-btn color="primary" rounded @click="saveEdit">Update</q-btn>
          <q-btn flat rounded color="grey" class="q-ml-auto" v-close-popup
            >Cancel</q-btn
          >
        </div>
      </q-card>
    </q-dialog>
    <LockedTokensTable :bucket-id="bucketId" class="q-mt-lg" />
    <CreatorLockedTokensTable :bucket-id="bucketId" class="q-mt-lg" />
    <div class="q-mt-lg">
      <HistoryTable :bucket-id="bucketId" />
    </div>
  </div>
  <div v-else class="q-pa-md">{{ $t("BucketDetail.not_found") }}</div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { useBucketsStore } from "stores/buckets";
import { DEFAULT_BUCKET_ID } from "@/constants/buckets";
import { useProofsStore } from "stores/proofs";
import { useMintsStore } from "stores/mints";
import { useUiStore } from "stores/ui";
import { storeToRefs } from "pinia";
import { useSendTokensStore } from "stores/sendTokensStore";
import { useTokensStore, HistoryToken } from "stores/tokens";
import SendTokenDialog from "components/SendTokenDialog.vue";
import SendBucketDmDialog from "components/SendBucketDmDialog.vue";
import HistoryTable from "components/HistoryTable.vue";
import LockedTokensTable from "components/LockedTokensTable.vue";
import CreatorLockedTokensTable from "components/CreatorLockedTokensTable.vue";
import { notifyError } from "src/js/notify";
import { DEFAULT_COLOR } from "src/js/constants";
import { useI18n } from "vue-i18n";

const route = useRoute();
const { t } = useI18n();
const bucketsStore = useBucketsStore();
const proofsStore = useProofsStore();
const mintsStore = useMintsStore();
const uiStore = useUiStore();
const sendTokensStore = useSendTokensStore();
const tokensStore = useTokensStore();

const bucketId = route.params.id as string;
const bucket = computed(() =>
  bucketsStore.bucketList.find((b) => b.id === bucketId)
);
const bucketProofs = computed(() =>
  proofsStore.proofs.filter((p) => p.bucketId === bucketId && !p.reserved)
);
const bucketBalance = computed(() =>
  bucketProofs.value.reduce((s, p) => s + p.amount, 0)
);
const { activeUnit } = storeToRefs(mintsStore);
const showSendTokens = storeToRefs(sendTokensStore).showSendTokens;
const sendDmDialogRef = ref<InstanceType<typeof SendBucketDmDialog> | null>(
  null
);

const selectedSecrets = ref<string[]>([]);
const targetBucketId = ref<string | null>(null);
const editDialog = ref({
  show: false,
  label: "",
  color: DEFAULT_COLOR,
  description: "",
  originalLabel: "",
});

type ProofGroup = {
  key: string;
  label: string;
  color: string;
  secrets: string[];
  total: number;
  tokens: HistoryToken[];
};

const groupedProofs = computed<ProofGroup[]>(() => {
  const groups: Record<string, ProofGroup> = {};
  const historyByLabel: Record<string, HistoryToken[]> = {};
  tokensStore.historyTokens
    .filter((t) => t.bucketId === bucketId)
    .forEach((t) => {
      const lbl = t.label ?? "";
      if (!historyByLabel[lbl]) historyByLabel[lbl] = [];
      historyByLabel[lbl].push(t);
    });
  bucketProofs.value.forEach((p) => {
    const lbl = p.label ?? "";
    if (!groups[lbl]) {
      const color = historyByLabel[lbl]?.[0]?.color ?? DEFAULT_COLOR;
      groups[lbl] = {
        key: lbl || "nolabel",
        label: lbl,
        color,
        secrets: [],
        total: 0,
        tokens: historyByLabel[lbl] || [],
      };
    }
    groups[lbl].secrets.push(p.secret);
    groups[lbl].total += p.amount;
  });
  return Object.values(groups);
});

const bucketOptions = computed(() =>
  bucketsStore.bucketList
    .filter((b) => b.id !== bucketId)
    .map((b) => ({ label: b.name, value: b.id }))
);

function formatCurrency(amount: number, unit: string) {
  return uiStore.formatCurrency(amount, unit);
}

function formatTs(ts: number) {
  const d = new Date(ts * 1000);
  return `${d.getFullYear()}-${("0" + (d.getMonth() + 1)).slice(-2)}-${(
    "0" + d.getDate()
  ).slice(-2)} ${("0" + d.getHours()).slice(-2)}:${("0" + d.getMinutes()).slice(
    -2
  )}`;
}

function toggleGroup(group: ProofGroup, val: boolean) {
  if (val) {
    const add = group.secrets.filter((s) => !selectedSecrets.value.includes(s));
    selectedSecrets.value.push(...add);
  } else {
    selectedSecrets.value = selectedSecrets.value.filter(
      (s) => !group.secrets.includes(s)
    );
  }
}

function onDragStart(ev: DragEvent, group: ProofGroup) {
  const secrets = selectedSecrets.value.length
    ? selectedSecrets.value
    : group.secrets;
  if (ev.dataTransfer) {
    ev.dataTransfer.setData("text/plain", JSON.stringify(secrets));
    ev.dataTransfer.effectAllowed = "move";
  }
}

function openEditGroup(group: ProofGroup) {
  editDialog.value.show = true;
  editDialog.value.label = group.label;
  editDialog.value.color = group.color;
  editDialog.value.description = group.tokens[0]?.description || "";
  editDialog.value.originalLabel = group.label;
}

function saveEdit() {
  const tokens = tokensStore.historyTokens.filter(
    (t) =>
      t.bucketId === bucketId &&
      (t.label ?? "") === editDialog.value.originalLabel
  );
  tokens.forEach((t) => {
    tokensStore.editHistoryToken(t.token, {
      newLabel: editDialog.value.label,
      newColor: editDialog.value.color,
      newDescription: editDialog.value.description,
    });
  });
  editDialog.value.show = false;
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
  await proofsStore.moveProofs(
    selectedSecrets.value,
    targetBucketId.value as string
  );
  selectedSecrets.value = [];
}

function sendSelected() {
  const proofs = bucketProofs.value.filter((p) =>
    selectedSecrets.value.includes(p.secret)
  );
  const token = proofsStore.serializeProofs(proofs);
  sendTokensStore.clearSendData();
  sendTokensStore.sendData.tokensBase64 = token;
  showSendTokens.value = true;
}

function exportBucket() {
  const token = proofsStore.serializeProofs(bucketProofs.value);
  sendTokensStore.clearSendData();
  sendTokensStore.sendData.tokensBase64 = token;
  showSendTokens.value = true;
}

function openSendDmDialog() {
  const npub = bucket.value?.creatorPubkey;
  (sendDmDialogRef.value as any)?.show(npub);
}
</script>
