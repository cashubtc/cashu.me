# Fundstr

**The Patreon of Nostr**  
Support your favorite Nostr creators with private, instant Bitcoin Lightning payments powered by Cashu ecash.

Fundstr is both a wallet and a platform designed to empower the creator economy on Nostr. It helps users discover, support and engage with creators while letting those creators receive funding directly and privately using Cashu.

Think Patreon, but built for the Nostr ecosystem and leveraging the privacy and efficiency of Cashu.

## Vision: A Decentralized Creator Economy

- Creators can share their work, build communities and earn sustainable income directly from their audience, free from intermediaries and censorship.
- Supporters can discover inspiring creators and fund their work with micropayments or recurring support while keeping their privacy.

## How It Works

### For Supporters

1. **Discover** – Browse a wide range of Nostr creators such as writers, artists, developers or podcasters.
2. **Explore Profiles** – Learn about creators, see their work and check their funding goals.
3. **Support with Cashu**
   - Make one-time donations.
   - Set up recurring pledges by sending P2PK-locked tokens to the creator, optionally with timelocks matching pledge periods. The app helps manage these tokens.
   - Choose predefined tiers with special benefits.
   - Use Token Buckets to organize funds for different creators or goals.
4. **Engage** – Access exclusive content or chat with creators using Nostr DMs (future feature).
5. **Stay Private** – All Cashu payments provide enhanced privacy.

### For Creators

1. **Create Your Profile** – Link your Nostr identity, describe your work and set funding goals.
2. **Define Support Tiers** – Offer multiple levels of support with unique perks (e.g. exclusive notes, early access, or direct messages).
3. **Receive Cashu Directly** – Funding goes instantly and privately to your Fundstr wallet. Supporters can send P2PK locked tokens for pledges.
4. **Manage Your Hub** – A future dashboard for tracking supporters, funding and content.
5. **Build Your Community** – Connect with supporters using integrated Nostr DMs.

## Key Features

- **Seamless Cashu Wallet** – Mint, send and receive ecash.
- **Token Buckets** – Organize tokens into named categories with descriptions, colors and goals. Auto-assign incoming tokens based on mint URL or memo rules and move tokens between buckets as needed.
- **Advanced Token Management**
  - P2PK (Pay-to-PubKey) support.
  - Timelocked tokens for pledge-style recurring support with irrevocable P2PK locks.
  - View and manage locked tokens with unlock dates.
- **Nostr Identity Integration** – Log in with your existing npub.
  - If your private key is available (via NIP-07 or imported nsec), Fundstr automatically saves the corresponding 66-char key pair for P2PK locking.
- **Creator Discovery** – Find creators by category, search or Nostr social graphs.
- **Creator Profiles** – Dedicated pages for creators and their funding needs.
- **Tiered Support System** – Multiple support levels with unique benefits.
- **Subscriber Analytics Dashboard** – KPI cards and charts visualize subscriber counts, status mix and projected revenue. The final KPI toggles between upcoming week or month to estimate expected income.
- **Direct Cashu Donations & Pledges** – One-time or recurring support using P2PK and timelocks.
- **Nostr Direct Messages** – NIP-04 encrypted chat with creators and other users.
- **Privacy-Preserving** – Chaumian ecash via Cashu.
- **Cross-Platform** – Web App, PWA and native Android/iOS.
- **npub.cash Integration** – Option to receive funds via a Lightning Address.
- **Nostr Wallet Connect (NWC)** – Planned/experimental automation for recurring support.

### Nostr Messenger

The app includes a built-in Nostr messenger for private chat.

1. Open **Nostr Messenger** from the menu.
2. Click **Identity / Relays** in the side drawer.
3. Paste your Nostr **Private Key** and add relay URLs.
4. Press **Save**, then use **Connect** under _Relays_.
5. The messenger connects to the relays defined in Settings and shows an
   **Online/Offline** badge in the header.

## Technology Stack

- **Frontend**: Quasar Framework (Vue.js 3)
- **Mobile/Desktop**: Capacitor
- **State Management**: Pinia
- **Cashu Protocol**: `@cashu/cashu-ts`
- **Nostr Protocol**: Nostr Dev Kit (NDK), `nip04` for encryption
- **Storage**: Dexie.js (IndexedDB)

## Current Status

Fundstr is currently in Alpha/Beta.

**What's Working**

- Core Cashu wallet functionality (send, receive, mint management)
- Token Buckets (creation, management, auto-assignment rules)
- P2PK and timelocking of tokens
- Basic Nostr identity integration
- Nostr Direct Messages (NIP-04 chat)
- Initial creator hub and donation presets

**Focus of Current Development**

- Enhancing creator profile management and display
- Improving discovery mechanisms
- Developing robust support tier definition
- Streamlining pledge flows (making P2PK/timelock usage intuitive)
- Exploring user-friendly recurring support options

## Getting Started

### 1. Access Fundstr

- **Web/PWA**: visit your Fundstr URL
- **Android/iOS**: use the store link or build instructions

### 2. For Supporters

1. Set up your wallet and load it with ecash from a compatible mint.
2. Optionally create Token Buckets for organization.
3. Browse or search for creators.
4. Visit a creator's profile and choose a tier, donation or recurring pledge.
5. (Optional) Pick a start date if you want your subscription to begin later.
6. Follow prompts to send Cashu ecash.
7. Chat with creators or other users via Nostr DMs.

