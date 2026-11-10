<!-- The wallet's seed phrase as a read-only outlined field: the words are masked until Show,
     and Show/Hide and Copy sit on the end edge, where a read-only field's lock would be. The
     field keeps its edge (readonly-outlined) and its label stays above the words. -->
<template>
  <q-field
    outlined
    readonly
    stack-label
    class="seed-field readonly-outlined"
    :label="label"
  >
    <template #control>
      <!-- Focusable, so the words can be reached and read from the keyboard. -->
      <div
        class="seed-text"
        dir="ltr"
        role="textbox"
        tabindex="0"
        aria-readonly="true"
        aria-multiline="true"
        :aria-label="label"
        :aria-describedby="describedBy || undefined"
      >
        {{ hidden ? maskedMnemonic : mnemonic }}
      </div>
    </template>
    <template #append>
      <IconButton
        :label="
          hidden
            ? $t('global.actions.show_seed.label')
            : $t('global.actions.hide_seed.label')
        "
        tooltip
        data-testid="reveal-seed"
        @click="hidden = !hidden"
      >
        <EyeIcon v-if="hidden" :size="20" />
        <EyeOffIcon v-else :size="20" />
      </IconButton>
      <CopyButton
        :value="mnemonic"
        :tooltip="$t('global.actions.copy.label')"
        data-testid="copy-seed"
      />
    </template>
  </q-field>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Eye as EyeIcon, EyeOff as EyeOffIcon } from "lucide-vue-next";
import CopyButton from "src/components/ui/CopyButton.vue";
import IconButton from "src/components/ui/IconButton.vue";

export default defineComponent({
  name: "SeedPhraseField",
  components: { CopyButton, EyeIcon, EyeOffIcon, IconButton },
  props: {
    mnemonic: { type: String, default: "" },
    label: { type: String, required: true },
    /** The id of a caption that describes the field, read after its label. */
    describedBy: { type: String, default: "" },
  },
  data() {
    return {
      hidden: true,
    };
  },
  computed: {
    // Every word as six asterisks, so the mask gives away neither the words nor their lengths.
    maskedMnemonic(): string {
      return this.mnemonic
        .split(" ")
        .map(() => "*".repeat(6))
        .join(" ");
    },
  },
});
</script>

<style scoped>
.seed-text {
  border-radius: var(--app-radius-sm);
  color: var(--app-text);
  font-family: monospace;
  font-size: 0.9rem;
  line-height: 1.8;
  padding: 2px 0 12px;
  width: 100%;
  word-wrap: break-word;
}
.seed-text:focus-visible {
  box-shadow: var(--app-focus-ring);
  outline: none;
}

@media (max-width: 600px) {
  .seed-text {
    font-size: 0.85rem;
  }
}
</style>
