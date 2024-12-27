<template>
  <div
    class="fullscreen bg-dark text-white text-center q-pa-md flex flex-center"
  >
    <div>
      <div style="font-size: 30vh">404</div>
      <div class="text-h3 q-pb-lg" style="opacity: 0.8">
        Oops. Nothing here...
      </div>
      <q-btn
        rounded
        size="lg"
        class="q-mt-xl"
        color="white"
        text-color="black"
        unelevated
        to="/"
        label="Go back home"
      />
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "ErrorNotFound",
});
</script>
