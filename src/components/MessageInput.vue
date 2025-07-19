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
  <div v-if="attachment" class="q-px-sm q-pb-sm">
    <q-img
      v-if="isImage"
      :src="attachment"
      style="max-width: 150px; max-height: 150px"
      class="q-mb-sm"
    />
    <div v-else class="text-caption">{{ attachmentName }}</div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import { Nut as NutIcon } from "lucide-vue-next";

const emit = defineEmits(["send", "sendToken"]);
const text = ref("");
const attachment = ref<string | null>(null);
const attachmentName = ref<string>("");
const attachmentType = ref<string>("");
const isImage = computed(() => attachment.value?.startsWith("data:image"));
const fileInput = ref<HTMLInputElement>();

const send = () => {
  const m = text.value.trim();
  if (!m && !attachment.value) return;
  const payload: any = { text: m };
  if (attachment.value) {
    payload.attachment = {
      dataUrl: attachment.value,
      name: attachmentName.value,
      type: attachmentType.value,
    };
  }
  emit("send", payload);
  attachment.value = null;
  attachmentName.value = "";
  attachmentType.value = "";
  text.value = "";
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
    attachmentName.value = files[0].name;
    attachmentType.value = files[0].type;
  };
  reader.readAsDataURL(files[0]);
};
</script>
