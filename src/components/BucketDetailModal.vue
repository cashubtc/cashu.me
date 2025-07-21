<template>
  <q-dialog v-model="showLocal" persistent>
    <q-card dark class="modal-card q-pa-lg">
      <h6 class="q-mt-none q-mb-md bucket-accent">{{ bucket?.name }}</h6>
      <q-list bordered>
        <q-item v-for="p in bucketProofs" :key="p.secret">
          <q-item-section>
            <q-item-label class="text-weight-bold">{{ formatCurrency(p.amount, activeUnit.value) }}</q-item-label>
            <q-item-label caption v-if="p.label">{{ p.label }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
      <div class="row q-mt-md">
        <q-btn flat rounded color="grey" class="q-ml-auto" v-close-popup>{{ $t('global.actions.close.label') }}</q-btn>
      </div>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useProofsStore } from 'stores/proofs';
import { useBucketsStore } from 'stores/buckets';
import { useMintsStore } from 'stores/mints';
import { storeToRefs } from 'pinia';
import { useUiStore } from 'stores/ui';
import { useI18n } from 'vue-i18n';

const props = defineProps<{ modelValue: boolean; bucketId: string | null }>();
const emit = defineEmits(['update:modelValue']);
const { t } = useI18n();

const showLocal = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
});

const bucketsStore = useBucketsStore();
const proofsStore = useProofsStore();
const mintsStore = useMintsStore();
const uiStore = useUiStore();
const { activeUnit } = storeToRefs(mintsStore);

const bucket = computed(() =>
  bucketsStore.bucketList.find(b => b.id === props.bucketId) || null
);
const bucketProofs = computed(() =>
  proofsStore.proofs.filter(p => p.bucketId === props.bucketId && !p.reserved)
);
const formatCurrency = (a:number, unit:string) => uiStore.formatCurrency(a, unit);
</script>
