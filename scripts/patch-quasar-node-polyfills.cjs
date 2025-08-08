const fs = require('fs');

const file = 'quasar.config.js';
let s = fs.readFileSync(file, 'utf8');
let changed = false;

// 1) Ensure import at top-level
if (!/from ['"]vite-plugin-node-polyfills['"]/.test(s)) {
  // insert right after first import/export line or at top
  if (/^import .*;?/m.test(s)) {
    s = s.replace(/^import .*;?/m, m => m + "\nimport { nodePolyfills } from 'vite-plugin-node-polyfills';");
  } else {
    s = "import { nodePolyfills } from 'vite-plugin-node-polyfills';\n" + s;
  }
  changed = true;
}

// 2) Ensure build.vitePlugins includes nodePolyfills(...)
function ensureBuildBlock(src) {
  if (!/build\s*:\s*{/.test(src)) {
    src = src.replace(/return\s*{/, "return {\n    build: {},");
  }
  return src;
}
s = ensureBuildBlock(s);

// add/augment vitePlugins
if (/vitePlugins\s*:\s*\[/.test(s)) {
  if (!/vitePlugins[^[]*\[[^\]]*nodePolyfills\(/.test(s)) {
    s = s.replace(/vitePlugins\s*:\s*\[/, "vitePlugins: [\n        nodePolyfills({\n          globals: { Buffer: true, global: true, process: true },\n          protocolImports: true\n        }), ");
    changed = true;
  }
} else {
  s = s.replace(/build\s*:\s*{/, "build: {\n      vitePlugins: [\n        nodePolyfills({\n          globals: { Buffer: true, global: true, process: true },\n          protocolImports: true\n        })\n      ],");
  changed = true;
}

// 3) Ensure optimizeDeps.include has buffer & process
if (!/optimizeDeps\s*:\s*{/.test(s)) {
  s = s.replace(/build\s*:\s*{/, "build: {\n      optimizeDeps: { include: ['buffer', 'process'] },");
  changed = true;
} else {
  if (!/optimizeDeps[^}]*include\s*:\s*\[[^\]]*['"]buffer['"]/.test(s)) {
    s = s.replace(/optimizeDeps\s*:\s*{[^}]*include\s*:\s*\[/, m => m + "'buffer', ");
    changed = true;
  }
  if (!/optimizeDeps[^}]*include\s*:\s*\[[^\]]*['"]process['"]/.test(s)) {
    s = s.replace(/optimizeDeps\s*:\s*{[^}]*include\s*:\s*\[/, m => m + "'process', ");
    changed = true;
  }
}

if (changed) {
  fs.writeFileSync(file, s);
  console.log('quasar.config.js patched with node polyfills plugin + optimizeDeps includes.');
} else {
  console.log('quasar.config.js already configured for node polyfills.');
}
