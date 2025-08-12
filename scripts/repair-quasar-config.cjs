const fs = require("fs");

const file = "quasar.config.js";
let s = fs.readFileSync(file, "utf8");
let changed = false;

// 1) Ensure import for node polyfills
if (!/from ['"]vite-plugin-node-polyfills['"]/.test(s)) {
  if (/^import .*;?/m.test(s)) {
    s = s.replace(
      /^import .*;?/m,
      (m) =>
        m + "\nimport { nodePolyfills } from 'vite-plugin-node-polyfills';",
    );
  } else {
    s = "import { nodePolyfills } from 'vite-plugin-node-polyfills';\n" + s;
  }
  changed = true;
}

// 2) Ensure boot: ['buffer', ...]
if (/boot\s*:\s*\[[^\]]*\]/.test(s)) {
  if (!/boot\s*:\s*\[[^\]]*['"]buffer['"]/.test(s)) {
    s = s.replace(/boot\s*:\s*\[/, "boot: ['buffer', ");
    changed = true;
  }
} else {
  s = s.replace(/return\s*{/, "return {\n    boot: ['buffer'],");
  changed = true;
}

// Helpers to insert into build block
function ensureBuildBlock(src) {
  if (!/build\s*:\s*{/.test(src)) {
    src = src.replace(/return\s*{/, "return {\n    build: {},");
    changed = true;
  }
  return src;
}
s = ensureBuildBlock(s);

// 3) Ensure extendViteConf exists and pushes nodePolyfills + aliases + optimizeDeps
if (/build\s*:\s*{/.test(s)) {
  // Insert extendViteConf if missing
  if (!/extendViteConf\s*\(/.test(s)) {
    s = s.replace(
      /build\s*:\s*{/,
      "build: {\n      extendViteConf(viteConf) {\n        viteConf.plugins = viteConf.plugins || [];\n        viteConf.plugins.push(\n          nodePolyfills({\n            globals: { Buffer: true, global: true, process: true },\n            protocolImports: true\n          })\n        );\n        viteConf.optimizeDeps = viteConf.optimizeDeps || {};\n        const inc = new Set([...(viteConf.optimizeDeps.include || []), 'buffer', 'process']);\n        viteConf.optimizeDeps.include = Array.from(inc);\n        viteConf.resolve = viteConf.resolve || {};\n        viteConf.resolve.alias = Object.assign({}, viteConf.resolve.alias, { buffer: 'buffer', process: 'process/browser' });\n      },",
    );
    changed = true;
  } else {
    // extendViteConf exists: minimally ensure our bits are present
    if (!/nodePolyfills\(/.test(s)) {
      s = s.replace(
        /extendViteConf\s*\([^)]*\)\s*{/,
        (match) =>
          match +
          "\n        viteConf.plugins = viteConf.plugins || [];\n        viteConf.plugins.push(\n          nodePolyfills({\n            globals: { Buffer: true, global: true, process: true },\n            protocolImports: true\n          })\n        );\n",
      );
      changed = true;
    }
    if (!/optimizeDeps[^}]*include/.test(s)) {
      s = s.replace(
        /extendViteConf\s*\([^)]*\)\s*{/,
        (match) =>
          match +
          "\n        viteConf.optimizeDeps = viteConf.optimizeDeps || {};\n        const inc = new Set([...(viteConf.optimizeDeps.include || []), 'buffer', 'process']);\n        viteConf.optimizeDeps.include = Array.from(inc);\n",
      );
      changed = true;
    }
    if (
      !/resolve[^}]*alias/.test(s) ||
      !/buffer['"]?\s*:/.test(s) ||
      !/process['"]?\s*:/.test(s)
    ) {
      s = s.replace(
        /extendViteConf\s*\([^)]*\)\s*{/,
        (match) =>
          match +
          "\n        viteConf.resolve = viteConf.resolve || {};\n        viteConf.resolve.alias = Object.assign({}, viteConf.resolve.alias, { buffer: 'buffer', process: 'process/browser' });\n",
      );
      changed = true;
    }
  }
}

if (changed) {
  fs.writeFileSync(file, s);
  console.log("quasar.config.js repaired (polyfills, aliases, deps, boot).");
} else {
  console.log("quasar.config.js already ok; no changes made.");
}
