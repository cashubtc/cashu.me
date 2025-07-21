<template>
  <div class="w-full max-w-7xl mx-auto flex flex-col">
    <header class="q-mb-lg text-center">
      <h1 class="text-h4 text-weight-bold text-white q-mb-md">Buckets Dashboard</h1>
      <q-btn-toggle
        v-model="viewMode"
        no-caps
        rounded
        unelevated
        toggle-color="pink-6"
        color="grey-9"
        text-color="white"
        :options="[
          {label: 'Active', value: 'all'},
          {label: 'Archived', value: 'archived'}
        ]"
        class="q-mb-md"
      />
      <q-input
        v-model="searchTerm"
        dark
        borderless
        dense
        class="q-mb-md bg-slate-800 rounded-lg q-px-md q-py-sm"
        placeholder="Search by name or description..."
        aria-label="Search buckets by name or description"
      />
    </header>
    <div class="text-body2 q-mb-md">{{ $t("BucketManager.helper.intro") }}</div>
    <div v-if="filteredBuckets.length > 0" class="row q-col-gutter-md q-mb-md">
      <div
        v-for="bucket in filteredBuckets"
        :key="bucket.id"
        class="col-12 col-md-6 col-lg-4"
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
    <footer class="row justify-center q-mt-xl q-gutter-md">
      <q-btn
        @click="openAdd"
        label="+ New Bucket"
        no-caps
        unelevated
        padding="12px 32px"
        text-color="white"
        class="font-semibold"
        style="background-image: linear-gradient(to right, #db2777, #9333ea);"
      />
      <q-btn
        @click="moveSelected"
        label="Move Tokens"
        no-caps
        unelevated
        padding="12px 32px"
        :disable="!selectedBucketIds.length"
        class="bg-grey-8 font-semibold"
      />
    </footer>
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
    const filteredBuckets = computed(() => {
      const term = searchTerm.value.toLowerCase();
      return bucketList.value
        .filter((b) => (viewMode.value === 'archived' ? b.isArchived : !b.isArchived))
        .filter((b) => {
          const name = (b.name || '').toLowerCase();
          const description = (b.description || '').toLowerCase();
          return name.includes(term) || description.includes(term);
        });
    });
    const bucketBalances = computed(() => bucketsStore.bucketBalances);

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
      viewMode,
      filteredBuckets,
      bucketBalances,
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
