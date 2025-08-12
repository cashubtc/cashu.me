<template>
  <div class="about-page antialiased">
    <!-- Header -->
    <header class="text-center py-16 px-4 fade-in-section">
      <h1 class="text-5xl md:text-7xl font-extrabold mb-6">
        About <span class="gradient-text">Fundstr</span>
      </h1>
      <p class="max-w-3xl mx-auto text-lg md:text-xl">
        A privacy-first Bitcoin wallet, social chat, and creator-monetisation
        hub built on the open-source Cashu ecash protocol and the decentralised
        Nostr network.
      </p>
      <div
        class="alpha-warning mt-8 max-w-3xl mx-auto flex items-start gap-3 animate-pulse"
        role="alert"
      >
        <span class="text-3xl">⚠️</span>
        <p>
          Fundstr is experimental alpha software. Features may break or change,
          and loss of funds is possible. Use only small amounts you can afford
          to lose.
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
          We believe in a world where your financial life and social
          interactions are truly your own. Fundstr is an experiment in creating
          a parallel, peer-to-peer economy—free from corporate gatekeepers,
          surveillance, and unpredictable fees. It’s a gateway to a more
          sovereign way of connecting and transacting.
        </p>
      </div>
    </section>

    <!-- Site Overview -->
    <section id="site-overview" class="py-16 px-4 fade-in-section">
      <div class="max-w-6xl mx-auto text-center">
        <h2 class="text-3xl md:text-5xl font-bold mb-6 gradient-text">
          {{ $t("AboutPage.siteOverview.title") }}
        </h2>
        <div
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 text-left"
        >
          <router-link
            v-for="card in siteOverviewCards"
            :key="card.route"
            :to="card.route"
            class="interactive-card p-6 md:p-8 flex flex-col cursor-pointer"
          >
            <q-icon
              :name="$t(card.iconKey)"
              size="2.5rem"
              class="text-white mb-4"
            />
            <p class="text-accent font-semibold">
              {{ $t(card.titleKey) }}
            </p>
            <p class="text-sm mt-2">
              {{ $t(card.descriptionKey) }}
            </p>
          </router-link>
        </div>
      </div>
    </section>

    <!-- How Ecash Works -->
    <section id="how-it-works" class="py-16 px-4 fade-in-section">
      <div class="max-w-5xl mx-auto text-center">
        <h2 class="text-3xl md:text-5xl font-bold mb-6 gradient-text">
          How Ecash Works
        </h2>
        <p class="text-lg md:text-xl mb-12">
          The loop is simple: Bitcoin in → private e-cash out → social payments
          everywhere.
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
              Start with sats from any wallet. For example, swap 100k sats for
              ecash to send privately.
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
              The mint issues blind signed tokens in exchange for your bitcoin.
              Example: deposit 100k sats and receive ecash you can split and
              spend.
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
              Store and send ecash privately. For instance, forward tokens to a
              friend or redeem them back for bitcoin later.
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
              Monetize your audience directly, free from de-platforming and high
              fees.
            </p>
          </div>

          <!-- Card 2 -->
          <div class="interactive-card p-6">
            <div class="text-4xl mb-4">🛡️</div>
            <h3 class="font-semibold text-xl mb-2">Privacy Advocates</h3>
            <p class="text-sm">
              Transact with confidence that your financial life isn't being
              tracked.
            </p>
          </div>

          <!-- Card 3 -->
          <div class="interactive-card p-6">
            <div class="text-4xl mb-4">🔗</div>
            <h3 class="font-semibold text-xl mb-2">Nostr Users</h3>
            <p class="text-sm">
              Upgrade your zaps to be truly private and integrate payments
              seamlessly.
            </p>
          </div>

          <!-- Card 4 -->
          <div class="interactive-card p-6">
            <div class="text-4xl mb-4">🌐</div>
            <h3 class="font-semibold text-xl mb-2">Global Citizens</h3>
            <p class="text-sm">
              Move value across borders instantly, without relying on
              traditional banking.
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
        <div id="map-container" class="mt-8 text-left" ref="mapContainer">
          <q-tabs
            v-model="mode"
            align="center"
            dense
            class="mb-6"
            aria-label="Toggle between fan and creator modes"
            :active-color="mode === 'fan' ? 'accent' : 'primary'"
            :indicator-color="mode === 'fan' ? 'accent' : 'primary'"
          >
            <q-tab name="fan" label="Fan" :aria-selected="mode === 'fan'" />
            <q-tab
              name="creator"
              label="Creator"
              :aria-selected="mode === 'creator'"
            />
          </q-tabs>

          <q-list class="accordion">
            <q-expansion-item
              v-for="(item, idx) in navigationItems"
              :key="item.menuItem"
              :label="item.menuItem"
              :icon="item.icon"
              group="navigation"
              class="border-b accordion-item"
              :class="{ open: openIndex === idx }"
              @show="openIndex = idx"
              @hide="openIndex = null"
              expand-icon="keyboard_arrow_down"
              expanded-icon="keyboard_arrow_down"
            >
              <div class="px-4 pb-4 text-sm">
                <div class="fan-content">
                  <h4 class="font-semibold mb-2">
                    {{ $t("AboutPage.navigation.fanPerspective") }}
                  </h4>
                  <p>{{ item.fanText }}</p>
                </div>
                <div class="creator-content">
                  <h4 class="font-semibold mb-2">
                    {{ $t("AboutPage.navigation.creatorPerspective") }}
                  </h4>
                  <p>{{ item.creatorText }}</p>
                </div>
              </div>
            </q-expansion-item>
          </q-list>
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
          <details class="interactive-card p-6 text-left">
            <summary class="cursor-pointer">
              <span class="block text-4xl mb-4">🐙</span>
              <span class="block font-semibold text-xl mb-2"
                >Open Source & Verifiable</span
              >
              <span class="block text-sm"
                >Fundstr is built on open-source code. We invite you to inspect,
                verify, and contribute. Transparency is our core
                principle.</span
              >
            </summary>
            <div class="mt-4 text-sm space-y-2">
              <p>
                Anyone can audit our wallet and mint implementations or even
                reproduce the exact binaries we ship.
              </p>
              <ul class="list-disc pl-6 space-y-1">
                <li>
                  <a
                    href="https://opensource.org/osd?utm_source=chatgpt.com"
                    target="_blank"
                    rel="noopener"
                    >Open Source Definition</a
                  >
                </li>
                <li>
                  <a
                    href="https://github.com/cashubtc?utm_source=chatgpt.com"
                    target="_blank"
                    rel="noopener"
                    >Cashu organisation on GitHub</a
                  >
                </li>
                <li>
                  <a
                    href="https://linderud.dev/blog/nixos-is-not-reproducible/?utm_source=chatgpt.com"
                    target="_blank"
                    rel="noopener"
                    >Build provenance and reproducible builds</a
                  >
                </li>
                <li>
                  <a
                    href="https://telegram.org/blog/verifiable-apps-and-more?utm_source=chatgpt.com"
                    target="_blank"
                    rel="noopener"
                    >Telegram's verifiable builds programme</a
                  >
                </li>
              </ul>
            </div>
          </details>

          <!-- Card 2 -->
          <details class="interactive-card p-6 text-left">
            <summary class="cursor-pointer">
              <span class="block text-4xl mb-4">🔑</span>
              <span class="block font-semibold text-xl mb-2"
                >You Hold the Keys</span
              >
              <span class="block text-sm"
                >You are the sole holder of your ecash tokens and Nostr
                identity. Mints act as custodians for the underlying Bitcoin,
                but only you can spend your ecash.</span
              >
            </summary>
            <div class="mt-4 text-sm space-y-2">
              <p>
                Owning your private key means only you can authorise payments or
                posts.
              </p>
              <ul class="list-disc pl-6 space-y-1">
                <li>
                  <a
                    href="https://www.coindesk.com/learn/what-is-crypto-custody?utm_source=chatgpt.com"
                    target="_blank"
                    rel="noopener"
                    >CoinDesk: What is crypto custody?</a
                  >
                </li>
                <li>
                  <a
                    href="https://www.investopedia.com/terms/p/private-key.asp?utm_source=chatgpt.com"
                    target="_blank"
                    rel="noopener"
                    >Investopedia: Private keys explained</a
                  >
                </li>
                <li>
                  <a
                    href="https://github.com/nostr-protocol/nips?utm_source=chatgpt.com"
                    target="_blank"
                    rel="noopener"
                    >Nostr Implementation Possibilities (NIPs)</a
                  >
                </li>
              </ul>
            </div>
          </details>

          <!-- Card 3 -->
          <details class="interactive-card p-6 text-left">
            <summary class="cursor-pointer">
              <span class="block text-4xl mb-4">🛡️</span>
              <span class="block font-semibold text-xl mb-2"
                >Unbreakable Privacy</span
              >
              <span class="block text-sm"
                >Thanks to Chaumian blind signatures, mints cannot link your
                deposits to your withdrawals. Your spending habits remain
                completely private.</span
              >
            </summary>
            <div class="mt-4 text-sm space-y-2">
              <p>
                Blind signatures break the trail between your deposits and
                spends, even from the mint itself.
              </p>
              <ul class="list-disc pl-6 space-y-1">
                <li>
                  <a
                    href="https://sceweb.sce.uhcl.edu/yang/teaching/csci5234WebSecurityFall2011/Chaum-blind-signatures.PDF?utm_source=chatgpt.com"
                    target="_blank"
                    rel="noopener"
                    >David Chaum's original paper</a
                  >
                </li>
                <li>
                  <a
                    href="https://medium.com/rootstock-tech-blog/blind-signatures-af6338da6347?utm_source=chatgpt.com"
                    target="_blank"
                    rel="noopener"
                    >Rootstock: blind signatures explainer</a
                  >
                </li>
                <li>
                  <a
                    href="https://delvingbitcoin.org/t/building-intuition-for-the-cashu-blind-signature-scheme/506?utm_source=chatgpt.com"
                    target="_blank"
                    rel="noopener"
                    >Building intuition for Cashu's scheme</a
                  >
                </li>
                <li>
                  <a
                    href="https://blog.cashu.space/buckets-of-blind-signatures/?utm_source=chatgpt.com"
                    target="_blank"
                    rel="noopener"
                    >Buckets of blind signatures</a
                  >
                </li>
                <li>
                  <a
                    href="https://bitcoin.design/guide/how-it-works/ecash/cashu/?utm_source=chatgpt.com"
                    target="_blank"
                    rel="noopener"
                    >Bitcoin Design guide: Cashu overview</a
                  >
                </li>
              </ul>
            </div>
          </details>

          <!-- Card 4 -->
          <details class="interactive-card p-6 text-left">
            <summary class="cursor-pointer">
              <span class="block text-4xl mb-4">🪙</span>
              <span class="block font-semibold text-xl mb-2"
                >Mint Diversification</span
              >
              <span class="block text-sm"
                >Fundstr supports multiple mints, allowing you to diversify your
                holdings. Our audit tools will warn you (⚠️) of any unusual mint
                behavior.</span
              >
            </summary>
            <div class="mt-4 text-sm space-y-2">
              <p>
                Spreading tokens across independent mints limits custodial risk.
              </p>
              <ul class="list-disc pl-6 space-y-1">
                <li>
                  <a
                    href="https://docs.cashu.space/mints?utm_source=chatgpt.com"
                    target="_blank"
                    rel="noopener"
                    >Cashu docs: mints</a
                  >
                </li>
                <li>
                  <a
                    href="https://bitcoinmagazine.com/technical/the-emerging-bitcoin-modular-ecosystem?utm_source=chatgpt.com"
                    target="_blank"
                    rel="noopener"
                    >Bitcoin Magazine: modular ecosystem</a
                  >
                </li>
                <li>
                  <a
                    href="https://github.com/cashubtc/awesome-cashu?utm_source=chatgpt.com"
                    target="_blank"
                    rel="noopener"
                    >Awesome Cashu resources</a
                  >
                </li>
                <li>
                  <a
                    href="https://www.nasdaq.com/articles/how-to-guide%3A-running-an-ecash-mint?utm_source=chatgpt.com"
                    target="_blank"
                    rel="noopener"
                    >Nasdaq guide: running an ecash mint</a
                  >
                </li>
              </ul>
            </div>
          </details>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section id="faq" class="py-16 px-4 fade-in-section">
      <div class="max-w-4xl mx-auto">
        <h2
          class="text-3xl md:text-5xl font-bold mb-12 text-center gradient-text"
        >
          Frequently Asked Questions
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Q1 -->
          <details class="interactive-card p-4">
            <summary class="cursor-pointer font-semibold text-lg">
              What if a fan stops paying?
            </summary>
            <p class="mt-4 text-sm">
              Creator view » Their timelocked token never unlocks for you.
              Fundstr flags the user as “Expired” and hides future paid posts.
              Fan view » You simply don’t renew. No recurring pull, no surprise
              charges.
            </p>
          </details>

          <!-- Q2 -->
          <details class="interactive-card p-4">
            <summary class="cursor-pointer font-semibold text-lg">
              Can I withdraw to a Lightning wallet?
            </summary>
            <p class="mt-4 text-sm">
              Yes. Go to Wallet → Send → Lightning Invoice, paste the invoice
              from any external wallet; Fundstr melts the tokens at the mint and
              pays it.
            </p>
          </details>

          <!-- Q3 -->
          <details class="interactive-card p-4">
            <summary class="cursor-pointer font-semibold text-lg">
              How private is this really?
            </summary>
            <ul class="mt-4 text-sm list-disc pl-6 space-y-1">
              <li>
                Mints see withdraw/redeem events but cannot correlate them.
              </li>
              <li>
                Nostr chats are E2E encrypted; Nutzaps use P2PK so only the
                intended receiver can claim them.
              </li>
              <li>
                Choose different mints or buckets to compartmentalise further.
              </li>
            </ul>
          </details>

          <!-- Q4 -->
          <details class="interactive-card p-4">
            <summary class="cursor-pointer font-semibold text-lg">
              What exactly is Cashu and how is it different from regular Bitcoin
              or Lightning wallets?
            </summary>
            <p class="mt-4 text-sm">
              Cashu uses Chaumian e‑cash, allowing the mint to issue anonymized
              tokens. Unlike typical wallets, your transactions never appear on
              the blockchain, and the mint cannot link where your tokens are
              spent.
            </p>
          </details>

          <!-- Q5 -->
          <details class="interactive-card p-4">
            <summary class="cursor-pointer font-semibold text-lg">
              Do I need to trust a mint, and what happens if a mint goes
              offline?
            </summary>
            <p class="mt-4 text-sm">
              A mint is required to issue and redeem tokens. If it disappears,
              any tokens it issued become unusable. To reduce risk, you can hold
              small balances, spread funds across multiple mints, and withdraw
              or swap tokens when you suspect a mint might fail.
            </p>
          </details>

          <!-- Q6 -->
          <details class="interactive-card p-4">
            <summary class="cursor-pointer font-semibold text-lg">
              How can I back up or restore my wallet?
            </summary>
            <p class="mt-4 text-sm">
              During setup you can generate a BIP‑39 seed. Record it safely; if
              your device is lost, reinstall the app, enter the seed, and
              reconnect to your mints to restore unspent tokens. Without a seed
              or token export, lost devices mean lost funds.
            </p>
          </details>

          <!-- Q7 -->
          <details class="interactive-card p-4">
            <summary class="cursor-pointer font-semibold text-lg">
              What are “Buckets” and why would I use them?
            </summary>
            <p class="mt-4 text-sm">
              Buckets act like sub‑accounts. You can allocate tokens to
              categories (e.g., savings, subscriptions) and move funds between
              buckets instantly, which helps with budgeting or keeping project
              funds separate.
            </p>
          </details>

          <!-- Q8 -->
          <details class="interactive-card p-4">
            <summary class="cursor-pointer font-semibold text-lg">
              How does the Nostr integration work?
            </summary>
            <p class="mt-4 text-sm">
              The app can generate or import a Nostr key pair, connect to
              relays, and send encrypted DMs. This enables token transfers and
              tipping directly through Nostr events without exposing invoices or
              addresses.
            </p>
          </details>

          <!-- Q9 -->
          <details class="interactive-card p-4">
            <summary class="cursor-pointer font-semibold text-lg">
              What are Nutzaps and how do I receive them?
            </summary>
            <p class="mt-4 text-sm">
              Nutzaps let users send Cashu tokens as Nostr “zap” events. Publish
              your NIP‑61 profile (the app guides you), and others can tip you
              using ecash locked to your Nostr wallet key, keeping the payment
              private yet publicly verifiable.
            </p>
          </details>

          <!-- Q10 -->
          <details class="interactive-card p-4">
            <summary class="cursor-pointer font-semibold text-lg">
              Can I connect the wallet to other Nostr‑enabled apps?
            </summary>
            <p class="mt-4 text-sm">
              Yes. Nostr Wallet Connect (NWC) provides a QR code and secret key.
              Pair it with supported apps, and they can request payments or
              signatures through Nostr events that you approve inside the
              wallet.
            </p>
          </details>

          <!-- Q11 -->
          <details class="interactive-card p-4">
            <summary class="cursor-pointer font-semibold text-lg">
              Are there any fees for using Cashu tokens?
            </summary>
            <p class="mt-4 text-sm">
              Sending tokens between users is free. Fees may apply when minting
              or melting tokens via Lightning, depending on the mint’s policy
              and Lightning network costs. The app shows mint‑specific fees
              before you confirm a transaction.
            </p>
          </details>

          <!-- Q12 -->
          <details class="interactive-card p-4">
            <summary class="cursor-pointer font-semibold text-lg">
              Does the app work offline?
            </summary>
            <p class="mt-4 text-sm">
              You can view balances, buckets, and message history offline.
              Creating or redeeming tokens, chatting, and nutzap processing
              require an internet connection to reach the mint and Nostr relays.
            </p>
          </details>

          <!-- Q13 -->
          <details class="interactive-card p-4">
            <summary class="cursor-pointer font-semibold text-lg">
              Is the code open source and can I run it myself?
            </summary>
            <p class="mt-4 text-sm">
              Yes. The entire project is MIT‑licensed. You can review, fork, or
              self‑host the repository. Advanced users can also run their own
              mint and point the wallet at it for full control over issuance and
              redemption.
            </p>
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
            Follow the project and its creator on Nostr to stay up-to-date and
            connect with the community.
          </p>
          <div
            class="flex flex-col sm:flex-row justify-center gap-4 text-accent"
          >
            <a
              href="https://primal.net/KalonAxiarch"
              target="_blank"
              rel="noopener noreferrer"
              class="interactive-card px-6 py-3 flex items-center justify-center gap-2"
              >👤 Creator's Profile</a
            >
            <a
              href="#"
              class="interactive-card px-6 py-3 flex items-center justify-center gap-2"
              >🚀 Fundstr Project Page</a
            >
            <a
              href="/find-creators?npub=npub1aljmhjp5tqrw3m60ra7t3u8uqq223d6rdg9q0h76a8djd9m4hmvsmlj82m"
              class="interactive-card px-6 py-3 flex items-center justify-center gap-2"
              >💰 View KalonAxiarch's Tiers</a
            >
          </div>
        </div>
      </section>

      <!-- Quote -->
      <section class="py-16 fade-in-section">
        <div class="max-w-5xl mx-auto">
          <blockquote>
            Fundstr is powered by open-source code and an open community.
            Whether you’re a storyteller earning sats or a fan supporting work
            you love, we hope this guide helps you navigate every page with
            confidence — and makes your next payment feel as effortless as a
            like, comment, or retweet.
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
import { onMounted, ref, watch, computed } from "vue";
import { useI18n } from "vue-i18n";

