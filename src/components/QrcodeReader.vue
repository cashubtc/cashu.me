<script lang="ts">
import QrScanner from "qr-scanner";
import { URDecoder } from "@gandlaf21/bc-ur";

export default {
  data(): {
    qrScanner: QrScanner | null;
    urDecoder: URDecoder | null;
    urDecoderProgress: number;
  } {
    return {
      qrScanner: null,
      urDecoder: null,
      urDecoderProgress: 0,
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
    this.urDecoder = new URDecoder();
  },
  methods: {
    handleResult(result: QrScanner.ScanResult) {
      // if this is a multipart-qr code, do not yet emit
      if (result.data.startsWith("ur:")) {
        // console.log("ur: ", result.data);
        console.log("progress: ", this.urDecoder?.getProgress());
        this.urDecoderProgress = this.urDecoder?.getProgress() || 0;
        this.urDecoder?.receivePart(result.data);
        if (this.urDecoder?.isComplete() && this.urDecoder?.isSuccess()) {
          const ur = this.urDecoder?.resultUR();
          const decoded = ur.decodeCBOR();
          this.$emit("decode", decoded.toString());
          this.qrScanner?.stop();
          this.urDecoderProgress = 0;
        }
      } else {
        this.$emit("decode", result.data);
        this.qrScanner?.stop();
      }
    },
  },
  unmounted() {
    this.qrScanner?.destroy();
  },
};
</script>

<template>
  <div>
    <video ref="cameraEl" style="width: 100%"></video>
  </div>
  <div>
    <div class="row q-justify-center">
      <q-linear-progress
        rounded
        size="25px"
        v-if="urDecoderProgress > 0"
        :value="urDecoderProgress"
        :indeterminate="urDecoderProgress === 0"
        class="q-mt-md"
        color="accent"
      >
        <div class="absolute-full flex flex-center">
          <q-badge
            color="white"
            text-color="accent"
            :label="Math.round(urDecoderProgress * 100) + '%'"
          />
        </div>
      </q-linear-progress>
    </div>
  </div>
</template>
