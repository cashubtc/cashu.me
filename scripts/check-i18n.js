import { promises as fs } from "fs";
import path from "path";

const SRC_DIR = "src";
const LOCALE_FILE = path.join("src", "i18n", "en-US", "index.ts");

async function collectFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const res = path.resolve(dir, entry.name);
      if (entry.isDirectory()) return collectFiles(res);
      if (/[.](vue|js|ts|jsx|tsx|html)$/.test(entry.name)) return [res];
      return [];
    }),
  );
  return files.flat();
}

function extractKeys(src) {
  const re = /\$t\(\s*['"`]([^'"`]+)['"`]\s*\)|i18n\.t\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
  const keys = new Set();
  let m;
  while ((m = re.exec(src)) !== null) {
    const key = m[1] || m[2];
    if (key && !key.includes("${")) keys.add(key);
  }
  return keys;
}

function flatten(obj, prefix = "", out = new Set()) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) flatten(v, key, out);
    else out.add(key);
  }
  return out;
}

async function loadLocaleKeys() {
  const content = await fs.readFile(LOCALE_FILE, "utf8");
  const match = content.match(/export const messages = (\{[\s\S]*?\n\});/);
  if (!match) throw new Error("Could not parse locale file");
  // eslint-disable-next-line no-new-func
  const messages = new Function(`return ${match[1]}`)();
  return flatten(messages);
}

async function main() {
  const files = await collectFiles(SRC_DIR);
  const usedKeys = new Set();
  for (const file of files) {
    const content = await fs.readFile(file, "utf8");
    extractKeys(content).forEach((k) => usedKeys.add(k));
  }

  const localeKeys = await loadLocaleKeys();
  const missing = [...usedKeys].filter((k) => !localeKeys.has(k));
  if (missing.length) {
    console.error("Missing i18n keys:\n" + missing.join("\n"));
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

