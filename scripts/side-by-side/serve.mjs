// Serves a built deploy the way nginx.conf does, for capturing and for checking the deck
// locally: the app at / (history routing), the deck at /side-by-side/, and the base build
// at /side-by-side/before/ (its own history routing).
//   node scripts/side-by-side/serve.mjs <app dist> <side-by-side dir> [port]
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const [app, deck, port = 5100] = process.argv
  .slice(2)
  .map((a, i) => (i < 2 ? path.resolve(a) : Number(a)));
const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
  ".png": "image/png",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
};
const file = (p) => fs.existsSync(p) && fs.statSync(p).isFile();

http
  .createServer((req, res) => {
    const url = decodeURIComponent(new URL(req.url, "http://x").pathname);
    let target;
    if (url.startsWith("/side-by-side")) {
      const rel = url.slice("/side-by-side".length) || "/";
      target = path.join(deck, rel);
      if (!file(target)) {
        const index = path.join(target, "index.html");
        target = file(index)
          ? index
          : path.join(
              deck,
              rel.startsWith("/before") ? "before/index.html" : "index.html"
            );
      }
    } else {
      target = path.join(app, url);
      if (!file(target)) target = path.join(app, "index.html");
    }
    res.writeHead(200, {
      "content-type": types[path.extname(target)] ?? "application/octet-stream",
      "cache-control": "no-cache",
    });
    fs.createReadStream(target).pipe(res);
  })
  .listen(port, "127.0.0.1", () =>
    console.log(`http://127.0.0.1:${port}/side-by-side/`)
  );