interface NavigationItem {
  menuItem: string;
  icon: string;
  fanText: string;
  creatorText: string;
}

const dialogStep1 = ref(false);
const dialogStep2 = ref(false);
const dialogStep3 = ref(false);

const { t } = useI18n();

interface SiteOverviewCard {
  route: string;
  titleKey: string;
  descriptionKey: string;
  iconKey: string;
}

const siteOverviewCards: SiteOverviewCard[] = [
  {
    route: "/wallet",
    titleKey: "MainHeader.menu.wallet.title",
    descriptionKey: "AboutPage.siteOverview.wallet.description",
    iconKey: "AboutPage.siteOverview.wallet.icon",
  },
  {
    route: "/find-creators",
    titleKey: "MainHeader.menu.findCreators.title",
    descriptionKey: "AboutPage.siteOverview.findCreators.description",
    iconKey: "AboutPage.siteOverview.findCreators.icon",
  },
  {
    route: "/creator-hub",
    titleKey: "MainHeader.menu.creatorHub.title",
    descriptionKey: "AboutPage.siteOverview.creatorHub.description",
    iconKey: "AboutPage.siteOverview.creatorHub.icon",
  },
  {
    route: "/my-profile",
    titleKey: "MainHeader.menu.myProfile.title",
    descriptionKey: "AboutPage.siteOverview.myProfile.description",
    iconKey: "AboutPage.siteOverview.myProfile.icon",
  },
  {
    route: "/buckets",
    titleKey: "MainHeader.menu.buckets.title",
    descriptionKey: "AboutPage.siteOverview.buckets.description",
    iconKey: "AboutPage.siteOverview.buckets.icon",
  },
  {
    route: "/subscriptions",
    titleKey: "MainHeader.menu.subscriptions.title",
    descriptionKey: "AboutPage.siteOverview.subscriptions.description",
    iconKey: "AboutPage.siteOverview.subscriptions.icon",
  },
  {
    route: "/nostr-messenger",
    titleKey: "MainHeader.menu.nostrMessenger.title",
    descriptionKey: "AboutPage.siteOverview.nostrMessenger.description",
    iconKey: "AboutPage.siteOverview.nostrMessenger.icon",
  },
  {
    route: "/settings",
    titleKey: "MainHeader.menu.settings.title",
    descriptionKey: "AboutPage.siteOverview.settings.description",
    iconKey: "AboutPage.siteOverview.settings.icon",
  },
  {
    route: "/restore",
    titleKey: "MainHeader.menu.restore.title",
    descriptionKey: "AboutPage.siteOverview.restore.description",
    iconKey: "AboutPage.siteOverview.restore.icon",
  },
  {
    route: "/already-running",
    titleKey: "MainHeader.menu.alreadyRunning.title",
    descriptionKey: "AboutPage.siteOverview.alreadyRunning.description",
    iconKey: "AboutPage.siteOverview.alreadyRunning.icon",
  },
  {
    route: "/welcome",
    titleKey: "MainHeader.menu.welcome.title",
    descriptionKey: "AboutPage.siteOverview.welcome.description",
    iconKey: "AboutPage.siteOverview.welcome.icon",
  },
  {
    route: "/terms",
    titleKey: "MainHeader.menu.terms.title",
    descriptionKey: "AboutPage.siteOverview.terms.description",
    iconKey: "AboutPage.siteOverview.terms.icon",
  },
  {
    route: "/nostr-login",
    titleKey: "MainHeader.menu.nostrLogin.title",
    descriptionKey: "AboutPage.siteOverview.nostrLogin.description",
    iconKey: "AboutPage.siteOverview.nostrLogin.icon",
  },
];

