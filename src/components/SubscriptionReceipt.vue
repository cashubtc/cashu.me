<template>
  <q-dialog v-model="model" persistent backdrop-filter="blur(2px) brightness(60%)">
    <q-card class="q-pa-md qcard" style="min-width:300px">
      <q-card-section class="text-h6">{{ $t('SubscriptionReceipt.title') }}</q-card-section>
      <q-card-section>
        <q-input v-model="token" readonly type="textarea" autogrow style="font-family: monospace" />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat color="primary" @click="copyToken">{{ $t('global.actions.copy.label') }}</q-btn>
        <q-btn flat color="primary" @click="saveToken">{{ $t('SubscriptionReceipt.actions.save.label') }}</q-btn>
        <q-btn v-close-popup flat color="grey">{{ $t('global.actions.close.label') }}</q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SubscriptionReceipt',
  mixins: [windowMixin],
  props: {
    modelValue: Boolean,
    token: {
      type: String,
      required: true,
    },
  },
  emits: ['update:modelValue'],
  computed: {
    model: {
      get(): boolean {
        return this.modelValue;
      },
      set(v: boolean) {
        this.$emit('update:modelValue', v);
      },
    },
  },
  methods: {
    copyToken() {
      this.copyText(this.token);
    },
    saveToken() {
      const blob = new Blob([this.token], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'subscription_token.txt';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  },
});
</script>

<style scoped>
</style>

