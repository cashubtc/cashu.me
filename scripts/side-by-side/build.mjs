// Assembles deploy/side-by-side from a capture: the deck, its images and thumbnails, the
// demo wallet snapshots, and the base build the live "before" pane frames.
//
//   node scripts/side-by-side/build.mjs <shots dir> <base build dir> "<before ref>" "<after ref>"
//
// The base build must be built with publicPath /side-by-side/before/ and is given shim.js
// as its first script, so it keeps its own storage.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { NOTES } from "./shots.mjs";

const [SHOTS, BEFORE_BUILD, BEFORE_REF, AFTER_REF] = process.argv.slice(2);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, "../../deploy/side-by-side");

for (const entry of fs.readdirSync(OUT))
  if (entry !== ".gitkeep")
    fs.rmSync(path.join(OUT, entry), { recursive: true });
for (const dir of ["img", "thumb"])
  fs.mkdirSync(path.join(OUT, dir), { recursive: true });
for (const file of fs.readdirSync(path.join(HERE, "deck")))
  fs.copyFileSync(path.join(HERE, "deck", file), path.join(OUT, file));

fs.cpSync(BEFORE_BUILD, path.join(OUT, "before"), { recursive: true });
const index = path.join(OUT, "before/index.html");
const html = fs.readFileSync(index, "utf8");
if (!html.includes("/side-by-side/before/"))
  throw new Error(
    "the base build was not built with publicPath /side-by-side/before/"
  );
fs.writeFileSync(
  index,
  html.replace(/<head>/i, '<head><script src="/side-by-side/shim.js"></script>')
);

const manifest = JSON.parse(
  fs.readFileSync(path.join(SHOTS, "manifest.json"), "utf8")
);
const failed = [];
const captured = (shot) =>
  ["before", "after"].every((v) =>
    fs.existsSync(path.join(SHOTS, `${shot.id}-${v}.png`))
  );
const missing = manifest.shots.filter((shot) => !captured(shot));
if (missing.length)
  console.log(
    `${missing.length} slides have no capture and are left out:`,
    missing.map((s) => s.id).join(", ")
  );
manifest.shots = manifest.shots.filter(captured);
for (const shot of manifest.shots) {
  shot.size = {};
  for (const version of ["before", "after"]) {
    const source = path.join(SHOTS, `${shot.id}-${version}.png`);
    const picture = sharp(source);
    const { width, height } = await picture.metadata();
    shot.size[version] = { width: width / 2, height: height / 2 };
    await picture
      .webp({ quality: 84, effort: 5 })
      .toFile(path.join(OUT, "img", `${shot.id}-${version}.webp`));
    // The top of the page at the slide's proportions, small.
    const crop = Math.min(
      height,
      Math.round((width * shot.viewport.height) / shot.viewport.width)
    );
    await sharp(source)
      .extract({ left: 0, top: 0, width, height: crop })
      .resize({ width: shot.viewport.width > 600 ? 280 : 96 })
      .webp({ quality: 70 })
      .toFile(path.join(OUT, "thumb", `${shot.id}-${version}.webp`));
    if (shot.errors?.[version])
      failed.push(`${shot.id} (${version}): ${shot.errors[version]}`);
  }
  for (const key of ["testnut", "fresh"]) delete shot[key];
}
manifest.refs = { before: BEFORE_REF, after: AFTER_REF };
manifest.notes = NOTES;
fs.writeFileSync(path.join(OUT, "manifest.json"), JSON.stringify(manifest));
for (const version of ["before", "after"])
  fs.copyFileSync(
    path.join(SHOTS, `seed-${version}.json`),
    path.join(OUT, `seed-${version}.json`)
  );

console.log(manifest.shots.length, "slides ->", OUT);
if (failed.length) {
  console.log(
    `${failed.length} captures had a failed step (marked on their slides):`
  );
  for (const line of failed) console.log("  " + line);
}
