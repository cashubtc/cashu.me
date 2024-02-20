<script lang="ts">
import QrScanner from "qr-scanner";
export default {
  data(): { qrScanner: QrScanner | null } {
    return {
      qrScanner: null,
    };
  },
  mounted() {
    this.qrScanner = new QrScanner(
      this.$refs.cameraEl as HTMLVideoElement,
      (result: QrScanner.ScanResult) => {
        this.handleResult(result);
      },
      {
        returnDetailedScanResult: true,
        highlightScanRegion: true,
        highlightCodeOutline: true,
        onDecodeError: () => {},
      }
    );
    this.qrScanner.start();
  },
  methods: {
    handleResult(result: QrScanner.ScanResult) {
      this.$emit("decode", result.data);
      this.qrScanner?.stop();
    },
  },
  unmounted() {
    this.qrScanner?.destroy();
  },
};
</script>

<template>
  <!-- <q-dialog v-model="camera.show">
    <q-card>
      <div class="text-center"> -->
  <div>
    <video ref="cameraEl" style="width: 100%"></video>
  </div>
  <!-- </div>
      <div class="row q-mt-lg">
        <q-btn @click="closeCamera" flat color="grey" class="q-ml-auto"
          >Cancel</q-btn
        >
      </div>
    </q-card>
  </q-dialog> -->
</template>
