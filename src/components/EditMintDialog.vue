<template>
  <!-- A form, so the shared bottom sheet like Add mint and the pickers; only confirmations
       (remove mint) stay centred dialogs. -->
  <BottomSheet
    v-model="showEditMintDialogLocal"
    :title="$t('EditMintDialog.title')"
  >
    <div class="edit-mint-dialog q-px-md q-pb-md">
      <q-input
        v-model="editMintData.url"
        outlined
        type="textarea"
        autogrow
        :label="$t('EditMintDialog.inputs.mint_url.label')"
        class="q-mb-md url-input"
      />
      <q-input
        v-model="editMintData.nickname"
        outlined
        type="textarea"
        autogrow
        :label="$t('EditMintDialog.inputs.nickname.label')"
        :placeholder="$t('EditMintDialog.inputs.nickname.placeholder')"
      />
      <div class="edit-mint-dialog__actions">
        <q-btn
          color="primary"
          rounded
          unelevated
          no-caps
          class="full-width"
          @click="updateMintLocal"
        >
          {{ $t("EditMintDialog.actions.update.label") }}
        </q-btn>
        <q-btn flat rounded no-caps class="full-width" v-close-popup>
          {{ $t("EditMintDialog.actions.cancel.label") }}
        </q-btn>
      </div>
    </div>
  </BottomSheet>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed } from "vue";
import { useMintsStore } from "src/stores/mints";
import { useQuasar } from "quasar";
import BottomSheet from "src/components/BottomSheet.vue";

export default defineComponent({
  name: "EditMintDialog",
  components: { BottomSheet },
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

<style scoped>
/* One full-width primary, with Cancel as a quiet second row: the sheet's action stack. */
.edit-mint-dialog__actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 24px;
}
.edit-mint-dialog__actions .q-btn {
  min-height: 48px;
  font-size: 15px;
  font-weight: 600;
}
</style>
