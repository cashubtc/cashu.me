<!-- The wallet's two strategic actions, Receive and Send, as equal capitalised pills with scan
     in a tinted circle between them (styles in src/css/app.scss .wallet-actions). -->
<template>
  <div class="wallet-actions">
    <q-btn
      unelevated
      rounded
      data-testid="wallet-receive"
      class="wallet-action-btn"
      color="primary"
      :label="$t('WalletPage.actions.receive.label')"
      @click="$emit('receive')"
    />
    <q-btn
      flat
      dense
      round
      class="wallet-scan-btn"
      :aria-label="$t('global.actions.scan.label')"
      @click="$emit('scan')"
    >
      <ScanIcon :size="26" />
    </q-btn>
    <q-btn
      unelevated
      rounded
      data-testid="wallet-send"
      class="wallet-action-btn"
      color="primary"
      :label="$t('WalletPage.actions.send.label')"
      @click="$emit('send')"
    />
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Scan as ScanIcon } from "lucide-vue-next";

export default defineComponent({
  name: "WalletActions",
  components: { ScanIcon },
  emits: ["receive", "send", "scan"],
});
</script>
