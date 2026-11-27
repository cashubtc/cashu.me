import { describe, expect, it } from "vitest";
import enUS from "src/i18n/en-US";
import hiIN from "src/i18n/hi-IN";
import mrIN from "src/i18n/mr-IN";

type Messages = { [key: string]: string | Messages };

function flatten(messages: Messages, prefix = ""): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(messages)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") out[path] = value;
    else Object.assign(out, flatten(value, path));
  }
  return out;
}

// Placeholders like { amount } and links like @:global.actions.copy.label must survive translation.
const tokens = (s: string) =>
  [...s.matchAll(/\{\s*([^}\s]+)\s*\}|@:[\w.]+/g)]
    .map((m) => m[1] ?? m[0])
    .sort();

const english = flatten(enUS as Messages);

describe.each([
  ["hi-IN", hiIN],
  ["mr-IN", mrIN],
])("%s locale", (_, locale) => {
  const translated = flatten(locale as Messages);

  it("has exactly the same keys as en-US", () => {
    expect(Object.keys(translated).sort()).toEqual(Object.keys(english).sort());
  });

  it("keeps every placeholder and message link", () => {
    for (const [key, value] of Object.entries(english)) {
      expect(tokens(translated[key]), key).toEqual(tokens(value));
    }
  });
});
