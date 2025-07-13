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
          @edit="openEdit"
          @delete="openDelete"
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

  <q-dialog v-model="showForm">
    <q-card class="q-pa-lg" style="max-width: 500px">
      <h6 class="q-mt-none q-mb-md">{{ formTitle }}</h6>
      <q-form ref="bucketForm">
        <q-input
          v-model="form.name"
          outlined
          :rules="nameRules"
          :label="$t('bucket.name')"
          class="q-mb-sm"
        />
        <q-input
          v-model="form.color"
          outlined
          :label="$t('bucket.color')"
          class="q-mb-sm"
          type="color"
        />
        <q-input
          v-model="form.description"
          outlined
          type="textarea"
          autogrow
          class="q-mb-sm"
        >
          <template #label>
            <div class="row items-center no-wrap">
              <span>{{ $t('bucket.description') }}</span>
              <InfoTooltip
                class="q-ml-xs"
                :text="$t('BucketManager.tooltips.description')"
              />
            </div>
          </template>
        </q-input>
        <q-input
          v-model.number="form.goal"
          outlined
          :rules="goalRules"
          type="number"
          class="q-mb-sm"
        >
          <template #label>
            <div class="row items-center no-wrap">
              <span>{{ $t('bucket.goal') }}</span>
              <InfoTooltip
                class="q-ml-xs"
                :text="$t('BucketManager.tooltips.goal')"
              />
            </div>
          </template>
        </q-input>
        <q-input v-model="form.creatorPubkey" outlined class="q-mb-sm">
          <template #label>
            <div class="row items-center no-wrap">
              <span>{{ $t("BucketManager.inputs.creator_pubkey") }}</span>
              <InfoTooltip
                class="q-ml-xs"
                :text="$t('BucketManager.tooltips.creator_pubkey')"
              />
            </div>
          </template>
        </q-input>
        <div class="row q-mt-md">
          <q-btn color="primary" rounded @click="saveBucket">{{
            $t("global.actions.update.label")
          }}</q-btn>
          <q-btn flat rounded color="grey" class="q-ml-auto" v-close-popup>{{
            $t("global.actions.cancel.label")
          }}</q-btn>
        </div>
      </q-form>
    </q-card>
  </q-dialog>

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
</template>

<script>
import { defineComponent, ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useBucketsStore, DEFAULT_BUCKET_ID } from "stores/buckets";
import { useMintsStore } from "stores/mints";
import { useProofsStore } from "stores/proofs";
import { storeToRefs } from "pinia";
import { useUiStore } from "stores/ui";
import { notifyError } from "src/js/notify";
import { DEFAULT_COLOR } from "src/js/constants";
import BucketCard from "./BucketCard.vue";
import BucketDialog from "./BucketDialog.vue";

export default defineComponent({
  name: "BucketManager",
  components: { BucketCard, BucketDialog },
  setup() {
    const bucketsStore = useBucketsStore();
    const uiStore = useUiStore();
    const { t } = useI18n();
    const showForm = ref(false);
    const dialogOpen = ref(false);
    const bucketForm = ref(null);
    const showDelete = ref(false);
    const editId = ref(null);
    const deleteId = ref(null);
    const form = ref({
      name: "",
      color: DEFAULT_COLOR,
      description: "",
      goal: null,
      creatorPubkey: "",
    });

    const bucketList = computed(() => bucketsStore.bucketList);
    const searchTerm = ref("");
    const filteredBuckets = computed(() => {
      const term = searchTerm.value.toLowerCase();
      return bucketList.value.filter((b) =>
        b.name.toLowerCase().includes(term)
      );
    });
    const bucketBalances = computed(() => bucketsStore.bucketBalances);

    const formatCurrency = (amount, unit) => {
      return uiStore.formatCurrency(amount, unit);
    };

    const mintsStore = useMintsStore();
    const { activeUnit } = storeToRefs(mintsStore);

    const openAdd = () => {
      dialogOpen.value = true;
    };

    const openEdit = (bucket) => {
      editId.value = bucket.id;
      form.value = {
        name: bucket.name,
        color: bucket.color,
        description: bucket.description,
        goal: bucket.goal,
        creatorPubkey: bucket.creatorPubkey || "",
      };
      showForm.value = true;
    };

    const nameRules = [(val) => !!val || t("BucketManager.validation.name")];

    const goalRules = [
      (val) =>
        val === null ||
        val === undefined ||
        val >= 0 ||
        t("BucketManager.validation.goal"),
    ];

    const proofsStore = useProofsStore();

    const handleDrop = async (ev, id) => {
      ev.preventDefault();
      const data = ev.dataTransfer?.getData("text/plain");
      if (!data) return;
      let secrets;
      try {
        secrets = JSON.parse(data);
      } catch (e) {
        secrets = data.split(",");
      }
      if (Array.isArray(secrets) && secrets.length) {
        await proofsStore.moveProofs(secrets, id);
      }
    };

    const saveBucket = async () => {
      if (!(await bucketForm.value.validate())) {
        notifyError(t("BucketManager.validation.error"));
        return;
      }
      if (editId.value) {
        bucketsStore.editBucket(editId.value, { ...form.value });
      }
      showForm.value = false;
    };

    const openDelete = (id) => {
      deleteId.value = id;
      showDelete.value = true;
    };

    const deleteBucket = () => {
      bucketsStore.deleteBucket(deleteId.value);
      showDelete.value = false;
    };

    return {
      DEFAULT_BUCKET_ID,
      bucketList,
      searchTerm,
      filteredBuckets,
      bucketBalances,
      activeUnit,
      showForm,
      dialogOpen,
      showDelete,
      form,
      bucketForm,
      nameRules,
      goalRules,
      formTitle: computed(() => t('BucketManager.actions.edit')),
      openAdd,
      openEdit,
      saveBucket,
      openDelete,
      deleteBucket,
      formatCurrency,
      handleDrop,
      DEFAULT_COLOR,
    };
  },
});
</script>
