<template>
  <!-- TOOLBAR (labels are plain text, not broken i18n keys) -->
  <div class="row items-end q-col-gutter-md q-mt-md">
    <div class="col-12 col-sm-6 col-md-4">
      <q-input dense v-model="state.query" label="Search (name / npub / nip05)" clearable>
        <template #prepend><q-icon name="search" /></template>
      </q-input>
    </div>

    <div class="col-12 col-sm-6 col-md-4">
      <div class="text-caption text-grey-5 q-mb-xs">Frequency</div>
      <div class="row items-center q-gutter-xs">
        <q-chip clickable :color="state.freq.has('weekly')?'primary':''" outline @click="toggleFreq('weekly')">Weekly</q-chip>
        <q-chip clickable :color="state.freq.has('biweekly')?'primary':''" outline @click="toggleFreq('biweekly')">Bi-weekly</q-chip>
        <q-chip clickable :color="state.freq.has('monthly')?'primary':''" outline @click="toggleFreq('monthly')">Monthly</q-chip>
      </div>
    </div>

    <div class="col-12 col-sm-6 col-md-2">
      <q-select dense :options="['any','active','pending','ended']" v-model="state.status" label="Status"/>
    </div>

    <div class="col-6 col-sm-3 col-md-2">
      <q-select dense :options="tierOptions" v-model="state.tier" label="Tier"/>
    </div>

    <div class="col-6 col-sm-3 col-md-2">
      <q-select dense :options="[{label:'Next renewal',value:'next'},{label:'First seen',value:'first'},{label:'Lifetime sats',value:'amount'}]"
                map-options emit-value v-model="state.sort" label="Sort by"/>
    </div>

    <div class="col-6 col-sm-3 col-md-2">
      <q-toggle v-model="state.compact" label="Compact"/>
    </div>

    <div class="col-6 col-sm-3 col-md-2">
      <q-btn outline color="grey-5" icon="download" label="Export CSV" @click="exportCsv"/>
    </div>
  </div>

  <!-- KPI rail -->
  <div class="row q-col-gutter-md q-mt-lg">
    <div class="col-12 col-sm-6 col-lg-3">
      <q-card class="sub-card"><q-card-section>
        <div class="text-caption text-grey-5">Subscribers</div>
        <div class="text-h5">{{ kpis.total }}</div>
      </q-card-section></q-card>
    </div>
    <div class="col-12 col-sm-6 col-lg-3">
      <q-card class="sub-card"><q-card-section>
        <div class="text-caption text-grey-5">Active</div>
        <div class="text-h5">{{ kpis.active }}</div>
        <div class="text-caption text-grey-6">Pending {{ kpis.pending }}</div>
      </q-card-section></q-card>
    </div>
    <div class="col-12 col-sm-6 col-lg-3">
      <q-card class="sub-card"><q-card-section class="row items-center justify-between">
        <div>
          <div class="text-caption text-grey-5">Revenue</div>
          <div class="text-h5">{{ kpis.revenueLifetime }} sat</div>
        </div>
        <!-- tiny sparkline -->
        <svg width="90" height="28"><path d="M2 20 L20 14 L38 16 L56 10 L74 12 L88 8" stroke="currentColor" fill="none" stroke-width="2"/></svg>
      </q-card-section></q-card>
    </div>
    <div class="col-12 col-sm-6 col-lg-3">
      <q-card class="sub-card"><q-card-section class="row items-center justify-between">
        <div>
          <div class="text-caption text-grey-5">This period</div>
          <div class="text-h5">{{ kpis.revenueThisPeriod }} sat</div>
        </div>
        <div>
          <q-btn size="sm" :flat="state.period!=='week'" :color="state.period==='week'?'primary':'grey-5'" label="This week" @click="state.period='week'"/>
          <q-btn size="sm" :flat="state.period!=='month'" :color="state.period==='month'?'primary':'grey-5'" label="This month" class="q-ml-xs" @click="state.period='month'"/>
        </div>
      </q-card-section></q-card>
    </div>
  </div>

  <!-- Micro charts -->
  <div class="row q-col-gutter-md q-mt-md">
    <div class="col-12 col-sm-6 col-lg-3">
      <q-card class="sub-card"><q-card-section>
        <div class="text-caption text-grey-5 q-mb-sm">Frequency</div>
        <svg viewBox="0 0 36 36" width="80">
          <circle cx="18" cy="18" r="15.915" fill="none" stroke="#2b2f3a" stroke-width="3"/>
          <circle cx="18" cy="18" r="15.915" fill="none" stroke="#22c55e" stroke-width="3"
                  :stroke-dasharray="(freqSeries[0]/(freqSeries[0]+freqSeries[1]+freqSeries[2]||1))*100 + ', 100'" />
        </svg>
        <div class="text-caption text-grey-6 q-mt-xs">W {{ freqSeries[0] }} • 2W {{ freqSeries[1] }} • M {{ freqSeries[2] }}</div>
      </q-card-section></q-card>
    </div>

    <div class="col-12 col-sm-6 col-lg-3">
      <q-card class="sub-card"><q-card-section>
        <div class="text-caption text-grey-5 q-mb-sm">Status</div>
        <div class="text-caption text-grey-6">Active {{ statusSeries[0] }} • Pending {{ statusSeries[1] }} • Ended {{ statusSeries[2] }}</div>
      </q-card-section></q-card>
    </div>
  </div>

  <!-- GROUPED CARDS (always renders; no VirtualScroll yet) -->
  <div class="q-mt-lg">
    <div v-for="section in ['weekly','biweekly','monthly']" :key="section" class="q-mb-lg">
      <div class="row items-center q-mb-sm">
        <div class="text-subtitle2 text-grey-4">{{ section === 'weekly' ? 'Weekly' : section === 'biweekly' ? 'Bi-weekly' : 'Monthly' }}</div>
        <q-space />
        <div class="text-caption text-grey-6">{{ grouped[section].length }}</div>
      </div>

      <div class="row q-col-gutter-md">
        <div v-for="r in grouped[section]" :key="r.subscriptionId" class="col-12 col-sm-6 col-lg-4">
          <q-card :class="['sub-card', { compact: state.compact }]">
            <q-card-section class="row items-center no-wrap">
              <q-avatar rounded class="bg-grey-8 text-grey-2">{{ (r.displayName || r.subscriberNpub).slice(0,2).toUpperCase() }}</q-avatar>
              <div class="q-ml-md">
                <div class="text-body1 ellipsis">{{ r.displayName || r.subscriberNpub }}</div>
                <div class="text-caption text-grey-5 ellipsis">{{ r.subscriberNpub }}</div>
              </div>
              <q-space/>
              <q-badge outline :color="uiStatus(r)==='active' ? 'positive' : uiStatus(r)==='pending' ? 'warning' : 'grey-6'">
                {{ uiStatus(r) }}
              </q-badge>
            </q-card-section>

            <q-card-section class="q-pt-none">
              <div class="row items-center q-gutter-sm">
                <q-chip dense color="deep-purple-5" text-color="white">{{ r.tierName || 'Unknown' }}</q-chip>
                <q-chip dense outline>{{ section }}</q-chip>
              </div>

              <div class="row items-center justify-between q-mt-sm">
                <div class="text-body2">
                  {{ (r.amountPerInterval ?? '—') }}<span class="text-caption"> sat / {{ section==='weekly'?'wk':section==='biweekly'?'2wk':'mo' }}</span>
                </div>
                <div class="text-caption text-grey-5">renews in {{ nextInStr(r.nextRenewal) }}</div>
              </div>

              <q-linear-progress :value="progress(r)" color="purple" class="q-mt-xs"/>
              <div class="text-caption text-grey-6 q-mt-xs">total {{ r.totalAmount ?? 0 }} sat</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <div v-if="grouped[section].length === 0" class="text-caption text-grey-6 q-pt-md">No {{ section }} subscribers.</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useCreatorSubscriptionsStore } from 'src/stores/creatorSubscriptions'
