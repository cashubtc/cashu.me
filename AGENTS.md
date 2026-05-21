# Cashu.me Developer Guide for Agents

This document provides a comprehensive overview of the **Cashu.me** codebase for coding agents.

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

- **`wallet.ts` (`useWalletStore`):** **Primary controller**. Handles sending, receiving, melting, minting.
- **`mints.ts` (`useMintsStore`):** Manages connected mints, keysets, and URLs.
- **`proofs.ts` (`useProofsStore`):** Manages proofs (ecash tokens). CRUD + sync with storage.
- **`tokens.ts` (`useTokensStore`):** Manages token history (spent/received logs).
- **`dexie.ts` (`useDexieStore`):** Wrapper around Dexie.js for persistent storage.
- **`ui.ts` (`useUiStore`):** Manages UI state (loaders, dialogs, tabs).

### Database Schema (Dexie)

The `proofs` table stores tokens: `secret` (PK), `amount`, `C` (curve point), `id` (keyset ID), `reserved` (locked boolean), `quote`.

---

## 4. Coding Conventions

### Imports & File Paths

- **Alias:** ALWAYS use the `src/` alias for imports within the source directory.
  - Good: `import { useWalletStore } from "src/stores/wallet";`
  - Bad: `import { useWalletStore } from "../../stores/wallet";`
- **Extensions:** Omit extensions for `.ts` and `.js` imports. Include `.vue` extension for components.

### Component Style

- **API:** Use **Options API** with **Pinia mappers** (`mapState`, `mapActions`) in `.vue` files.
- **Structure:**

  ```typescript
  import { defineComponent } from "vue";
  import { mapState, mapActions } from "pinia";
  import { useWalletStore } from "src/stores/wallet";

  export default defineComponent({
    name: "MyComponent",
    mixins: [windowMixin], // Common mixin
    computed: {
      ...mapState(useWalletStore, ["someState"]),
    },
    methods: {
      ...mapActions(useWalletStore, ["someAction"]),
    },
  });
  ```

- **Note:** Do NOT use `<script setup>` for existing components unless refactoring the entire file. Maintain consistency.

### Styling

- **Utility Classes:** Use **Quasar Utility Classes** (e.g., `q-pa-md`, `text-center`, `row`, `col-12`).
- **Scoped:** Use `<style scoped>` for component-specific overrides.
- **Variables:** `src/css/quasar.variables.scss`.

### Error Handling & Notifications

- **Notify:** Use `src/js/notify.ts` helpers.
  - `notifySuccess(message: string)`
  - `notifyError(message: string)`
  - `notifyApiError(error: any)` (for handling API/library errors)
- **Catching:** In stores, wrap async operations in `try/catch` blocks and use `notifyError` or `notifyApiError` to inform the user.
- **Mutex:** Critical wallet ops (mint/melt/swap) MUST use the global mutex (`ui.ts` -> `lockMutex`). ALWAYS release in `finally`.

### Naming

- **Files:** PascalCase for components (`BalanceView.vue`), camelCase for logic (`wallet.ts`).
- **Stores:** `use[Name]Store` (e.g., `useWalletStore`).
- **Types:** Define types locally if specific, or in `src/js/types.ts` (if exists) or top of file. PascalCase for interfaces/types.

---

## 5. Development Workflow

### Commands

- **Run Dev Server:** `npm run dev`
- **Lint Code:** `npm run lint`
- **Format Code:** `npm run format`
- **Run All Tests:** `npm test`

### Running a Single Test

To run a specific test file, use `npx vitest` followed by the path or pattern:

```bash
npx vitest src/path/to/test.ts
# or
npm test -- src/path/to/test.ts
```

### Adding Dependencies

- Use `npm install` (not yarn or pnpm).

### Common Gotchas

- **Platform:** Use `this.getPwaDisplayMode()` to detect environment (Web vs PWA vs App).
- **Assets:** Import icons from `lucide-vue-next` as `XIcon` (e.g., `import { Home as HomeIcon } from "lucide-vue-next"`).
- **Reactivity:** Be careful with deep reactivity in Pinia state; use `storeToRefs` if destructuring in Composition API (though Options API is preferred here).