### 3. For Creators

1. Go to the **Creator Hub** section.
2. Set up your profile and link your npub.
3. Make sure a Nostr signer (NIP-07 extension or nsec key) is connected and at least one relay is configured.
4. Define support tiers and benefits.
5. Share your Fundstr profile with your audience.
6. Communicate with supporters through Nostr DMs.

### DM-per-Token Subscriptions

The **DM-per-token** workflow allows fans to pledge recurring payments by
sending one locked Cashu token each period via Nostr DM. Creators must publish a
`kind:10019` profile from the Creator Hub so supporters know which P2PK key and
mint URLs to use.

1. Supporter opens the subscription dialog on a creator's page.
2. The app retrieves the creator's `kind:10019` profile.
3. Supporter selects the payment amount, interval (weekly, twice monthly, or monthly) and number of periods.
4. The selected frequency determines the cost per interval and unlock schedule.
5. Fundstr sends one token per period that is irrevocably locked to the creator's pubkey until the specified `locktime`.

### Media Previews for Tiers

Creators can attach media links to each tier so supporters can preview what they’ll receive. Simply add trusted URLs (e.g. YouTube, IPFS, or other HTTPS resources) when defining your tiers in the Creator Hub. The app doesn’t host any files itself – it only stores the links you provide and renders previews from those sources.

You can also supply raw `<iframe>` snippets for custom embeds or include a `nostr:` link that references an event ID. If a `nostr:` link is provided, the preview displays the linked event’s content. These previews appear both on a creator’s profile and when browsing tiers from the **find creators** page.
**Preview layout tips**

- Previews are displayed inside a responsive container that aims for a 16:9 aspect ratio.
- Images and videos are scaled to fit while maintaining their own ratio.
- Content with very different dimensions may be letterboxed or cropped depending on the source embed.

You can access this documentation from the Creator Hub: look for the "Learn more" link next to the Media Preview help icon when editing tiers.

Example `kind:30000` event content:

```json
[
  {
    "id": "gold",
    "name": "Gold Tier",
    "price_sats": 10000,
    "frequency": "monthly",
    "intervalDays": 30,
    "description": "Access to behind-the-scenes posts",
    "media": [
      { "url": "https://www.youtube.com/embed/abcd1234" },
      { "url": "ipfs://bafybeibxyz/file.png", "type": "image" }
    ]
  }
]
```

## Roadmap & Future Ideas

- Advanced creator discovery with search, filters and Nostr recommendations
- Content gating and delivery using Nostr (tagged or encrypted notes, token-gated chats)
- Creator dashboards with analytics
- Notifications for supporters and content updates
- Deeper NWC integration
- Community features like comments and badges
- Decentralized creator registration via Nostr

## Development

This project uses **pnpm** as its package manager.

Install dependencies:

```bash
pnpm install
```

Start a development server:

```bash
pnpm dev
```

## Development setup

Install project dependencies before running tests:

```bash
pnpm install
pnpm test
```

### Verifying the NDK refactor

After migrating away from direct `NDK` instances, check that no lingering instantiations remain.
Run these commands and ensure they return no results (except mocks or the boot file):

```
git grep -n "new NDK("
git grep -n ".ndk"
```

### Optional Backend Search Service

You can configure a URL that returns NIP-50 search results for the
`find-creators.html` page. Set the value in local storage using the key
`cashu.settings.searchBackendUrl`. When defined, search queries hit this
backend first and fall back to client-side relay queries if no results are
returned.

### Default Relay List

You can also override the relays used by the creator search. Set
`cashu.settings.defaultNostrRelays` in local storage with an array of relay
URLs. If not defined, the search falls back to the following list:

```
wss://relay.damus.io/
wss://relay.primal.net/
wss://eden.nostr.land/
wss://nos.lol/
wss://nostr-pub.wellorder.net/
wss://nostr.bitcoiner.social/
wss://relay.nostr.band/
wss://relay.snort.social/
```

### Verify Nutzap Profile

After publishing your `kind:10019` Nutzap profile, you can confirm that relays
have received it. Run the helper script with your npub:

```bash
npx ts-node scripts/verifyNutzapProfile.ts <your-npub>
```

The script connects read-only to your configured relays and prints the fetched
profile data so you can double-check the values.

## Contributing

Contributions are welcome! Open an issue or pull request to discuss your ideas. Bug reports and feature requests are encouraged. Help with translation and documentation is always appreciated.

Before submitting a pull request, install dependencies and run the test suite:

```bash
pnpm install
pnpm run test:ci
```

For a watch mode during development, you can also run:

```bash
pnpm test
```

Some tests communicate with an external Cashu mint. Ensure network connectivity
or provide the required environment variables before running the suite.

## Updated UI Components

The wallet interface now uses three new Vue components:

- `src/pages/WalletBucketsPage.vue`
- `src/components/HeaderBar.vue`
- `src/components/Sidebar.vue`

To try the redesign, swap the old wallet route to `WalletBucketsPage` and include `HeaderBar` and `Sidebar` where appropriate. These components rely on the existing stores and keep all previous functionality.

## License

This project is licensed under the [MIT License](LICENSE.md).

Join us in building the future of creator funding on Nostr!
