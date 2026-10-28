<!-- An in-row confirmation: a caption question with small Cancel and (negative) Confirm
     buttons. Clicks stop here so the surrounding row does not fire again. -->
<template>
  <div class="q-mt-xs">
    <span class="text-caption">{{ question }}</span>
    <div class="row items-center q-gutter-sm q-mt-xs">
      <q-btn
        size="sm"
        rounded
        outline
        class="q-px-md"
        @click.stop="$emit('cancel')"
        >{{ cancelLabel }}</q-btn
      >
      <q-btn
        size="sm"
        rounded
        outline
        class="q-px-md"
        color="negative"
        @click.stop="$emit('confirm')"
        >{{ confirmLabel }}</q-btn
      >
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "InlineConfirm",
  props: {
    question: {
      type: String,
      required: true,
    },
    cancelLabel: {
      type: String,
      required: true,
    },
    confirmLabel: {
      type: String,
      required: true,
    },
  },
  emits: ["confirm", "cancel"],
});
</script>
