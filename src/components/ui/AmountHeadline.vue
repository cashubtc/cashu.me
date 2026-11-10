<!-- The one large amount at the top of a payment, token or request view: 36px bold tabular
     figures, centred. The amount is isolated left to right so a sign or unit symbol stays in
     front of the digits in right-to-left languages. -->
<template>
  <div class="amount-headline">
    <bdi dir="ltr"><slot /></bdi>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "AmountHeadline",
});
</script>
