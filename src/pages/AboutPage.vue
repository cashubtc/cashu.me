<template>
  <div class="font-sans text-gray-300">
    <header class="text-center py-16 fade-in-section">
      <h1 class="text-4xl sm:text-5xl font-extrabold gradient-text">About Fundstr</h1>
      <p class="mt-4 text-lg max-w-2xl mx-auto">
        Learn how Fundstr uses Cashu ecash to empower fans and creators with private, instant payments.
      </p>
      <div class="mt-6 max-w-xl mx-auto border border-amber-500/30 bg-amber-900/20 text-amber-200 p-4 rounded">
        ⚠️ Fundstr is in <span class="font-semibold">alpha</span>. Expect bugs and use at your own risk.
      </div>
    </header>

    <main class="max-w-5xl mx-auto space-y-24 px-6">
      <!-- Vision -->
      <section id="vision" class="fade-in-section text-center">
        <h2 class="text-2xl font-semibold mb-4">Our Vision</h2>
        <p class="prose-custom mx-auto">
          Fundstr imagines a world where anyone can fund what they love using
          <span class="accent-text">privacy‑preserving ecash</span>.
        </p>
      </section>

      <!-- How Ecash Works -->
      <section id="how-it-works" class="fade-in-section">
        <h2 class="text-2xl font-semibold mb-8 text-center">How Ecash Works</h2>
        <div class="grid gap-6 md:grid-cols-5 items-center text-center">
          <!-- Your Bitcoin -->
          <div class="p-6 rounded-lg bg-white/5 interactive-card flex flex-col items-center">
            <div class="mb-4 flex items-center justify-center w-12 h-12 rounded-full border border-white/20">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-6 h-6 fill-current accent-text"><path d="M11.755 12.016l-.002.009c1.676.408 2.74 1.56 2.414 3.265-.392 1.917-2.055 2.542-3.897 2.644l-.16.809-1.26-.245.154-.78c-.322-.064-.65-.132-.978-.2l-.153.773-1.26-.245.155-.786c-.267-.058-.533-.116-.796-.177l-1.586-.309.402-1.362s.9.188.889.176c.348.069.504-.156.56-.327l.394-2.004c.023.005.053.01.086.016l-.085-.017.62-3.156c.011-.262-.073-.595-.561-.688.012-.011-.887-.177-.887-.177l.215-1.293 1.682.327c.313.061.622.122.923.182l.153-.79 1.26.245-.154.78c.33.064.654.127.97.188l.152-.774 1.26.245-.154.78c1.642.356 2.717 1.409 2.4 3.024-.255 1.312-1.214 1.969-2.459 2.176zM9.74 9.36l-.437 2.23c.49.098 2.003.272 2.246-.577.237-1.206-1.103-1.482-1.809-1.653zm-.713 3.636l-.482 2.463c.583.116 2.344.336 2.602-.539.263-1.302-1.335-1.596-2.12-1.924z"/></svg>
            </div>
            <h3 class="font-bold mb-2">Your Bitcoin</h3>
            <p class="text-sm">Start with sats you already own.</p>
          </div>
          <div class="hidden md:flex justify-center">&rarr;</div>
          <!-- The Mint -->
          <div class="p-6 rounded-lg bg-white/5 interactive-card flex flex-col items-center">
            <div class="mb-4 flex items-center justify-center w-12 h-12 rounded-full border border-white/20">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-6 h-6 stroke-current accent-text" fill="none"><path stroke-width="2" d="M4 4h16v16H4z"/><path stroke-width="2" d="M4 9h16"/><path stroke-width="2" d="M9 4v16"/></svg>
            </div>
            <h3 class="font-bold mb-2">The Mint</h3>
            <p class="text-sm">Swap sats for ecash tokens.</p>
          </div>
          <div class="hidden md:flex justify-center">&rarr;</div>
          <!-- Fundstr Wallet -->
          <div class="p-6 rounded-lg bg-white/5 interactive-card flex flex-col items-center">
            <div class="mb-4 flex items-center justify-center w-12 h-12 rounded-full border border-white/20">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-6 h-6 stroke-current accent-text" fill="none"><path stroke-width="2" d="M3 7h18v10H3z"/><path stroke-width="2" d="M7 11h10"/><path stroke-width="2" d="M7 15h6"/></svg>
            </div>
            <h3 class="font-bold mb-2">Fundstr Wallet</h3>
            <p class="text-sm">Spend or send instantly and privately.</p>
          </div>
        </div>
      </section>

      <!-- Built for the Sovereign Individual -->
      <section id="who-for" class="fade-in-section">
        <h2 class="text-2xl font-semibold mb-8 text-center">Built for the Sovereign Individual</h2>
        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div class="p-6 rounded-lg bg-white/5 interactive-card text-center">
            <div class="mb-4 flex justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 accent-text" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="7" r="4"/><path d="M6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/></svg>
            </div>
            <h3 class="font-bold mb-2">Creators</h3>
            <p class="text-sm">Collect tips directly from your audience.</p>
          </div>
          <div class="p-6 rounded-lg bg-white/5 interactive-card text-center">
            <div class="mb-4 flex justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 accent-text" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l8.84 8.84 8.84-8.84a5.5 5.5 0 000-7.78z"/></svg>
            </div>
            <h3 class="font-bold mb-2">Fans</h3>
            <p class="text-sm">Support what you love without friction.</p>
          </div>
          <div class="p-6 rounded-lg bg-white/5 interactive-card text-center">
            <div class="mb-4 flex justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 accent-text" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
            </div>
            <h3 class="font-bold mb-2">Communities</h3>
            <p class="text-sm">Pool funds for causes and friends.</p>
          </div>
          <div class="p-6 rounded-lg bg-white/5 interactive-card text-center">
            <div class="mb-4 flex justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 accent-text" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20v-6"/><path d="M6 20v-4"/><path d="M18 20v-8"/><path d="M2 10l10-8 10 8"/></svg>
            </div>
            <h3 class="font-bold mb-2">Developers</h3>
            <p class="text-sm">Build on an open, extensible protocol.</p>
          </div>
        </div>
      </section>

      <!-- Navigation Map -->
      <section id="navigation-map" class="fade-in-section">
        <h2 class="text-2xl font-semibold mb-4 text-center">Navigation Map</h2>
        <table class="nav-table w-full text-left hidden md:table">
          <thead>
            <tr class="bg-white/5">
              <th class="py-2 px-4">Section</th>
              <th class="py-2 px-4">Fan View</th>
              <th class="py-2 px-4">Creator View</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="py-2 px-4">Dashboard</td>
              <td class="py-2 px-4 accent-text">Track tips</td>
              <td class="py-2 px-4 text-pink-400">Monitor income</td>
            </tr>
            <tr>
              <td class="py-2 px-4">Find Creators</td>
              <td class="py-2 px-4 accent-text">Discover talent</td>
              <td class="py-2 px-4 text-pink-400">Showcase profile</td>
            </tr>
            <tr>
              <td class="py-2 px-4">Settings</td>
              <td class="py-2 px-4 accent-text">Manage wallet</td>
              <td class="py-2 px-4 text-pink-400">Customize hub</td>
            </tr>
          </tbody>
        </table>
        <div class="nav-cards grid gap-4 md:hidden">
          <div class="p-4 rounded-lg bg-white/5 interactive-card">
            <h3 class="font-semibold">Dashboard</h3>
            <p class="mt-2"><span class="accent-text">Fan:</span> Track tips</p>
            <p><span class="text-pink-400">Creator:</span> Monitor income</p>
          </div>
          <div class="p-4 rounded-lg bg-white/5 interactive-card">
            <h3 class="font-semibold">Find Creators</h3>
            <p class="mt-2"><span class="accent-text">Fan:</span> Discover talent</p>
            <p><span class="text-pink-400">Creator:</span> Showcase profile</p>
          </div>
          <div class="p-4 rounded-lg bg-white/5 interactive-card">
            <h3 class="font-semibold">Settings</h3>
            <p class="mt-2"><span class="accent-text">Fan:</span> Manage wallet</p>
            <p><span class="text-pink-400">Creator:</span> Customize hub</p>
          </div>
        </div>
      </section>

      <!-- Trust & Security -->
      <section id="trust" class="fade-in-section">
        <h2 class="text-2xl font-semibold mb-8 text-center">Trust &amp; Security</h2>
        <div class="grid gap-6 md:grid-cols-2">
          <div class="p-6 rounded-lg bg-white/5 interactive-card">
            <h3 class="font-bold mb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 mr-2 accent-text" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Open Source
            </h3>
            <p class="text-sm">Explore the code on GitHub and audit everything.</p>
            <a href="https://github.com/cashubtc/cashu.me" target="_blank" class="accent-text underline text-sm">Explore on GitHub</a>
          </div>
          <div class="p-6 rounded-lg bg-white/5 interactive-card">
            <h3 class="font-bold mb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 mr-2 accent-text" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12l2-2 4 4L21 4"/><path d="M3 12v6a2 2 0 002 2h14"/></svg>
              Your Keys, Your Money
            </h3>
            <p class="text-sm">Seed words stay on your device—no custodian required.</p>
          </div>
          <div class="p-6 rounded-lg bg-white/5 interactive-card">
            <h3 class="font-bold mb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 mr-2 accent-text" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v18"/><path d="M5 12h14"/></svg>
              Privacy First
            </h3>
            <p class="text-sm">Ecash hides amounts and identities by design.</p>
          </div>
          <div class="p-6 rounded-lg bg-white/5 interactive-card">
            <h3 class="font-bold mb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 mr-2 accent-text" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 13h6"/><path d="M5 17h14"/><path d="M7 9h10"/><path d="M12 4v1"/><path d="M12 19v1"/></svg>
              Mint Diversification
            </h3>
            <p class="text-sm">Use multiple mints to spread risk. ⚠️</p>
          </div>
        </div>
      </section>

      <!-- FAQ -->
      <section id="faq" class="fade-in-section">
        <h2 class="text-2xl font-semibold mb-4 text-center">FAQ</h2>
        <div class="space-y-4">
          <details class="p-4 rounded-lg bg-white/5 interactive-card">
            <summary class="font-medium flex justify-between items-center cursor-pointer">
              <span>What happens if I lose my seed?</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 9l-7 7-7-7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </summary>
            <p class="mt-2 text-sm">Lost seeds cannot be recovered. Always back up your 12‑word seed securely.</p>
          </details>
          <details class="p-4 rounded-lg bg-white/5 interactive-card">
            <summary class="font-medium flex justify-between items-center cursor-pointer">
              <span>Is Fundstr free?</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 9l-7 7-7-7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </summary>
            <p class="mt-2 text-sm">Yes, Fundstr is free and open‑source. Donate if you find it useful.</p>
          </details>
          <details class="p-4 rounded-lg bg-white/5 interactive-card">
            <summary class="font-medium flex justify-between items-center cursor-pointer">
              <span>Can I run my own mint?</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 9l-7 7-7-7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </summary>
            <p class="mt-2 text-sm">Absolutely. Cashu is permissionless—run a mint and plug it into Fundstr.</p>
          </details>
        </div>
      </section>

      <!-- Community Links -->
      <section id="community" class="fade-in-section">
        <h2 class="text-2xl font-semibold mb-4 text-center">Community</h2>
        <div class="flex flex-wrap gap-4 justify-center">
          <a href="https://github.com/cashubtc/cashu.me" target="_blank" class="flex items-center px-4 py-2 rounded-lg bg-white/5 interactive-card">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 007.87 10.95c.58.1.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.53-1.35-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.18.08 1.8 1.22 1.8 1.22 1.04 1.78 2.73 1.27 3.4.97.1-.75.41-1.27.75-1.56-2.56-.29-5.26-1.28-5.26-5.69 0-1.26.45-2.29 1.2-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.07 11.07 0 015.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.75.81 1.2 1.84 1.2 3.1 0 4.42-2.7 5.39-5.28 5.67.42.36.8 1.06.8 2.13 0 1.54-.01 2.78-.01 3.16 0 .31.21.67.8.56A11.5 11.5 0 0023.5 12C23.5 5.65 18.35.5 12 .5z"/></svg>
            <span class="ml-2">GitHub</span>
          </a>
          <a href="https://fundstr.app" target="_blank" class="flex items-center px-4 py-2 rounded-lg bg-white/5 interactive-card">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 5v14" stroke-width="2" stroke-linecap="round"/><path d="M5 12h14" stroke-width="2" stroke-linecap="round"/></svg>
            <span class="ml-2">Website</span>
          </a>
          <a href="https://njump.me/npub1aljmhjp5tqrw3m60ra7t3u8uqq223d6rdg9q0h76a8djd9m4hmvsmlj82m" target="_blank" class="flex items-center px-4 py-2 rounded-lg bg-white/5 interactive-card">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15 10l4.55-4.55a2 2 0 000-2.83l-.17-.17a2 2 0 00-2.83 0L12 7"/><path d="M17 8l-6.29 6.29"/><path d="M11 16l-1.17 1.17a2 2 0 01-2.83 0l-.17-.17a2 2 0 010-2.83L10 12" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <span class="ml-2">Nostr</span>
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
      <section id="cta" class="fade-in-section text-center pb-16">
        <div class="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <router-link to="/welcome" class="px-6 py-3 rounded-lg bg-white/5 interactive-card">
            Install PWA
          </router-link>
          <a href="https://fundstr.app/support" target="_blank" class="px-6 py-3 rounded-lg gradient-bg text-white shadow">
            Support Fundstr
          </a>
        </div>
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
  --accent-color: #22d3ee;
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

.prose-custom {
  line-height: 1.7;
}

.interactive-card {
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(4px);
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
}
.interactive-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(34, 211, 238, 0.2);
  border-color: rgba(34, 211, 238, 0.4);
}

.nav-table {
  width: 100%;
  border-collapse: collapse;
}

.gradient-bg {
  background: linear-gradient(to right, var(--gradient-start), var(--gradient-end));
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

