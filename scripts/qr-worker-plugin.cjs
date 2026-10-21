const path = require("node:path");
const { build } = require("esbuild");

// Vite 2's worker import returns a constructor; the scanner needs a script URL.
module.exports = function qrWorkerPlugin() {
  const virtualId = "virtual:qr-scanner-worker-url";
  let config;
  return {
    name: "wallet-qr-worker-url",
    configResolved(resolved) {
      config = resolved;
    },
    resolveId(id) {
      if (id === virtualId) return "\0" + virtualId;
    },
    async load(id) {
      if (id !== "\0" + virtualId) return;
      if (config.command === "serve") {
        return `export default ${JSON.stringify(
          config.base + "src/js/qr-scanner-worker.ts?worker_file"
        )};`;
      }
      const result = await build({
        entryPoints: [path.resolve(config.root, "src/js/qr-scanner-worker.ts")],
        bundle: true,
        write: false,
        format: "esm",
        platform: "browser",
        target: "esnext",
        minify: true,
      });
      const reference = this.emitFile({
        type: "asset",
        name: "qr-scanner-worker.js",
        source: result.outputFiles[0].text,
      });
      return `export default import.meta.ROLLUP_FILE_URL_${reference};`;
    },
  };
};
