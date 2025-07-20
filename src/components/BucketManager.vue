<template>
  <div style="max-width: 800px; margin: 0 auto">
    <div class="text-body2 q-mb-md">{{ $t("BucketManager.helper.intro") }}</div>
    <q-input
      v-model="searchTerm"
      outlined
      dense
      class="q-mb-md"
      :placeholder="$t('bucketManager.inputs.search.placeholder')"
    />
    <q-tabs v-model="viewMode" dense class="q-mb-md" no-caps>
      <q-tab name="all" :label="$t('BucketManager.view.all')" />
      <q-tab name="archived" :label="$t('BucketManager.view.archived')" />
    </q-tabs>
    <q-list padding>
      <div
        v-for="bucket in filteredBuckets"
        :key="bucket.id"
        class="q-mb-md"
        @dragover.prevent
        @drop="handleDrop($event, bucket.id)"
      >
        <BucketCard
          :bucket="bucket"
          :balance="bucketBalances[bucket.id] || 0"
          :activeUnit="activeUnit.value"
          @menu-action="handleMenuAction"
        />
      </div>
      <q-item>
        <q-item-section>
          <q-btn
            color="primary"
            icon="add"
            outline
            @click="openAdd"
            :label="$t('bucketManager.actions.add')"
          >
            <q-tooltip>{{ $t("BucketManager.tooltips.add_button") }}</q-tooltip>
          </q-btn>
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <router-link to="/move-tokens" style="text-decoration: none">
            <q-btn color="primary" outline>
              {{ $t("BucketDetail.move") }}
              <q-tooltip>{{
                $t("BucketManager.tooltips.move_button")
              }}</q-tooltip>
            </q-btn>
          </router-link>
        </q-item-section>
      </q-item>
    </q-list>
  </div>

  <q-dialog v-model="showDelete">
    <q-card class="q-pa-md" style="max-width: 400px">
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

export default defineComponent({
  name: 'BucketManager',
  components: { BucketCard, BucketDialog, EditBucketModal, BucketDetailModal },
  setup() {
    const bucketsStore = useBucketsStore();
    const uiStore = useUiStore();
    const { t } = useI18n();

    const dialogOpen = ref(false);
    const showDelete = ref(false);
    const deleteId = ref(null as string | null);

    const editModalOpen = ref(false);
    const detailModalOpen = ref(false);
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
    };
  },
});
</script>
