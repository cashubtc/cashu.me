<template>
  <q-page padding>
    <!-- Top bar -->
    <div class="row items-center q-gutter-sm q-mb-md">
      <div class="text-h6">Subscribers</div>
      <q-input
        dense
        v-model="search"
        placeholder="Search"
        class="q-ml-md"
        clearable
      >
        <template #prepend>
          <q-icon name="search" />
        </template>
      </q-input>
      <q-btn dense flat round icon="tune" class="q-ml-sm">
        <q-menu class="q-pa-md" anchor="bottom right" self="top right">
          <div class="column q-gutter-md" style="min-width: 220px">
            <div>
              <div class="text-caption text-grey-6 q-mb-xs">Status</div>
              <div class="row q-gutter-xs">
                <q-chip
                  clickable
                  outline
                  :color="statuses.has('active') ? 'primary' : ''"
                  @click="toggleStatus('active')"
                  >Active</q-chip
                >
                <q-chip
                  clickable
                  outline
                  :color="statuses.has('pending') ? 'primary' : ''"
                  @click="toggleStatus('pending')"
                  >Pending</q-chip
                >
                <q-chip
                  clickable
                  outline
                  :color="statuses.has('ended') ? 'primary' : ''"
                  @click="toggleStatus('ended')"
                  >Ended</q-chip
                >
              </div>
            </div>
            <div>
              <div class="text-caption text-grey-6 q-mb-xs">Tiers</div>
              <div class="row q-gutter-xs">
                <q-chip
                  v-for="t in tierOptions"
                  :key="t.id"
                  clickable
                  outline
                  :color="tiers.has(t.id) ? 'primary' : ''"
                  @click="toggleTier(t.id)"
                  >{{ t.name }}</q-chip
                >
              </div>
            </div>
            <div>
              <div class="text-caption text-grey-6 q-mb-xs">Sort</div>
              <q-select
                dense
                v-model="sort"
                :options="sortOptions"
                emit-value
                map-options
              />
            </div>
          </div>
        </q-menu>
      </q-btn>
      <q-btn
        outline
        color="grey-5"
        icon="download"
        label="Export CSV"
        class="q-ml-sm"
        @click="exportCsv()"
      />
    </div>

    <!-- Tabs -->
    <q-tabs v-model="activeTab" dense class="q-mb-md" no-caps>
      <q-tab name="all"
        ><div class="row items-center no-wrap">
          <span>All</span
          ><q-badge class="q-ml-xs" color="primary">{{ counts.all }}</q-badge>
        </div></q-tab
      >
      <q-tab name="weekly"
        ><div class="row items-center no-wrap">
          <span>Weekly</span
          ><q-badge class="q-ml-xs" color="primary">{{
            counts.weekly
          }}</q-badge>
        </div></q-tab
      >
      <q-tab name="biweekly"
        ><div class="row items-center no-wrap">
          <span>Bi-weekly</span
          ><q-badge class="q-ml-xs" color="primary">{{
            counts.biweekly
          }}</q-badge>
        </div></q-tab
      >
      <q-tab name="monthly"
        ><div class="row items-center no-wrap">
          <span>Monthly</span
          ><q-badge class="q-ml-xs" color="primary">{{
            counts.monthly
          }}</q-badge>
        </div></q-tab
      >
      <q-tab name="pending"
        ><div class="row items-center no-wrap">
          <span>Pending</span
          ><q-badge class="q-ml-xs" color="primary">{{
            counts.pending
          }}</q-badge>
        </div></q-tab
      >
      <q-tab name="ended"
        ><div class="row items-center no-wrap">
          <span>Ended</span
          ><q-badge class="q-ml-xs" color="primary">{{ counts.ended }}</q-badge>
        </div></q-tab
      >
    </q-tabs>

    <!-- Table -->
    <q-table
      flat
      :rows="filtered"
      row-key="id"
      selection="multiple"
      v-model:selected="selected"
      :columns="columns"
      :rows-per-page-options="[10, 25, 50]"
      :row-class="rowClass"
    >
      <template #body-cell-subscriber="props">
        <q-td :props="props">
          <div class="row items-center q-gutter-sm no-wrap">
            <q-avatar size="32px">{{ initials(props.row.name) }}</q-avatar>
            <div>
              <div class="text-body2">{{ props.row.name }}</div>
              <div class="text-caption text-grey-6">{{ props.row.nip05 }}</div>
            </div>
          </div>
        </q-td>
      </template>
      <template #body-cell-tier="props">
        <q-td :props="props"
          ><q-chip dense color="primary" text-color="white">{{
            props.row.tierName
          }}</q-chip></q-td
        >
      </template>
      <template #body-cell-frequency="props">
        <q-td :props="props"
          ><q-chip dense outline>{{
            freqShort(props.row.frequency)
          }}</q-chip></q-td
        >
      </template>
      <template #body-cell-status="props">
        <q-td :props="props"
          ><q-chip
            dense
            :color="statusColor(props.row.status)"
            text-color="white"
            >{{ props.row.status }}</q-chip
          ></q-td
        >
      </template>
      <template #body-cell-amount="props"
        ><q-td :props="props">{{ props.row.amountSat }} sat</q-td></template
      >
      <template #body-cell-nextRenewal="props">
        <q-td :props="props">
          <div class="row items-center no-wrap q-gutter-sm">
            <div
              class="progress-ring"
              :style="{
                '--progress': progressPercent(props.row),
                '--size': '28px',
                '--thickness': '3px',
                '--progress-ring-fill': `var(--q-${
                  dueSoon(props.row) ? 'warning' : 'primary'
                })`,
              }"
              :data-label="`${progressPercent(props.row)}%`"
              role="progressbar"
              :aria-valuenow="progressPercent(props.row)"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-label="Renewal progress"
            />
            <div class="column">
              <div
                :class="[
                  'text-caption',
                  dueSoon(props.row) ? 'text-warning' : '',
                ]"
              >
                {{
                  props.row.nextRenewal ? distToNow(props.row.nextRenewal) : "—"
                }}
              </div>
              <div class="text-caption text-grey-6">
                {{
                  props.row.nextRenewal ? formatDate(props.row.nextRenewal) : ""
                }}
              </div>
            </div>
          </div>
        </q-td>
      </template>
      <template #body-cell-lifetime="props"
        ><q-td :props="props">{{ props.row.lifetimeSat }} sat</q-td></template
      >
      <template #body-cell-actions="props"
        ><q-td :props="props"
          ><q-btn
            flat
            dense
            round
            icon="chevron_right"
            @click="openDrawer(props.row)" /></q-td
      ></template>
    </q-table>

    <!-- Selection bar -->
    <div
      v-if="selected.length"
      class="q-mt-sm q-pa-sm bg-primary text-white row items-center q-gutter-sm"
    >
      <div>{{ selected.length }} selected</div>
      <q-space />
      <q-btn
        outline
        dense
        color="white"
        icon="download"
        label="Export selection"
        @click="exportCsv(true)"
      />
      <q-btn flat dense color="white" label="Clear" @click="selected = []" />
    </div>

    <!-- Drawer -->
    <q-drawer v-model="drawer" side="right" overlay bordered>
      <div v-if="current" class="q-pa-md">
        <div class="row items-center q-gutter-sm">
          <q-avatar size="64px">{{ initials(current.name) }}</q-avatar>
          <div>
            <div class="text-h6">{{ current.name }}</div>
            <div class="text-body2 text-grey-6">{{ current.nip05 }}</div>
          </div>
        </div>
        <div class="row q-gutter-xs q-mt-md">
          <q-chip dense color="primary" text-color="white">{{
            current.tierName
          }}</q-chip>
          <q-chip dense outline>{{ current.frequency }}</q-chip>
          <q-chip
            dense
            :color="statusColor(current.status)"
            text-color="white"
            >{{ current.status }}</q-chip
          >
        </div>
        <div class="q-mt-md">
          {{ current.amountSat }} sat / {{ current.frequency }}
        </div>
        <div class="q-mt-sm">
          Next renewal:
          {{ current.nextRenewal ? formatDate(current.nextRenewal) : "—" }}
          <span v-if="current.nextRenewal" class="text-grey-6"
            >({{ distToNow(current.nextRenewal) }})</span
          >
        </div>
        <div class="q-mt-sm">Lifetime: {{ current.lifetimeSat }} sat</div>
        <div class="q-mt-sm">Since {{ formatDate(current.startDate) }}</div>
        <div class="row q-gutter-sm q-mt-md">
          <q-btn outline label="DM" :to="'/dm/' + current.npub" />
          <q-btn outline label="Copy npub" @click="copyNpub" />
        </div>
        <div class="q-mt-lg">
          <div class="text-subtitle2 q-mb-sm">Payments</div>
          <q-list bordered dense>
            <q-item v-for="p in payments" :key="p.ts">
              <q-item-section>{{ formatDate(p.ts) }}</q-item-section>
              <q-item-section side>{{ p.amount }} sat</q-item-section>
            </q-item>
          </q-list>
        </div>
        <div class="q-mt-lg">
          <div class="text-subtitle2 q-mb-sm">Activity</div>
          <q-list bordered dense>
            <q-item v-for="a in activity" :key="a.ts">
              <q-item-section>{{ a.text }}</q-item-section>
              <q-item-section side class="text-caption text-grey">{{
                distToNow(a.ts)
              }}</q-item-section>
            </q-item>
          </q-list>
        </div>
      </div>
    </q-drawer>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useCreatorSubscribersStore } from "src/stores/creatorSubscribers";