// navigation items for the navigation map
const navigationItems = computed<NavigationItem[]>(() => [
  {
    menuItem: t("MainHeader.menu.wallet.title"),
    icon: "account_balance_wallet",
    fanText: t("AboutPage.navigation.items.wallet.fan"),
    creatorText: t("AboutPage.navigation.items.wallet.creator"),
  },
  {
    menuItem: t("MainHeader.menu.settings.title"),
    icon: "settings",
    fanText: t("AboutPage.navigation.items.settings.fan"),
    creatorText: t("AboutPage.navigation.items.settings.creator"),
  },
  {
    menuItem: t("MainHeader.menu.findCreators.title"),
    icon: "img:icons/find-creators.svg",
    fanText: t("AboutPage.navigation.items.findCreators.fan"),
    creatorText: t("AboutPage.navigation.items.findCreators.creator"),
  },
  {
    menuItem: t("MainHeader.menu.creatorHub.title"),
    icon: "img:icons/creator-hub.svg",
    fanText: t("AboutPage.navigation.items.creatorHub.fan"),
    creatorText: t("AboutPage.navigation.items.creatorHub.creator"),
  },
  {
    menuItem: t("MainHeader.menu.myProfile.title"),
    icon: "person",
    fanText: t("AboutPage.navigation.items.myProfile.fan"),
    creatorText: t("AboutPage.navigation.items.myProfile.creator"),
  },
  {
    menuItem: t("MainHeader.menu.buckets.title"),
    icon: "inventory_2",
    fanText: t("AboutPage.navigation.items.buckets.fan"),
    creatorText: t("AboutPage.navigation.items.buckets.creator"),
  },
  {
    menuItem: t("MainHeader.menu.subscriptions.title"),
    icon: "auto_awesome_motion",
    fanText: t("AboutPage.navigation.items.subscriptions.fan"),
    creatorText: t("AboutPage.navigation.items.subscriptions.creator"),
  },
  {
    menuItem: t("MainHeader.menu.nostrMessenger.title"),
    icon: "chat",
    fanText: t("AboutPage.navigation.items.chats.fan"),
    creatorText: t("AboutPage.navigation.items.chats.creator"),
  },
  {
    menuItem: t("MainHeader.menu.restore.title"),
    icon: "settings_backup_restore",
    fanText: t("AboutPage.navigation.items.restore.fan"),
    creatorText: t("AboutPage.navigation.items.restore.creator"),
  },
  {
    menuItem: t("MainHeader.menu.alreadyRunning.title"),
    icon: "warning",
    fanText: t("AboutPage.navigation.items.alreadyRunning.fan"),
    creatorText: t("AboutPage.navigation.items.alreadyRunning.creator"),
  },
  {
    menuItem: t("MainHeader.menu.welcome.title"),
    icon: "info",
    fanText: t("AboutPage.navigation.items.welcome.fan"),
    creatorText: t("AboutPage.navigation.items.welcome.creator"),
  },
  {
    menuItem: t("MainHeader.menu.terms.title"),
    icon: "gavel",
    fanText: t("AboutPage.navigation.items.terms.fan"),
    creatorText: t("AboutPage.navigation.items.terms.creator"),
  },
  {
    menuItem: t("MainHeader.menu.about.title"),
    icon: "info",
    fanText: t("AboutPage.navigation.items.about.fan"),
    creatorText: t("AboutPage.navigation.items.about.creator"),
  },
  {
    menuItem: t("MainHeader.menu.links.title"),
    icon: "link",
    fanText: t("AboutPage.navigation.items.externalLinks.fan"),
    creatorText: t("AboutPage.navigation.items.externalLinks.creator"),
  },
  {
    menuItem: t("MainHeader.menu.nostrLogin.title"),
    icon: "vpn_key",
    fanText: t("AboutPage.navigation.items.nostrLogin.fan"),
    creatorText: t("AboutPage.navigation.items.nostrLogin.creator"),
  },
]);

