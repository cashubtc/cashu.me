const fs = require("fs");

const file = "quasar.config.js";
let s = fs.readFileSync(file, "utf8");

function ensureBootBuffer(src) {
  if (/boot\s*:\s*\[[^\]]*buffer/.test(src)) return src; // already present
  if (/boot\s*:\s*\[[^\]]*\]/.test(src)) {
    return src.replace(/boot\s*:\s*\[/, "boot: ['buffer', ");
  }
  return src.replace(/return\s*{/, "return {\n    boot: ['buffer'],");
}

function ensureOptimizeDepsBuffer(src) {
  if (/optimizeDeps[^}]*include[^]*['"]buffer['"]/.test(src)) return src;

  // Try inject into existing include array
  let changed = false;
  src = src.replace(
    /(optimizeDeps\s*:\s*{[^}]*include\s*:\s*\[)([^]*?\])/,
    (m, p1, p2) => {
      changed = true;
      return p1 + `'buffer', ` + p2.slice(1);
    },
  );
  if (changed) return src;

  // Add optimizeDeps to existing build
  if (/build\s*:\s*{/.test(src)) {
    return src.replace(
      /build\s*:\s*{/,
      "build: {\n      optimizeDeps: { include: ['buffer'] },",
    );
  }
  // Or add a minimal build block near return {
  return src.replace(
    /return\s*{/,
    "return {\n    build: { optimizeDeps: { include: ['buffer'] } },",
  );
}

let out = ensureBootBuffer(s);
out = ensureOptimizeDepsBuffer(out);

if (out !== s) {
  fs.writeFileSync(file, out);
  console.log(
    "quasar.config.js patched for Buffer boot + optimizeDeps.include",
  );
} else {
  console.log("quasar.config.js already had Buffer settings; no change.");
}
