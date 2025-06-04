<template>
  <div class="find-creators-wrapper">
    <iframe
      src="/find-creators.html"
      class="find-creators-frame"
      title="Find Creators"
    />
  </div>
</template>

<script setup lang="ts">
// The FindCreators page now loads a standalone HTML file that contains the
// entire implementation for searching and displaying creators. We simply embed
// that file in an iframe to keep it separate from the Quasar SPA while
// retaining navigation via the router.
</script>

<style scoped>
.find-creators-wrapper {
  height: 100vh;
  padding: 0;
  margin: 0;
}

.find-creators-frame {
  border: none;
  width: 100%;
  height: 100%;
}
</style>
