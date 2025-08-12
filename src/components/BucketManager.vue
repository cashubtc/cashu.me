<template>
  <div class="w-full max-w-7xl mx-auto flex flex-col">
    <BucketsToolbar
      v-model:search="searchTerm"
      v-model:viewMode="viewMode"
      v-model:sort="sortBy"
      @move-tokens="moveSelected"
    />

    <q-banner
      v-if="selectedBucketIds.length > 0"
      dense
      class="q-mb-md bg-primary text-white dark:bg-grey-9 rounded-borders q-px-md q-py-sm row items-center justify-between"
    >
      <div class="text-subtitle2 text-weight-medium">
        {{ selectedBucketIds.length }} buckets selected
      </div>
      <template #action>
        <div class="row q-gutter-sm">
          <q-btn
            flat
            dense
            color="white"
            class="text-weight-medium"
            @click="moveSelected"
            aria-label="Move tokens"
          >
            {{ $t("BucketDetail.move") }}
          </q-btn>
          <q-btn
            flat
            dense
            color="white"
            class="text-weight-medium"
            @click="toggleMultiSelect"
            aria-label="Deselect all"
          >
            {{ $t("BucketManager.actions.deselect_all") }}
          </q-btn>
        </div>
      </template>
    </q-banner>
    <div class="text-body2 q-mb-md">{{ $t("BucketManager.helper.intro") }}</div>
    <div v-if="isLoading" class="row q-col-gutter-md q-mb-md">
      <div
        v-for="n in 4"
        :key="'skeleton-' + n"
        class="col-12 col-sm-6 col-md-4 col-lg-3"
      >
        <q-card flat bordered class="placeholder-card">
          <q-card-section class="row items-start">
            <q-skeleton type="rect" width="48px" height="48px" />
            <div class="col q-ml-md">
              <q-skeleton type="text" width="70%" />
              <q-skeleton type="text" width="50%" />
            </div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <q-skeleton type="text" width="60%" class="q-mb-sm" />
            <q-skeleton width="100%" height="6px" />
          </q-card-section>
        </q-card>
      </div>
    </div>
    <div
      v-else-if="filteredBuckets.length > 0"
      class="row q-col-gutter-md q-mb-md"
    >
      <div
        v-for="bucket in filteredBuckets"
        :key="bucket.id"
        class="col-12 col-sm-6 col-md-4 col-lg-3"
        @dragover.prevent
        @drop="handleDrop($event, bucket.id)"
        draggable="true"
        @dragstart="onDragStart($event, bucket.id)"
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
    <div v-else class="empty-state text-center text-grey-6 q-py-xl">
      <q-icon name="inbox" size="4em" class="q-mb-md" />
      <div class="text-h6 q-mb-sm">No Buckets Yet</div>
      <p class="q-mb-md">Create your first bucket to organize your tokens.</p>
      <q-btn color="pink-6" icon="add" label="Create Bucket" @click="openAdd" />
    </div>
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
  <EditBucketModal
    v-model="editModalOpen"
    @save="handleEditSave"
    :bucket="editingBucket"
  />
  <BucketDetailModal
    v-model="detailModalOpen"
    :bucket-id="viewingBucket ? viewingBucket.id : null"
  />
  <MoveTokensModal
    v-model="isMoveModalOpen"
    :bucket-ids="selectedBucketIds"
    @move="handleMoveTokens"
  />
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import { useQuasar } from "quasar";
import { useBucketsStore } from "stores/buckets";
import { DEFAULT_BUCKET_ID } from "@/constants/buckets";
import { useMintsStore } from "stores/mints";
import { useProofsStore } from "stores/proofs";
import { storeToRefs } from "pinia";
import { useUiStore } from "stores/ui";
import BucketCard from "./BucketCard.vue";
import BucketDialog from "./BucketDialog.vue";
import EditBucketModal from "./EditBucketModal.vue";
import BucketDetailModal from "./BucketDetailModal.vue";
import MoveTokensModal from "./MoveTokensModal.vue";
import BucketsToolbar from "./BucketsToolbar.vue";

