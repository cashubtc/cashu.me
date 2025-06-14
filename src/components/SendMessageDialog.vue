<template>
  <q-dialog v-model="model" persistent>
    <q-card class="q-pa-md qcard" style="min-width: 300px">
      <q-card-section class="text-h6">{{
        $t("SendMessageDialog.title")
      }}</q-card-section>
      <q-card-section>
        <q-input
          v-model="message"
          type="textarea"
          autogrow
          :label="$t('SendMessageDialog.inputs.message.label')"
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat color="primary" @click="cancel">{{
          $t("SendMessageDialog.actions.cancel.label")
        }}</q-btn>
        <q-btn flat color="primary" @click="confirm">{{
          $t("SendMessageDialog.actions.send.label")
        }}</q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "vue";

export default defineComponent({
  name: "SendMessageDialog",
  props: {
    modelValue: Boolean,
  },
  emits: ["update:modelValue", "send"],
  setup(props, { emit }) {
    const message = ref("");
    const model = computed({
      get: () => props.modelValue,
      set: (v: boolean) => emit("update:modelValue", v),
    });

    const cancel = () => {
      emit("update:modelValue", false);
    };

    const confirm = () => {
      emit("send", message.value);
      emit("update:modelValue", false);
      message.value = "";
    };

    return { model, message, cancel, confirm };
  },
});
</script>
