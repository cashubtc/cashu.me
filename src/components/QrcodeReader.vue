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
      { returnDetailedScanResult: true, onDecodeError: () => {} }
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
  <div>
    <video ref="cameraEl" style="width: 400px; height: 400px"></video>
  </div>
</template>