const mode = ref<"fan" | "creator">("fan");
const mapContainer = ref<HTMLElement | null>(null);
const openIndex = ref<number | null>(null);

watch(mode, (val) => {
  if (mapContainer.value) {
    mapContainer.value.classList.toggle("fan-mode", val === "fan");
    mapContainer.value.classList.toggle("creator-mode", val === "creator");
  }
});

onMounted(() => {
  if (mapContainer.value) {
    mapContainer.value.classList.add("fan-mode");
  }

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    });

    document.querySelectorAll(".fade-in-section").forEach((el) => {
      observer.observe(el);
    });
  } else {
    document
      .querySelectorAll(".fade-in-section")
      .forEach((el) => el.classList.add("is-visible"));
  }
});
</script>

<style scoped>
.about-page {
  --color-accent: var(--q-accent);
  --color-accent-rgb: var(--q-accent-rgb, 34, 211, 238);
  font-family: "Inter", sans-serif;
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

.accordion-item {
  transition: background-color 0.3s;
}

.accordion-item.open {
  background-color: rgba(var(--color-accent-rgb), 0.15);
}

.accordion-item .q-expansion-item__toggle-icon {
  transition: transform 0.3s;
}

.accordion-item.open .q-expansion-item__toggle-icon {
  transform: rotate(180deg);
}

.step-card {
  position: relative;
}

.step-card::after {
  content: "→";
  position: absolute;
  top: 50%;
  right: -1.5rem;
  transform: translateY(-50%);
  font-size: 2rem;
  color: currentColor;
}

.step-card:last-child::after {
  content: "";
}

@media (max-width: 768px) {
  .step-card::after {
    content: "↓";
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

.fan-mode .creator-content,
.creator-mode .fan-content {
  display: none;
}
</style>
