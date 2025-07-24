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
            <q-item v-for="p in bucketProofs" :key="p.secret">
              <q-item-section>
                <q-item-label class="text-weight-bold">{{
                  formatCurrency(p.amount, activeUnit.value)
                }}</q-item-label>
                <q-item-label caption v-if="p.label">{{
                  p.label
                }}</q-item-label>
              </q-item-section>
            </q-item>
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
              Send via Nostr DM
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
  </q-dialog>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import { useProofsStore } from "stores/proofs";
import { useBucketsStore } from "stores/buckets";
import { useMintsStore } from "stores/mints";
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
const uiStore = useUiStore();
const { activeUnit } = storeToRefs(mintsStore);
const sendDmDialogRef = ref<InstanceType<typeof SendBucketDmDialog> | null>(null);

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

function openSendDmDialog() {
  const npub = bucket.value?.creatorPubkey;
  (sendDmDialogRef.value as any)?.show(npub);
}
</script>
