import { defineStore } from "pinia";

export const useCameraStore = defineStore("camera", {
  state: () => ({
    camera: {
      data: null,
      show: false,
      camera: "auto",
    },
    hasCamera: function () {
      navigator.permissions.query({ name: "camera" }).then((res) => {
        return res.state == "granted";
      });
    },
  }),
  actions: {
    closeCamera: function () {
      this.camera.show = false;
    },
    showCamera: function () {
      this.camera.show = true;
    },
  },
});
