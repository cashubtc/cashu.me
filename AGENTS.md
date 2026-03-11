# Cashu.me Developer Guide for Agents

This document provides a comprehensive overview of the **Cashu.me** codebase. It is designed to help coding agents understand the architecture, tech stack, conventions, and patterns used in this project.

## 1. Tech Stack

### Core Frameworks

- **Framework:** [Quasar Framework](https://quasar.dev/) (Vue.js 3 + Vite)
- **Language:** TypeScript (mostly) and JavaScript.
- **State Management:** [Pinia](https://pinia.vuejs.org/)
- **Routing:** Vue Router (standard Quasar setup)
- **Build Tool:** Vite (via Quasar CLI)
- **CSS:** SCSS/Sass with Quasar's utility classes.

### Mobile & Desktop

- **Mobile:** [Capacitor](https://capacitorjs.com/) (Android & iOS)
- **Desktop:** Electron (via Quasar mode)
- **PWA:** Supported and primary delivery method for web.

### Cashu & Cryptography

- **Cashu Library:** [`@cashu/cashu-ts`](https://github.com/cashubtc/cashu-ts) (Core Cashu wallet logic)
- **Crypto:** `@cashu/crypto`, `@noble/secp256k1`
- **Lightning/Bitcoin:** `light-bolt11-decoder`, `bech32`

### Persistence

- **Database:** [Dexie.js](https://dexie.org/) (IndexedDB wrapper) for storing Cashu proofs (tokens).
- **Local Storage:** `@vueuse/core` (`useLocalStorage`) for user settings, history, and simpler state.

### Testing & Linting

- **Testing:** Vitest
- **Linting:** ESLint + Prettier

---

## 2. Project Structure

```
.
├── src/
│   ├── assets/          # Static assets (images, icons)
│   ├── boot/            # Quasar boot files (initialization logic)
│   ├── components/      # Vue components (UI elements)
│   ├── css/             # Global styles (SCSS)
│   ├── i18n/            # Internationalization (locales)
│   ├── js/              # Utility functions (non-component logic)
│   ├── layouts/         # App layouts (MainLayout, FullscreenLayout)
│   ├── pages/           # Route pages (WalletPage, Settings, etc.)
│   ├── router/          # Vue Router configuration
│   ├── stores/          # Pinia stores (Critical business logic)
│   ├── App.vue          # Root component
│   └── main.js          # Entry point
├── src-capacitor/       # Capacitor configuration and native projects
├── src-electron/        # Electron main/preload scripts
├── src-pwa/             # PWA service worker and manifest
└── quasar.config.js     # Quasar configuration
```

---

## 3. Architecture & Key Stores

The application logic is heavily centralized in Pinia stores found in `src/stores/`.

### Critical Stores

- **`wallet.ts` (`useWalletStore`):** The **primary controller** for the wallet. It handles:
  - Sending, receiving, melting (paying invoices), and minting tokens.
  - interacting with the `cashu-ts` library (`CashuWallet`, `CashuMint`).
  - managing invoice history.
- **`mints.ts` (`useMintsStore`):** Manages the list of connected mints, their keysets, and URLs.
- **`proofs.ts` (`useProofsStore`):** Manages the collection of proofs (ecash tokens). Handles CRUD operations for proofs in memory and syncs with storage.
- **`tokens.ts` (`useTokensStore`):** Manages token history (spent/received tokens log).
- **`dexie.ts` (`useDexieStore`):** Wrapper around Dexie.js for persistent storage of proofs.
- **`ui.ts` (`useUiStore`):** Manages UI state (loaders, dialog visibility, tab selection).

### Database Schema (Dexie)

The `proofs` table in Dexie stores the actual ecash tokens:

- `secret` (string, PK)
- `amount` (number)
- `C` (string, curve point)
- `id` (string, keyset ID)
- `reserved` (boolean, locked for pending operations)
- `quote` (string, optional)

---

## 4. Coding Conventions

### Component Style

The project predominantly uses the **Options API** with **Pinia mappers** within `.vue` files, even though it is a Vue 3 project.

**Pattern:**

```typescript
import { defineComponent } from "vue";
import { mapState, mapActions, mapWritableState } from "pinia";
import { useWalletStore } from "src/stores/wallet";

export default defineComponent({
  name: "MyComponent",
  mixins: [windowMixin], // Common mixin used for global window props
  components: { ... },
  data() {
    return { ... };
  },
  computed: {
    ...mapState(useWalletStore, ["someState"]),
    ...mapWritableState(useWalletStore, ["someWritableState"]),
  },
  methods: {
    ...mapActions(useWalletStore, ["someAction"]),
    myMethod() {
      // Logic here
    }
  }
});
```

**Note:** While `<script setup>` is the modern Vue 3 standard, this codebase relies heavily on the Options API + Pinia mappers. **Respect this convention when modifying existing components.** For new simple components, `<script setup>` may be acceptable, but consistency is preferred.

### Styling

- Use **Quasar Utility Classes** (e.g., `q-pa-md`, `text-center`, `row`, `col-12`) whenever possible.
- Scoped CSS (`<style scoped>`) is used for component-specific overrides.
- Global variables are in `src/css/quasar.variables.scss`.

### Naming

- **Files:** PascalCase for components (`BalanceView.vue`), camelCase for logic files (`wallet.ts`).
- **Stores:** `use[Name]Store` (e.g., `useWalletStore`).

---

## 5. Common Patterns & Gotchas

### Wallet Operations

Most heavy lifting happens in `wallet.ts`. If you need to implement a new feature involving Cashu logic (e.g., "swap tokens", "pay lnurl"), look there first.

### Mutex Locking

The app uses a global mutex (in `ui.ts` -> `lockMutex`) during critical wallet operations (minting, melting, swapping) to prevent race conditions with the database or network.
**Always** ensure mutexes are released in a `finally` block.

### Notifications

Use the helper in `src/js/notify.ts`:

- `notifySuccess(message)`
- `notifyError(message)`
- `notifyWarning(message)`

### Platform Detection

The app runs on Web, Android, and iOS.

- Use `this.getPwaDisplayMode()` (mixin/helper) to detect if running as PWA or browser.
- Capacitor plugins are often wrapped or used directly in stores/components.

### Assets & Icons

- Icons are typically from `lucide-vue-next` or Quasar's internal Material Icons.
- Imports: `import { X as XIcon } from "lucide-vue-next";`

## 6. Development Workflow

- **Run Dev Server:** `npm run dev` (Starts Vite + Quasar)
- **Lint:** `npm run lint`
- **Format:** `npm run format`
- **Test:** `npm test` (Vitest)

When adding dependencies, prefer `npm install`.
