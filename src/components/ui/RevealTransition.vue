<!-- A block that opens and closes in place (a QR under the mint name, a warning, a
     message of the day): it grows from no height while fading and settling 10px down, and
     closes the same way, quicker. Transition props such as `appear` and
     `enter-active-class` pass through. Styles: src/css/elements.scss .reveal-*. -->
<template>
  <transition name="reveal" v-bind="$attrs">
    <slot />
  </transition>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "RevealTransition",
  inheritAttrs: false,
});
</script>
