import { defineStore } from "pinia";

export const useCameraStore = defineStore("camera", {
  state: () => ({
    tickerShort: "sats",
    tickerLong: "Satoshis",
    camera: {
      data: null,
      show: false,
      camera: "auto",
    },
  }),
  actions: {
    closeCamera: function () {
      this.camera.show = false;
    },
    showCamera: function () {
      this.camera.show = true;
    },
    hasCamera: function () {
      navigator.permissions.query({ name: "camera" }).then((res) => {
        return res.state == "granted";
      });
    },
  },
});
