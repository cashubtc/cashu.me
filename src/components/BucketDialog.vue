<template>
  <q-dialog v-model="showLocal" persistent>
    <q-card class="q-pa-lg" style="max-width: 500px">
      <q-form @submit.prevent="save">
        <q-input
          v-model="form.name"
          :label="t('bucket.name')"
          outlined
          class="q-mb-sm"
        />
        <q-input
          v-model="form.color"
          :label="t('bucket.color')"
          type="color"
          outlined
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
          <q-btn
            color="primary"
            :disable="!canSave"
            @click="save"
          >
            {{ t('global.actions.save.label') }}
          </q-btn>
          <q-btn flat color="grey" class="q-ml-auto" v-close-popup>
            {{ t('global.actions.cancel.label') }}
          </q-btn>
        </div>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { useBucketsStore } from 'stores/buckets'
import { DEFAULT_COLOR } from 'src/js/constants'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits(['update:modelValue'])

const showLocal = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val)
})

const form = reactive({
  name: '',
  color: DEFAULT_COLOR,
  goal: null as number | null,
  desc: ''
})

const { t } = useI18n()
const buckets = useBucketsStore()

const canSave = computed(() => form.name.trim().length > 0)

function reset () {
  form.name = ''
  form.color = DEFAULT_COLOR
  form.goal = null
  form.desc = ''
}

function save () {
  if (!canSave.value) return
  buckets.addBucket({
    name: form.name,
    color: form.color,
    goal: form.goal ?? undefined,
    description: form.desc
  })
  emit('update:modelValue', false)
  reset()
}
</script>