import { storeToRefs } from "pinia";
import { useDebounceFn } from "@vueuse/core";
import { format, formatDistanceToNow } from "date-fns";
import { copyToClipboard } from "quasar";
import type { Subscriber, Frequency, SubStatus } from "src/types/subscriber";

const subStore = useCreatorSubscribersStore();
const { filtered, counts } = storeToRefs(subStore);
const { activeTab, statuses, tiers, sort } = storeToRefs(subStore);

const search = ref(subStore.query);
const applySearch = useDebounceFn((v: string) => {
  subStore.query = v;
}, 300);
watch(search, (v) => applySearch(v));

const tierOptions = computed(() => {
  const map = new Map<string, string>();
  subStore.subscribers.forEach((s) => map.set(s.tierId, s.tierName));
  return Array.from(map).map(([id, name]) => ({ id, name }));
});

function toggleStatus(s: SubStatus) {
  statuses.value.has(s) ? statuses.value.delete(s) : statuses.value.add(s);
}
function toggleTier(id: string) {
  tiers.value.has(id) ? tiers.value.delete(id) : tiers.value.add(id);
}

const sortOptions = [
  { label: "Next renewal", value: "next" },
  { label: "First seen", value: "first" },
  { label: "Lifetime sats", value: "amount" },
];

const selected = ref<Subscriber[]>([]);

