<template>
  <div class="row items-end q-gutter-sm">
    <q-input
      v-model="message"
      type="textarea"
      autogrow
      class="col"
      placeholder="Type a message"
      @keyup.enter.prevent="handleEnter"
    />
    <q-btn
      color="primary"
      @click="onSend(message)"
      :disable="!message.trim()"
      icon="send"
      class="self-end"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

export default defineComponent({
  name: "MessageInput",
  emits: ["send"],
  setup(_, { emit }) {
    const message = ref("");

    const onSend = (value: string) => {
      if (!value.trim()) return;
      emit("send", value.trim());
      message.value = "";
    };

    const handleEnter = (event: KeyboardEvent) => {
      if (!event.shiftKey) {
        onSend(message.value);
      }
    };

    return {
      message,
      onSend,
      handleEnter,
    };
  },
});
</script>

<style scoped>
.row {
  width: 100%;
}
</style>
