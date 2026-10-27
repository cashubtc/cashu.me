<template>
  <q-dialog
    v-model="showEditMintDialogLocal"
    backdrop-filter="blur(4px) brightness(50%)"
    transition-show="fade"
    transition-hide="fade"
  >
    <q-card class="council-dialog edit-mint-dialog">
      <div class="council-dialog__title">
        {{ $t("EditMintDialog.title") }}
      </div>
      <q-input
        v-model="editMintData.url"
        rounded
        outlined
        type="textarea"
        autogrow
        :label="$t('EditMintDialog.inputs.mint_url.label')"
        class="q-mb-md url-input"
      />
      <q-input
        v-model="editMintData.nickname"
        rounded
        outlined
        type="textarea"
        autogrow
        :label="$t('EditMintDialog.inputs.nickname.label')"
        :placeholder="$t('EditMintDialog.inputs.nickname.placeholder')"
      />
      <div class="council-dialog__actions">
        <q-btn flat rounded no-caps class="col" v-close-popup>
          {{ $t("EditMintDialog.actions.cancel.label") }}
        </q-btn>
        <q-btn
          color="primary"
          rounded
          unelevated
          no-caps
          class="col"
          @click="updateMintLocal"
          v-close-popup
        >
          {{ $t("EditMintDialog.actions.update.label") }}
        </q-btn>
      </div>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed } from "vue";
import { useMintsStore } from "src/stores/mints";
import { useQuasar } from "quasar";

export default defineComponent({
  name: "EditMintDialog",
  props: {
    mint: {
      type: Object,
      required: true,
    },
    showEditMintDialog: {
      type: Boolean,
      required: true,
    },
  },
  setup(props, { emit }) {
    const $q = useQuasar();
    const editMintData = ref({
      url: "",
      nickname: "",
    });
    const mintToEdit = ref({});
    const showEditMintDialogLocal = computed({
      get: () => props.showEditMintDialog,
      set: (value) => emit("update:showEditMintDialog", value),
    });

    watch(
      () => props.mint,
      (newMint) => {
        mintToEdit.value = { ...newMint };
        editMintData.value = { ...newMint };
      },
      { immediate: true }
    );

    const updateMintLocal = () => {
      const mintStore = useMintsStore();
      mintStore.updateMint(mintToEdit.value, editMintData.value);
      showEditMintDialogLocal.value = false;
    };

    return {
      editMintData,
      mintToEdit,
      updateMintLocal,
      showEditMintDialogLocal,
      isDark: computed(() => $q.dark.isActive),
    };
  },
});
</script>
