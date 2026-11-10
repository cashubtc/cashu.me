<!-- The mark for one event only: the wallet switching mint. An 18px ring in a 24px cell,
     shown by the mint card being switched to and by the mint picker under the balance;
     everything else that waits shows the pending dots (PendingDots). Under reduced motion it
     stops as a three-quarter arc (src/css/app.scss .mint-switch-ring). -->
<template>
  <q-spinner
    class="mint-switch-ring"
    size="18px"
    :thickness="4"
    aria-hidden="true"
  />
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({ name: "MintSwitchRing" });
</script>
