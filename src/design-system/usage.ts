// Where each design system entry is used, read from the source at build time (dev only: the
// board's route is not registered in production). A component counts by its tag, in Pascal or
// kebab case; a class or literal counts wherever it appears.

import type { DsItem } from "src/design-system/registry";

// Vite 2: one plain literal pattern per call, raw text through `as: "raw"`.
const VUE = import.meta.globEager("/src/**/*.vue", { as: "raw" });
const TS = import.meta.globEager("/src/**/*.ts", { as: "raw" });
const SCSS = import.meta.globEager("/src/css/*.scss", { as: "raw" });
const CSS = import.meta.globEager("/src/css/*.css", { as: "raw" });
const SOURCES = { ...VUE, ...TS, ...SCSS, ...CSS } as unknown as Record<
  string,
  string
>;

// The board and its own machinery would count every entry; leave them out.
const IGNORED =
  /\/(DesignSystemPage\.vue|design-system\/|components\/ds\/)|\.test\.ts$/;

export type DsUsage = { file: string; line: number; count: number };

const kebab = (name: string) =>
  name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function pattern(item: DsItem): RegExp | null {
  const u = item.usage;
  if (!u) return null;
  if (u.tag) return new RegExp(`<(${u.tag}|${kebab(u.tag)})(?=[\\s/>])`, "g");
  if (u.className)
    return new RegExp(`(?<![\\w-])${escape(u.className)}(?![\\w-])`, "g");
  if (u.text) return new RegExp(escape(u.text), "g");
  return null;
}

export function usageOf(item: DsItem): DsUsage[] {
  const re = pattern(item);
  if (!re) return [];
  const own = item.source.split(" ")[0];
  const found: DsUsage[] = [];
  for (const [path, text] of Object.entries(SOURCES)) {
    const file = path.replace(/^\//, "");
    if (IGNORED.test(path) || file === own) continue;
    const matches = [...text.matchAll(re)];
    if (!matches.length) continue;
    const line = text.slice(0, matches[0].index).split("\n").length;
    found.push({ file, line, count: matches.length });
  }
  return found.sort(
    (a, b) => b.count - a.count || a.file.localeCompare(b.file)
  );
}

// Props, read from the component's own definition (Options API `props`).
const COMPONENT_FILES = import.meta.glob("/src/components/**/*.vue");
const PAGE_FILES = import.meta.glob("/src/pages/settings/SettingsSection.vue");
const COMPONENTS = { ...COMPONENT_FILES, ...PAGE_FILES };

export type DsProp = {
  name: string;
  type: string;
  required: boolean;
  default: string;
};

const typeName = (t: unknown): string =>
  Array.isArray(t)
    ? t.map(typeName).join(" | ")
    : typeof t === "function"
    ? (t as { name: string }).name
    : "any";

export type DsApi = { props: DsProp[]; emits: string[] };

export async function apiOf(item: DsItem): Promise<DsApi | null> {
  const path = "/" + item.source.split(" ")[0];
  const load = COMPONENTS[path];
  if (!path.endsWith(".vue") || !load) return null;
  const mod = (await load()) as {
    default: { props?: unknown; emits?: string[] | Record<string, unknown> };
  };
  const { props, emits } = mod.default;
  return {
    props: propList(props),
    emits: Array.isArray(emits) ? emits : Object.keys(emits || {}),
  };
}

function propList(props: unknown): DsProp[] {
  if (!props) return [];
  if (Array.isArray(props))
    return props.map((name) => ({
      name,
      type: "any",
      required: false,
      default: "",
    }));
  return Object.entries(props as Record<string, any>).map(([name, def]) => {
    const d =
      def && typeof def === "object" && !Array.isArray(def)
        ? def
        : { type: def };
    const dflt =
      d.default === undefined
        ? ""
        : typeof d.default === "function" && d.type !== Function
        ? "(factory)"
        : JSON.stringify(d.default);
    return {
      name,
      type: typeName(d.type),
      required: !!d.required,
      default: dflt,
    };
  });
}
