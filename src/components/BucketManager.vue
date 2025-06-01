<template>
  <div style="max-width: 800px; margin: 0 auto">
    <q-list padding>
      <div
        v-for="bucket in bucketList"
        :key="bucket.id"
        class="q-mb-md"
        @dragover.prevent
        @drop="handleDrop($event, bucket.id)"
      >
        <router-link
          :to="`/buckets/${bucket.id}`"
          style="text-decoration: none; display: block"
          class="text-dark"
        >
          <q-item
            clickable
            :style="{
              border: '1px solid rgba(128,128,128,0.2)',
              'border-radius': '10px',
            }"
          >
            <q-item-section avatar>
              <q-icon
                name="circle"
                :style="{ color: bucket.color || 'grey' }"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-bold">{{
                bucket.name
              }}</q-item-label>
              <q-item-label caption v-if="bucket.description">{{
                bucket.description
              }}</q-item-label>
              <q-item-label caption>
                {{
                  formatCurrency(
                    bucketBalances[bucket.id] || 0,
                    activeUnit.value,
                  )
                }}
                <span v-if="bucket.goal"
                  >/ {{ formatCurrency(bucket.goal, activeUnit.value) }}</span
                >
              </q-item-label>
              <q-linear-progress
                v-if="bucket.goal"
                color="primary"
                :value="Math.min(bucketBalances[bucket.id] / bucket.goal, 1)"
                class="q-mt-xs"
              />
            </q-item-section>
            <q-item-section side v-if="bucket.id !== DEFAULT_BUCKET_ID">
              <q-btn
                icon="edit"
                flat
                round
                size="sm"
                @click.stop.prevent="openEdit(bucket)"
              />
              <q-btn
                icon="delete"
                flat
                round
                size="sm"
                @click.stop.prevent="openDelete(bucket.id)"
              />
            </q-item-section>
          </q-item>
        </router-link>
      </div>
      <q-item>
        <q-item-section>
          <q-btn color="primary" icon="add" outline @click="openAdd">{{
            $t("BucketManager.actions.add")
          }}</q-btn>
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
          :label="$t('BucketManager.inputs.name')"
          class="q-mb-sm"
        />
      <q-input
        v-model="form.color"
        outlined
        :label="$t('BucketManager.inputs.color')"
        class="q-mb-sm"
        type="color"
      />
      <q-input
        v-model="form.description"
        outlined
        :label="$t('BucketManager.inputs.description')"
        type="textarea"
        autogrow
        class="q-mb-sm"
      />
        <q-input
          v-model.number="form.goal"
          outlined
          :rules="goalRules"
          :label="$t('BucketManager.inputs.goal')"
          type="number"
          class="q-mb-sm"
        />
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

export default defineComponent({
  name: "BucketManager",
  setup() {
    const bucketsStore = useBucketsStore();
    const uiStore = useUiStore();
    const { t } = useI18n();
    const showForm = ref(false);
    const bucketForm = ref(null);
    const showDelete = ref(false);
    const editId = ref(null);
    const deleteId = ref(null);
    const form = ref({
      name: "",
      color: "#1976d2",
      description: "",
      goal: null,
    });

    const bucketList = computed(() => bucketsStore.bucketList);
    const bucketBalances = computed(() => bucketsStore.bucketBalances);

    const formatCurrency = (amount, unit) => {
      return uiStore.formatCurrency(amount, unit);
    };

    const mintsStore = useMintsStore();
    const { activeUnit } = storeToRefs(mintsStore);

    const openAdd = () => {
      editId.value = null;
      form.value = { name: "", color: "#1976d2", description: "", goal: null };
      showForm.value = true;
    };

    const openEdit = (bucket) => {
      editId.value = bucket.id;
      form.value = {
        name: bucket.name,
        color: bucket.color,
        description: bucket.description,
        goal: bucket.goal,
      };
      showForm.value = true;
    };

    const nameRules = [
      (val) => !!val || t('BucketManager.validation.name'),
    ];

    const goalRules = [
      (val) => val === null || val === undefined || val >= 0 || t('BucketManager.validation.goal'),
    ];

    const proofsStore = useProofsStore();

    const handleDrop = async (ev, id) => {
      ev.preventDefault();
      const data = ev.dataTransfer?.getData('text/plain');
      if (!data) return;
      let secrets;
      try {
        secrets = JSON.parse(data);
      } catch (e) {
        secrets = data.split(',');
      }
      if (Array.isArray(secrets) && secrets.length) {
        await proofsStore.moveProofs(secrets, id);
      }
    };

    const saveBucket = async () => {
      if (!(await bucketForm.value.validate())) {
        notifyError(t('BucketManager.validation.error'));
        return;
      }
      if (editId.value) {
        bucketsStore.editBucket(editId.value, { ...form.value });
      } else {
        bucketsStore.addBucket({ ...form.value });
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
      bucketBalances,
      activeUnit,
      showForm,
      showDelete,
      form,
      bucketForm,
      nameRules,
      goalRules,
      formTitle: computed(() => (editId.value ? "Edit Bucket" : "Add Bucket")),
      openAdd,
      openEdit,
      saveBucket,
      openDelete,
      deleteBucket,
      formatCurrency,
      handleDrop,
    };
  },
});
</script>