const columns = [
  { name: "subscriber", label: "Subscriber", field: "name", sortable: true },
  { name: "tier", label: "Tier", field: "tierName" },
  { name: "frequency", label: "Freq", field: "frequency" },
  { name: "status", label: "Status", field: "status" },
  { name: "amount", label: "Amount", field: "amountSat", sortable: true },
  {
    name: "nextRenewal",
    label: "Next renewal",
    field: "nextRenewal",
    sortable: true,
  },
  { name: "lifetime", label: "Lifetime", field: "lifetimeSat", sortable: true },
  { name: "actions", label: "", field: "id" },
];

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}
function freqShort(f: Frequency) {
  return f === "weekly" ? "W" : f === "biweekly" ? "2W" : "M";
}
function statusColor(s: SubStatus) {
  return s === "active" ? "positive" : s === "pending" ? "warning" : "negative";
}
function progressPercent(r: Subscriber) {
  if (!r.nextRenewal) return 0;
  const days =
    r.frequency === "weekly" ? 7 : r.frequency === "biweekly" ? 14 : 30;
  const end = r.nextRenewal * 1000;
  const start = end - days * 86400000;
  const now = Date.now();
  return Math.round(
    Math.min(Math.max((now - start) / (end - start), 0), 1) * 100
  );
}
function dueSoon(r: Subscriber) {
  if (!r.nextRenewal || r.status !== "active") return false;
  return r.nextRenewal * 1000 - Date.now() < 72 * 3600 * 1000;
}
function rowClass(row: Subscriber) {
  return dueSoon(row) ? "due-soon" : "";
}
function distToNow(ts: number) {
  return formatDistanceToNow(ts * 1000, { addSuffix: true });
}
function formatDate(ts: number) {
  return format(ts * 1000, "PP p");
}

function exportCsv(selectionOnly = false) {
  const rows = selectionOnly ? selected.value : filtered.value;
  const header =
    "name,npub,nip05,tier,frequency,status,amount_sat,next_renewalISO,lifetime_sat,start_dateISO";
  const lines = rows.map((r) =>
    [
      JSON.stringify(r.name),
      r.npub,
      r.nip05,
      JSON.stringify(r.tierName),
      r.frequency,
      r.status,
      r.amountSat,
      r.nextRenewal ? new Date(r.nextRenewal * 1000).toISOString() : "",
      r.lifetimeSat,
      new Date(r.startDate * 1000).toISOString(),
    ].join(",")
  );
  const blob = new Blob([header + "\n" + lines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `subscribers-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const drawer = ref(false);
const current = ref<Subscriber | null>(null);
function openDrawer(r: Subscriber) {
  current.value = r;
  drawer.value = true;
}
function copyNpub() {
  if (current.value) copyToClipboard(current.value.npub);
}
const payments = computed(() => {
  const r = current.value;
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
  const r = current.value;
  if (!r) return [] as any[];
  const arr = [{ ts: r.startDate, text: "Started subscription" }];
  if (r.nextRenewal) arr.push({ ts: r.nextRenewal, text: "Next renewal" });
  return arr;
});
</script>
