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

  // Lucide is the one icon family, and the Material font is no longer loaded, so a Material
  // name would render as its literal text. Quasar's own icons come from src/js/lucide-icons.ts.
  it("no Material icon names (use a Lucide component or lucideIcon())", () => {
    const material = (text: string) =>
      [...text.matchAll(/<q-icon\b[^>]*>/g)].some(([tag]) =>
        /\s:?name="[^"]*/.test(tag)
      ) ||
      /\s(icon|icon-right)="[a-z]/.test(text) ||
      /\s:(icon|icon-right)="[^"]*'[a-z_]+'/.test(text);
    expect(offenders(material)).toEqual([]);
    const scripts = (readdirSync(SRC, { recursive: true }) as string[])
      .filter((f) => /\.(ts|js)$/.test(f) && !f.includes("__tests__"))
      .filter((f) =>
        /\bicon:\s*["'][a-z_]+["']/.test(readFileSync(join(SRC, f), "utf8"))
      );
    expect(scripts).toEqual([]);
  });

  // A pattern's classes belong to its component: everyone else uses the component, so the
  // markup (and the board's sample of it) can't drift into copies.
  it.each([
    ["ui/AppBadge.vue", /^app-badge(--[\w-]+)?$/],
    ["ui/IconButton.vue", /^(app-icon-btn|floating-close-btn)$/],
    ["ui/IconCircle.vue", /^app-icon-circle(--[\w-]+)?$/],
    ["ui/OptionRow.vue", /^app-option-row(__[\w-]+|--[\w-]+)?$/],
    ["ui/BlockingState.vue", /^blocking-state(__[\w-]+)?$/],
    ["ui/ConfirmDialog.vue", /^council-dialog(__[\w-]+)?$/],
    ["ui/EmptyState.vue", /^app-empty(__(title|text))?$/],
    ["WalletActions.vue", /^wallet-(actions|action-btn|scan-btn)$/],
    [
      "MintCard.vue",
      /^mint-card(--active|__(body|head|foot|foot--meta|balances|plus))?$/,
    ],
  ])("only %s uses its classes", (owner, pattern) => {
    expect(
      offenders((text) =>
        [...text.matchAll(/\s:?class="([^"]*)"/g)].some(([, value]) =>
          value.split(/[\s'"`{}:,?]+/).some((token) => pattern.test(token))
        )
      ).filter((file) => !file.endsWith(owner))
    ).toEqual([]);
  });

  it("one pending mark: no spinner outside PendingDots", () => {
    expect(
      offenders((text) => /<q-spinner/.test(text)).filter(
        (file) => !file.endsWith("ui/PendingDots.vue")
      )
    ).toEqual([]);
  });

  // A skeleton drawn by the component it stands in for has the loaded boxes by construction.
  it("skeletons live in components with a skeleton prop", () => {
    expect(
      offenders(
        (text) =>
          text.includes("<q-skeleton") &&
          !/\bskeleton:\s*\{\s*type:\s*Boolean/.test(text)
      )
    ).toEqual([]);
  });

  it("no q-btn-toggle (use SegmentedControl)", () => {
    expect(offenders((text) => text.includes("<q-btn-toggle"))).toEqual([]);
  });

  // The field's shape, fill and edge come from app.scss alone; a component that resets the
  // control's radius or fill paints a second shape inside the first (a pill fill inside a
  // rounded border). The paste box is its own borderless pattern.
  it("no component restyles a field's control", () => {
    expect(
      offenders((text) =>
        [...text.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].some(([, css]) =>
          css.includes("q-field__control")
        )
      ).filter((file) => !file.endsWith("ParseInputComponent.vue"))
    ).toEqual([]);
  });

  it("text fields are the one outlined style", () => {
    expect(
      offenders((text) =>
        [...text.matchAll(/<q-input\b[^>]*>/g)].some(([tag]) =>
          /\s(dense|rounded|filled|standout|borderless)(?=[\s>/=])/.test(tag)
        )
      )
    ).toEqual([]);
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
