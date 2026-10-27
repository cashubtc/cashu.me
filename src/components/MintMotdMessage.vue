<template>
  <!-- A mint's message of the day: the standard warning callout while new, a neutral one
       once dismissed (src/css/elements.scss). -->
  <div
    v-if="message"
    class="app-callout motd-callout"
    :class="dismissed ? 'q-mt-md' : 'app-callout--warning q-mb-md'"
  >
    <info-icon :size="20" class="app-callout__icon" />
    <div class="app-callout__body">
      <div class="app-callout__title">{{ $t("MintMotdMessage.title") }}</div>
      <div class="app-callout__text">{{ message }}</div>
    </div>
    <q-btn
      v-if="!dismissed"
      flat
      round
      dense
      size="sm"
      class="motd-close"
      :aria-label="$t('global.actions.close.label')"
      @click="dismissMessage"
    >
      <x-icon :size="16" />
    </q-btn>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { X as XIcon, Info as InfoIcon } from "lucide-vue-next";
import { useMintsStore } from "src/stores/mints";

export default defineComponent({
  name: "MintMotdMessage",
  components: {
    XIcon,
    InfoIcon,
  },
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

<style scoped>
.motd-close {
  color: var(--app-text-muted);
  margin: -4px -6px 0 0;
}
</style>
