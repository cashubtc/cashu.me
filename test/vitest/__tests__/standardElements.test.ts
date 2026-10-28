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
    ["ui/QrCopyLine.vue", /^qr-copy-line(__icon)?$/],
    ["ui/AmountHeadline.vue", /^amount-headline$/],
    ["ui/PaymentStatus.vue", /^payment-status(__[\w-]+)?$/],
    ["ui/UnitToggle.vue", /^sheet-unit-toggle(__swap)?$/],
    ["ui/MintCardAction.vue", /^mint-card-add(__icon)?$/],
    ["ui/TonalChip.vue", /^(tonal-chip(__icon)?|qr-control-chip)$/],
    ["ui/FlowFooter.vue", /^(bottom-panel|flow-footer__(bar|col))$/],
    [
      "ui/SectionDivider.vue",
      /^(section-divider(-block|__caption)?|divider-(line|text))$/,
    ],
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

  // Pictures and glyphs in a round slot are IconCircle (src for a picture, the icon as its
  // fallback). The remaining q-avatars are the ones still waiting to move over; no new ones.
  it("round avatars use IconCircle", () => {
    expect(offenders((text) => text.includes("<q-avatar")).sort()).toEqual([
      "components/ActivityRow.vue",
      "components/MintInfoContainer.vue",
      "components/WelcomeDialog.vue",
      "pages/CreateMintReviewPage.vue",
    ]);
  });

  // Full-screen flows are FlowDialog (one shell: fade, Escape closes, the desktop dialog).
  it("full-screen flows use FlowDialog", () => {
    expect(
      offenders((text) => /<q-dialog\b[^>]*\smaximized[\s>]/.test(text)).filter(
        (file) => !file.endsWith("ui/FlowDialog.vue")
      )
    ).toEqual(["pages/WalletPage.vue"]);
  });

  it("busy buttons say what they are doing with BusyLabel", () => {
    expect(
      offenders((text) => /<PendingDots class="on-left"/.test(text)).filter(
        (file) => !file.endsWith("ui/BusyLabel.vue")
      )
    ).toEqual([]);
  });

  // Round icon buttons are IconButton: 44px and always labelled (hand-built ones had no name
  // or a 24px target, council R76-R77). Allowed: the card corner menu, the callout close and
  // the mint QR toggle, the wallet scan disc and the flow footer's back, which own their
  // geometry.
  it("round icon buttons use IconButton", () => {
    const allowed =
      /class="[^"]*\b(mint-card-more|app-callout__close|qr-toggle|wallet-scan-btn|flow-footer__back)\b/;
    expect(
      offenders((text) =>
        [...text.matchAll(/<q-btn\b[^>]*>/g)].some(
          ([tag]) =>
            /(?<![:\w-])round\b/.test(tag) &&
            /(?<![:\w-])flat\b/.test(tag) &&
            !allowed.test(tag)
        )
      ).filter(
        (file) =>
          !file.endsWith("pages/DesignSystemPage.vue") &&
          !file.includes("components/ui/")
      )
    ).toEqual([]);
  });

  // One language list (src/js/languages.ts): two hand-kept copies drifted (council R79).
  it("language options come from src/js/languages", () => {
    expect(
      offenders((text) => /label:\s*"English",\s*value:\s*"en-US"/.test(text))
    ).toEqual([]);
  });

  // A flow's centred content column is FlowColumn (16 hand-built copies, council R82).
  it("flow content columns use FlowColumn", () => {
    expect(
      offenders((text) =>
        /justify-center[^"]*"[^>]*>\s*<div\s+class="col-12[^"]*"\s+style="max-width: var\(--app-column\)"/.test(
          text
        )
      )
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
