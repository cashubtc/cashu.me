<template>
  <q-dialog v-model="model">
    <q-card style="min-width: 300px">
      <q-card-section>
        <div class="text-h6">{{ title }}</div>
      </q-card-section>
      <q-card-section
        class="q-pa-none"
        style="max-height: 300px; overflow-y: auto"
      >
        <q-list bordered>
          <q-item v-for="t in tokens" :key="t.id">
            <q-item-section>
              <q-item-label class="text-weight-bold">
                {{ formatCurrency(t.amount) }}
              </q-item-label>
              <q-item-label caption>
                Month {{ t.monthIndex }} -
                {{ t.locktime ? formatTs(t.locktime) : "-" }}
              </q-item-label>
              <q-item-label caption v-if="t.locktime">
                Unlocks in {{ countdownTo(t.locktime) }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon
                :name="t.redeemed ? 'check_circle' : 'hourglass_empty'"
                :color="t.redeemed ? 'positive' : 'grey'"
                class="q-mr-sm"
              />
              <q-btn
                flat
                dense
                icon="content_copy"
                @click="copy(t.token)"
                :aria-label="$t('global.actions.copy.label')"
              />
            </q-item-section>
          </q-item>
        </q-list>
        <div
          v-if="tokens.length === 0"
          class="text-center q-pa-md text-caption"
        >
          {{ $t("LockedTokensTable.empty_text") }}
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat color="primary" v-close-popup>{{
          $t("global.actions.close.label")
        }}</q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { formatDistanceToNow } from "date-fns";
import { useClipboard } from "src/composables/useClipboard";
import { useMintsStore } from "stores/mints";
import { useUiStore } from "stores/ui";

const props = defineProps<{
  modelValue: boolean;
  title: string;
  tokens: any[];
}>();

const emit = defineEmits(["update:modelValue"]);

const model = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val),
});

const { copy } = useClipboard();
const uiStore = useUiStore();
const { activeUnit } = useMintsStore();

function formatCurrency(amount: number): string {
  return uiStore.formatCurrency(amount, activeUnit.value);
}

function formatTs(ts: number): string {
  const d = new Date(ts * 1000);
  return `${d.getFullYear()}-${("0" + (d.getMonth() + 1)).slice(-2)}-${(
    "0" + d.getDate()
  ).slice(-2)}`;
}

function countdownTo(ts: number): string {
  return formatDistanceToNow(ts * 1000);
}
</script>
