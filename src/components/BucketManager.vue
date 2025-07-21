<template>
  <div class="w-full max-w-7xl mx-auto flex flex-col">
    <header class="q-mb-lg text-center">
      <div class="text-h5 text-weight-bold text-white">
        {{ formatCurrency(totalActiveBalance, activeUnit.value) }}
      </div>
      <div class="text-grey-5 q-mb-md">
        {{ activeBucketCount }} Active Buckets
      </div>
      <div class="row items-center justify-center q-gutter-xs">
        <q-input
          v-model="searchTerm"
          dark
          borderless
          dense
          class="bg-slate-800 rounded-lg q-px-md q-py-sm"
          placeholder="Search by name or description..."
          aria-label="Search buckets by name or description"
        />
        <q-btn-toggle
          v-model="viewMode"
          no-caps
          rounded
          unelevated
          toggle-color="pink-6"
          color="grey-9"
          text-color="white"
          :options="[
            { label: 'Active', value: 'all' },
            { label: 'Archived', value: 'archived' }
          ]"
        />
        <q-select
          v-model="sortBy"
          borderless
          dense
          dark
          class="bg-slate-800 rounded-lg q-px-md"
          :options="[
            { label: 'Name', value: 'name' },
            { label: 'Balance', value: 'balance' }
          ]"
          label="Sort By"
        />
        <q-btn
          flat
          dense
          round
          class="q-ml-sm"
          :color="multiSelectMode ? 'pink-6' : 'grey-5'"
          :icon="multiSelectMode ? 'close' : 'select_all'"
          @click="toggleMultiSelect"
          :aria-pressed="multiSelectMode"
          aria-label="Toggle bucket selection mode"
        />
      </div>
    </header>

    <q-banner
      v-if="selectedBucketIds.length > 0"
      dense
      class="q-mb-md bg-primary text-white"
    >
      {{ selectedBucketIds.length }} buckets selected.
      <template #action>
        <q-btn
          flat
          dense
          color="white"
          @click="moveSelected"
          aria-label="Move tokens"
        >
          {{ $t('BucketDetail.move') }}
        </q-btn>
        <q-btn
          flat
          dense
          color="white"
          @click="toggleMultiSelect"
          aria-label="Deselect all"
        >
          {{ $t('BucketManager.actions.deselect_all') }}
        </q-btn>
      </template>
    </q-banner>
    <div class="text-body2 q-mb-md">{{ $t("BucketManager.helper.intro") }}</div>
    <div v-if="filteredBuckets.length > 0" class="row q-col-gutter-md q-mb-md">
      <div
        v-for="bucket in filteredBuckets"
        :key="bucket.id"
        class="col-12 col-sm-6 col-md-4 col-lg-3"
        @dragover.prevent
        @drop="handleDrop($event, bucket.id)"
      >
        <BucketCard
          :bucket="bucket"
          :balance="bucketBalances[bucket.id] || 0"
          :activeUnit="activeUnit.value"
          :multi-select-mode="multiSelectMode"
          :selected="selectedBucketIds.includes(bucket.id)"
          @toggle-select="toggleBucketSelection"
          @menu-action="handleMenuAction"
        />
      </div>
    </div>
    <div v-else class="text-center text-grey-6 q-py-xl">
      <q-icon name="o_search" size="4em" class="q-mb-md" />
      <div class="text-h6">No Buckets Found</div>
      <p>Try adjusting your search or filter.</p>
    </div>
    <q-fab
      v-if="selectedBucketIds.length === 0"
      position="bottom-right"
      color="pink-6"
      icon="add"
      @click="openAdd"
      aria-label="Create new bucket"
    />
  </div>

  <q-dialog v-model="showDelete">
    <q-card class="q-pa-md bucket-modal" style="max-width: 400px">
      <q-card-section class="row items-center">
        <q-icon name="warning" color="red" size="2rem" />
        <span class="q-ml-sm">{{
          $t("BucketManager.delete_confirm.title")
        }}</span>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat color="grey" v-close-popup>{{
          $t("global.actions.cancel.label")
        }}</q-btn>
        <q-btn color="negative" @click="deleteBucket">{{
          $t("BucketManager.actions.delete")
        }}</q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>

  <BucketDialog v-model="dialogOpen" />
  <EditBucketModal v-model="editModalOpen" @save="handleEditSave" :bucket="editBucket" />
  <BucketDetailModal v-model="detailModalOpen" :bucket-id="detailBucketId" />
  <MoveTokensModal v-model="moveTokensOpen" :bucket-ids="selectedBucketIds" />
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useBucketsStore, DEFAULT_BUCKET_ID } from 'stores/buckets';
import { useMintsStore } from 'stores/mints';
import { useProofsStore } from 'stores/proofs';
import { storeToRefs } from 'pinia';
import { useUiStore } from 'stores/ui';
import BucketCard from './BucketCard.vue';
import BucketDialog from './BucketDialog.vue';
import EditBucketModal from './EditBucketModal.vue';
import BucketDetailModal from './BucketDetailModal.vue';
import MoveTokensModal from './MoveTokensModal.vue';

