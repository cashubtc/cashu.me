<template>
  <q-dialog
    v-model="showAddMintDialogLocal"
    @keydown.enter.prevent="addMintLocal"
    backdrop-filter="blur(2px) brightness(60%)"
  >
    <q-card class="q-pa-lg">
      <h6 class="q-mt-none q-mb-md">Do you trust this mint?</h6>
      <p>
        Before using this mint, make sure you trust it. Mints could become
        malicious or cease operation at any time.
      </p>
      <q-input
        outlined
        readonly
        v-model="mintUrl"
        label="Mint URL"
        type="textarea"
        autogrow
        class="q-mb-xs"
        style="font-family: monospace; font-size: 0.9em"
      ></q-input>
      <div class="row q-mt-lg">
        <div class="col">
          <q-btn
            class="float-left"
            rounded
            v-close-popup
            color="primary"
            icon="check"
            :loading="addMintBlocking"
            @click="addMintLocal"
            >Add mint
            <template v-slot:loading>
              <q-spinner-hourglass />
              Adding mint
            </template>
          </q-btn>
        </div>
        <div class="col">
          <q-btn v-close-popup flat class="float-right" color="grey"
            >Cancel</q-btn
          >
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent, computed } from "vue";

export default defineComponent({
  name: "AddMintDialog",
  props: {
    addMintData: {
      type: Object,
      required: true,
    },
    showAddMintDialog: {
      type: Boolean,
      required: true,
    },
    addMintBlocking: {
      type: Boolean,
      required: true,
    },
  },
  emits: ["add", "update:showAddMintDialog"],
  setup(props, { emit }) {
    const showAddMintDialogLocal = computed({
      get: () => props.showAddMintDialog,
      set: (value) => emit("update:showAddMintDialog", value),
    });

    const addMintLocal = () => {
      emit("add", props.addMintData, true); // Pass verbose = true
    };

    const mintUrl = computed(() => props.addMintData.url);

    return {
      addMintLocal,
      showAddMintDialogLocal,
      mintUrl,
    };
  },
});
</script>
