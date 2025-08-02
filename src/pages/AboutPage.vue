<template>
  <div class="font-sans text-gray-800 dark:text-gray-100">
    <header class="text-center py-16 fade-in-section">
      <h1 class="text-4xl sm:text-5xl font-extrabold gradient-text">About Cashu.me</h1>
      <p class="mt-4 text-lg max-w-2xl mx-auto">
        Discover how Cashu.me brings ecash to the masses with privacy and freedom.
      </p>
    </header>

    <main class="max-w-5xl mx-auto space-y-16 px-6">
      <!-- Vision -->
      <section class="fade-in-section">
        <h2 class="text-2xl font-semibold mb-4">Our Vision</h2>
        <p>
          Cashu.me envisions a world where anyone can transact instantly using
          <span class="accent-text">privacy preserving ecash</span>.
        </p>
      </section>

      <!-- How Ecash Works -->
      <section class="fade-in-section">
        <h2 class="text-2xl font-semibold mb-8">How Ecash Works</h2>
        <div class="grid gap-6 md:grid-cols-3">
          <div class="p-6 rounded-lg bg-white/5 dark:bg-white/10 interactive-card">
            <div class="flex items-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="12" r="10" stroke-width="2" />
                <path d="M12 6v6l4 2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <h3 class="font-bold text-lg ml-4">Mint</h3>
            </div>
            <p>Generate tokens from a mint and store them in your wallet.</p>
          </div>
          <div class="p-6 rounded-lg bg-white/5 dark:bg-white/10 interactive-card">
            <div class="flex items-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <h3 class="font-bold text-lg ml-4">Send</h3>
            </div>
            <p>Transfer ecash to friends using Lightning or Nostr.</p>
          </div>
          <div class="p-6 rounded-lg bg-white/5 dark:bg-white/10 interactive-card">
            <div class="flex items-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M4 7h16v10H4z" stroke-width="2" stroke-linejoin="round" />
                <path d="M8 11h8" stroke-width="2" stroke-linecap="round" />
                <path d="M8 15h5" stroke-width="2" stroke-linecap="round" />
              </svg>
              <h3 class="font-bold text-lg ml-4">Redeem</h3>
            </div>
            <p>Swap ecash back into sats whenever you like.</p>
          </div>
        </div>
      </section>

      <!-- Audience -->
      <section class="fade-in-section">
        <h2 class="text-2xl font-semibold mb-8">Who Is It For?</h2>
        <div class="grid gap-6 md:grid-cols-3">
          <div class="p-6 rounded-lg bg-white/5 dark:bg-white/10 interactive-card text-center">
            <div class="mb-4 flex justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" stroke-width="2" />
                <path d="M6 22v-2c0-2.21 1.79-4 4-4h4c2.21 0 4 1.79 4 4v2" stroke-width="2" stroke-linecap="round" />
              </svg>
            </div>
            <h3 class="font-bold mb-2">Creators</h3>
            <p>Receive tips directly from supporters.</p>
          </div>
          <div class="p-6 rounded-lg bg-white/5 dark:bg-white/10 interactive-card text-center">
            <div class="mb-4 flex justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke-width="2" stroke-linecap="round" />
                <circle cx="9" cy="7" r="4" stroke-width="2" />
                <path d="M23 21v-2a4 4 0 00-3-3.87" stroke-width="2" stroke-linecap="round" />
                <path d="M16 3.13a4 4 0 010 7.75" stroke-width="2" stroke-linecap="round" />
              </svg>
            </div>
            <h3 class="font-bold mb-2">Communities</h3>
            <p>Share pooled funds with groups and causes.</p>
          </div>
          <div class="p-6 rounded-lg bg-white/5 dark:bg-white/10 interactive-card text-center">
            <div class="mb-4 flex justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l8.84 8.84 8.84-8.84a5.5 5.5 0 000-7.78z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <h3 class="font-bold mb-2">Fans</h3>
            <p>Support what you love without friction.</p>
          </div>
        </div>
      </section>

      <!-- Navigation Map -->
      <section class="fade-in-section">
        <h2 class="text-2xl font-semibold mb-4">Navigation</h2>
        <table class="nav-table w-full text-left hidden md:table">
          <thead>
            <tr>
              <th class="py-2 px-4">Page</th>
              <th class="py-2 px-4">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="py-2 px-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M3 12l9-9 9 9v9a3 3 0 01-3 3H6a3 3 0 01-3-3z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                Home
              </td>
              <td class="py-2 px-4">Return to dashboard</td>
            </tr>
            <tr>
              <td class="py-2 px-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M17 7H7v10h10V7z" stroke-width="2" />
                  <path d="M12 17v4" stroke-width="2" stroke-linecap="round" />
                  <path d="M8 21h8" stroke-width="2" stroke-linecap="round" />
                </svg>
                Wallet
              </td>
              <td class="py-2 px-4">Manage your ecash balance</td>
            </tr>
            <tr>
              <td class="py-2 px-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M8 17l4-4 4 4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M12 12V3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                Creator Hub
              </td>
              <td class="py-2 px-4">Tools for content creators</td>
            </tr>
            <tr>
              <td class="py-2 px-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M10.325 4.317a4.993 4.993 0 013.35 0l.79 2.375a5.005 5.005 0 012.812 2.812l2.375.79a5 5 0 010 3.35l-2.375.79a5.005 5.005 0 01-2.812 2.812l-.79 2.375a5 5 0 01-3.35 0l-.79-2.375a5.005 5.005 0 01-2.812-2.812l-2.375-.79a5 5 0 010-3.35l2.375-.79a5.005 5.005 0 012.812-2.812l.79-2.375z" stroke-width="2" />
                </svg>
                Settings
              </td>
              <td class="py-2 px-4">Customize your experience</td>
            </tr>
          </tbody>
        </table>
        <div class="nav-cards grid gap-4 md:hidden">
          <router-link
            to="/"
            class="flex items-center p-4 rounded-lg bg-white/5 dark:bg-white/10 interactive-card"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M3 12l9-9 9 9v9a3 3 0 01-3 3H6a3 3 0 01-3-3z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span class="ml-4">Home</span>
          </router-link>
          <router-link
            to="/wallet"
            class="flex items-center p-4 rounded-lg bg-white/5 dark:bg-white/10 interactive-card"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M17 7H7v10h10V7z" stroke-width="2" />
              <path d="M12 17v4" stroke-width="2" stroke-linecap="round" />
              <path d="M8 21h8" stroke-width="2" stroke-linecap="round" />
            </svg>
            <span class="ml-4">Wallet</span>
          </router-link>
          <router-link
            to="/creator-hub"
            class="flex items-center p-4 rounded-lg bg-white/5 dark:bg-white/10 interactive-card"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M8 17l4-4 4 4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M12 12V3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span class="ml-4">Creator Hub</span>
          </router-link>
          <router-link
            to="/settings"
            class="flex items-center p-4 rounded-lg bg-white/5 dark:bg-white/10 interactive-card"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M10.325 4.317a4.993 4.993 0 013.35 0l.79 2.375a5.005 5.005 0 012.812 2.812l2.375.79a5 5 0 010 3.35l-2.375.79a5.005 5.005 0 01-2.812 2.812l-.79 2.375a5 5 0 01-3.35 0l-.79-2.375a5.005 5.005 0 01-2.812-2.812l-2.375-.79a5 5 0 010-3.35l2.375-.79a5.005 5.005 0 012.812-2.812l.79-2.375z" stroke-width="2" />
            </svg>
            <span class="ml-4">Settings</span>
          </router-link>
        </div>
      </section>

      <!-- Trust & Security -->
      <section class="fade-in-section">
        <h2 class="text-2xl font-semibold mb-4">Trust &amp; Security</h2>
        <p>
          Cashu.me is <span class="accent-text">open-source</span> and non‑custodial. You keep full control of
          your keys.
        </p>
      </section>

      <!-- FAQ -->
      <section class="fade-in-section">
        <h2 class="text-2xl font-semibold mb-4">FAQ</h2>
        <div class="space-y-4">
          <details class="p-4 rounded-lg bg-white/5 dark:bg-white/10 interactive-card">
            <summary class="font-medium flex justify-between items-center cursor-pointer">
              <span>What happens if I lose my seed?</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M19 9l-7 7-7-7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </summary>
            <p class="mt-2 text-sm">
              Lost seeds cannot be recovered. Always back up your 12‑word seed securely.
            </p>
          </details>
          <details class="p-4 rounded-lg bg-white/5 dark:bg-white/10 interactive-card">
            <summary class="font-medium flex justify-between items-center cursor-pointer">
              <span>Is Cashu.me free?</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M19 9l-7 7-7-7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </summary>
            <p class="mt-2 text-sm">
              Yes, Cashu.me is free and open‑source. Support the project if you find it useful.
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
            class="flex items-center px-4 py-2 rounded-lg bg-white/5 dark:bg-white/10 interactive-card"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 007.87 10.95c.58.1.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.53-1.35-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.18.08 1.8 1.22 1.8 1.22 1.04 1.78 2.73 1.27 3.4.97.1-.75.41-1.27.75-1.56-2.56-.29-5.26-1.28-5.26-5.69 0-1.26.45-2.29 1.2-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.07 11.07 0 015.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.75.81 1.2 1.84 1.2 3.1 0 4.42-2.7 5.39-5.28 5.67.42.36.8 1.06.8 2.13 0 1.54-.01 2.78-.01 3.16 0 .31.21.67.8.56A11.5 11.5 0 0023.5 12C23.5 5.65 18.35.5 12 .5z"
              />
            </svg>
            <span class="ml-2">GitHub</span>
          </a>
          <a
            href="https://fundstr.app"
            target="_blank"
            class="flex items-center px-4 py-2 rounded-lg bg-white/5 dark:bg-white/10 interactive-card"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M12 5v14" stroke-width="2" stroke-linecap="round" />
              <path d="M5 12h14" stroke-width="2" stroke-linecap="round" />
            </svg>
            <span class="ml-2">Website</span>
          </a>
          <a
            href="https://njump.me/npub1aljmhjp5tqrw3m60ra7t3u8uqq223d6rdg9q0h76a8djd9m4hmvsmlj82m"
            target="_blank"
            class="flex items-center px-4 py-2 rounded-lg bg-white/5 dark:bg-white/10 interactive-card"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M15 10l4.55-4.55a2 2 0 000-2.83l-.17-.17a2 2 0 00-2.83 0L12 7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M17 8l-6.29 6.29" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M11 16l-1.17 1.17a2 2 0 01-2.83 0l-.17-.17a2 2 0 010-2.83L10 12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span class="ml-2">Creator</span>
          </a>
        </div>
      </section>

      <!-- Final Quote -->
      <section class="fade-in-section text-center">
        <blockquote class="italic max-w-2xl mx-auto">
          "The future of digital economies lies in open, community‑driven tools."
        </blockquote>
      </section>

      <!-- Call to Action -->
      <section class="fade-in-section text-center pb-16">
        <router-link
          to="/welcome"
          class="inline-block mt-8 px-6 py-3 rounded-lg bg-blue-600 text-white shadow hover:bg-blue-700 transition"
        >
          Get Started
        </router-link>
      </section>
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          obs.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.1 }
  )

  document.querySelectorAll('.fade-in-section').forEach((el) => observer.observe(el))
})
</script>

<style scoped>
:root {
  --gradient-start: #8b5cf6;
  --gradient-end: #ec4899;
  --accent-color: #3b82f6;
}

.gradient-text {
  background: linear-gradient(to right, var(--gradient-start), var(--gradient-end));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
}

.accent-text {
  color: var(--accent-color);
}

.interactive-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.interactive-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}

.nav-table {
  width: 100%;
  border-collapse: collapse;
}
.nav-table th,
.nav-table td {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding: 0.75rem 1rem;
}

summary {
  list-style: none;
}
summary::-webkit-details-marker {
  display: none;
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

details[open] summary svg {
  transform: rotate(180deg);
}

@media (max-width: 767px) {
  .nav-table {
    display: none;
  }
  .nav-cards {
    display: grid;
  }
}

@media (min-width: 768px) {
  .nav-cards {
    display: none;
  }
}
</style>

