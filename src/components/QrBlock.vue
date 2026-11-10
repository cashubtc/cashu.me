<template>
  <!-- A square QR code on the shared .app-qr frame (sized by --app-qr-size); clicks and other
       attributes fall through to the frame. -->
  <q-responsive :ratio="1" class="app-qr">
    <vue-qrcode
      :value="value"
      :options="{ width }"
      class="rounded-borders"
      style="width: 100%"
    />
  </q-responsive>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import VueQrcode from "@chenfengyuan/vue-qrcode";

export default defineComponent({
  name: "QrBlock",
  components: { VueQrcode },
  props: {
    value: { type: String, required: true },
    // Canvas resolution in px; the frame sets the displayed size.
    width: { type: Number, default: 400 },
  },
});
</script>
