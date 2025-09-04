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
                  placeholder="Enter Cairo executable code"
                />
              </div>
              <div class="col-12">
                <q-input
                  v-model="cairoInput"
                  label="Program input (comma-separated numbers)"
                  outlined
                  clearable
                  placeholder="e.g., 123,456,789"
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
            @click="saveCairoData"
            :disable="!cairoExecutable.trim()"
          >
            Save
          </q-btn>
          <q-btn v-close-popup flat color="grey" class="q-ml-auto">Close</q-btn>
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent } from "vue";
import { useCairoStore } from "src/stores/cairo";

export default defineComponent({
  name: "CairoReceiveDialog",
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue"],
  data() {
    return {
      cairoExecutable: "",
      cairoInput: "",
    };
  },
  computed: {
    show: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit("update:modelValue", value);
      },
    },
  },
  methods: {
    saveCairoData() {
      if (!this.cairoExecutable.trim()) {
        return;
      }

      // Parse the input string into bigint array
      const programInput = [];
      if (this.cairoInput.trim()) {
        const inputParts = this.cairoInput
          .split(",")
          .map((part) => part.trim());
        for (const part of inputParts) {
          if (part) {
            try {
              programInput.push(BigInt(part));
            } catch (error) {
              console.error("Invalid input number:", part);
            }
          }
        }
      }

      const cairoStore = useCairoStore();
      cairoStore.setCairoReceiveData(this.cairoExecutable, programInput);
      cairoStore.hideCairoReceiveDialog();
      this.show = false;
    },
  },
  watch: {
    show(newValue) {
      if (newValue) {
        // Reset form when dialog opens
        this.cairoExecutable = "";
        this.cairoInput = "";
      }
    },
  },
});
</script>
