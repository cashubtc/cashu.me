<template>
  <q-drawer
    :model-value="modelValue"
    @update:model-value="(value) => emit('update:modelValue', value)"
    side="right"
    :overlay="$q.screen.lt.md"
    bordered
    class="page-surface"
    :width="drawerWidth"
    style="min-width: 320px; max-width: 500px"
  >
    <div v-if="subscriber" class="column fit">
      <div class="q-pa-md scroll-y" style="overflow-x: hidden">
        <div class="row items-center q-gutter-x-md">
          <q-btn
            flat
            dense
            round
            icon="arrow_back"
            aria-label="Back"
            @click="emit('update:modelValue', false)"
            class="focus-outline"
          />
          <q-avatar size="64px">{{ initials(subscriber.name) }}</q-avatar>
          <div class="col" style="min-width: 0">
            <div class="text-h6 break-word">{{ subscriber.name }}</div>
            <div class="text-body2 text-secondary break-word">
              {{ subscriber.nip05 }}
            </div>
          </div>
        </div>
        <q-expansion-item
          class="q-mt-sm"
          dense
          expand-separator
          header-class="card-bg"
          label="npub"
        >
          <div class="q-pa-sm card-bg text-body2 monospace break-word">
            {{ subscriber.npub }}
          </div>
        </q-expansion-item>

        <q-expansion-item
          class="q-mt-md"
          dense
          expand-separator
          header-class="card-bg"
          :label="t('CreatorSubscribers.drawer.tabs.overview')"
          default-opened
        >
          <div class="card-bg">
            <q-markup-table flat bordered dense class="overview-table">
              <tbody>
                <tr>
                  <td>{{ t("CreatorSubscribers.columns.tier") }}</td>
                  <td class="text-right break-word">{{ subscriber.tierName }}</td>
                </tr>
                <tr>
                  <td>{{ t("CreatorSubscribers.columns.frequency") }}</td>
                  <td class="text-right break-word">
                    {{ t("CreatorSubscribers.frequency." + subscriber.frequency) }}
                  </td>
                </tr>
                <tr>
                  <td>{{ t("CreatorSubscribers.columns.status") }}</td>
                  <td class="text-right break-word">
                    {{ t("CreatorSubscribers.status." + subscriber.status) }}
                  </td>
                </tr>
                <tr>
                  <td>{{ t("CreatorSubscribers.drawer.overview.amountPerInterval") }}</td>
                  <td class="text-right break-word">
                    {{ subscriber.amountSat }} sat /
                    {{ t("CreatorSubscribers.frequency." + subscriber.frequency) }}
                  </td>
                </tr>
                <tr>
                  <td>{{ t("CreatorSubscribers.drawer.overview.nextRenewal") }}</td>
                  <td class="text-right break-word">
                    {{
                      subscriber.nextRenewal
                        ? formatDate(subscriber.nextRenewal)
                        : "—"
                    }}
                  </td>
                </tr>
                <tr>
                  <td>{{ t("CreatorSubscribers.drawer.overview.lifetimeTotal") }}</td>
                  <td class="text-right break-word">
                    {{ subscriber.lifetimeSat }} sat
                  </td>
                </tr>
                <tr>
                  <td>{{ t("CreatorSubscribers.drawer.overview.since") }}</td>
                  <td class="text-right break-word">
                    {{ formatDate(subscriber.startDate) }}
                  </td>
                </tr>
              </tbody>
            </q-markup-table>
          </div>
        </q-expansion-item>

        <q-expansion-item
          class="q-mt-md"
          dense
          expand-separator
          header-class="card-bg"
          :label="t('CreatorSubscribers.drawer.tabs.payments')"
          default-opened
        >
          <div class="card-bg">
            <q-markup-table
              v-if="payments.length"
              flat
              bordered
              dense
              class="payment-table"
            >
              <tbody>
                <tr v-for="p in payments" :key="p.ts">
                  <td>{{ formatDate(p.ts) }}</td>
                  <td class="text-right">{{ p.amount }} sat</td>
                </tr>
              </tbody>
            </q-markup-table>
            <div v-else class="q-pa-sm text-secondary">
              {{ t("CreatorSubscribers.drawer.payments.noPayments") }}
            </div>
          </div>
        </q-expansion-item>

        <q-expansion-item
          class="q-mt-md"
          dense
          expand-separator
          header-class="card-bg"
          :label="t('CreatorSubscribers.drawer.activity')"
          default-opened
        >
          <div class="card-bg">
            <q-markup-table flat bordered dense class="activity-table">
              <tbody>
                <tr v-for="a in activity" :key="a.ts">
                  <td class="break-word">{{ a.text }}</td>
                  <td
                    class="text-right text-caption text-secondary"
                  >
                    {{ distToNow(a.ts) }}
                  </td>
                </tr>
              </tbody>
            </q-markup-table>
          </div>
        </q-expansion-item>
      </div>
      <q-separator class="divider-bg" />
      <div class="q-pa-sm card-bg row q-gutter-sm justify-end">
        <q-btn
          flat
          :label="t('CreatorSubscribers.drawer.actions.dm')"
          :aria-label="t('CreatorSubscribers.drawer.actions.dm')"
          @click="dmSubscriber"
          class="focus-outline"
        />
        <q-btn
          flat
          :label="t('CreatorSubscribers.drawer.actions.copyNpub')"
          :aria-label="t('CreatorSubscribers.drawer.actions.copyNpub')"
          @click="copyCurrentNpub"
          class="focus-outline"
        />
        <q-btn
          flat
          color="negative"
          :label="t('CreatorSubscribers.drawer.actions.cancel')"
          :aria-label="t('CreatorSubscribers.drawer.actions.cancel')"
          @click="emit('update:modelValue', false)"
          class="focus-outline"
        />
      </div>
    </div>
  </q-drawer>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { format, formatDistanceToNow } from "date-fns";
