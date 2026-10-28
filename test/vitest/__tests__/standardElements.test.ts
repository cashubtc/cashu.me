import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";

// Shared patterns have one implementation in src/css/elements.scss (or one component). These
// checks keep second copies from coming back; the design system board (src/pages/DesignSystemPage.vue) shows each one.

const SRC = join(__dirname, "../../../src");
const vueFiles = (readdirSync(SRC, { recursive: true }) as string[])
  .filter((f) => f.endsWith(".vue") && !f.endsWith("DesignSystemPage.vue"))
  .map((f) => ({ file: f, text: readFileSync(join(SRC, f), "utf8") }));

const offenders = (match: (text: string) => boolean) =>
  vueFiles.filter(({ text }) => match(text)).map(({ file }) => file);

describe("standard elements", () => {
  it.each([
    ["<q-badge", ".app-badge"],
    ["<q-chip", ".app-badge"],
    ["<q-banner", "AppCallout"],
    ["<q-select", "SheetSelect"],
    ["<q-btn-dropdown", "SheetSelect"],
  ])("no %s (use %s)", (tag) => {
    expect(offenders((text) => text.includes(tag))).toEqual([]);
  });

  it("no component restyles a standard element in its own styles", () => {
    expect(
      offenders((text) =>
        [...text.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].some(([, css]) =>
          /(^|[\s,}])\.app-[a-z]/m.test(css)
        )
      )
    ).toEqual([]);
  });
});
