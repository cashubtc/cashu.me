import fs from "fs";

const files = ["quasar.config.js", "quasar.config.ts"].filter((f) =>
  fs.existsSync(f),
);
if (!files.length) {
  console.error(
    "Could not find quasar.config.js or quasar.config.ts in the repo root.",
  );
  process.exit(1);
}

for (const file of files) {
  let s = fs.readFileSync(file, "utf8");
  const before = s;

  // Unify property name
  s = s.replace(/\bworkboxPluginMode\b/g, "workboxMode");

  // Normalize allowed values (case-insensitive -> proper case)
  s = s.replace(
    /workboxMode\s*:\s*['"]generateSW['"]/gi,
    "workboxMode: 'GenerateSW'",
  );
  s = s.replace(
    /workboxMode\s*:\s*['"]injectManifest['"]/gi,
    "workboxMode: 'InjectManifest'",
  );

  // Clean up stray "strategy: 'generateSW'| 'injectManifest'" under PWA config (if any)
  s = s.replace(/strategy\s*:\s*['"]generateSW['"]\s*,?/gi, "");
  s = s.replace(/strategy\s*:\s*['"]injectManifest['"]\s*,?/gi, "");

  // Ensure we at least have a pwa block with workboxMode if none exists
  if (!/pwa\s*:\s*\{[\s\S]*?workboxMode\s*:/m.test(s)) {
    s = s.replace(
      /return\s*\{/,
      (match) => `${match}\n  pwa: { workboxMode: 'GenerateSW' },`,
    );
  }

  if (s !== before) {
    fs.writeFileSync(file + ".bak.pwa", before);
    fs.writeFileSync(file, s);
    console.log("Patched:", file);
  } else {
    console.log("No changes needed:", file);
  }
}