import { useQuasar } from "quasar";
import type { Subscriber } from "src/types/subscriber";
import { copyNpub } from "src/utils/clipboard";

const props = defineProps<{
  modelValue: boolean;
  subscriber: Subscriber | null;
  width?: number;
}>();

const emit = defineEmits<{
  "update:modelValue": [boolean];
}>();

const { t } = useI18n();
const router = useRouter();
const $q = useQuasar();

const drawerWidth = computed(() =>
  props.width ?? ($q.screen.lt.md ? 320 : 400),
);

function initials(name: string) {
  if (!name) return "";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

function distToNow(ts: number) {
  return formatDistanceToNow(ts * 1000, { addSuffix: true });
}

function formatDate(ts: number) {
  return format(ts * 1000, "PP p");
}

function copyCurrentNpub() {
  if (!props.subscriber) return;
  copyNpub(props.subscriber.npub);
}

function dmSubscriber() {
  if (!props.subscriber) return;
  router.push({
    path: "/nostr-messenger",
    query: { pubkey: props.subscriber.npub },
  });
}

const payments = computed(() => {
  const r = props.subscriber;
  if (!r) return [] as any[];
  const interval =
    r.frequency === "weekly" ? 7 : r.frequency === "biweekly" ? 14 : 30;
  const last = (r.nextRenewal ?? r.startDate) - interval * 86400;
  return [
    { ts: last, amount: r.amountSat },
    { ts: r.nextRenewal ?? r.startDate, amount: r.amountSat },
  ];
});

const activity = computed(() => {
  const r = props.subscriber;
  if (!r) return [] as any[];
  const arr = [{ ts: r.startDate, text: "Started subscription" }];
  if (r.nextRenewal) arr.push({ ts: r.nextRenewal, text: "Next renewal" });
  return arr;
});
</script>

<style scoped>
.page-surface {
  background-color: #0f1216;
  color: #e7ecf3;
}
.card-bg {
  background-color: #12161c;
}
.divider-bg {
  background-color: #1c222b;
}
.text-secondary {
  color: #a7b0bf;
}
.focus-outline:focus-visible,
.focus-outline .q-field__native:focus-visible {
  outline: 2px solid #8c5efb;
  outline-offset: 2px;
}
.break-word {
  word-break: break-all;
  overflow-wrap: break-word;
  white-space: normal;
}
/* Tables use default styling; no additional rules needed */
</style>
