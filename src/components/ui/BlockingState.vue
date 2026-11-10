<!-- A whole-screen state that stops the app (page not found, already open elsewhere): an icon
     disc, a title, one line of text and one hero action. -->
<template>
  <div class="blocking-state column flex-center text-center q-pa-lg">
    <IconCircle :icon="icon" size="lg" class="blocking-state__icon" />
    <CjkText class="blocking-state__title q-mt-md" tag="div" :text="title" />
    <CjkText
      v-if="text"
      class="blocking-state__text q-mt-sm"
      tag="div"
      :text="text"
    />
    <q-btn
      v-if="action"
      unelevated
      rounded
      color="primary"
      class="blocking-state__action full-width q-mt-lg"
      :to="to || undefined"
      @click="$emit('action')"
    >
      {{ action }}
    </q-btn>
  </div>
</template>

<script lang="ts">
import { defineComponent, type Component, type PropType } from "vue";
import CjkText from "src/components/ui/CjkText.vue";
import IconCircle from "src/components/ui/IconCircle.vue";

export default defineComponent({
  name: "BlockingState",
  components: { CjkText, IconCircle },
  props: {
    icon: { type: [Object, Function] as PropType<Component>, required: true },
    title: { type: String, required: true },
    text: { type: String, default: "" },
    action: { type: String, default: "" },
    /** A route for the action, instead of handling `action`. */
    to: { type: String, default: "" },
  },
  emits: ["action"],
});
</script>
