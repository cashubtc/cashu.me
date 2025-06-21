<script lang="ts">
import { onMounted, getCurrentInstance } from "vue";
import { useCameraStore } from "src/stores/camera";
import { mapActions, mapState, mapWritableState } from "pinia";
import { useUiStore } from "src/stores/ui";

let QrScanner: any;
let URDecoder: any;

export default {
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
  setup() {
    const instance = getCurrentInstance();
    const scannerPromise = (async () => {
      QrScanner = (await import("qr-scanner")).default;
      URDecoder = (await import("@gandlaf21/bc-ur")).URDecoder;
    })();

    onMounted(() => {
      scannerPromise.then(() => {
        if (!instance) return;
        const vm: any = instance.proxy;
        vm.qrScanner = new QrScanner(
          vm.$refs.cameraEl as HTMLVideoElement,
          (result: any) => {
            vm.handleResult(result);
          },
          {
            returnDetailedScanResult: true,
            highlightScanRegion: true,
            highlightCodeOutline: true,
            onDecodeError: () => {},
          }
        );
        vm.qrScanner.start();
        vm.urDecoder = new URDecoder();
      });
    });
    return {};
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
    handleResult(result: QrScanner.ScanResult) {
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
  <q-card>
    <div class="text-center">
      <div>
        <video ref="cameraEl" style="width: 100%"></video>
      </div>
      <div>
        <div class="row q-justify-center">
          <q-linear-progress
            rounded
            size="30px"
            v-if="urDecoderProgress > 0"
            :value="urDecoderProgress"
            :indeterminate="urDecoderProgress === 0"
            class="q-mt-none"
            color="secondary"
          >
            <div class="absolute-full flex flex-center">
              <q-badge
                color="white"
                text-color="secondary"
                style="font-size: 1rem; padding: 5px"
                class="text-weight-bold"
                :label="
                  $t('QrcodeReader.progress.text', {
                    percentage: $t('QrcodeReader.progress.percentage', {
                      percentage: Math.round(urDecoderProgress * 100),
                    }),
                    addon:
                      urDecoderProgress > 0.9
                        ? $t('QrcodeReader.progress.keep_scanning_text')
                        : '',
                  })
                "
              />
            </div>
          </q-linear-progress>
        </div>
      </div>
    </div>
    <div class="row q-my-sm">
      <q-btn
        unelevated
        v-if="canPasteFromClipboard"
        @click="pasteToParseDialog"
      >
        <q-icon name="content_paste" class="q-mr-sm" />
        {{ $t("QrcodeReader.actions.paste.label") }}</q-btn
      >
      <q-btn @click="closeCamera" flat color="grey" class="q-ml-auto">{{
        $t("QrcodeReader.actions.close.label")
      }}</q-btn>
    </div>
  </q-card>
</template>
