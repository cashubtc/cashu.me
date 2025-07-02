<template>
  <div class="row no-wrap items-center q-pa-sm">
    <q-input v-model="text" class="col" dense outlined @keyup.enter="send">
      <template v-slot:append>
        <q-btn
          flat
          round
          color="primary"
          @click="selectFile"
          icon="attach_file"
        />
        <q-btn flat round color="primary" @click="sendToken">
          <NutIcon />
        </q-btn>
        <q-btn
          flat
          round
          icon="send"
          color="primary"
          class="q-ml-sm"
          :disable="!text.trim() && !attachment"
          @click="send"
        />
      </template>
    </q-input>
    <input ref="fileInput" type="file" class="hidden" @change="handleFile" />
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { Nut as NutIcon } from "lucide-vue-next";

const emit = defineEmits(["send", "sendToken"]);
const text = ref("");
const attachment = ref<string | null>(null);
const fileInput = ref<HTMLInputElement>();

const send = () => {
  const m = text.value.trim();
  if (m || attachment.value) {
    emit("send", m);
    if (attachment.value) {
      emit("send", attachment.value);
      attachment.value = null;
    }
    text.value = "";
  }
};

const sendToken = () => {
  emit("sendToken");
};

const selectFile = () => {
  fileInput.value?.click();
};

const handleFile = (e: Event) => {
  const files = (e.target as HTMLInputElement).files;
  if (!files || !files[0]) return;
  const reader = new FileReader();
  reader.onload = () => {
    attachment.value = reader.result as string;
  };
  reader.readAsDataURL(files[0]);
};
</script>
