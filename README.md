<div align="center">
  <img src="icon-round.png" alt="Cashu.me logo" width="120" />

# Cashu.me

**A free and open-source Cashu ecash wallet for the web.**

[![Build](https://github.com/cashubtc/cashu.me/actions/workflows/build.yaml/badge.svg)](https://github.com/cashubtc/cashu.me/actions/workflows/build.yaml)
[![Tests](https://github.com/cashubtc/cashu.me/actions/workflows/test.yml/badge.svg)](https://github.com/cashubtc/cashu.me/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE.md)

[Cashu protocol](https://cashu.space) &middot; [Documentation](https://docs.cashu.space)

</div>

---

## About

Cashu.me is a progressive web app (PWA) wallet for [Cashu](https://github.com/cashubtc) — an open-source Chaumian ecash protocol. It lets you send and receive funds instantly and privately as ecash that only you control.

The wallet runs entirely on your device: keys and tokens are stored locally in your browser's IndexedDB. You can install it as an app or self-host it with Docker.

## Features

- **Send & receive ecash** — create, scan, and redeem Cashu tokens, including animated QR codes for large tokens
- **Lightning payments** — pay and create BOLT11 invoices, with BOLT12 offer support
- **On-chain** — deposit and withdraw on-chain bitcoin where supported by the mint
- **Multi-mint** — connect to any number of mints, with mint discovery, community ratings, and mint audit insights
- **Multinut payments** — pay a single invoice with funds split across multiple mints (NUT-15)
- **Seed phrase backup** — restore your wallet deterministically from a 12-word seed phrase
- **Nostr integration** — encrypted wallet backups on Nostr (NIP-60), Nostr Wallet Connect (NWC), and npub.cash Lightning addresses
- **P2PK** — lock ecash tokens to a public key so only the intended recipient can spend them
- **Payment requests** — request payments from other wallets
- **Private by design** — your proofs never leave your device
- **Internationalized** — available in 14 languages
- **Runs everywhere** — PWA, Android & iOS (Capacitor), desktop (Electron), and a browser extension

## Quick start with Docker

The fastest way to run Cashu.me yourself:

```bash
git clone https://github.com/cashubtc/cashu.me.git
cd cashu.me
docker compose up -d
```

Access the wallet at http://localhost:3000, or serve it behind a reverse proxy (see [Self-hosting](#self-hosting-behind-a-reverse-proxy)).

## Development

**Requirements:** Node.js >= 22.4 and npm.

```bash
npm install
npm run dev
```

### Common commands

| Command                  | Description                                                         |
| ------------------------ | ------------------------------------------------------------------- |
| `npm run dev`            | Start the dev server (hot reloading, error reporting)               |
| `npm run build:pwa`      | Production PWA build, output in `dist/pwa`                          |
| `npm run build`          | SPA production build                                                |
| `npm run build:electron` | Desktop app build                                                   |
| `npm test`               | Run unit tests with Vitest (watch mode)                             |
| `npm run test:ci`        | Run unit tests once (CI mode)                                       |
| `npm run test:e2e`       | End-to-end tests: boots local test mints in Docker, runs Playwright |
| `npm run lint`           | Lint with ESLint                                                    |
| `npm run format`         | Format all files with Prettier                                      |
| `npm run checkformat`    | Check Prettier formatting without writing                           |
| `npm run i18n:check`     | Verify non-English translations are in sync with the English source |

### Testing

Unit tests use [Vitest](https://vitest.dev/). To run a single test file:

```bash
npx vitest src/path/to/test.ts
```

End-to-end tests use [Playwright](https://playwright.dev/) against a local test stack (two CDK mints with a Lightning backend) started via Docker Compose:

```bash
# Full run: brings the stack up, runs the tests, tears it down
npm run test:e2e

# Or manage the stack yourself and run Playwright directly
npm run test:e2e:stack:up
npm run test:e2e:playwright
npm run test:e2e:stack:down
```

## Mobile & desktop

Cashu.me ships as native apps via [Capacitor](https://capacitorjs.com/) (Android & iOS) and Electron (desktop).

```bash
# Build the web assets, then sync them into the native projects
npm run build:pwa
npx cap copy
npx cap sync

# Open the native projects
npx cap open android
npx cap open ios
```

Regenerate app icons and splash screens after changing `icon.png`:

```bash
npx capacitor-assets generate
```

For the desktop app: `make electron` starts an Electron dev build, `npm run build:electron` produces a production build.

## Project structure

```
src/
  components/   Vue components (dialogs, mint management, QR, ...)
  pages/        Route pages (wallet, restore, mint details, settings)
  stores/       Pinia stores — the core business logic (wallet, mints, proofs, ...)
  boot/         Quasar boot files (app initialization)
  i18n/         Translations (en-US is the source of truth)
  js/           Shared helpers (notifications, utilities)
src-pwa/        Service worker & PWA manifest
src-electron/   Electron main/preload scripts
test/e2e/       Playwright e2e tests and Docker test stack
```

See [AGENTS.md](AGENTS.md) for architecture details and coding conventions.

## Self-hosting behind a reverse proxy

The app is a single-page application using Vue Router in history mode, so your web server needs a fallback to `index.html` to allow page refreshes. It should also send proper headers for the service worker. Example `Caddyfile`:

```
# CORS snippet by https://kalnytskyi.com/posts/setup-cors-caddy-2/
(cors) {
  @cors_preflight method OPTIONS
  @cors header Origin {args.0}

  handle @cors_preflight {
    header Access-Control-Allow-Origin "{args.0}"
    header Access-Control-Allow-Methods "GET, POST, PUT, PATCH, DELETE"
    header Access-Control-Allow-Headers "Content-Type"
    header Access-Control-Max-Age "3600"
    respond "" 204
  }

  handle @cors {
    header Access-Control-Allow-Origin "{args.0}"
    header Access-Control-Expose-Headers "Link"
  }
}

host.com {
    import cors *
    encode gzip

    header /service-worker.js {
            Service-Worker-Allowed "/"
            Cache-Control "no-cache"
    }

    # SPA root
    root * /usr/share/caddy/cashu.me/

    # quasar vue router fallback history mode
    try_files {path} /index.html

    file_server
}
```

Background: [Vue Router history mode](https://router.vuejs.org/guide/essentials/history-mode.html#HTML5-Mode).

## Contributing

Contributions are welcome! Before opening a pull request:

1. Run `npm run format` and `npm run lint`.
2. Make sure `npm run test:ci` passes.
3. If you touched UI text, update translations and run `npm run i18n:check`.

Translations live in `src/i18n/`. English (`en-US`) is the source of truth — the `i18n:check` script verifies that other languages stay in sync.

## Security

To report a vulnerability, please email **cashu-security@pm.me** — see [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE.md) &copy; Cashu
