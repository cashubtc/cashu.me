<template>
  <!-- A mint's message of the day: an info callout while new, neutral once dismissed. -->
  <AppCallout
    v-if="message"
    :variant="dismissed ? 'neutral' : 'info'"
    :class="dismissed ? 'q-mt-md' : 'q-mb-md'"
    :title="$t('MintMotdMessage.title')"
    :text="message"
    :dismissible="!dismissed"
    @dismiss="dismissMessage"
  />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import AppCallout from "src/components/AppCallout.vue";
import { useMintsStore } from "src/stores/mints";

export default defineComponent({
  name: "MintMotdMessage",
  components: { AppCallout },
  props: {
    message: {
      type: String,
      default: "",
    },
    mintUrl: {
      type: String,
      required: true,
    },
    dismissed: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["dismiss"],
  setup(props, { emit }) {
    const mintsStore = useMintsStore();

    const dismissMessage = () => {
      mintsStore.mints.filter((m) => m.url === props.mintUrl)[0].motdDismissed =
        true;
      emit("dismiss");
    };

    return {
      dismissMessage,
    };
  },
});
</script>
