<template>
  <q-dialog v-model="showLocal" persistent>
    <q-card
      dark
      class="modal-card q-pa-lg"
      :style="{ borderTopColor: bucket.color }"
    >
      <h6 class="q-mt-none q-mb-md bucket-accent">
        {{ $t("BucketManager.actions.edit") }}
      </h6>
      <q-form>
        <q-input
          v-model="local.name"
          outlined
          color="accent"
          rounded
          :label="$t('bucket.name')"
          class="q-mb-sm"
        />
        <q-color
          v-model="local.color"
          :palette="COLOR_PALETTE"
          default-view="palette"
          no-header
          no-footer
          class="q-mb-sm"
        />
        <q-input
          v-model="local.description"
          outlined
          color="accent"
          rounded
          type="textarea"
          autogrow
          class="q-mb-sm"
        >
          <template #label>
            <div class="row items-center no-wrap">
              <span>{{ $t("bucket.description") }}</span>
            </div>
          </template>
        </q-input>
        <q-input
          v-model.number="local.goal"
          outlined
          color="accent"
          rounded
          type="number"
          class="q-mb-sm"
        >
          <template #label>
            <div class="row items-center no-wrap">
              <span>{{ $t("bucket.goal") }}</span>
            </div>
          </template>
        </q-input>
        <q-input
          v-model="local.creatorPubkey"
          outlined
          color="accent"
          rounded
          class="q-mb-sm"
        >
          <template #label>
            <div class="row items-center no-wrap">
              <span>{{ $t("BucketManager.inputs.creator_pubkey") }}</span>
            </div>
          </template>
        </q-input>
        <div class="row q-mt-md">
          <q-btn color="accent" rounded :disable="!canSave" @click="onSave">{{
            $t("global.actions.save.label")
          }}</q-btn>
          <q-btn flat rounded color="grey" class="q-ml-auto" v-close-popup>{{
            $t("global.actions.cancel.label")
          }}</q-btn>
        </div>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { reactive, watch, computed } from "vue";
import { useI18n } from "vue-i18n";
import { COLOR_PALETTE, hashColor, useBucketsStore } from "stores/buckets";
import type { Bucket } from "src/types/buckets";

const props = defineProps<{ modelValue: boolean; bucket: Bucket | null }>();
const emit = defineEmits(["update:modelValue", "save"]);

const { t } = useI18n();
const bucketsStore = useBucketsStore();

const showLocal = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const local = reactive({
  name: "",
  color: hashColor(""),
  description: "",
  goal: null as number | null,
  creatorPubkey: "",
});

const nameTaken = computed(() =>
  props.bucket
    ? false
    : bucketsStore.bucketList.some(
        (b) =>
          b.id !== props.bucket?.id &&
          b.name.toLowerCase() === local.name.trim().toLowerCase(),
      ),
);
const canSave = computed(
  () =>
    local.name.trim().length > 0 &&
    !nameTaken.value &&
    (local.goal === null || local.goal >= 0),
);

watch(
  () => props.bucket,
  (b) => {
    if (!b) return;
    local.name = b.name;
    local.color = b.color || hashColor(b.name);
    local.description = b.description || "";
    local.goal = b.goal ?? null;
    local.creatorPubkey = b.creatorPubkey || "";
  },
  { immediate: true, deep: true },
);

watch(
  () => props.modelValue,
  (val) => {
    if (val && props.bucket) {
      local.name = props.bucket.name;
      local.color = props.bucket.color || hashColor(props.bucket.name);
      local.description = props.bucket.description || "";
      local.goal = props.bucket.goal ?? null;
      local.creatorPubkey = props.bucket.creatorPubkey || "";
    }
  },
);

function onSave() {
  if (!canSave.value) return;
  emit("save", { ...local });
  emit("update:modelValue", false);
}
</script>
