<template>
  <q-drawer
    :model-value="modelValue"
    @update:model-value="(value) => emit('update:modelValue', value)"
    side="right"
    :overlay="$q.screen.lt.md"
    bordered
    class="page-surface"
  >
    <div v-if="subscriber" class="column fit">
      <div class="q-pa-md scroll">
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
        <q-bar class="card-bg q-mt-sm">
          <div class="text-body2 monospace ellipsis">{{ subscriber.npub }}</div>
        </q-bar>

        <div class="q-mt-md">
          <div class="text-subtitle2 q-mb-sm">
            {{ t("CreatorSubscribers.drawer.tabs.overview") }}
          </div>
          <q-list bordered dense class="card-bg">
            <q-item>
              <q-item-section>{{
                t("CreatorSubscribers.columns.tier")
              }}</q-item-section>
              <q-item-section side>{{ subscriber.tierName }}</q-item-section>
            </q-item>
            <q-item>
              <q-item-section>{{
                t("CreatorSubscribers.columns.frequency")
              }}</q-item-section>
              <q-item-section side>{{
                t("CreatorSubscribers.frequency." + subscriber.frequency)
              }}</q-item-section>
            </q-item>
            <q-item>
              <q-item-section>{{
                t("CreatorSubscribers.columns.status")
              }}</q-item-section>
              <q-item-section side>{{
                t("CreatorSubscribers.status." + subscriber.status)
              }}</q-item-section>
            </q-item>
            <q-item>
              <q-item-section>{{
                t("CreatorSubscribers.drawer.overview.amountPerInterval")
              }}</q-item-section>
              <q-item-section side>
                {{ subscriber.amountSat }} sat /
                {{ t("CreatorSubscribers.frequency." + subscriber.frequency) }}
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>{{
                t("CreatorSubscribers.drawer.overview.nextRenewal")
              }}</q-item-section>
              <q-item-section side>
                {{
                  subscriber.nextRenewal
                    ? formatDate(subscriber.nextRenewal)
                    : "—"
                }}
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>{{
                t("CreatorSubscribers.drawer.overview.lifetimeTotal")
              }}</q-item-section>
              <q-item-section side
                >{{ subscriber.lifetimeSat }} sat</q-item-section
              >
            </q-item>
            <q-item>
              <q-item-section>{{
                t("CreatorSubscribers.drawer.overview.since")
              }}</q-item-section>
              <q-item-section side>{{
                formatDate(subscriber.startDate)
              }}</q-item-section>
            </q-item>
          </q-list>
        </div>

        <div class="q-mt-lg">
          <div class="text-subtitle2 q-mb-sm">
            {{ t("CreatorSubscribers.drawer.tabs.payments") }}
          </div>
          <q-list bordered dense class="card-bg">
            <q-item v-for="p in payments" :key="p.ts">
              <q-item-section>{{ formatDate(p.ts) }}</q-item-section>
              <q-item-section side>{{ p.amount }} sat</q-item-section>
            </q-item>
          </q-list>
        </div>

        <div class="q-mt-lg">
          <div class="text-subtitle2 q-mb-sm">
            {{ t("CreatorSubscribers.drawer.activity") }}
          </div>
          <q-list bordered dense class="card-bg">
            <q-item v-for="a in activity" :key="a.ts">
              <q-item-section>{{ a.text }}</q-item-section>
              <q-item-section side class="text-caption text-secondary">
                {{ distToNow(a.ts) }}
              </q-item-section>
            </q-item>
          </q-list>
        </div>
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
import type { Subscriber } from "src/types/subscriber";
import { copyNpub } from "src/utils/clipboard";

const props = defineProps<{
  modelValue: boolean;
  subscriber: Subscriber | null;
}>();

const emit = defineEmits<{
  "update:modelValue": [boolean];
}>();

const { t } = useI18n();
const router = useRouter();

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
}
</style>
