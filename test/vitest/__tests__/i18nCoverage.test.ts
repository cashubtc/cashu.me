// Every user-facing string goes through the locale files (src/i18n), so each of the 14
// languages can carry it. These checks keep it that way: no literal text handed to a toast,
// every locale holds the same keys as en-US, and a translation names only placeholders the
// English message provides (a misspelt {amount} would print as the raw text).
import { readdirSync, readFileSync, statSync } from "fs";
import { join, relative } from "path";
import { describe, expect, it } from "vitest";
import messages from "src/i18n";

const SRC = join(__dirname, "../../../src");
// The design-system board is developer-only and English on purpose.
const SKIP = /(^|\/)(design-system|ds|__tests__|i18n)\/|DesignSystemPage\.vue$/;

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(vue|ts|js)$/.test(name) ? [path] : [];
  });
}

function flatten(tree: object, prefix = ""): Record<string, string> {
  return Object.entries(tree).reduce((flat, [key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object")
      Object.assign(flat, flatten(value, path));
    else flat[path] = String(value);
    return flat;
  }, {} as Record<string, string>);
}

const placeholders = (text: string) =>
  [...text.matchAll(/\{\s*(\w+)\s*\}/g)].map((m) => m[1]);

describe("i18n coverage", () => {
  it("toasts take translated text, not English literals", () => {
    // A literal (or a raw `${error.message}`) as the title; raw detail belongs in the caption.
    const literal = /\bnotify(Success|Error|Warning|Copied)?\(\s*["'`]/;
    const offenders = sourceFiles(SRC)
      .map((file) => relative(SRC, file))
      .filter((file) => !SKIP.test(file))
      .filter((file) =>
        readFileSync(join(SRC, file), "utf8")
          .split("\n")
          .filter((line) => !line.trim().startsWith("//"))
          .join("\n")
          .match(literal)
      );
    expect(offenders).toEqual([]);
  });

  const english = flatten(messages["en-US"]);
  const locales = Object.keys(messages).filter((code) => code !== "en-US");

  it.each(locales)("%s has exactly the en-US keys", (code) => {
    const keys = Object.keys(flatten(messages[code as keyof typeof messages]));
    const englishKeys = Object.keys(english);
    expect(englishKeys.filter((key) => !keys.includes(key))).toEqual([]);
    expect(keys.filter((key) => !(key in english))).toEqual([]);
  });

  it.each(locales)("%s uses only the placeholders en-US provides", (code) => {
    const translated = flatten(messages[code as keyof typeof messages]);
    const unknown = Object.entries(translated).flatMap(([key, text]) => {
      const known = new Set(placeholders(english[key] ?? ""));
      // Plural messages also get {n} and {count} from vue-i18n.
      if (english[key]?.includes("|")) known.add("n").add("count");
      return placeholders(text)
        .filter((name) => !known.has(name))
        .map((name) => `${key}: {${name}}`);
    });
    expect(unknown).toEqual([]);
  });
});
