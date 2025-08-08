import fs from 'fs';

function removeImportAndCall(s, modName, funcName) {
  // Remove: import { funcName } from 'modName';
  s = s.replace(
    new RegExp(String.raw`^\s*import\s*\{\s*${funcName}\s*\}\s*from\s*['"]${modName}['"];\s*\n?`, 'm'),
    ''
  );

  // Remove nodePolyfills( ... ) with balanced parentheses
  let i = 0, out = '';
  while (true) {
    const k = s.indexOf(`${funcName}(`, i);
    if (k === -1) { out += s.slice(i); break; }
    out += s.slice(i, k);
    let j = k + `${funcName}(`.length, depth = 1;
    for (; j < s.length; j++) {
      const ch = s[j];
      if (ch === '(') depth++;
      else if (ch === ')') { depth--; if (depth === 0) { j++; break; } }
    }
    // swallow trailing comma/space/newlines
    while (j < s.length && /[\s,]/.test(s[j])) j++;
    i = j;
  }
  return out;
}

function ensureBoot(s) {
  // Try to add "boot: ['node-globals']," inside top-level returned object
  // Insert after first "return {" or after "export default define*(" object opening
  if (/\bboot\s*:\s*\[/.test(s)) {
    // Replace existing boot: [...] with inclusion if missing
    s = s.replace(/\bboot\s*:\s*\[([^\]]*)\]/, (m, inner) => {
      if (/\b['"]node-globals['"]\b/.test(inner)) return m;
      return `boot: [${inner ? inner.trim().replace(/\]$/, '') + ', ' : ''}'node-globals']`;
    });
  } else {
    s = s.replace(/return\s*\{/, match => `${match}\n    boot: ['node-globals'],`);
  }
  return s;
}

function ensureExtendViteConf(s) {
  // If extendViteConf exists, augment it; otherwise create a minimal one under build
  if (!/build\s*:\s*\{/.test(s)) {
    s = s.replace(/return\s*\{/, match => `${match}\n  build: {},`);
  }

  if (/extendViteConf\s*\(/.test(s)) {
    // Inject our tweaks inside the function by creating/merging props
    s = s.replace(/extendViteConf\s*\(\s*viteConf\s*\)\s*\{\s*([\s\S]*?)\}/, (m, body) => {
      const inject = `
      viteConf.resolve = viteConf.resolve || {};
      viteConf.resolve.alias = { ...(viteConf.resolve.alias || {}), buffer: 'buffer', process: 'process/browser' };

      viteConf.define = { ...(viteConf.define || {}), global: 'globalThis' };

      viteConf.optimizeDeps = { ...(viteConf.optimizeDeps || {}), include: [ ...(viteConf.optimizeDeps?.include || []), 'buffer', 'process' ] };
`;
      return `extendViteConf(viteConf) {${inject}\n${body}\n}`;
    });
  } else {
    s = s.replace(/build\s*:\s*\{/, match => `${match}
    extendViteConf(viteConf) {
      viteConf.resolve = viteConf.resolve || {};
      viteConf.resolve.alias = { ...(viteConf.resolve.alias || {}), buffer: 'buffer', process: 'process/browser' };

      viteConf.define = { ...(viteConf.define || {}), global: 'globalThis' };

      viteConf.optimizeDeps = { ...(viteConf.optimizeDeps || {}), include: [ ...(viteConf.optimizeDeps?.include || []), 'buffer', 'process' ] };
    },`);
  }
  return s;
}

function stripStrayGlobals(s) {
  // Remove naked "globals: { Buffer: true, global: true, process: true }" objects if left behind
  return s.replace(/\bglobals\s*:\s*\{\s*Buffer\s*:\s*true\s*,\s*global\s*:\s*true\s*,\s*process\s*:\s*true\s*\}\s*,?/g, '');
}

function processFile(file) {
  let s = fs.readFileSync(file, 'utf8');
  const before = s;

  s = removeImportAndCall(s, 'vite-plugin-node-polyfills', 'nodePolyfills');
  s = stripStrayGlobals(s);
  s = ensureBoot(s);
  s = ensureExtendViteConf(s);

  if (s !== before) {
    fs.writeFileSync(file + '.bak.autofix', before);
    fs.writeFileSync(file, s);
    console.log('Patched:', file);
  } else {
    console.log('No changes needed:', file);
  }
}

['quasar.config.js', 'quasar.config.ts'].forEach(f => {
  if (fs.existsSync(f)) processFile(f);
});
