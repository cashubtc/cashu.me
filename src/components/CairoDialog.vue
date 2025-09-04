<template>
  <q-dialog
    v-model="show"
    position="top"
    backdrop-filter="blur(2px) brightness(60%)"
  >
    <q-card class="q-px-lg q-pt-md q-pb-md qcard">
      <div class="text-center q-mb-md q-mt-none q-pt-none">
        <div class="row justify-center">
          <q-card-section class="q-pa-sm">
            <div class="row justify-center">
              <q-item-label overline class="q-mb-sm q-pt-md text-white">
                Cairo spending condition
              </q-item-label>
            </div>
            <div class="row q-col-gutter-md q-pt-md">
              <div class="col-12">
                <q-input
                  v-model="cairoExecutable"
                  label="Cairo executable"
                  outlined
                  clearable
                />
              </div>
              <div class="col-12">
                <q-input
                  v-model="cairoExpectedOutput"
                  label="Expected output"
                  outlined
                  clearable
                />
              </div>
            </div>
          </q-card-section>
        </div>
        <div class="row q-mt-lg">
          <q-btn
            class="q-mx-xs"
            size="md"
            color="primary"
            @click="$emit('save', { cairoExecutable, cairoExpectedOutput })"
            >Save</q-btn
          >
          <q-btn v-close-popup flat color="grey" class="q-ml-auto">Close</q-btn>
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>
<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "CairoDialog",
  props: {
    modelValue: { type: Boolean, default: false },
    initialExecutable: { type: String, default: "" },
    initialExpectedOutput: { type: String, default: "" },
  },
  emits: ["update:modelValue", "save"],
  data() {
    return {
      cairoExecutable: this.initialExecutable,
      cairoExpectedOutput: this.initialExpectedOutput,
    };
  },
  computed: {
    show: {
      get() {
        return this.modelValue;
      },
      set(v) {
        this.$emit("update:modelValue", v);
      },
    },
  },
});
</script>
