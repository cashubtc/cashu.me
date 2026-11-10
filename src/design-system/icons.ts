// Every icon the app uses, read from the source at build time (dev only, like usage.ts): Lucide
// icons by their imports, and any Material icon names still passed to Quasar (`name="…"`,
// `icon="…"`, or quoted names inside a `:name`/`:icon` binding). The board shows them in one
// grid to check they read as one family.

const VUE = import.meta.globEager("/src/**/*.vue", { as: "raw" });
const TS = import.meta.globEager("/src/**/*.ts", { as: "raw" });
const SOURCES = { ...VUE, ...TS } as unknown as Record<string, string>;

// The board would add every icon it demos; leave it out.
const IGNORED =
  /\/(DesignSystemPage\.vue|design-system\/|components\/ds\/)|\.test\.ts$/;

export type DsIcon = { name: string; files: string[] };

const add = (map: Map<string, Set<string>>, name: string, file: string) => {
  if (!map.has(name)) map.set(name, new Set());
  map.get(name)?.add(file);
};

const lucide = new Map<string, Set<string>>();
const material = new Map<string, Set<string>>();

for (const [path, text] of Object.entries(SOURCES)) {
  if (IGNORED.test(path)) continue;
  const file = path.replace(/^\/src\//, "");
  for (const m of text.matchAll(
    /import\s*\{([^}]*)\}\s*from\s*["']lucide-vue-next["']/g
  )) {
    for (const part of m[1].split(",")) {
      const name = part.trim().split(/\s+as\s+/)[0];
      if (name) add(lucide, name, file);
    }
  }
  if (!path.endsWith(".vue")) continue;
  // `name` only on q-icon (a transition also has a name); `icon` on any Quasar component.
  for (const tag of text.matchAll(/<q-icon\b[^>]*>/g)) {
    const n = tag[0].match(/\sname="([a-z][a-z0-9_]*)"/);
    if (n) add(material, n[1], file);
    const b = tag[0].match(/\s:name="([^"]*)"/);
    if (b)
      for (const q of b[1].matchAll(/'([a-z][a-z0-9_]+)'/g))
        add(material, q[1], file);
  }
  for (const m of text.matchAll(/\s(?:icon|icon-right)="([a-z][a-z0-9_]*)"/g))
    add(material, m[1], file);
}

const list = (map: Map<string, Set<string>>): DsIcon[] =>
  [...map.entries()]
    .map(([name, files]) => ({ name, files: [...files].sort() }))
    .sort((a, b) => a.name.localeCompare(b.name));

export const lucideIcons = list(lucide);
export const materialIcons = list(material);