export default defineComponent({
  name: 'BucketManager',
  components: {
    BucketCard,
    BucketDialog,
    EditBucketModal,
    BucketDetailModal,
    MoveTokensModal,
  },
  setup() {
    const bucketsStore = useBucketsStore();
    const uiStore = useUiStore();
    const { t } = useI18n();

    const dialogOpen = ref(false);
    const showDelete = ref(false);
    const deleteId = ref(null as string | null);

    const editModalOpen = ref(false);
    const detailModalOpen = ref(false);
    const moveTokensOpen = ref(false);
    const multiSelectMode = ref(false);
    const selectedBucketIds = ref<string[]>([]);
    const editBucket = ref<any>(null);
    const detailBucketId = ref<string | null>(null);

    const viewMode = ref('all');

    const bucketList = computed(() => bucketsStore.bucketList);
    const searchTerm = ref('');
    const sortBy = ref('name');
    const bucketBalances = computed(() => bucketsStore.bucketBalances);

    const activeBuckets = computed(() =>
      bucketList.value.filter((b) => !b.isArchived)
    );

    const activeBucketCount = computed(() => activeBuckets.value.length);

    const totalActiveBalance = computed(() => {
      return activeBuckets.value.reduce(
        (sum, b) => sum + (bucketBalances.value[b.id] || 0),
        0
      );
    });

    const filteredBuckets = computed(() => {
      const term = searchTerm.value.toLowerCase();
      const list = bucketList.value
        .filter((b) =>
          viewMode.value === 'archived' ? b.isArchived : !b.isArchived
        )
        .filter((b) => {
          const name = (b.name || '').toLowerCase();
          const description = (b.description || '').toLowerCase();
          return name.includes(term) || description.includes(term);
        });
      const sorted = [...list];
      if (sortBy.value === 'balance') {
        sorted.sort(
          (a, b) => (bucketBalances.value[b.id] || 0) - (bucketBalances.value[a.id] || 0)
        );
      } else {
        sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      }
      return sorted;
    });

    const mintsStore = useMintsStore();
    const { activeUnit } = storeToRefs(mintsStore);

    const proofsStore = useProofsStore();

    const formatCurrency = (amount: number, unit: string) => uiStore.formatCurrency(amount, unit);

    const openAdd = () => {
      dialogOpen.value = true;
    };

    const openEdit = (bucket: any) => {
      editBucket.value = bucket;
      editModalOpen.value = true;
    };

    const openDetail = (bucket: any) => {
      detailBucketId.value = bucket.id;
      detailModalOpen.value = true;
    };

    const toggleBucketSelection = (id: string) => {
      if (selectedBucketIds.value.includes(id)) {
        selectedBucketIds.value = selectedBucketIds.value.filter((b) => b !== id);
      } else {
        selectedBucketIds.value.push(id);
      }
    };

    const toggleMultiSelect = () => {
      multiSelectMode.value = !multiSelectMode.value;
      if (!multiSelectMode.value) selectedBucketIds.value = [];
    };

    const moveSelected = () => {
      if (selectedBucketIds.value.length) {
        moveTokensOpen.value = true;
      }
    };

    const handleEditSave = (data: any) => {
      if (editBucket.value) {
        bucketsStore.editBucket(editBucket.value.id, { ...data });
      }
      editModalOpen.value = false;
    };

    const handleDrop = async (ev: DragEvent, id: string) => {
      ev.preventDefault();
      const data = ev.dataTransfer?.getData('text/plain');
      if (!data) return;
      let secrets: string[] | undefined;
      try {
        secrets = JSON.parse(data);
      } catch (e) {
        secrets = data.split(',');
      }
      if (Array.isArray(secrets) && secrets.length) {
        await proofsStore.moveProofs(secrets, id);
      }
    };

    const openDelete = (id: string) => {
      deleteId.value = id;
      showDelete.value = true;
    };

    const deleteBucket = () => {
      bucketsStore.deleteBucket(deleteId.value as string);
      showDelete.value = false;
    };

    const handleMenuAction = ({ action, bucket }: any) => {
      switch (action) {
        case 'view':
          openDetail(bucket);
          break;
        case 'edit':
          openEdit(bucket);
          break;
        case 'archive':
          bucketsStore.editBucket(bucket.id, { isArchived: !bucket.isArchived });
          break;
        case 'delete':
          openDelete(bucket.id);
          break;
      }
    };

    return {
      DEFAULT_BUCKET_ID,
      bucketList,
      searchTerm,
      sortBy,
      viewMode,
      filteredBuckets,
      bucketBalances,
      activeBucketCount,
      totalActiveBalance,
      activeUnit,
      dialogOpen,
      showDelete,
      editModalOpen,
      detailModalOpen,
      moveTokensOpen,
      editBucket,
      detailBucketId,
      openAdd,
      openEdit,
      openDetail,
      handleEditSave,
      openDelete,
      deleteBucket,
      formatCurrency,
      handleDrop,
      handleMenuAction,
      multiSelectMode,
      selectedBucketIds,
      toggleBucketSelection,
      toggleMultiSelect,
      moveSelected,
    };
  },
});
</script>
