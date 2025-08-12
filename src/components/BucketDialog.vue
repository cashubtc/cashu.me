<template>
  <q-dialog v-model="showLocal" persistent>
    <q-card dark class="modal-card q-pa-lg">
      <q-form @submit.prevent="save">
        <q-input
          v-model="form.name"
          :label="t('bucket.name')"
          outlined
          class="q-mb-sm"
        />
        <q-color
          v-model="form.color"
          :palette="COLOR_PALETTE"
          default-view="palette"
          no-header
          no-footer
          class="q-mb-sm"
        />
        <q-input
          v-model.number="form.goal"
          :label="t('bucket.goal')"
          type="number"
          outlined
          class="q-mb-sm"
        />
        <q-input
          v-model="form.desc"
          :label="t('bucket.description')"
          type="textarea"
          autogrow
          outlined
          class="q-mb-sm"
        />
        <div class="row q-mt-md">
          <q-btn color="primary" :disable="!canSave" @click="save">
            {{ t("global.actions.save.label") }}
          </q-btn>
          <q-btn flat color="grey" class="q-ml-auto" v-close-popup>
            {{ t("global.actions.cancel.label") }}
          </q-btn>
        </div>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useBucketsStore, COLOR_PALETTE, hashColor } from "stores/buckets";

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits(["update:modelValue"]);

const showLocal = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val),
});

const form = reactive({
  name: "",
  color: hashColor(""),
  goal: null as number | null,
  desc: "",
});

const { t } = useI18n();
const buckets = useBucketsStore();

const nameTaken = computed(() =>
  buckets.bucketList.some(
    (b) => b.name.toLowerCase() === form.name.trim().toLowerCase(),
  ),
);
const canSave = computed(
  () =>
    form.name.trim().length > 0 &&
    !nameTaken.value &&
    (form.goal === null || form.goal >= 0),
);

watch(
  () => form.name,
  (val) => {
    form.color = hashColor(val);
  },
);

function reset() {
  form.name = "";
  form.color = hashColor("");
  form.goal = null;
  form.desc = "";
}

function save() {
  if (!canSave.value) return;
  buckets.addBucket({
    name: form.name,
    color: form.color,
    goal: form.goal ?? undefined,
    description: form.desc,
  });
  emit("update:modelValue", false);
  reset();
}
</script>