import { daysToFrequency } from 'src/constants/subscriptionFrequency'

const store = useCreatorSubscriptionsStore()

// ---------- Filters/state ----------
const state = reactive({
  query: '',
  freq: new Set<string>(),            // 'weekly'|'biweekly'|'monthly'
  status: 'any' as 'any'|'active'|'pending'|'ended',
  tier: 'all' as 'all' | string,
  sort: 'next' as 'next'|'first'|'amount',
  compact: false,
  period: 'month' as 'week'|'month'
})

const rows = computed(() => store.subscriptions ?? [])
const now = computed(() => Math.floor(Date.now()/1000))

function normalizeFreq(r: any) {
  const key = (r.frequency || daysToFrequency(r.intervalDays || 30) || '').toLowerCase()
  return key === 'biweekly' ? 'biweekly' : key === 'weekly' ? 'weekly' : 'monthly'
}
function uiStatus(r: any) {
  if (r.status === 'pending') return 'pending'
  const ended = !!r.endDate && r.endDate <= now.value
  return ended ? 'ended' : (r.status === 'active' ? 'active' : 'ended')
}
function nextInStr(sec?: number) {
  if (!sec) return '—'
  const diff = Math.max(0, sec - now.value)
  const d = Math.floor(diff / 86400), h = Math.floor((diff % 86400)/3600)
  return d ? `${d}d ${h}h` : `${h}h`
}
function progress(r: any) {
  if (!r.nextRenewal) return 0
  const days = r.intervalDays || (normalizeFreq(r)==='weekly'?7:normalizeFreq(r)==='biweekly'?14:30)
  const end = r.nextRenewal * 1000
  const start = end - days*86400000
  const ratio = (Date.now() - start) / (end - start)
  return Math.max(0, Math.min(1, ratio))
}

