<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-gutter-sm q-mb-md">
      <q-input v-model="searchTerm" dense outlined label="Search" />
      <q-select
        v-model="viewMode"
        dense
        outlined
        :options="[
          { label: 'Active', value: 'active' },
          { label: 'Archived', value: 'archived' }
        ]"
        label="View"
      />
      <q-select
        v-model="sortBy"
        dense
        outlined
        :options="[
          { label: 'Name', value: 'name' },
          { label: 'Balance', value: 'balance' }
        ]"
        label="Sort By"
      />
      <q-btn color="primary" icon="add" label="Add" @click="openAdd" />
    </div>
    <div class="row q-col-gutter-md">
      <div
        v-for="bucket in filteredBuckets"
        :key="bucket.id"
        class="col-12 col-sm-6 col-md-4 col-lg-3"
      >
        <BucketCard
          :bucket="bucket"
          :balance="bucketBalances[bucket.id] || 0"
          :active-unit="activeUnit"
          @menu-action="handleMenuAction"
        />
      </div>
    </div>
    <BucketDialog v-model="dialogOpen" />
    <EditBucketModal v-model="editModalOpen" :bucket="editBucket" @save="saveEdit" />
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import BucketCard from 'components/BucketCard.vue';
import BucketDialog from 'components/BucketDialog.vue';
import EditBucketModal from 'components/EditBucketModal.vue';
import { useBucketsStore } from 'stores/buckets';
import { useMintsStore } from 'stores/mints';

const bucketsStore = useBucketsStore();
const mintsStore = useMintsStore();

const { bucketList, bucketBalances } = storeToRefs(bucketsStore);
const { activeUnit } = storeToRefs(mintsStore);

const searchTerm = ref('');
const viewMode = ref<'active' | 'archived'>('active');
const sortBy = ref<'name' | 'balance'>('name');

const dialogOpen = ref(false);
const editModalOpen = ref(false);
const editBucket = ref(null as any);

function openAdd() {
  dialogOpen.value = true;
}
function handleMenuAction({ action, bucket }: any) {
  switch (action) {
    case 'edit':
      editBucket.value = bucket;
      editModalOpen.value = true;
      break;
    case 'delete':
      bucketsStore.deleteBucket(bucket.id);
      break;
    case 'archive':
      bucketsStore.editBucket(bucket.id, { isArchived: !bucket.isArchived });
      break;
  }
}
function saveEdit(data: any) {
  if (editBucket.value) {
    bucketsStore.editBucket(editBucket.value.id, { ...data });
  }
  editModalOpen.value = false;
}

const filteredBuckets = computed(() => {
  const term = searchTerm.value.toLowerCase();
  const list = bucketList.value.filter(b =>
    viewMode.value === 'archived' ? b.isArchived : !b.isArchived
  );
  const filtered = list.filter(b => {
    const name = (b.name || '').toLowerCase();
    const desc = (b.description || '').toLowerCase();
    return name.includes(term) || desc.includes(term);
  });
  const sorted = [...filtered];
  if (sortBy.value === 'balance') {
    sorted.sort((a, b) => (bucketBalances.value[b.id] || 0) - (bucketBalances.value[a.id] || 0));
  } else {
    sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }
  return sorted;
});
</script>

<style scoped>
</style>
