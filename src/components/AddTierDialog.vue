<template>
  <q-dialog v-model="showLocal" persistent backdrop-filter="blur(2px) brightness(60%)">
    <q-card class="q-pa-md" style="min-width:350px">
      <q-card-section>
        <div class="row items-center">
          <div class="text-h6 q-mr-xs">{{ $t('CreatorHub.dashboard.add_tier') }}</div>
          <HelpPopup
            text="Create a tier with a price and optional welcome message for your supporters."
            :close-label="$t('global.actions.close.label')"
          />
        </div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <q-input v-model="localTier.name" label="Title" outlined dense class="q-mb-sm" />
        <q-input v-model.number="localTier.price" type="number" label="Cost (sats)" outlined dense class="q-mb-sm" />
        <q-input
          v-model="localTier.description"
          type="textarea"
          autogrow
          label="Description (Markdown)"
          outlined
          dense
          class="q-mb-sm"
        />
        <div class="text-caption text-grey q-mb-sm">Markdown formatting is supported.</div>
        <q-input
          v-model="localTier.welcomeMessage"
          type="textarea"
          autogrow
          label="Welcome Message"
          outlined
          dense
          class="q-mb-sm"
        />
      </q-card-section>
      <q-card-actions align="between" class="q-pt-none">
        <q-btn flat color="primary" @click="save">{{ $t('CreatorHub.dashboard.save_tier') }}</q-btn>
        <q-btn flat color="grey" v-close-popup>{{ $t('global.actions.cancel.label') }}</q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, computed, reactive, watch } from 'vue';
import { Tier } from 'stores/creatorHub';

export default defineComponent({
  name: 'AddTierDialog',
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
    tier: {
      type: Object as () => Partial<Tier>,
      required: true,
    },
  },
  emits: ['update:modelValue', 'save'],
  setup(props, { emit }) {
    const showLocal = computed({
      get: () => props.modelValue,
      set: (val) => emit('update:modelValue', val),
    });

    const localTier = reactive<Partial<Tier>>({ ...props.tier });

    watch(
      () => props.tier,
      (val) => {
        Object.assign(localTier, val);
      },
      { immediate: true, deep: true }
    );

    const save = () => {
      emit('save', { ...localTier });
    };

    return { showLocal, localTier, save };
  },
});
</script>
