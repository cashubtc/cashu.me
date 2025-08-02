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
      <div
        class="alpha-warning mt-8 max-w-3xl mx-auto flex items-start gap-3 animate-pulse"
        role="alert"
      >
        <span class="text-3xl">⚠️</span>
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

    <!-- Site Overview -->
    <section id="site-overview" class="py-16 px-4 fade-in-section">
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="text-3xl md:text-5xl font-bold mb-6 gradient-text">
          {{ $t('AboutPage.siteOverview.title') }}
        </h2>
        <ul class="text-lg md:text-xl space-y-4 text-left">
          <li>
            <router-link to="/wallet" class="text-accent font-semibold">
              {{ $t('MainHeader.menu.wallet.title') }}
            </router-link>
            – {{ $t('AboutPage.siteOverview.wallet') }}
          </li>
          <li>
            <router-link to="/find-creators" class="text-accent font-semibold">
              {{ $t('MainHeader.menu.findCreators.title') }}
            </router-link>
            – {{ $t('AboutPage.siteOverview.findCreators') }}
          </li>
          <li>
            <router-link to="/creator-hub" class="text-accent font-semibold">
              {{ $t('MainHeader.menu.creatorHub.title') }}
            </router-link>
            – {{ $t('AboutPage.siteOverview.creatorHub') }}
          </li>
          <li>
            <router-link to="/my-profile" class="text-accent font-semibold">
              {{ $t('MainHeader.menu.myProfile.title') }}
            </router-link>
            – {{ $t('AboutPage.siteOverview.myProfile') }}
          </li>
          <li>
            <router-link to="/buckets" class="text-accent font-semibold">
              {{ $t('MainHeader.menu.buckets.title') }}
            </router-link>
            – {{ $t('AboutPage.siteOverview.buckets') }}
          </li>
          <li>
            <router-link to="/subscriptions" class="text-accent font-semibold">
              {{ $t('MainHeader.menu.subscriptions.title') }}
            </router-link>
            – {{ $t('AboutPage.siteOverview.subscriptions') }}
          </li>
          <li>
            <router-link to="/nostr-messenger" class="text-accent font-semibold">
              {{ $t('AboutPage.siteOverview.nostrMessengerTitle') }}
            </router-link>
            – {{ $t('AboutPage.siteOverview.nostrMessenger') }}
          </li>
          <li>
            <router-link to="/settings" class="text-accent font-semibold">
              {{ $t('MainHeader.menu.settings.title') }}
            </router-link>
            – {{ $t('AboutPage.siteOverview.settings') }}
          </li>
        </ul>
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
        <div class="grid grid-cols-1 md:grid-cols-3 items-center gap-6">
          <!-- Step 1 -->
          <button
            type="button"
            class="step-card interactive-card p-6 flex flex-col items-center focus:outline-none"
            @click="dialogStep1 = true"
            @keyup.enter="dialogStep1 = true"
            tabindex="0"
          >
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
          </button>

          <!-- Step 2 -->
          <button
            type="button"
            class="step-card interactive-card p-6 flex flex-col items-center focus:outline-none"
            @click="dialogStep2 = true"
            @keyup.enter="dialogStep2 = true"
            tabindex="0"
          >
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
          </button>

          <!-- Step 3 -->
          <button
            type="button"
            class="step-card interactive-card p-6 flex flex-col items-center focus:outline-none"
            @click="dialogStep3 = true"
            @keyup.enter="dialogStep3 = true"
            tabindex="0"
          >
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
          </button>
        </div>

        <!-- Dialogs -->
        <q-dialog v-model="dialogStep1">
          <q-card>
            <q-card-section class="text-h6">Your Bitcoin</q-card-section>
            <q-card-section>
              Start with sats from any wallet. For example, swap 100k sats for ecash to send privately.
            </q-card-section>
            <q-card-actions align="right">
              <q-btn flat label="Close" v-close-popup />
            </q-card-actions>
          </q-card>
        </q-dialog>

        <q-dialog v-model="dialogStep2">
          <q-card>
            <q-card-section class="text-h6">The Mint</q-card-section>
            <q-card-section>
              The mint issues blind signed tokens in exchange for your bitcoin. Example: deposit 100k sats and receive
              ecash you can split and spend.
            </q-card-section>
            <q-card-actions align="right">
              <q-btn flat label="Close" v-close-popup />
            </q-card-actions>
          </q-card>
        </q-dialog>

        <q-dialog v-model="dialogStep3">
          <q-card>
            <q-card-section class="text-h6">Fundstr Wallet</q-card-section>
            <q-card-section>
              Store and send ecash privately. For instance, forward tokens to a friend or redeem them back for bitcoin
              later.
            </q-card-section>
            <q-card-actions align="right">
              <q-btn flat label="Close" v-close-popup />
            </q-card-actions>
          </q-card>
        </q-dialog>
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

        <!-- Perspective Toggle -->
        <div class="mb-8 flex justify-center gap-4">
          <q-btn
            rounded
            unelevated
            color="primary"
            label="Fan / Subscriber"
            :outline="viewMode !== 'fan'"
            @click="viewMode = 'fan'"
          />
          <q-btn
            rounded
            unelevated
            color="primary"
            label="Creator"
            :outline="viewMode !== 'creator'"
            @click="viewMode = 'creator'"
          />
        </div>

        <!-- Desktop Table -->
        <div class="hidden md:block">
          <div class="interactive-card p-2 overflow-x-auto">
            <table class="min-w-full text-left">
              <thead class="border-b border-gray-700 text-sm uppercase">
                <tr>
                  <th class="p-4">🧭 Menu item</th>
                  <th class="p-4">
                    {{
                      viewMode === 'fan'
                        ? 'Fan / Subscriber perspective'
                        : 'Creator perspective'
                    }}
                  </th>
                </tr>
              </thead>
              <tbody class="text-sm">
                <tr
                  v-for="(item, index) in navigationItems"
                  :key="item.menuItem"
                  :class="{ 'border-b border-gray-800': index !== navigationItems.length - 1 }"
                >
                  <td class="p-4 font-semibold">{{ item.menuItem }}</td>
                  <td class="p-4">
                    {{ viewMode === 'fan' ? item.fanText : item.creatorText }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Mobile Cards -->
        <div class="md:hidden space-y-4">
          <div
            v-for="item in navigationItems"
            :key="item.menuItem"
            class="interactive-card p-6"
          >
            <h3 class="font-semibold text-lg mb-2">{{ item.menuItem }}</h3>
            <p class="text-sm">
              <strong
                >{{
                  viewMode === 'fan'
                    ? 'Fan / Subscriber perspective:'
                    : 'Creator perspective:'
                }}</strong
              >
              {{ viewMode === 'fan' ? item.fanText : item.creatorText }}
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

<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface NavigationItem {
  menuItem: string
  fanText: string
  creatorText: string
}

const dialogStep1 = ref(false)
const dialogStep2 = ref(false)
const dialogStep3 = ref(false)
const viewMode = ref<'fan' | 'creator'>('fan')

const navigationItems = ref<NavigationItem[]>([
  {
    menuItem: 'Settings',
    fanText:
      'Add / switch mints, choose display unit, set language & theme, import or back-up your 12-word seed, manage Nostr keys & relays.',
    creatorText:
      'Same, plus Publishing settings: toggle automatic NIP-61 profile updates and set a default “Earnings” bucket.',
  },
  {
    menuItem: 'Find Creators',
    fanText:
      'Search or browse Nostr-indexed profiles. View tier prices, previews and public posts. Hit Subscribe or Zap with a single tap.',
    creatorText:
      'Your public storefront as seen by visitors. Great for a quick audit of how your profile appears worldwide.',
  },
  {
    menuItem: 'Creator Hub',
    fanText: '— (hidden unless you toggle “Creator Mode”)',
    creatorText:
      'Define or edit tiers (price, duration, perks), upload cover art, publish pay-walled posts, check revenue analytics and subscriber list.',
  },
  {
    menuItem: 'My Profile',
    fanText:
      'Show off your avatar, npub link and optional NIP-05. Personal stats: total zaps sent & received, bucket balances.',
    creatorText:
      'Same card plus Edit. Update bio, tags and the secondary P2PK key used by fans to send you locked tokens.',
  },
  {
    menuItem: 'Buckets',
    fanText:
      'Drag-and-drop jars for budgeting (“Groceries”, “Fun money”, “Subs”). Move sats with zero fees.',
    creatorText:
      'Create an “Income” bucket that auto-receives new tips; split out taxes or savings instantly.',
  },
  {
    menuItem: 'Subscriptions',
    fanText:
      'See every active plan: tier name, next renewal, cumulative sats spent. Cancel or renew with one click.',
    creatorText:
      'Quick list of paying supporters, tier breakdown, churn alerts and pending renewals.',
  },
  {
    menuItem: 'Chats',
    fanText:
      'End-to-end encrypted DMs (Nostr kind 4). Attach images or Cashu tokens. Green flash means a payment is embedded and auto-redeemed on receipt.',
    creatorText:
      'Same powerful chat plus a broadcast toggle to message all subs in a tier at once.',
  },
  {
    menuItem: 'Terms',
    fanText: 'Human-readable, plain-English licence & disclaimers.',
    creatorText: 'Identical — clarifies you keep full custody of funds.',
  },
  {
    menuItem: 'About',
    fanText: 'Learn everything in one scroll.',
    creatorText: 'Ditto; includes creator-specific FAQs below.',
  },
  {
    menuItem: 'External links',
    fanText: 'Cashu.space docs, GitHub, Twitter, Telegram, Donate.',
    creatorText: 'Identical — share with collaborators or fans.',
  },
])

onMounted(() => {
  if ('IntersectionObserver' in window) {
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
  } else {
    document
      .querySelectorAll('.fade-in-section')
      .forEach((el) => el.classList.add('is-visible'))
  }
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
  color: #e2e8f0;
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

.step-card {
  position: relative;
}

.step-card::after {
  content: '→';
  position: absolute;
  top: 50%;
  right: -1.5rem;
  transform: translateY(-50%);
  font-size: 2rem;
  color: currentColor;
}

.step-card:last-child::after {
  content: '';
}

@media (max-width: 768px) {
  .step-card::after {
    content: '↓';
    top: auto;
    bottom: -1.5rem;
    left: 50%;
    right: auto;
    transform: translateX(-50%);
    font-size: 1.5rem;
  }
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

.alpha-warning {
  background-color: rgba(120, 53, 15, 0.2);
  border: 1px solid rgba(245, 158, 11, 0.3);
  color: #fcd34d;
  border-radius: 0.5rem;
  padding: 1.5rem;
  font-size: 1.25rem;
  font-weight: 700;
  box-shadow: 0 0 10px rgba(245, 158, 11, 0.5);
}

@media (min-width: 768px) {
  .alpha-warning {
    font-size: 1.5rem;
  }
}
</style>