export default defineComponent({
  name: "BucketManager",
  components: {
    BucketCard,
    BucketDialog,
    EditBucketModal,
    BucketDetailModal,
    MoveTokensModal,
    BucketsToolbar,
  },
  setup() {
    const bucketsStore = useBucketsStore();
    const uiStore = useUiStore();
    const { t } = useI18n();
    const $q = useQuasar();

    const dialogOpen = ref(false);
    const showDelete = ref(false);
    const deleteId = ref(null as string | null);

    const editingBucket = ref<any>(null);
    const viewingBucket = ref<any>(null);
    const isMoveModalOpen = ref(false);
    const multiSelectMode = ref(false);
    const selectedBucketIds = ref<string[]>([]);

    const editModalOpen = computed({
      get: () => editingBucket.value !== null,
      set: (val: boolean) => {
        if (!val) editingBucket.value = null;
      },
    });

    const detailModalOpen = computed({
      get: () => viewingBucket.value !== null,
      set: (val: boolean) => {
        if (!val) viewingBucket.value = null;
      },
    });
    const isLoading = ref(true);

    onMounted(async () => {
      await nextTick();
      isLoading.value = false;
    });

    const viewMode = ref("active");

    const bucketList = computed(() => bucketsStore.bucketList);
    const searchTerm = ref("");
    const sortBy = ref("name-asc");
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
        .filter((b) => {
          if (viewMode.value === "archived") return b.isArchived;
          if (viewMode.value === "active") return !b.isArchived;
          return true;
        })
        .filter((b) => {
          const name = (b.name || "").toLowerCase();
          const description = (b.description || "").toLowerCase();
          return name.includes(term) || description.includes(term);
        });
      const sorted = [...list];
      switch (sortBy.value) {
        case "name-desc":
          sorted.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
          break;
        case "balance-asc":
          sorted.sort(
            (a, b) =>
              (bucketBalances.value[a.id] || 0) -
              (bucketBalances.value[b.id] || 0)
          );
          break;
        case "balance-desc":
          sorted.sort(
            (a, b) =>
              (bucketBalances.value[b.id] || 0) -
              (bucketBalances.value[a.id] || 0)
          );
          break;
        case "name-asc":
        default:
          sorted.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
          break;
      }
      return sorted;
    });

    const mintsStore = useMintsStore();
    const { activeUnit } = storeToRefs(mintsStore);

    const proofsStore = useProofsStore();

    const formatCurrency = (amount: number, unit: string) =>
      uiStore.formatCurrency(amount, unit);

    const openAdd = () => {
      dialogOpen.value = true;
    };

    const openEdit = (bucket: any) => {
      editingBucket.value = bucket;
      editModalOpen.value = true;
    };

    const openDetail = (bucket: any) => {
      viewingBucket.value = bucket;
      detailModalOpen.value = true;
    };

    const toggleBucketSelection = (id: string) => {
      if (selectedBucketIds.value.includes(id)) {
        selectedBucketIds.value = selectedBucketIds.value.filter(
          (b) => b !== id
        );
      } else {
        selectedBucketIds.value.push(id);
      }
    };

    const toggleMultiSelect = () => {
      multiSelectMode.value = !multiSelectMode.value;
      if (!multiSelectMode.value) selectedBucketIds.value = [];
    };

    const moveSelected = () => {
      isMoveModalOpen.value = true;
    };

    const handleEditSave = (data: any) => {
      if (editingBucket.value) {
        bucketsStore.editBucket(editingBucket.value.id, { ...data });
      }
      editModalOpen.value = false;
    };

    const handleMoveTokens = async ({
      secrets,
      bucketId,
    }: {
      secrets: string[];
      bucketId: string;
    }) => {
      await proofsStore.moveProofs(secrets, bucketId);
      isMoveModalOpen.value = false;
    };

    const onDragStart = (ev: DragEvent, id: string) => {
      ev.dataTransfer?.setData("application/x-bucket-id", id);
    };

    const handleDrop = async (ev: DragEvent, id: string) => {
      ev.preventDefault();
      const bucketIdData = ev.dataTransfer?.getData("application/x-bucket-id");
      if (bucketIdData) {
        const draggedId = bucketIdData;
        if (draggedId && draggedId !== id) {
          const draggedItem = bucketsStore.bucketList.find(
            (b) => b.id === draggedId
          );
          const targetItem = bucketsStore.bucketList.find((b) => b.id === id);
          if (draggedItem && targetItem) {
            const secrets = proofsStore.proofs
              .filter((p) => p.bucketId === draggedId)
              .map((p) => p.secret);
            if (secrets.length) {
              $q.dialog({
                title: t("BucketManager.move_confirm.title"),
                message: t("BucketManager.move_confirm.text", {
                  from: draggedItem.name,
                  to: targetItem.name,
                }),
                cancel: true,
                persistent: true,
              }).onOk(async () => {
                await proofsStore.moveProofs(secrets, id);
                $q.notify({
                  type: "positive",
                  message: t("BucketManager.notifications.move_success"),
                });
              });
            }
          }
        }
        return;
      }
      const data = ev.dataTransfer?.getData("text/plain");
      if (!data) return;
      let secrets: string[] | undefined;
      try {
        secrets = JSON.parse(data);
      } catch (e) {
        secrets = data.split(",");
      }
      if (Array.isArray(secrets) && secrets.length) {
        try {
          await proofsStore.moveProofs(secrets, id);
          $q.notify({
            type: "positive",
            message: t("BucketManager.notifications.move_success"),
          });
        } catch (e) {
          $q.notify({ type: "negative", message: "Move failed" });
        }
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
        case "manage":
          openDetail(bucket);
          break;
        case "edit":
          openEdit(bucket);
          break;
        case "archive":
          bucketsStore.editBucket(bucket.id, {
            isArchived: !bucket.isArchived,
          });
          break;
        case "delete":
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
      isMoveModalOpen,
      editingBucket,
      viewingBucket,
      openAdd,
      openEdit,
      openDetail,
      handleEditSave,
      onDragStart,
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
      handleMoveTokens,
      isLoading,
    };
  },
});
</script>

<style scoped>
.placeholder-card {
  height: 200px;
  border-radius: 16px;
  background: linear-gradient(145deg, #1e293b, #111827);
  padding: 24px;
  animation: placeholder-pulse 1.5s ease-in-out infinite;
}

.empty-state q-icon {
  color: var(--q-primary);
}

@keyframes placeholder-pulse {
  0%,
  100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}
</style>
