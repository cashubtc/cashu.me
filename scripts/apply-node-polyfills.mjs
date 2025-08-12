import fs from "fs";

const file = "quasar.config.js";
if (!fs.existsSync(file)) {
  console.error("Cannot find quasar.config.js in repo root.");
  process.exit(1);
}

let s = fs.readFileSync(file, "utf8");
const before = s;

function insertImport(src) {
  if (src.includes("from 'vite-plugin-node-polyfills'")) return src;
  // Find first import; if none, put at top
  const m = src.match(/^\s*import .*?;?\s*$/m);
  const imp = "import { nodePolyfills } from 'vite-plugin-node-polyfills';\n";
  if (m) return src.replace(m[0], m[0] + "\n" + imp);
  return imp + src;
}

function ensureBoot(src) {
  // Ensure node-globals is in boot list, and remove duplicate 'buffer' boot if present
  if (/boot\s*:\s*\[/.test(src)) {
    src = src.replace(/\bboot\s*:\s*\[([^\]]*)\]/, (m, inner) => {
      let items = inner
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);
      // strip quotes and normalize
      items = items.map((x) => x.replace(/^['"]|['"]$/g, ""));
      // remove legacy 'buffer' boot entry if present
      items = items.filter((x) => x !== "buffer");
      if (!items.includes("node-globals")) items.push("node-globals");
      return "boot: [" + items.map((x) => `'${x}'`).join(", ") + "]";
    });
  } else {
    src = src.replace(
      /return\s*\{/,
      (match) => `${match}\n    boot: ['node-globals'],`,
    );
  }
  return src;
}

function ensureBuildBlock(src) {
  // Make sure we have a build: { ... } block
  if (!/build\s*:\s*\{/.test(src)) {
    src = src.replace(/return\s*\{/, (match) => `${match}\n  build: {},`);
  }
  return src;
}

function ensureVitePlugins(src) {
  // Add nodePolyfills({ include:['buffer','process'], protocolImports: true })
  // inside build.vitePlugins: [ ... ]
  if (/vitePlugins\s*:\s*\[/.test(src)) {
    if (!/nodePolyfills\s*\(/.test(src)) {
      src = src.replace(
        /vitePlugins\s*:\s*\[/,
        (m) =>
          m +
          `nodePolyfills({ include: ['buffer', 'process'], protocolImports: true }), `,
      );
    }
  } else {
    // Insert a vitePlugins array inside build
    src = src.replace(
      /build\s*:\s*\{/,
      (match) =>
        `${match}
    vitePlugins: [
      nodePolyfills({ include: ['buffer', 'process'], protocolImports: true }),
    ],`,
    );
  }
  return src;
}

function ensureExtendViteConf(src) {
  // Ensure resolve.alias / define / optimizeDeps include our entries
  if (/extendViteConf\s*\(\s*viteConf\s*\)\s*\{/.test(src)) {
    src = src.replace(
      /extendViteConf\s*\(\s*viteConf\s*\)\s*\{\s*/,
      (m) =>
        m +
        `
      viteConf.resolve = viteConf.resolve || {};
      viteConf.resolve.alias = {
        ...(viteConf.resolve.alias || {}),
        buffer: 'buffer',
        process: 'process/browser'
      };
      viteConf.define = { ...(viteConf.define || {}), global: 'globalThis' };
      viteConf.optimizeDeps = {
        ...(viteConf.optimizeDeps || {}),
        include: [ ...(viteConf.optimizeDeps?.include || []), 'buffer', 'process' ]
      };
    `,
    );
  } else {
    src = src.replace(
      /build\s*:\s*\{/,
      (match) => `${match}
    extendViteConf(viteConf) {
      viteConf.resolve = viteConf.resolve || {};
      viteConf.resolve.alias = {
        ...(viteConf.resolve.alias || {}),
        buffer: 'buffer',
        process: 'process/browser'
      };
      viteConf.define = { ...(viteConf.define || {}), global: 'globalThis' };
      viteConf.optimizeDeps = {
        ...(viteConf.optimizeDeps || {}),
        include: [ ...(viteConf.optimizeDeps?.include || []), 'buffer', 'process' ]
      };
    },`,
    );
  }
  return src;
}

s = insertImport(s);
s = ensureBoot(s);
s = ensureBuildBlock(s);
s = ensureVitePlugins(s);
s = ensureExtendViteConf(s);

// IMPORTANT: never add "globals: { Buffer: true, ... }" here; we rely on boot + aliases instead

if (s !== before) {
  fs.writeFileSync(file + ".bak.polyfill", before);
  fs.writeFileSync(file, s);
  console.log("Patched:", file);
} else {
  console.log("No changes needed:", file);
}
