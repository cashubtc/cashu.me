# Cashu (cashu)

Cashu Wallet

## One-liner build & run

```
docker-compose up -d
```

access at http://localhost:3000 or serve it behind a reverse proxy.

## Install the dependencies

```bash
npm install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)

```bash
quasar dev
```

### Run unit tests

```bash
npm test
```

### Lint the files

```bash
npm run lint
```

### Format the files

```bash
npm run format
```

### Build the app for production

```bash
quasar build -m pwa
```

### Capacitor

After updating code, run:

```
quasar build -m pwa
npx cap copy
npx cap sync
npx cap open android / ios
```

Regenerate assets:

```
npx capacitor-assets generate
```

### Customize the configuration

See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-webpack/quasar-config-js).

### Cairo Spending Conditions

The wallet supports receiving tokens with Cairo spending conditions. To receive Cairo-locked tokens:

1. Click the "Receive" button in the wallet
2. Click the "Cairo" button in the receive drawer
3. Enter the Cairo executable code in the dialog
4. Optionally enter program input values (comma-separated numbers)
5. Click "Save" to store the Cairo data
6. Paste or scan a Cairo-locked token
7. The wallet will automatically use the stored Cairo data when redeeming the token

The Cairo data is automatically cleared after successful token reception for security.

### Cross-Origin Isolation

The application is configured with cross-origin isolation enabled for enhanced security. This is achieved by setting the following headers:

- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`

These headers are automatically configured for:

- **Development server**: Via Quasar devServer configuration
- **Production server**: Via SSR configuration and nginx
- **Docker deployment**: Via nginx configuration

To verify the headers are working, run:

```bash
./test-headers.sh
```

### Reverse proxy

For Quasar Vue Router with history mode, add this fallback URL to allow refreshes: https://router.vuejs.org/guide/essentials/history-mode.html#HTML5-Mode

More info: https://stackoverflow.com/questions/36399319/vue-router-return-404-when-revisit-to-the-url

`Caddyfile`:

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
