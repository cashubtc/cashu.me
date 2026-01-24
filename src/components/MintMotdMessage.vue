<template>
  <div class="motd-container" v-if="message && !dismissed">
    <div class="motd-content">
      <info-icon size="24" class="motd-icon" />
      <div class="motd-text-container">
        <div class="motd-header">
          <div class="motd-title">{{ $t("MintMotdMessage.title") }}</div>
          <x-icon
            size="18"
            class="motd-close-icon cursor-pointer"
            @click="dismissMessage"
          />
        </div>
        <div class="motd-message">{{ message }}</div>
      </div>
    </div>
  </div>
  <div class="motd-dismissed q-mt-md" v-else-if="message && dismissed">
    <div class="motd-dismissed-message">
      <info-icon size="24" class="motd-dismissed-icon" />
      <div class="motd-text-container">
        <div class="motd-title">{{ $t("MintMotdMessage.title") }}</div>
        <div class="motd-message">{{ message }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { X as XIcon, Info as InfoIcon } from "lucide-vue-next";
import { useMintsStore } from "src/stores/mints";

export default defineComponent({
  name: "MintMotdMessage",
  components: {
    XIcon,
    InfoIcon,
  },
  props: {
    message: {
      type: String,
      default: "",
    },
    mintUrl: {
      type: String,
      required: true,
    },
    dismissed: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["dismiss"],
  setup(props, { emit }) {
    const mintsStore = useMintsStore();

    const dismissMessage = () => {
      mintsStore.mints.filter((m) => m.url === props.mintUrl)[0].motdDismissed =
        true;
      emit("dismiss");
    };

    return {
      dismissMessage,
    };
  },
});
</script>

<style scoped>
.motd-container {
  width: 100%;
  position: relative;
  border-radius: 8px;
  border: 1px solid #f18408;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  padding: 8px;
  text-align: left;
  font-size: 14px;
  color: #f18408;
  margin-bottom: 16px;
}

.motd-content {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 12px;
}

.motd-icon {
  flex-shrink: 0;
  color: #f18408;
}

.motd-text-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 2px;
}

.motd-header {
  align-self: stretch;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.motd-title {
  position: relative;
  line-height: 16px;
  font-weight: 500;
}

.motd-close-icon {
  overflow: hidden;
  flex-shrink: 0;
  color: #f18408;
}

.motd-message {
  align-self: stretch;
  position: relative;
  line-height: 16px;
}

.motd-dismissed {
  width: 100%;
}

.motd-dismissed-message {
  font-size: 14px;
  color: #9e9e9e;
  line-height: 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.motd-dismissed-icon {
  flex-shrink: 0;
  color: #9e9e9e;
}
</style>
