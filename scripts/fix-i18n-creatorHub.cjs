const fs = require("fs");
const path = require("path");

function listLocaleFiles() {
  const base = path.join("src", "i18n");
  return fs
    .readdirSync(base, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => path.join(base, d.name, "index.ts"))
    .filter((p) => fs.existsSync(p));
}

const files = listLocaleFiles();
let changed = 0;

for (const file of files) {
  const original = fs.readFileSync(file, "utf8");
  let src = original;

  const hits = [];
  const re = /creatorHub\s*:\s*\{/g;
  let m;
  while ((m = re.exec(src)) !== null) hits.push(m.index);

  if (hits.length <= 1) continue;

  const removals = [];
  for (let i = 1; i < hits.length; i++) {
    const startKey = hits[i];
    let start = src.indexOf("{", startKey);
    if (start < 0) continue;

    let depth = 0,
      end = start;
    for (let j = start; j < src.length; j++) {
      const ch = src[j];
      if (ch === "{") depth++;
      else if (ch === "}") depth--;
      if (depth === 0) {
        end = j + 1;
        break;
      }
    }

    // eat trailing ws + trailing comma for valid syntax
    while (end < src.length && /\s/.test(src[end])) end++;
    if (src[end] === ",") end++;

    removals.push([startKey, end]);
  }

  removals
    .sort((a, b) => b[0] - a[0])
    .forEach(([from, to]) => {
      src = src.slice(0, from) + src.slice(to);
    });

  if (src !== original) {
    fs.writeFileSync(file, src);
    console.log(`Fixed duplicates in: ${file} (removed ${removals.length})`);
    changed++;
  }
}

console.log(`\nDone. Files changed: ${changed}`);
