<!-- A decision that needs a yes: a title, what it applies to (label and value rows), one note
     on the consequence, then Cancel and the confirming pill (the danger pill when it
     destroys something). `inline` draws the card in place, for the design system board.
     Styles: src/css/app.scss.confirm-dialog. -->
<template>
  <component
    :is="inline ? 'div' : QDialog"
    v-bind="
      inline
        ? {}
        : {
            modelValue,
            'onUpdate:modelValue': (v) => $emit('update:modelValue', v),
            transitionShow: 'fade',
            transitionHide: 'fade',
          }
    "
  >
    <q-card class="confirm-dialog">
      <div class="confirm-dialog__title">{{ title }}</div>
      <q-list v-if="summary.length" class="confirm-dialog__summary">
        <q-item v-for="row in summary" :key="row.label">
          <q-item-section>
            <q-item-label caption>{{ row.label }}</q-item-label>
            <q-item-label class="ellipsis">{{ row.value }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
      <p v-if="note" class="confirm-dialog__note">{{ note }}</p>
      <div class="confirm-dialog__actions">
        <q-btn flat rounded class="col" @click="close">
          {{ cancelLabel || $t("global.actions.cancel.label") }}
        </q-btn>
        <q-btn
          unelevated
          rounded
          class="col"
          :class="danger ? 'app-btn-danger' : null"
          :color="danger ? undefined : 'primary'"
          data-testid="confirm-dialog-confirm"
          @click="confirm"
        >
          {{ confirmLabel }}
        </q-btn>
      </div>
    </q-card>
  </component>
</template>

<script lang="ts">
import { defineComponent, markRaw, type PropType } from "vue";
import { QDialog } from "quasar";

export type ConfirmRow = { label: string; value: string };

export default defineComponent({
  name: "ConfirmDialog",
  props: {
    modelValue: { type: Boolean, default: false },
    title: { type: String, required: true },
    summary: { type: Array as PropType<ConfirmRow[]>, default: () => [] },
    note: { type: String, default: "" },
    confirmLabel: { type: String, required: true },
    cancelLabel: { type: String, default: "" },
    danger: { type: Boolean, default: false },
    inline: { type: Boolean, default: false },
  },
  emits: ["update:modelValue", "confirm"],
  setup() {
    return { QDialog: markRaw(QDialog) };
  },
  methods: {
    close() {
      this.$emit("update:modelValue", false);
    },
    confirm() {
      this.$emit("confirm");
      this.close();
    },
  },
});
</script>
