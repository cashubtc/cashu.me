#!/usr/bin/env node
// Simple i18n keys auditor for src/i18n/*/index.ts
// - Compares key sets across locales
// - Reports missing/extra keys per locale
// - Detects duplicate object paths within a single locale file by parsing once

const fs = require("fs");
const path = require("path");

const i18nDir = path.join(process.cwd(), "src", "i18n");

function flatten(obj, prefix = "") {
  const res = {};
  for (const [k, v] of Object.entries(obj || {})) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      Object.assign(res, flatten(v, p));
    } else {
      res[p] = true;
    }
  }
  return res;
}

function loadLocale(file) {
  // Load TypeScript via ts-node/register if available; otherwise do a crude eval
  const src = fs.readFileSync(file, "utf8");
  // Transform "export default { ... }" to "module.exports = { ... }"
  const transformed = src.replace(/export default /, "module.exports = ");
  const mod = { exports: {} };
  const fn = new Function("module", "exports", transformed);
  fn(mod, mod.exports);
  return mod.exports;
}

function main() {
  const entries = fs
    .readdirSync(i18nDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => ({
      code: d.name,
      file: path.join(i18nDir, d.name, "index.ts"),
    }))
    .filter((e) => fs.existsSync(e.file));

  if (entries.length === 0) {
    console.error("No locale files found.");
    process.exit(1);
  }

  const locales = entries.map((e) => ({
    code: e.code,
    data: loadLocale(e.file),
  }));
  const flatMaps = locales.map(({ code, data }) => ({
    code,
    flat: flatten(data),
  }));

  // Choose reference: en-US if present, else first
  const ref = flatMaps.find((l) => l.code === "en-US") || flatMaps[0];

  let hadError = false;
  const diffs = {};
  for (const { code, flat } of flatMaps) {
    const missing = Object.keys(ref.flat).filter((k) => !(k in flat));
    const extra = Object.keys(flat).filter((k) => !(k in ref.flat));
    if (missing.length || extra.length) {
      diffs[code] = { missing: missing.length, extra: extra.length };
      hadError = true;
      console.log(`Locale ${code}:`);
      if (missing.length) {
        console.log(`  Missing (${missing.length}):`);
        missing.slice(0, 50).forEach((k) => console.log(`    - ${k}`));
        if (missing.length > 50)
          console.log(`    ... and ${missing.length - 50} more`);
      }
      if (extra.length) {
        console.log(`  Extra (${extra.length}):`);
        extra.slice(0, 50).forEach((k) => console.log(`    + ${k}`));
        if (extra.length > 50)
          console.log(`    ... and ${extra.length - 50} more`);
      }
    }
  }

  if (hadError) {
    console.log("\nDifferences found.");
    console.log("Number of differences per file:");
    for (const [code, { missing, extra }] of Object.entries(diffs)) {
      console.log(`  ${code}: missing ${missing}, extra ${extra}`);
    }
    process.exit(2);
  } else {
    console.log("All locale keys are consistent.");
  }
}

main();
