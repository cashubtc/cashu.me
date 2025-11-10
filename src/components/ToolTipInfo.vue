<template>
  <div class="tool-tip-info">
    <q-icon name="info" size="16px" class="q-mr-xs" />
    <span class="tool-tip-info-text">{{ text }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "ToolTipInfo",
  props: {
    text: {
      type: String,
      required: true,
    },
  },
});
</script>

<style lang="scss" scoped>
.tool-tip-info {
  display: flex;
  align-items: center;
  padding: 12px;
  background: rgba(33, 150, 243, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(33, 150, 243, 0.2);
}

.tool-tip-info-text {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.4;
}
</style>
