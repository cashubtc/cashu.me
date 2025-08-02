<template>
  <div class="font-sans text-gray-800 dark:text-gray-100">
    <section class="text-center py-12 fade-in-section">
      <h1 class="text-4xl font-extrabold gradient-text">About Fundstr</h1>
      <p class="mt-4 text-lg">Learn how Fundstr empowers communities with Cashu tokens.</p>
    </section>

    <section class="max-w-4xl mx-auto space-y-16 px-6">
      <!-- Vision -->
      <section class="fade-in-section">
        <h2 class="text-2xl font-semibold mb-4">Our Vision</h2>
        <p>
          Fundstr brings the power of Cashu tokens to content creators and their
          supporters with a simple, non‑custodial experience.
        </p>
      </section>

      <!-- How it Works -->
      <section class="fade-in-section">
        <h2 class="text-2xl font-semibold mb-4">How it Works</h2>
        <div class="grid gap-6 md:grid-cols-3">
          <div class="p-6 rounded-lg bg-white/5 dark:bg-white/10 interactive-card">
            <h3 class="font-bold mb-2">Create</h3>
            <p>Generate a wallet and share your Fundstr address.</p>
          </div>
          <div class="p-6 rounded-lg bg-white/5 dark:bg-white/10 interactive-card">
            <h3 class="font-bold mb-2">Support</h3>
            <p>Fans send you tokens over Lightning or Nostr.</p>
          </div>
          <div class="p-6 rounded-lg bg-white/5 dark:bg-white/10 interactive-card">
            <h3 class="font-bold mb-2">Grow</h3>
            <p>Redeem tokens or pay other creators instantly.</p>
          </div>
        </div>
      </section>

      <!-- Audience -->
      <section class="fade-in-section">
        <h2 class="text-2xl font-semibold mb-4">Who is it for?</h2>
        <p>Fundstr is built for creators, communities and fans.</p>
        <table class="responsive-table mt-6">
          <thead>
            <tr class="text-left">
              <th class="py-2 px-4">Audience</th>
              <th class="py-2 px-4">Benefit</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="py-2 px-4" data-label="Audience">Creators</td>
              <td class="py-2 px-4" data-label="Benefit">Receive tips directly</td>
            </tr>
            <tr>
              <td class="py-2 px-4" data-label="Audience">Communities</td>
              <td class="py-2 px-4" data-label="Benefit">Share pooled funds</td>
            </tr>
            <tr>
              <td class="py-2 px-4" data-label="Audience">Fans</td>
              <td class="py-2 px-4" data-label="Benefit">Support what you love</td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- Navigation Map -->
      <section class="fade-in-section">
        <h2 class="text-2xl font-semibold mb-4">Navigation</h2>
        <ul class="grid gap-4 sm:grid-cols-2">
          <li>
            <router-link
              to="/"
              class="block p-4 rounded-lg bg-white/5 dark:bg-white/10 interactive-card"
              >Home</router-link
            >
          </li>
          <li>
            <router-link
              to="/wallet"
              class="block p-4 rounded-lg bg-white/5 dark:bg-white/10 interactive-card"
              >Wallet</router-link
            >
          </li>
          <li>
            <router-link
              to="/creator-hub"
              class="block p-4 rounded-lg bg-white/5 dark:bg-white/10 interactive-card"
              >Creator Hub</router-link
            >
          </li>
          <li>
            <router-link
              to="/settings"
              class="block p-4 rounded-lg bg-white/5 dark:bg-white/10 interactive-card"
              >Settings</router-link
            >
          </li>
        </ul>
      </section>

      <!-- Trust & Security -->
      <section class="fade-in-section">
        <h2 class="text-2xl font-semibold mb-4">Trust &amp; Security</h2>
        <p>
          Fundstr is open‑source and non‑custodial. You keep full control of
          your keys.
        </p>
      </section>

      <!-- FAQ -->
      <section class="fade-in-section">
        <h2 class="text-2xl font-semibold mb-4">FAQ</h2>
        <div class="space-y-4">
          <details class="p-4 rounded-lg bg-white/5 dark:bg-white/10 interactive-card">
            <summary class="font-medium cursor-pointer">
              What happens if I lose my seed?
            </summary>
            <p class="mt-2 text-sm">
              Lost seeds cannot be recovered. Always back up your 12‑word seed
              securely.
            </p>
          </details>
          <details class="p-4 rounded-lg bg-white/5 dark:bg-white/10 interactive-card">
            <summary class="font-medium cursor-pointer">Is Fundstr free?</summary>
            <p class="mt-2 text-sm">
              Yes, Fundstr is free and open‑source. Support the project if you
              find it useful.
            </p>
          </details>
        </div>
      </section>

      <!-- Community Links -->
      <section class="fade-in-section">
        <h2 class="text-2xl font-semibold mb-4">Community</h2>
        <div class="flex flex-wrap gap-4">
          <a
            href="https://github.com/cashubtc/cashu.me"
            target="_blank"
            class="px-4 py-2 rounded-lg bg-white/5 dark:bg-white/10 interactive-card"
            >GitHub</a
          >
          <a
            href="https://fundstr.app"
            target="_blank"
            class="px-4 py-2 rounded-lg bg-white/5 dark:bg-white/10 interactive-card"
            >Website</a
          >
          <a
            href="https://njump.me/npub1aljmhjp5tqrw3m60ra7t3u8uqq223d6rdg9q0h76a8djd9m4hmvsmlj82m"
            target="_blank"
            class="px-4 py-2 rounded-lg bg-white/5 dark:bg-white/10 interactive-card"
            >Creator</a
          >
        </div>
      </section>

      <!-- Final Quote -->
      <section class="fade-in-section text-center">
        <blockquote class="italic max-w-2xl mx-auto">
          "The future of digital economies lies in open, community‑driven
          tools."
        </blockquote>
      </section>

      <!-- Call to Action -->
      <section class="fade-in-section text-center pb-16">
        <router-link
          to="/welcome"
          class="inline-block mt-8 px-6 py-3 rounded-lg bg-blue-600 text-white shadow hover:bg-blue-700 transition"
          >Get Started</router-link
        >
      </section>
    </section>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.1 }
  )

  document
    .querySelectorAll('.fade-in-section')
    .forEach((el) => observer.observe(el))
})
</script>

<style scoped>
.gradient-text {
  background: linear-gradient(to right, #8b5cf6, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
}

.interactive-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.interactive-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}

.responsive-table {
  width: 100%;
  border-collapse: collapse;
}
.responsive-table th,
.responsive-table td {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}
@media (max-width: 767px) {
  .responsive-table thead {
    display: none;
  }
  .responsive-table tr {
    display: block;
    margin-bottom: 1rem;
  }
  .responsive-table td {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 1rem;
  }
  .responsive-table td::before {
    content: attr(data-label);
    font-weight: 600;
    margin-right: 1rem;
  }
}
@media (min-width: 768px) {
  .responsive-table tr {
    display: table-row;
  }
  .responsive-table th,
  .responsive-table td {
    padding: 0.5rem 1rem;
  }
}

.fade-in-section {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}
.fade-in-section.is-visible {
  opacity: 1;
  transform: translateY(0);
}
</style>
