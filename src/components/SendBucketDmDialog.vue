<template>
  <q-dialog v-model="show" persistent ref="dialog">
    <q-card class="q-pa-md qcard" style="min-width: 300px">
      <q-card-section class="text-h6">{{
        t("SendBucketDmDialog.title")
      }}</q-card-section>
      <q-card-section>
        <q-input
          v-model="recipient"
          :label="t('SendBucketDmDialog.inputs.recipient.label')"
          outlined
          dense
          :error="recipient && !isValidRecipient"
          :error-message="t('SendBucketDmDialog.errors.invalid_pubkey')"
          class="q-mb-md"
        />
        <div class="text-caption q-mb-sm">Balance: {{ formattedBalance }}</div>
        <q-option-group
          v-model="mode"
          inline
          :options="modeOptions"
          class="q-mb-md"
        />
        <div v-if="mode === 'amount'">
          <q-input
            v-model.number="amount"
            type="number"
            :label="t('SendBucketDmDialog.inputs.amount.label')"
            outlined
            dense
          />
        </div>
        <div v-else style="max-height: 200px; overflow: auto">
          <q-list bordered>
            <q-item v-for="p in bucketProofs" :key="p.secret">
              <q-item-section side>
                <q-checkbox
                  :model-value="selectedSecrets.includes(p.secret)"
                  @update:model-value="(val) => toggleProof(p.secret, val)"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{
                  formatCurrency(p.amount, activeUnit)
                }}</q-item-label>
                <q-item-label caption v-if="p.label">{{
                  p.label
                }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-if="!bucketProofs.length">
              <q-item-section>Empty</q-item-section>
            </q-item>
          </q-list>
        </div>
        <q-input
          v-model="memo"
          :label="t('SendBucketDmDialog.inputs.memo.label')"
          outlined
          dense
          class="q-mt-md"
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat color="primary" @click="cancel">{{
          t("SendBucketDmDialog.actions.cancel.label")
        }}</q-btn>
        <q-btn flat color="primary" :disable="sendDisabled" @click="confirm">
          {{ t("SendBucketDmDialog.actions.send.label") }}
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import { storeToRefs } from "pinia";
import { useBucketsStore } from "src/stores/buckets";
import { useProofsStore } from "src/stores/proofs";
import { useMintsStore } from "src/stores/mints";
import { useUiStore } from "src/stores/ui";
import { useMessengerStore } from "src/stores/messenger";
import { useP2PKStore } from "src/stores/p2pk";
import type { WalletProof } from "src/types/proofs";
import { useI18n } from "vue-i18n";

const props = defineProps<{ bucketId: string; prefillNpub?: string }>();

const bucketsStore = useBucketsStore();
const proofsStore = useProofsStore();
const mintsStore = useMintsStore();
const uiStore = useUiStore();
const messenger = useMessengerStore();
const p2pkStore = useP2PKStore();

const { activeUnit } = storeToRefs(mintsStore);
const { bucketBalances } = storeToRefs(bucketsStore);
const { t } = useI18n();

const show = ref(false);
const recipient = ref("");
const amount = ref<number | null>(null);
const memo = ref("");
const mode = ref<"amount" | "proofs">("amount");
const selectedSecrets = ref<string[]>([]);

const modeOptions = [
  { label: t("SendBucketDmDialog.options.amount"), value: "amount" },
  { label: t("SendBucketDmDialog.options.proofs"), value: "proofs" },
];

const bucketProofs = computed<WalletProof[]>(() =>
  proofsStore.proofs.filter(
    (p) => p.bucketId === props.bucketId && !p.reserved,
  ),
);

const formattedBalance = computed(() =>
  uiStore.formatCurrency(
    bucketBalances.value[props.bucketId] ?? 0,
    activeUnit.value,
  ),
);

const isValidRecipient = computed(() =>
  p2pkStore.isValidPubkey(recipient.value),
);

function formatCurrency(a: number, unit: string) {
  return uiStore.formatCurrency(a, unit);
}

function toggleProof(secret: string, val: boolean) {
  if (val) {
    if (!selectedSecrets.value.includes(secret))
      selectedSecrets.value.push(secret);
  } else {
    selectedSecrets.value = selectedSecrets.value.filter((s) => s !== secret);
  }
}

const sendDisabled = computed(() => {
  if (!isValidRecipient.value) return true;
  if (mode.value === "amount") return !(amount.value && amount.value > 0);
  return selectedSecrets.value.length === 0;
});

function reset() {
  recipient.value = "";
  amount.value = null;
  memo.value = "";
  mode.value = "amount";
  selectedSecrets.value = [];
}

function showDialog(npub?: string) {
  reset();
  recipient.value = npub || props.prefillNpub || "";
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
  if (!isValidRecipient.value) {
    hideDialog();
    return;
  }
  if (mode.value === "amount") {
    if (!amount.value) {
      hideDialog();
      return;
    }
    await messenger.sendToken(
      recipient.value,
      amount.value,
      props.bucketId,
      memo.value.trim() || undefined,
    );
  } else {
    const proofs = bucketProofs.value.filter((p) =>
      selectedSecrets.value.includes(p.secret),
    );
    if (!proofs.length) {
      hideDialog();
      return;
    }
    await messenger.sendTokenFromProofs(
      recipient.value,
      proofs,
      props.bucketId,
      memo.value.trim() || undefined,
    );
  }
  hideDialog();
}
</script>
