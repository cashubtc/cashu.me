<template>
  <div class="about-page antialiased">
    <!-- Header -->
    <header class="text-center py-16 px-4 fade-in-section">
      <h1 class="text-5xl md:text-7xl font-extrabold mb-6">
        About <span class="gradient-text">Fundstr</span>
      </h1>
      <p class="max-w-3xl mx-auto text-lg md:text-xl">
        A privacy-first Bitcoin wallet, social chat, and creator-monetisation hub built on the open-source Cashu ecash protocol and the decentralised Nostr network.
      </p>
      <div class="mt-8 p-4 border rounded bg-amber-900/20 border-amber-500/30 max-w-3xl mx-auto flex items-start gap-2 text-amber-300">
        <span class="text-2xl">⚠️</span>
        <p>
          Fundstr is experimental alpha software. Features may break or change, and loss of funds is possible. Use only small amounts you can afford to lose.
        </p>
      </div>
    </header>

    <!-- Vision -->
    <section id="vision" class="py-16 px-4 fade-in-section">
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="text-3xl md:text-5xl font-bold mb-6 gradient-text">
          Your Money, Your Network
        </h2>
        <p class="text-lg md:text-xl">
          We believe in a world where your financial life and social interactions are truly your own. Fundstr is an experiment in creating a parallel, peer-to-peer economy—free from corporate gatekeepers, surveillance, and unpredictable fees. It’s a gateway to a more sovereign way of connecting and transacting.
        </p>
      </div>
    </section>

    <!-- How Ecash Works -->
    <section id="how-it-works" class="py-16 px-4 fade-in-section">
      <div class="max-w-5xl mx-auto text-center">
        <h2 class="text-3xl md:text-5xl font-bold mb-6 gradient-text">
          How Ecash Works
        </h2>
        <p class="text-lg md:text-xl mb-12">
          The loop is simple: Bitcoin in → private e-cash out → social payments everywhere.
        </p>

        <!-- Flow Grid -->
        <div class="grid grid-cols-1 md:grid-cols-5 items-center gap-6">
          <!-- Step 1 -->
          <div class="interactive-card p-6 flex flex-col items-center">
            <svg
              class="w-12 h-12 mb-4 text-yellow-400"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M23.112 13.506c.353-2.353-1.444-3.415-3.897-4.2l.797-3.194-1.948-.485-.776 3.111c-.511-.127-1.035-.246-1.555-.364l.784-3.144-1.948-.486-.797 3.194c-.422-.096-.84-.19-1.246-.29l-.001-.006-2.688-.669-.518 2.075s1.444.331 1.415.352c.79.197.933.716.909 1.13l-2.195 8.8c-.096.238-.34.596-.89.461.02.028-1.415-.353-1.415-.353l-.966 2.385 2.538.631c.472.119.934.241 1.392.357l-.806 3.245 1.948.486.797-3.194c.529.143 1.042.274 1.547.398l-.793 3.179 1.948.485.805-3.244c3.324.63 5.827.376 6.885-2.633.849-2.417-.042-3.814-1.794-4.728 1.277-.295 2.237-1.135 2.497-2.873zm-4.462 6.26c-.605 2.417-4.696 1.108-6.025.781l1.076-4.32c1.329.332 5.585.991 4.949 3.539zm.605-6.29c-.553 2.211-3.96 1.086-5.063.811l.974-3.906c1.102.275 4.67.79 4.09 3.095z"
              />
            </svg>
            <h3 class="font-semibold text-xl mb-2">Your Bitcoin</h3>
            <p class="text-sm">From any wallet</p>
          </div>

          <!-- Arrow -->
          <div class="hidden md:flex justify-center text-4xl">→</div>

          <!-- Step 2 -->
          <div class="interactive-card p-6 flex flex-col items-center">
            <svg
              class="w-12 h-12 mb-4 text-indigo-400"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
              />
            </svg>
            <h3 class="font-semibold text-xl mb-2">The Mint</h3>
            <p class="text-sm">Swaps for Ecash</p>
          </div>

          <!-- Arrow -->
          <div class="hidden md:flex justify-center text-4xl">→</div>

          <!-- Step 3 -->
          <div class="interactive-card p-6 flex flex-col items-center">
            <svg
              class="w-12 h-12 mb-4 text-pink-400"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            <h3 class="font-semibold text-xl mb-2">Fundstr Wallet</h3>
            <p class="text-sm">Private & ready to spend</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Built for the Sovereign Individual -->
    <section id="who-for" class="py-16 px-4 fade-in-section">
      <div class="max-w-6xl mx-auto text-center">
        <h2 class="text-3xl md:text-5xl font-bold mb-12 gradient-text">
          Built for the Sovereign Individual
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <!-- Card 1 -->
          <div class="interactive-card p-6">
            <div class="text-4xl mb-4">🖌️</div>
            <h3 class="font-semibold text-xl mb-2">Content Creators</h3>
            <p class="text-sm">
              Monetize your audience directly, free from de-platforming and high fees.
            </p>
          </div>

          <!-- Card 2 -->
          <div class="interactive-card p-6">
            <div class="text-4xl mb-4">🛡️</div>
            <h3 class="font-semibold text-xl mb-2">Privacy Advocates</h3>
            <p class="text-sm">
              Transact with confidence that your financial life isn't being tracked.
            </p>
          </div>

          <!-- Card 3 -->
          <div class="interactive-card p-6">
            <div class="text-4xl mb-4">🔗</div>
            <h3 class="font-semibold text-xl mb-2">Nostr Users</h3>
            <p class="text-sm">
              Upgrade your zaps to be truly private and integrate payments seamlessly.
            </p>
          </div>

          <!-- Card 4 -->
          <div class="interactive-card p-6">
            <div class="text-4xl mb-4">🌐</div>
            <h3 class="font-semibold text-xl mb-2">Global Citizens</h3>
            <p class="text-sm">
              Move value across borders instantly, without relying on traditional banking.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Navigation Map -->
    <section id="navigation-map" class="py-16 px-4 fade-in-section">
      <div class="max-w-6xl mx-auto text-center">
        <h2 class="text-3xl md:text-5xl font-bold mb-6 gradient-text">
          Navigation Map
        </h2>
        <p class="text-lg md:text-xl mb-12">
          Every page explained from both the Creator and Fan perspectives.
        </p>

        <!-- Desktop Table -->
        <div class="hidden md:block">
          <div class="interactive-card p-2 overflow-x-auto">
            <table class="min-w-full text-left">
              <thead class="border-b border-gray-700 text-sm uppercase">
                <tr>
                  <th class="p-4">🧭 Menu item</th>
                  <th class="p-4">Fan / Subscriber perspective</th>
                  <th class="p-4">Creator perspective</th>
                </tr>
              </thead>
              <tbody class="text-sm">
                <tr class="border-b border-gray-800">
                  <td class="p-4 font-semibold">Settings</td>
                  <td class="p-4">
                    Add / switch mints, choose display unit, set language & theme, import or back-up your 12-word seed, manage Nostr keys & relays.
                  </td>
                  <td class="p-4">
                    Same, plus Publishing settings: toggle automatic NIP-61 profile updates and set a default “Earnings” bucket.
                  </td>
                </tr>
                <tr class="border-b border-gray-800">
                  <td class="p-4 font-semibold">Find Creators</td>
                  <td class="p-4">
                    Search or browse Nostr-indexed profiles. View tier prices, previews and public posts. Hit Subscribe or Zap with a single tap.
                  </td>
                  <td class="p-4">
                    Your public storefront as seen by visitors. Great for a quick audit of how your profile appears worldwide.
                  </td>
                </tr>
                <tr class="border-b border-gray-800">
                  <td class="p-4 font-semibold">Creator Hub</td>
                  <td class="p-4">— (hidden unless you toggle “Creator Mode”)</td>
                  <td class="p-4">
                    Define or edit tiers (price, duration, perks), upload cover art, publish pay-walled posts, check revenue analytics and subscriber list.
                  </td>
                </tr>
                <tr class="border-b border-gray-800">
                  <td class="p-4 font-semibold">My Profile</td>
                  <td class="p-4">
                    Show off your avatar, npub link and optional NIP-05. Personal stats: total zaps sent & received, bucket balances.
                  </td>
                  <td class="p-4">
                    Same card plus Edit. Update bio, tags and the secondary P2PK key used by fans to send you locked tokens.
                  </td>
                </tr>
                <tr class="border-b border-gray-800">
                  <td class="p-4 font-semibold">Buckets</td>
                  <td class="p-4">
                    Drag-and-drop jars for budgeting (“Groceries”, “Fun money”, “Subs”). Move sats with zero fees.
                  </td>
                  <td class="p-4">
                    Create an “Income” bucket that auto-receives new tips; split out taxes or savings instantly.
                  </td>
                </tr>
                <tr class="border-b border-gray-800">
                  <td class="p-4 font-semibold">Subscriptions</td>
                  <td class="p-4">
                    See every active plan: tier name, next renewal, cumulative sats spent. Cancel or renew with one click.
                  </td>
                  <td class="p-4">
                    Quick list of paying supporters, tier breakdown, churn alerts and pending renewals.
                  </td>
                </tr>
                <tr class="border-b border-gray-800">
                  <td class="p-4 font-semibold">Chats</td>
                  <td class="p-4">
                    End-to-end encrypted DMs (Nostr kind 4). Attach images or Cashu tokens. Green flash means a payment is embedded and auto-redeemed on receipt.
                  </td>
                  <td class="p-4">
                    Same powerful chat plus a broadcast toggle to message all subs in a tier at once.
                  </td>
                </tr>
                <tr class="border-b border-gray-800">
                  <td class="p-4 font-semibold">Terms</td>
                  <td class="p-4">
                    Human-readable, plain-English licence & disclaimers.
                  </td>
                  <td class="p-4">
                    Identical — clarifies you keep full custody of funds.
                  </td>
                </tr>
                <tr class="border-b border-gray-800">
                  <td class="p-4 font-semibold">About</td>
                  <td class="p-4">Learn everything in one scroll.</td>
                  <td class="p-4">Ditto; includes creator-specific FAQs below.</td>
                </tr>
                <tr>
                  <td class="p-4 font-semibold">External links</td>
                  <td class="p-4">
                    Cashu.space docs, GitHub, Twitter, Telegram, Donate.
                  </td>
                  <td class="p-4">
                    Identical — share with collaborators or fans.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Mobile Cards -->
        <div class="md:hidden space-y-4">
          <div class="interactive-card p-6">
            <h3 class="font-semibold text-lg mb-2">Settings</h3>
            <p class="text-sm mb-2">
              <strong>Fan / Subscriber perspective:</strong> Add / switch mints, choose display unit, set language & theme, import or back-up your 12-word seed, manage Nostr keys & relays.
            </p>
            <p class="text-sm">
              <strong>Creator perspective:</strong> Same, plus Publishing settings: toggle automatic NIP-61 profile updates and set a default “Earnings” bucket.
            </p>
          </div>

          <div class="interactive-card p-6">
            <h3 class="font-semibold text-lg mb-2">Find Creators</h3>
            <p class="text-sm mb-2">
              <strong>Fan / Subscriber perspective:</strong> Search or browse Nostr-indexed profiles. View tier prices, previews and public posts. Hit Subscribe or Zap with a single tap.
            </p>
            <p class="text-sm">
              <strong>Creator perspective:</strong> Your public storefront as seen by visitors. Great for a quick audit of how your profile appears worldwide.
            </p>
          </div>

          <div class="interactive-card p-6">
            <h3 class="font-semibold text-lg mb-2">Creator Hub</h3>
            <p class="text-sm mb-2">
              <strong>Fan / Subscriber perspective:</strong> — (hidden unless you toggle “Creator Mode”)
            </p>
            <p class="text-sm">
              <strong>Creator perspective:</strong> Define or edit tiers (price, duration, perks), upload cover art, publish pay-walled posts, check revenue analytics and subscriber list.
            </p>
          </div>

          <div class="interactive-card p-6">
            <h3 class="font-semibold text-lg mb-2">My Profile</h3>
            <p class="text-sm mb-2">
              <strong>Fan / Subscriber perspective:</strong> Show off your avatar, npub link and optional NIP-05. Personal stats: total zaps sent & received, bucket balances.
            </p>
            <p class="text-sm">
              <strong>Creator perspective:</strong> Same card plus Edit. Update bio, tags and the secondary P2PK key used by fans to send you locked tokens.
            </p>
          </div>

          <div class="interactive-card p-6">
            <h3 class="font-semibold text-lg mb-2">Buckets</h3>
            <p class="text-sm mb-2">
              <strong>Fan / Subscriber perspective:</strong> Drag-and-drop jars for budgeting (“Groceries”, “Fun money”, “Subs”). Move sats with zero fees.
            </p>
            <p class="text-sm">
              <strong>Creator perspective:</strong> Create an “Income” bucket that auto-receives new tips; split out taxes or savings instantly.
            </p>
          </div>

          <div class="interactive-card p-6">
            <h3 class="font-semibold text-lg mb-2">Subscriptions</h3>
            <p class="text-sm mb-2">
              <strong>Fan / Subscriber perspective:</strong> See every active plan: tier name, next renewal, cumulative sats spent. Cancel or renew with one click.
            </p>
            <p class="text-sm">
              <strong>Creator perspective:</strong> Quick list of paying supporters, tier breakdown, churn alerts and pending renewals.
            </p>
          </div>

          <div class="interactive-card p-6">
            <h3 class="font-semibold text-lg mb-2">Chats</h3>
            <p class="text-sm mb-2">
              <strong>Fan / Subscriber perspective:</strong> End-to-end encrypted DMs (Nostr kind 4). Attach images or Cashu tokens. Green flash means a payment is embedded and auto-redeemed on receipt.
            </p>
            <p class="text-sm">
              <strong>Creator perspective:</strong> Same powerful chat plus a broadcast toggle to message all subs in a tier at once.
            </p>
          </div>

          <div class="interactive-card p-6">
            <h3 class="font-semibold text-lg mb-2">Terms</h3>
            <p class="text-sm mb-2">
              <strong>Fan / Subscriber perspective:</strong> Human-readable, plain-English licence & disclaimers.
            </p>
            <p class="text-sm">
              <strong>Creator perspective:</strong> Identical — clarifies you keep full custody of funds.
            </p>
          </div>

          <div class="interactive-card p-6">
            <h3 class="font-semibold text-lg mb-2">About</h3>
            <p class="text-sm mb-2">
              <strong>Fan / Subscriber perspective:</strong> Learn everything in one scroll.
            </p>
            <p class="text-sm">
              <strong>Creator perspective:</strong> Ditto; includes creator-specific FAQs below.
            </p>
          </div>

          <div class="interactive-card p-6">
            <h3 class="font-semibold text-lg mb-2">External links</h3>
            <p class="text-sm mb-2">
              <strong>Fan / Subscriber perspective:</strong> Cashu.space docs, GitHub, Twitter, Telegram, Donate.
            </p>
            <p class="text-sm">
              <strong>Creator perspective:</strong> Identical — share with collaborators or fans.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Trust Through Transparency -->
    <section id="trust" class="py-16 px-4 fade-in-section">
      <div class="max-w-6xl mx-auto text-center">
        <h2 class="text-3xl md:text-5xl font-bold mb-12 gradient-text">
          Trust Through Transparency
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Card 1 -->
          <div class="interactive-card p-6 text-left flex flex-col">
            <div class="text-4xl mb-4">🐙</div>
            <h3 class="font-semibold text-xl mb-2">Open Source & Verifiable</h3>
            <p class="text-sm">
              Fundstr is built on open-source code. We invite you to inspect, verify, and contribute. Transparency is our core principle.
            </p>
          </div>

          <!-- Card 2 -->
          <div class="interactive-card p-6 text-left flex flex-col">
            <div class="text-4xl mb-4">🔑</div>
            <h3 class="font-semibold text-xl mb-2">You Hold the Keys</h3>
            <p class="text-sm">
              You are the sole holder of your ecash tokens and Nostr identity. Mints act as custodians for the underlying Bitcoin, but only you can spend your ecash.
            </p>
          </div>

          <!-- Card 3 -->
          <div class="interactive-card p-6 text-left flex flex-col">
            <div class="text-4xl mb-4">🛡️</div>
            <h3 class="font-semibold text-xl mb-2">Unbreakable Privacy</h3>
            <p class="text-sm">
              Thanks to Chaumian blind signatures, mints cannot link your deposits to your withdrawals. Your spending habits remain completely private.
            </p>
          </div>

          <!-- Card 4 -->
          <div class="interactive-card p-6 text-left flex flex-col">
            <div class="text-4xl mb-4">🪙</div>
            <h3 class="font-semibold text-xl mb-2">Mint Diversification</h3>
            <p class="text-sm">
              Fundstr supports multiple mints, allowing you to diversify your holdings. Our audit tools will warn you (⚠️) of any unusual mint behavior.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section id="faq" class="py-16 px-4 fade-in-section">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-3xl md:text-5xl font-bold mb-12 text-center gradient-text">
          Frequently Asked Questions
        </h2>

        <div class="space-y-4">
          <!-- Q1 -->
          <details class="interactive-card p-6">
            <summary class="cursor-pointer font-semibold text-lg">
              What if a fan stops paying?
            </summary>
            <p class="mt-4 text-sm">
              Creator view » Their timelocked token never unlocks for you. Fundstr flags the user as “Expired” and hides future paid posts. Fan view » You simply don’t renew. No recurring pull, no surprise charges.
            </p>
          </details>

          <!-- Q2 -->
          <details class="interactive-card p-6">
            <summary class="cursor-pointer font-semibold text-lg">
              Can I withdraw to a Lightning wallet?
            </summary>
            <p class="mt-4 text-sm">
              Yes. Go to Wallet → Send → Lightning Invoice, paste the invoice from any external wallet; Fundstr melts the tokens at the mint and pays it.
            </p>
          </details>

          <!-- Q3 -->
          <details class="interactive-card p-6">
            <summary class="cursor-pointer font-semibold text-lg">
              How private is this really?
            </summary>
            <ul class="mt-4 text-sm list-disc pl-6 space-y-1">
              <li>Mints see withdraw/redeem events but cannot correlate them.</li>
              <li>Nostr chats are E2E encrypted; Nutzaps use P2PK so only the intended receiver can claim them.</li>
              <li>Choose different mints or buckets to compartmentalise further.</li>
            </ul>
          </details>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="px-4">
      <!-- Community -->
      <section class="py-16 fade-in-section">
        <div class="max-w-4xl mx-auto text-center">
          <h2 class="text-3xl md:text-5xl font-bold mb-6 gradient-text">
            Join the Conversation
          </h2>
          <p class="mb-6">
            Follow the project and its creator on Nostr to stay up-to-date and connect with the community.
          </p>
          <div class="flex flex-col sm:flex-row justify-center gap-4 text-accent">
            <a
              href="#"
              class="interactive-card px-6 py-3 flex items-center justify-center gap-2"
              >👤 Creator's Profile</a
            >
            <a
              href="#"
              class="interactive-card px-6 py-3 flex items-center justify-center gap-2"
              >🚀 Fundstr Project Page</a
            >
          </div>
        </div>
      </section>

      <!-- Quote -->
      <section class="py-16 fade-in-section">
        <div class="max-w-5xl mx-auto">
          <blockquote>
            Fundstr is powered by open-source code and an open community. Whether you’re a storyteller earning sats or a fan supporting work you love, we hope this guide helps you navigate every page with confidence — and makes your next payment feel as effortless as a like, comment, or retweet.
          </blockquote>
        </div>
      </section>

      <!-- CTA -->
      <section id="cta" class="py-16 fade-in-section">
        <div class="max-w-4xl mx-auto text-center">
          <h2 class="text-3xl md:text-5xl font-bold mb-6 gradient-text">
            Ready to Join the Movement?
          </h2>
          <p class="mb-8">
            Install the PWA, explore the code, or help fund development.
          </p>
          <div class="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="#"
              class="px-8 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
              >Install PWA</a
            >
            <a
              href="#"
              class="px-8 py-3 rounded-full gradient-bg text-white font-semibold"
              >Support Fundstr</a
            >
          </div>
        </div>
      </section>
    </footer>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible')
      }
    })
  })

  document.querySelectorAll('.fade-in-section').forEach((el) => {
    observer.observe(el)
  })
})
</script>

<style scoped>
.about-page {
  --color-accent: #22d3ee;
  --color-accent-rgb: 34, 211, 238;
  font-family: 'Inter', sans-serif;
  background-color: #0a0a0a;
  background-image: radial-gradient(#1e293b 1px, transparent 1px);
  background-size: 20px 20px;
  color: #e2e8f0;
}

.gradient-text {
  background: linear-gradient(90deg, #a78bfa, #f472b6);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.gradient-bg {
  background: linear-gradient(90deg, #a78bfa, #f472b6);
}

.interactive-card {
  background-color: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  border: 1px solid #1e293b;
  border-radius: 0.75rem;
  transition: all 0.3s ease;
}

.interactive-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 0 25px rgba(var(--color-accent-rgb), 0.2);
  border-color: rgba(var(--color-accent-rgb), 0.4);
}

.fade-in-section {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

.fade-in-section.is-visible {
  opacity: 1;
  transform: none;
}

blockquote {
  border-left: 4px solid var(--color-accent);
  padding-left: 1rem;
  font-style: italic;
}
</style>

