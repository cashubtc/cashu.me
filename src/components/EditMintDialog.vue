<template>
  <!-- A form, so the shared bottom sheet like Add mint and the pickers; only confirmations
       (remove mint) stay centred dialogs. -->
  <BottomSheet
    v-model="showEditMintDialogLocal"
    :title="$t('EditMintDialog.title')"
  >
    <div class="edit-mint-dialog">
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
        :label="$t('EditMintDialog.inputs.nickname.label')"
      />
      <div class="edit-mint-dialog__actions">
        <q-btn
          color="primary"
          rounded
          unelevated
          class="full-width"
          :disable="!hasChanges"
          @click="updateMintLocal"
        >
          {{ $t("EditMintDialog.actions.update.label") }}
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

    // Update stays disabled until a field differs from the saved mint.
    const hasChanges = computed(
      () =>
        editMintData.value.url !== (mintToEdit.value as any).url ||
        (editMintData.value.nickname || "") !==
          ((mintToEdit.value as any).nickname || "")
    );

    return {
      hasChanges,
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
/* One full-width primary; the header close dismisses, as on every sheet. */
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
