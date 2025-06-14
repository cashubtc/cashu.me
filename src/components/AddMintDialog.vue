<template>
  <q-dialog
    v-model="showAddMintDialogLocal"
    @keydown.enter.prevent="addMintLocal"
    backdrop-filter="blur(2px) brightness(60%)"
  >
    <q-card class="q-pa-lg">
      <h6 class="q-mt-none q-mb-sm">{{ $t("AddMintDialog.title") }}</h6>
      <div class="row items-center q-mb-md">
        <p class="q-mr-xs q-mb-none">{{ $t("AddMintDialog.description") }}</p>
        <HelpPopup
          text="A mint issues ecash tokens. Only add mints you trust."
          :close-label="$t('global.actions.close.label')"
        />
      </div>
      <q-input
        outlined
        readonly
        v-model="mintUrl"
        type="textarea"
        autogrow
        class="q-mb-xs"
        style="font-family: monospace; font-size: 0.9em"
      >
        <template #label>
          <div class="row items-center no-wrap">
            <span>{{ $t("AddMintDialog.inputs.mint_url.label") }}</span>
            <InfoTooltip
              class="q-ml-xs"
              :text="$t('AddMintDialog.tooltips.mint_url')"
            />
          </div>
        </template>
      </q-input>
      <div class="text-caption text-grey q-mb-sm">
        Enter the base URL of the mint.
      </div>
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
            style="width: calc(75%)"
            >{{ $t("AddMintDialog.actions.add_mint.label") }}
            <template v-slot:loading>
              <q-spinner-hourglass />
              {{ $t("AddMintDialog.actions.add_mint.in_progress") }}</template
            >
          </q-btn>
        </div>
        <div class="col">
          <q-btn v-close-popup flat class="float-right" color="grey">{{
            $t("AddMintDialog.actions.cancel.label")
          }}</q-btn>
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
