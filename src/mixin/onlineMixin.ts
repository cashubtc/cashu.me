import { defineComponent } from "vue";

const onlineMixin = defineComponent({
  data() {
    return {
      g: {
        offline: !navigator.onLine,
      },
    };
  },
  created() {
    addEventListener("offline", this.updateOfflineStatus);
    addEventListener("online", this.updateOfflineStatus);
  },
  beforeUnmount() {
    removeEventListener("offline", this.updateOfflineStatus);
    removeEventListener("online", this.updateOfflineStatus);
  },
  methods: {
    updateOfflineStatus() {
      this.g.offline = !navigator.onLine;
    },
  },
});

export default onlineMixin;
