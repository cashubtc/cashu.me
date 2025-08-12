<template>
  <q-dialog v-model="showLocal" persistent>
    <q-card dark class="modal-card q-pa-lg">
      <h6 class="q-mt-none q-mb-xs bucket-accent">{{ bucket?.name }}</h6>
      <div v-if="bucket?.description" class="text-caption q-mb-sm">
        {{ bucket.description }}
      </div>
      <div v-if="bucket" class="text-secondary q-mb-md">
        <span>{{ formatCurrency(bucketBalance, activeUnit.value) }}</span>
        <span v-if="bucket.goal">
          / {{ formatCurrency(bucket.goal, activeUnit.value) }}
        </span>
      </div>
      <q-tabs v-model="activeTab" no-caps class="q-mb-md">
        <q-tab
          name="overview"
          class="text-secondary"
          :label="t('BucketDetail.tabs.overview')"
        />
        <q-tab
          name="history"
          class="text-secondary"
          :label="t('BucketDetail.tabs.history')"
        />
      </q-tabs>
      <q-tab-panels v-model="activeTab" animated>
        <q-tab-panel name="overview" class="q-pa-none">
          <q-list bordered>
            <q-expansion-item
              v-for="p in bucketProofs"
              :key="p.secret"
              expand-separator
            >
              <template #header>
                <q-item-section>
                  <q-item-label class="text-weight-bold">{{
                    formatCurrency(p.amount, activeUnit.value)
                  }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    flat
                    dense
                    icon="edit"
                    @click.stop="openEdit(p)"
                    aria-label="Edit"
                    title="Edit"
                  />
                </q-item-section>
              </template>
              <div class="q-pl-md q-pb-sm">
                <div v-if="p.label" class="text-caption">{{ p.label }}</div>
                <div v-if="p.description" class="text-caption">
                  {{ p.description }}
                </div>
              </div>
            </q-expansion-item>
          </q-list>
          <LockedTokensTable
            :bucket-id="props.bucketId ?? ''"
            class="q-mt-lg"
          />
          <CreatorLockedTokensTable
            :bucket-id="props.bucketId ?? ''"
            class="q-mt-lg"
          />
          <div class="row q-mt-md">
            <q-btn
              color="primary"
              outline
              :disable="!bucketProofs.length"
              @click="openSendDmDialog"
              class="q-mr-auto"
            >
              {{ t("BucketDetail.send_dm") }}
              <InfoTooltip
                class="q-ml-xs"
                :text="t('BucketDetail.tooltips.send_dm')"
              />
            </q-btn>
          </div>
        </q-tab-panel>
        <q-tab-panel name="history" class="q-pa-none">
          <HistoryTable :bucket-id="props.bucketId ?? ''" />
        </q-tab-panel>
      </q-tab-panels>
      <div class="row q-mt-md">
        <q-btn flat rounded color="grey" class="q-ml-auto" v-close-popup>{{
          $t("global.actions.close.label")
        }}</q-btn>
      </div>
    </q-card>
    <SendBucketDmDialog
      ref="sendDmDialogRef"
      :bucket-id="props.bucketId ?? ''"
      :prefill-npub="bucket?.creatorPubkey"
    />
    <q-dialog v-model="editDialog.show">
      <q-card class="q-pa-md" style="max-width: 400px">
        <h6 class="q-mt-none q-mb-md">Edit token</h6>
        <q-input
          v-model="editDialog.label"
          outlined
          :label="t('ReceiveTokenDialog.inputs.label.label')"
        />
        <q-input
          v-model="editDialog.description"
          outlined
          class="q-mt-md"
          :label="t('ReceiveTokenDialog.inputs.description.label')"
        />
        <div class="row q-mt-md">
          <q-btn color="primary" rounded @click="saveEdit">{{
            t("global.actions.update.label")
          }}</q-btn>
          <q-btn flat rounded color="grey" class="q-ml-auto" v-close-popup>{{
            t("global.actions.cancel.label")
          }}</q-btn>
        </div>
      </q-card>
    </q-dialog>
  </q-dialog>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import { useProofsStore } from "stores/proofs";
import { useBucketsStore } from "stores/buckets";
import { useMintsStore } from "stores/mints";
import { useTokensStore } from "stores/tokens";
import { storeToRefs } from "pinia";
import { useUiStore } from "stores/ui";
import { useI18n } from "vue-i18n";
import { notifyError } from "src/js/notify";
import LockedTokensTable from "components/LockedTokensTable.vue";
import CreatorLockedTokensTable from "components/CreatorLockedTokensTable.vue";
import HistoryTable from "components/HistoryTable.vue";
import SendBucketDmDialog from "components/SendBucketDmDialog.vue";

const props = defineProps<{ modelValue: boolean; bucketId: string | null }>();
const emit = defineEmits(["update:modelValue"]);
const { t } = useI18n();

const showLocal = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const activeTab = ref<"overview" | "history">("overview");

const bucketsStore = useBucketsStore();
const proofsStore = useProofsStore();
const mintsStore = useMintsStore();
const tokensStore = useTokensStore();
const uiStore = useUiStore();
const { activeUnit } = storeToRefs(mintsStore);
const sendDmDialogRef = ref<InstanceType<typeof SendBucketDmDialog> | null>(
  null
);
const editDialog = ref({
  show: false,
  label: "",
  description: "",
  secret: "",
});

const bucket = computed(
  () => bucketsStore.bucketList.find((b) => b.id === props.bucketId) || null
);
const bucketProofs = computed(() =>
  proofsStore.proofs.filter((p) => p.bucketId === props.bucketId && !p.reserved)
);
const bucketBalance = computed(() =>
  bucketProofs.value.reduce((s, p) => s + p.amount, 0)
);

const formatCurrency = (a: number, unit: string) =>
  uiStore.formatCurrency(a, unit);

function openEdit(token: any) {
  editDialog.value.show = true;
  editDialog.value.label = token.label || "";
  editDialog.value.description = token.description || "";
  editDialog.value.secret = token.secret;
}

function saveEdit() {
  tokensStore.editHistoryTokenBySecret(editDialog.value.secret, {
    newLabel: editDialog.value.label,
    newDescription: editDialog.value.description,
  });
  editDialog.value.show = false;
}

function openSendDmDialog() {
  const npub = bucket.value?.creatorPubkey;
  (sendDmDialogRef.value as any)?.show(npub);
}
</script>
