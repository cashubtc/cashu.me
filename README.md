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

### Timelocks

Tokens can be locked to a pubkey with an optional unlock time and refund pubkey.
In the send dialog choose **Lock** and fill the receiver key, unlock time and
optional refund key. When a locked token is pasted into the receive dialog the
unlock date is displayed.

### Timelocked P2PK Tokens

Use the **Lock** option in the Send dialog to create a token tied to a public key. Enter the receiver key, set a lock time (timestamp) and optionally a refund key for recovery. The mint must advertise support for NUT-11 and NUT-10 which can be verified via its `/info` endpoint.

Example workflow:

1. Check `/info` on your mint for `nut_supports` entries `11` and `10`.
2. Open **Send**, choose **Lock** and provide the recipient key, lock time and refund key.
3. Share the resulting token string. The recipient pastes it into **Receive** to see the unlock date.

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
