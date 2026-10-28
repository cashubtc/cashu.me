<!-- An in-row confirmation: a caption question with small Cancel and (negative) Confirm
     buttons (the shared danger fill). Clicks stop here so the surrounding row does not fire again. -->
<template>
  <div class="q-mt-xs">
    <span class="text-caption text-app-muted">{{ question }}</span>
    <div class="row items-center q-gutter-sm q-mt-xs">
      <q-btn rounded outline class="q-px-md" @click.stop="$emit('cancel')">{{
        cancelLabel
      }}</q-btn>
      <q-btn
        rounded
        unelevated
        class="q-px-md app-btn-danger"
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
