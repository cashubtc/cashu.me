<script lang="ts">
import QrScanner, { type ScanResult } from "@agicash/qr-scanner";
import { URDecoder } from "@gandlaf21/bc-ur";
import zxingReaderWasmUrl from "zxing-wasm/reader/zxing_reader.wasm?url";
import { useCameraStore } from "src/stores/camera";
import { mapActions, mapState } from "pinia";
import { useUiStore } from "src/stores/ui";
import { Clipboard as ClipboardIcon } from "lucide-vue-next";

QrScanner.configureWasm({
  locateFile: () => zxingReaderWasmUrl,
});

export default {
  components: { ClipboardIcon },
  emits: ["decode"],
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
      (result: ScanResult) => {
        this.handleResult(result);
      },
      {
        calculateScanRegion: (video) => ({
          x: 0,
          y: 0,
          width: video.videoWidth,
          height: video.videoHeight,
        }),
        highlightCodeOutline: true,
        onDecodeError: () => {},
      }
    );
    this.qrScanner.start();
    this.urDecoder = new URDecoder();
  },
  computed: {
    ...mapState(useCameraStore, ["camera", "hasCamera"]),
    canPasteFromClipboard: function () {
      return (
        window.isSecureContext &&
        navigator.clipboard &&
        navigator.clipboard.readText
      );
    },
  },
  methods: {
    ...mapActions(useCameraStore, ["closeCamera", "showCamera"]),
    handleResult(result: ScanResult) {
      // if this is a multipart-qr code, do not yet emit
      if (result.data.toLowerCase().startsWith("ur:")) {
        this.urDecoder?.receivePart(result.data);
        this.urDecoderProgress =
          this.urDecoder?.estimatedPercentComplete() || 0;
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
    pasteToParseDialog: async function () {
      const text = await useUiStore().pasteFromClipboard();
      if (text) {
        this.$emit("decode", text);
      }
    },
  },
  unmounted() {
    this.qrScanner?.destroy();
  },
};
</script>
<template>
  <!-- A full-screen camera view in the app's own chrome (user direction, R46): the sheet
       header (close, centred title), the feed behind a rounded viewfinder, and Paste as the
       one bottom action, instead of a white card with Paste and Close buttons. -->
  <div class="qr-scanner">
    <video ref="cameraEl" class="qr-scanner__video" playsinline muted></video>
    <div class="qr-scanner__shade" aria-hidden="true">
      <div class="qr-scanner__frame"></div>
    </div>

    <div class="row items-center sheet-column-header qr-scanner__header">
      <q-btn
        flat
        round
        icon="close"
        class="floating-close-btn qr-scanner__close"
        :aria-label="$t('QrcodeReader.actions.close.label')"
        @click="closeCamera"
      />
      <div class="col text-center dialog-header">
        {{ $t("ParseInputComponent.qr_scanner.title") }}
      </div>
    </div>

    <div class="qr-scanner__footer column items-center">
      <div class="qr-scanner__hint">
        <template v-if="urDecoderProgress > 0">
          {{
            $t("QrcodeReader.progress.text", {
              percentage: $t("QrcodeReader.progress.percentage", {
                percentage: Math.round(urDecoderProgress * 100),
              }),
              addon:
                urDecoderProgress > 0.9
                  ? $t("QrcodeReader.progress.keep_scanning_text")
                  : "",
            })
          }}
        </template>
        <template v-else>
          {{ $t("ParseInputComponent.qr_scanner.description") }}
        </template>
      </div>
      <q-linear-progress
        v-if="urDecoderProgress > 0"
        rounded
        size="4px"
        :value="urDecoderProgress"
        color="white"
        track-color="grey-8"
        class="qr-scanner__progress"
      />
      <q-btn
        v-if="canPasteFromClipboard"
        rounded
        unelevated
        no-caps
        class="qr-scanner__paste"
        @click="pasteToParseDialog"
      >
        <ClipboardIcon :size="20" class="q-mr-sm" />
        {{ $t("QrcodeReader.actions.paste.label") }}
      </q-btn>
    </div>
  </div>
</template>

<style scoped>
/* The camera always sits on black, in every theme and mode, like the onboarding. */
.qr-scanner {
  background: #000;
  color: #fff;
  height: 100%;
  inset: 0;
  overflow: hidden;
  position: fixed;
}
.qr-scanner__video {
  height: 100%;
  inset: 0;
  object-fit: cover;
  position: absolute;
  width: 100%;
}
/* Dim everything outside a square viewfinder with 24px corners. */
.qr-scanner__shade {
  align-items: center;
  display: flex;
  inset: 0;
  justify-content: center;
  pointer-events: none;
  position: absolute;
}
.qr-scanner__frame {
  aspect-ratio: 1;
  border: 2px solid rgba(255, 255, 255, 0.9);
  border-radius: 24px;
  box-shadow: 0 0 0 100vmax rgba(0, 0, 0, 0.55);
  width: min(72vw, 280px);
}
/* The header is the sheets' header (16px inset, 44px close on the 6px toolbar inset) on a
   dark gradient, with fixed white ink, so it reads over any camera image in every theme. */
.qr-scanner__header {
  background: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0));
  left: 0;
  padding: max(16px, env(safe-area-inset-top)) 16px 32px;
  position: absolute;
  right: 0;
  top: 0;
}
.qr-scanner__header,
.qr-scanner__header .dialog-header,
.qr-scanner__close {
  color: #fff !important;
}
.qr-scanner__footer {
  bottom: 0;
  gap: 16px;
  left: 0;
  padding: 16px 16px max(24px, env(safe-area-inset-bottom));
  position: absolute;
  right: 0;
}
.qr-scanner__hint {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  text-align: center;
}
.qr-scanner__progress {
  max-width: 280px;
}
.qr-scanner__paste {
  background: #fff;
  color: #111;
  font-size: 16px;
  font-weight: 600;
  max-width: var(--app-column);
  min-height: 52px;
  width: 100%;
}
</style>