// ---------- Filtering/sorting ----------
const tierOptions = computed(() => {
  const set = new Set<string>()
  rows.value.forEach(r => set.add(r.tierName || 'Unknown'))
  return ['all', ...Array.from(set)]
})

const filtered = computed(() => {
  const q = state.query.trim().toLowerCase()
  const arr = rows.value.filter((r) => {
    const statusOk = state.status === 'any' || uiStatus(r) === state.status
    const freqOk = !state.freq.size || state.freq.has(normalizeFreq(r))
    const tierOk = state.tier === 'all' || (r.tierName || 'Unknown') === state.tier
    const qOk = !q || String(r.subscriberNpub).toLowerCase().includes(q) || String(r.tierName||'').toLowerCase().includes(q)
    return statusOk && freqOk && tierOk && qOk
  })
  switch (state.sort) {
    case 'amount': return arr.sort((a,b) => (b.totalAmount||0) - (a.totalAmount||0))
    case 'first':  return arr.sort((a,b) => (a.startDate||0) - (b.startDate||0))
    default:       return arr.sort((a,b) => (a.nextRenewal||0) - (b.nextRenewal||0))
  }
})

const grouped = computed(() => {
  const g: Record<'weekly'|'biweekly'|'monthly', any[]> = { weekly:[], biweekly:[], monthly:[] }
  filtered.value.forEach(r => g[normalizeFreq(r) as keyof typeof g].push(r))
  return g
})

// CSV
function exportCsv() {
  const header = ['subscriptionId','displayName','npub','tier','frequency','status','nextRenewal','intervalDays','totalAmount','startDate','endDate']
  const lines = [header.join(',')]
  filtered.value.forEach(r => {
    const line = [
      r.subscriptionId,
      JSON.stringify(r.displayName ?? ''),
      r.subscriberNpub,
      JSON.stringify(r.tierName || 'Unknown'),
      normalizeFreq(r),
      uiStatus(r),
      r.nextRenewal ?? '',
      r.intervalDays ?? '',
      r.totalAmount ?? 0,
      r.startDate ?? '',
      r.endDate ?? ''
    ].join(',')
    lines.push(line)
  })
  const blob = new Blob([lines.join('\n')], {type:'text/csv;charset=utf-8;'})
  const url = URL.createObjectURL(blob); const a = document.createElement('a')
  a.href = url; a.download = `subscribers-${Date.now()}.csv`; a.click()
  URL.revokeObjectURL(url)
}

// chips helpers
function toggleFreq(key: 'weekly'|'biweekly'|'monthly') {
  state.freq.has(key) ? state.freq.delete(key) : state.freq.add(key)
}

// ---------- KPIs & charts ----------
const kpis = computed(() => {
  const total = rows.value.length
  const active = rows.value.filter(r => uiStatus(r) === 'active').length
  const pending = rows.value.filter(r => uiStatus(r) === 'pending').length
  const revenueLifetime = rows.value.reduce((s,r)=> s + (r.totalAmount||0), 0)

  const days = state.period === 'week' ? 7 : 30
  const cut = now.value - days*86400
  const revenueThisPeriod = rows.value
    .filter(r => (r.startDate||0) >= cut || (r.nextRenewal||0) >= cut)
    .reduce((s,r)=> s + (r.amountPerInterval||0), 0)

  return { total, active, pending, revenueLifetime, revenueThisPeriod }
})

const freqSeries = computed(() => {
  const c = { weekly:0, biweekly:0, monthly:0 }
  rows.value.forEach(r => c[normalizeFreq(r)]++)
  return [c.weekly, c.biweekly, c.monthly]
})
const statusSeries = computed(() => {
  const c = { active:0, pending:0, ended:0 }
  rows.value.forEach(r => c[uiStatus(r)]++)
  return [c.active, c.pending, c.ended]
})
</script>

<style scoped>
.sub-card {
  border: 1px solid #2b2f3a;
  border-radius: 16px;
  background: rgba(20,22,28,0.8);
}
.sub-card.compact .q-card__section:first-of-type { padding: 8px 12px; }
.sub-card.compact .q-card__section:nth-of-type(2) { padding: 8px 12px 12px; }
</style>

