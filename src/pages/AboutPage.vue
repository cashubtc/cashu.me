<template>
  <main
    class="max-w-3xl mx-auto p-6 font-sans text-gray-800 dark:text-gray-100 space-y-4"
  >
    <h1 class="text-2xl font-semibold mb-4 fade-section">About Fundstr</h1>

    <p class="mb-4 fade-section">
      Fundstr is in Alpha/Beta – use at your own risk.
    </p>

    <p class="mb-4 fade-section">
      Fundstr is open-source under the
      <a
        href="https://github.com/cashubtc/cashu.me/blob/master/LICENSE.md"
        target="_blank"
        class="text-blue-600 dark:text-blue-400 underline"
        >MIT License</a
      >.
      Contribute or read the code on
      <a
        href="https://github.com/cashubtc/cashu.me"
        target="_blank"
        class="text-blue-600 dark:text-blue-400 underline"
        >GitHub</a
      >.
    </p>

    <p class="mb-4 fade-section">
      Available as a web app, PWA and native Android/iOS. Supports incoming
      payments via a Lightning Address using npub.cash.
    </p>

    <p class="mb-4 fade-section">
      Advanced users can override default Nostr relays or set a custom search
      backend via local storage keys.
    </p>

    <p class="fade-section">
      Fundstr is non-custodial. Lost seeds or tokens cannot be recovered, so
      back up your 12-word seed and Nostr keys securely.
    </p>
  </main>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
          obs.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.1 }
  )

  document
    .querySelectorAll('.fade-section')
    .forEach((el) => observer.observe(el))
})
</script>

<style scoped>
:root {
  --fade-distance: 20px;
}

.fade-section {
  opacity: 0;
  transform: translateY(var(--fade-distance));
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

.fade-section.visible {
  opacity: 1;
  transform: translateY(0);
}
</style>
