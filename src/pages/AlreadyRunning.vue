<template>
  <div
    class="fullscreen bg-dark text-white text-center q-pa-md flex flex-center"
  >
    <div>
      <div class="text-h3">Nope.</div>
      <div class="text-h5 q-ma-lg text-grey">
        Another tab is already running. Close this tab and try again.
      </div>
      <q-btn
        rounded
        class="q-mt-md"
        color="white"
        text-color="black"
        unelevated
        to="/"
        label="Retry"
      />
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "AlreadyRunning",
});
</script>
