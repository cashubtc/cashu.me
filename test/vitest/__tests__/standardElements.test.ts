import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";

// Shared patterns have one implementation in src/css/elements.scss (or one component). These
// checks keep second copies from coming back; the design system board (src/pages/DesignSystemPage.vue) shows each one.

const SRC = join(__dirname, "../../../src");
// Dev-only design explorations (src/design-system/explorations) draw static lookalikes of
// store-bound components (ChooseMint, a flow's surface) with their real classes; they ship nowhere.
const vueFiles = (readdirSync(SRC, { recursive: true }) as string[])
  .filter((f) => f.endsWith(".vue") && !f.endsWith("DesignSystemPage.vue"))
  .filter((f) => !f.startsWith("design-system/explorations/"))
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
    ["ui/ExpansionIndicator.vue", /^expansion-indicator(__icon|--expanded)?$/],
    ["ui/QrCopyLine.vue", /^qr-copy-line(__icon)?$/],
    ["ui/AmountHeadline.vue", /^amount-headline$/],
    ["ui/PaymentStatus.vue", /^payment-status(__[\w-]+)?$/],
    ["ui/UnitToggle.vue", /^sheet-unit-toggle(__chevron)?$/],
    ["OnchainDepositLimits.vue", /^deposit-limits-range$/],
    ["ui/RowValue.vue", /^row-value(__(inner|text))?$/],
    ["ui/MetaLine.vue", /^meta-line(__sep)?$/],
    ["ui/AmountWarning.vue", /^amount-warning(__text)?$/],
    ["ui/MintCardAction.vue", /^mint-card-add(__icon)?$/],
    ["ui/TonalChip.vue", /^(tonal-chip(__icon)?|qr-control-chip)$/],
    ["ui/FlowFooter.vue", /^(bottom-panel|flow-footer__(bar|col))$/],
    // The flow surface (base.scss) is FlowDialog's card; no page paints it again.
    ["ui/FlowDialog.vue", /^flow-surface$/],
    [
      "ui/SectionDivider.vue",
      /^(section-divider(-block|-block--start|--start|__caption)?|divider-(line|text))$/,
    ],
    [
      "MintCard.vue",
      /^mint-card(--active|--host-only|__(body|head|status|ring|check|foot|foot--meta|balances|plus|action-skeleton))?$/,
    ],
    // The mint picker's shell, sizes and chevron button are ChooseMint's alone.
    ["ChooseMint.vue", /^mint-picker(--[\w-]+|__[\w-]+)?$/],
  ])("only %s uses its classes", (owner, pattern) => {
    expect(
      offenders((text) =>
        [...text.matchAll(/\s:?class="([^"]*)"/g)].some(([, value]) =>
          value.split(/[\s'"`{}:,?]+/).some((token) => pattern.test(token))
        )
      ).filter((file) => !file.endsWith(owner))
    ).toEqual([]);
  });

  // The unit switch is a header action (owner 2026-10-29b, item 11): inside a
  // FullscreenDialogHeader's #actions, never next to the amount and its ⇅ fiat swap.
  it("the unit toggle sits in a header's actions, not with the amount", () => {
    expect(offenders((text) => /<UnitToggle\b/.test(text)).sort()).toEqual([
      "components/CreateInvoiceDialog.vue",
      "components/PayInvoiceDialog.vue",
      "components/SendTokenDialog.vue",
    ]);
    expect(
      offenders(
        (text) =>
          [...text.matchAll(/<UnitToggle\b/g)].some(({ index }) => {
            const before = text.slice(0, index);
            return (
              before.lastIndexOf("#actions>") <=
              before.lastIndexOf("</template>")
            );
          }) ||
          /(?<![\w-])unit-toggle\b|unitToggle|toggle-unit|unit-chip/.test(text)
      )
    ).toEqual([]);
  });

  // One unit code (src/js/format-currency.ts unitCode): no hand-made unit names elsewhere.
  it("units are named by unitCode", () => {
    expect(
      offenders(
        (text) =>
          text.includes("₿ (sat)") ||
          // price-feed keys (prices[unit.toUpperCase()]) are data, not names
          /(?<!\[)\b[\w.]*[uU]nit\??\.toUpperCase\(/.test(text) ||
          /activeUnitLabel/.test(text)
      )
    ).toEqual([]);
  });

  // Quasar's type classes lose to the global button standard (src/css/app.scss .q-btn), so a
  // q-btn that needs its own size owns a class for it (the keypad's .keypad-key).
  it("buttons carry no Quasar type classes", () => {
    expect(
      offenders((text) =>
        /<q-btn\b[^>]*\sclass="[^"]*\btext-(h[1-6]|subtitle[12]|body[12])\b/.test(
          text
        )
      )
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

  // Full-screen flows are FlowDialog (one shell: fade, Escape closes, full window).
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
  // or a 24px target, council R76-R77). Allowed: the callout close and the mint QR toggle,
  // the wallet scan disc and the flow footer's back, which own their geometry. The mint
  // card's details button is an IconButton too.
  it("round icon buttons use IconButton", () => {
    const allowed =
      /class="[^"]*\b(app-callout__close|qr-toggle|wallet-scan-btn|flow-footer__back)\b/;
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

  // Onboarding copy is CjkText, so a Chinese word never splits across lines (council R83).
  it("onboarding paragraphs use CjkText", () => {
    expect(
      vueFiles
        .filter(({ file }) => file.includes("pages/welcome/"))
        .filter(({ text }) => /<p\b[^>]*>\s*\{\{\s*\$t\(/.test(text))
        .map(({ file }) => file)
    ).toEqual([]);
  });

  // A row's value and chevron are one RowValue, never a hand-built side section with a
  // chevron in it (the side section is a column, so the value stacked above it, council R83).
  // Captions of facts are MetaLine parts, never strings glued with " · " (in Arabic the
  // glued Latin parts merged into one run and read out of order, council R84).
  // The wobbling warning under an amount is AmountWarning, not a hand-keyed transition.
  it("amount warnings come from AmountWarning", () => {
    expect(
      offenders((text) => /name="wobble"/.test(text)).filter(
        (file) => !file.endsWith("ui/AmountWarning.vue")
      )
    ).toEqual([]);
  });

  // One section heading: SectionDivider, on settings pages and Mint details alike.
  it("section headings come from SectionDivider", () => {
    expect(
      offenders((text) =>
        /class="[^"]*settings-section-(title|header|caption)/.test(text)
      )
    ).toEqual([]);
  });

  // Fields carry their own label (the outlined field's label stays visible with content),
  // owner 2026-10-29.
  it("no label sits above a field", () => {
    expect(
      offenders((text) =>
        /<FieldLabel|class="(field-label|seed-label)|class="text-subtitle2 text-weight-medium/.test(
          text
        )
      )
    ).toEqual([]);
  });

  it("every text field shows its label", () => {
    expect(
      offenders((text) =>
        // Quoted attribute values may hold ">" (a :type ternary).
        [...text.matchAll(/<q-(input|field)\b(?:[^>"]|"[^"]*")*>/g)].some(
          ([tag]) => !/\s:?label=/.test(tag)
        )
      )
    ).toEqual([]);
  });

  // Owner 2026-10-29 (item 31): the centred caps label between two hairlines stays.
  it("section divider keeps its centred caps label between hairlines", () => {
    const sfc = readFileSync(
      join(SRC, "components/ui/SectionDivider.vue"),
      "utf8"
    );
    const css = readFileSync(join(SRC, "css/app.scss"), "utf8");
    expect(sfc.match(/class="divider-line"/g)?.length).toBe(2);
    expect(css).toMatch(/\.divider-text \{[^}]*text-transform: uppercase/);
    expect(css).toMatch(/\.section-divider \{[^}]*display: flex/);
  });

  // Settings sub-pages included (council R91): only a field label (the review rating) sits
  // on the start edge.
  it("content sections use the centred divider", () => {
    expect(
      offenders((text) =>
        /<SectionDivider[^>]*align="start"/.test(text)
      ).filter((f) => !/CreateMintReviewPage\.vue$/.test(f))
    ).toEqual([]);
  });

  // Two button text standards; Quasar's size writes an inline font-size. Dense chips-style
  // buttons (the history row's Check status) own their size.
  it("pill buttons never set a size", () => {
    expect(
      offenders((t) =>
        [...t.matchAll(/<q-btn\b[^>]*>/g)].some(
          ([tag]) =>
            /\srounded\b/.test(tag) &&
            !/\sdense\b/.test(tag) &&
            /\s:?size=/.test(tag)
        )
      )
    ).toEqual([]);
    expect(
      readFileSync(join(SRC, "components/SendPaymentRequest.vue"), "utf8")
    ).not.toMatch(/buttonSize/);
  });

  // Owner batch 2, item 3: Paste (and Clear) inside the field, and one scan affordance, the
  // labelled "Scan QR code" OptionRow under it, shown only with a camera.
  it("paste sits inside its field, scan is the one row under it", () => {
    expect(offenders((t) => /paste-text-btn/.test(t))).toEqual([]);
    const parse = readFileSync(
      join(SRC, "components/ParseInputComponent.vue"),
      "utf8"
    );
    const field = parse.slice(
      parse.indexOf("<q-input"),
      parse.indexOf("</q-input>")
    );
    expect(field).not.toMatch(/\$emit\('scan'\)/);
    expect(parse.match(/\$emit\('scan'\)/g)).toHaveLength(1);
    expect(parse).toMatch(/<OptionRow\s+v-if="hasCamera"/);
    expect(parse).toMatch(/\bScan as ScanIcon\b/);
  });

  // Owner batch 2, item 7: the deposit range is the info callout, not a helper line.
  it("deposit limits render the info callout", () => {
    const limits = readFileSync(
      join(SRC, "components/OnchainDepositLimits.vue"),
      "utf8"
    );
    expect(limits).toMatch(/<AppCallout[^>]*variant="info"/);
    expect(limits).toMatch(/<bdi dir="ltr" class="deposit-limits-range">/);
  });

  // A block that opens in place is RevealTransition, not another copy of the slide CSS.
  it("reveals come from RevealTransition", () => {
    expect(offenders((text) => /smooth-slide/.test(text))).toEqual([]);
  });

  it("row captions are MetaLine parts", () => {
    expect(
      offenders((text) => /:caption="[^"]*['`] · ['`]/.test(text))
    ).toEqual([]);
  });

  it("settings chevrons come from RowValue", () => {
    expect(
      offenders((text) => /class="settings-menu-chevron"/.test(text)).filter(
        (file) =>
          !file.endsWith("ui/RowValue.vue") &&
          !file.endsWith("ui/SettingsActionRow.vue")
      )
    ).toEqual([]);
  });

  // The one exception is MintCard's ring while the wallet switches to that mint (owner
  // 2026-10-29); busy buttons and pending rows keep the dots.
  it("one pending mark: no spinner outside PendingDots and the mint card's switch", () => {
    expect(
      offenders((text) => /<q-spinner/.test(text)).filter(
        (file) =>
          !file.endsWith("ui/PendingDots.vue") && !file.endsWith("MintCard.vue")
      )
    ).toEqual([]);
    const card = readFileSync(join(SRC, "components/MintCard.vue"), "utf8");
    expect(card.match(/<q-spinner\b[^>]*>/g)).toHaveLength(1);
    expect(card).toMatch(/<q-spinner\s+v-if="busy"/);
  });

  // Owner 2026-10-29 (items 1, 13): the selected mint shows a check, not an "Active" badge,
  // and the card's details button is vertical dots.
  it("mint cards mark the selected mint with a check and use vertical dots", () => {
    const settings = readFileSync(
      join(SRC, "components/MintSettings.vue"),
      "utf8"
    );
    expect(settings).not.toMatch(/MintSettings\.active_badge/);
    expect(settings).not.toMatch(/#status/);
    expect(settings).toMatch(/EllipsisVertical as/);
    expect(settings).not.toMatch(/\bEllipsis as/);
    expect(
      offenders(
        (text) => /<template[^>]*#status/.test(text) && /<MintCard/.test(text)
      )
    ).toEqual([]);
  });

  // Owner 2026-10-29 (items 3, 14): one picker recipe; density alone sets its height and the
  // chevron is a real, labelled button that says what it opens.
  it("the mint picker is one recipe with a real chevron button", () => {
    const picker = readFileSync(join(SRC, "components/ChooseMint.vue"), "utf8");
    const template = picker.slice(0, picker.indexOf("<script"));
    // No size or surface chosen by the label.
    expect(template).not.toMatch(/!label|label \?|"label &&/);
    expect(template).not.toMatch(/mint-chip/);
    expect(picker).not.toMatch(/\brounded:/);
    // The field is not itself a control: one native button, the chevron.
    expect(template.match(/<button\b/g)).toBeNull();
    expect(template.match(/<IconButton\b/g)).toHaveLength(1);
    const trigger = template.slice(template.indexOf("<IconButton"));
    for (const attr of [
      'aria-haspopup="listbox"',
      ':aria-expanded="',
      ':aria-controls="uid',
      ":data-testid=\"testId + '-trigger'\"",
      ':disable="disable"',
      "@click.stop=",
    ])
      expect(trigger).toContain(attr);
    expect(template).toContain(":id=\"uid + '-options'\"");
    // Glyph: the rounder Building2, everywhere a mint has no picture.
    expect(picker).toMatch(/Building2 as MintIcon/);
  });

  it("the mint glyph is Building2, not the sharp Landmark", () => {
    expect(
      offenders(
        (text) => /\bLandmark\b/.test(text) && /lucide-vue-next/.test(text)
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
  // rounded border).
  it("no component restyles a field's control", () => {
    expect(
      offenders((text) =>
        [...text.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].some(([, css]) =>
          css.includes("q-field__control")
        )
      )
    ).toEqual([]);
  });

  it("text fields are the one outlined style", () => {
    expect(
      offenders((text) =>
        [...text.matchAll(/<q-(input|field)\b[^>]*>/g)].some(([tag]) =>
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
  // Owner item 17: a route transition around the page component itself never finished leaving a
  // fragment-root page, so Back showed a blank screen. Route transitions animate a native wrapper.
  it("route transitions wrap the page in a native element", () => {
    expect(
      offenders((text) =>
        /<transition\b[^>]*>\s*<component\b/.test(
          text.replace(/<!--[\s\S]*?-->/g, "")
        )
      )
    ).toEqual([]);
    const app = readFileSync(join(SRC, "App.vue"), "utf8");
    expect(app).not.toMatch(/<transition\b/);
  });

  it("routed pages keep their comments inside the root element", () => {
    const routes = readFileSync(join(SRC, "router/routes.js"), "utf8");
    const pages = [...routes.matchAll(/src\/(pages\/[\w/]+\.vue)/g)].map(
      ([, page]) => page
    );
    expect(pages.length).toBeGreaterThan(10);
    expect(
      pages.filter((page) =>
        /^<template>\s*<!--/.test(readFileSync(join(SRC, page), "utf8"))
      )
    ).toEqual([]);
  });
  // Wallet home (owner items 5, 6, 7, 24): the minimal Scan glyph, a full-width tab indicator
  // with no baseline, the turning chevron instead of a grab handle, toasts at the top.
  it("wallet scan keeps the minimal Scan glyph", () => {
    const actions = readFileSync(
      join(SRC, "components/WalletActions.vue"),
      "utf8"
    );
    expect(actions).toMatch(/\bScan as ScanIcon\b/);
    expect(actions).not.toMatch(/import[^;]*\bScanLine\b/);
  });

  it("wallet tabs use the full-width indicator", () => {
    const files = ["pages/WalletPage.vue", "pages/DesignSystemPage.vue"].map(
      (f) => readFileSync(join(SRC, f), "utf8")
    );
    for (const text of files) {
      const tabs = [...text.matchAll(/<q-tabs\b[^>]*>/g)].map(([tag]) => tag);
      expect(tabs.length).toBeGreaterThan(0);
      for (const tag of tabs) {
        expect(tag).not.toMatch(/narrow-indicator/);
        expect(tag).toMatch(/wallet-tabs/);
      }
    }
  });

  it("the wallet panel toggle is the turning chevron, not a grab handle", () => {
    expect(offenders((text) => text.includes("wallet-history-handle"))).toEqual(
      []
    );
    const css = readdirSync(join(SRC, "css"))
      .map((f) => readFileSync(join(SRC, "css", f), "utf8"))
      .join("\n");
    expect(css).not.toMatch(/wallet-history-handle/);
  });

  it("toasts sit at the top, with no bottom or tucked stack", () => {
    const notify = readFileSync(join(SRC, "js/notify.ts"), "utf8");
    expect(notify).toMatch(
      /POSITION: QNotifyCreateOptions\["position"\] = "top"/
    );
    expect(notify).not.toMatch(/position:\s*"bottom/);
    const app = readFileSync(join(SRC, "css/app.scss"), "utf8");
    expect(app).not.toMatch(
      /q-notifications__list--bottom|q-notification--bottom-/
    );
    expect(app).not.toMatch(/\.q-notification:not\(:last-child\)/);
  });

  it("desktop flows fill the window (owner 2026-10-29, item 28)", () => {
    const app = readFileSync(join(SRC, "css/app.scss"), "utf8");
    expect(app).not.toMatch(
      /\.q-dialog__inner--maximized\s*>\s*\.q-card\s*\{[^}]*\b(max-)?width\s*:/
    );
    expect(app).not.toMatch(
      /\.q-dialog__inner--maximized\s*\{[^}]*align-items:\s*center/
    );
  });

  it("flows paint one surface", () => {
    expect(offenders((t) => /'bg-dark'\s*:\s*'bg-white'/.test(t))).toEqual([]);
    expect(
      readFileSync(join(SRC, "components/ui/FlowDialog.vue"), "utf8")
    ).toContain("flow-surface");
    const app = readFileSync(join(SRC, "css/app.scss"), "utf8");
    const panel = app.match(/\n\.bottom-panel\s*\{[^}]*\}/)?.[0] ?? "";
    expect(panel).toContain("var(--flow-surface");
  });

  it("FlowFooter buttons use the caps standard", () => {
    const blocks = vueFiles.flatMap(({ file, text }) =>
      [...text.matchAll(/<FlowFooter[\s\S]*?<\/FlowFooter>/g)].map(
        ([block]) => ({ file, block })
      )
    );
    expect(blocks.length).toBeGreaterThan(0);
    expect(
      blocks
        .filter(({ block }) => /size="lg"|button-size=|no-caps/.test(block))
        .map(({ file }) => file)
    ).toEqual([]);
  });

  // Detail rows (owner 2026-10-29, items 11, 20, 22, 34, 35): one 44px row 4px apart, the
  // spacing owned by .detail-table, links and copies being the row itself.
  const openingTags = (text: string, tag: string) =>
    [
      ...text.matchAll(
        new RegExp(`<${tag}\\b(?:[^>"']|"[^"]*"|'[^']*')*>`, "g")
      ),
    ].map(([t]) => t);

  it("detail rows are spaced by .detail-table, not their own margins", () => {
    expect(
      offenders((text) =>
        ["DetailRow", "ConfirmationsRow"].some((tag) =>
          openingTags(text, tag).some((t) =>
            /\sclass="[^"]*\bq-m[tby]-/.test(t)
          )
        )
      )
    ).toEqual([]);
  });

  it("links in detail rows use DetailRow href", () => {
    expect(
      offenders((text) =>
        [...text.matchAll(/<DetailRow\b[\s\S]*?<\/DetailRow>/g)].some(
          ([block]) => /<a\s/.test(block)
        )
      )
    ).toEqual([]);
  });

  it("no value-click on DetailRow (use action, href or copy-value)", () => {
    expect(offenders((text) => text.includes("@value-click"))).toEqual([]);
  });

  it("one mint header: no compact MintIdentityHeader", () => {
    expect(
      offenders((text) =>
        openingTags(text, "MintIdentityHeader").some((t) =>
          /\scompact[\s>/=]/.test(t)
        )
      )
    ).toEqual([]);
  });

  it("mint contacts are DetailRows", () => {
    const page = readFileSync(join(SRC, "pages/MintDetailsPage.vue"), "utf8");
    expect(page).not.toContain("contact-item");
    expect(page).not.toContain("<CopyButton");
  });

  it("mint details rows are not indented (owner 2026-10-29, item 34)", () => {
    const page = readFileSync(join(SRC, "pages/MintDetailsPage.vue"), "utf8");
    const css = page.match(/<style[^>]*>([\s\S]*?)<\/style>/)?.[1] ?? "";
    expect(css).not.toMatch(/padding-inline/);
  });

  it("the audit retry is a busy row, not a refresh glyph", () => {
    const audit = readFileSync(
      join(SRC, "components/MintAuditInfo.vue"),
      "utf8"
    );
    expect(audit).not.toContain("<RefreshCwIcon");
    expect(audit).toMatch(/:busy="retrying"/);
  });

  it("one on-chain status", () => {
    const quote = readFileSync(
      join(SRC, "components/MintQuoteInformation.vue"),
      "utf8"
    );
    expect(quote).not.toMatch(/<ChainStatusRow|<ConfirmationsRow/);
    expect(quote.match(/<QuoteStatusRow\b/g)).toHaveLength(1);
  });

  // Owner 2026-10-29b, item 10: one status, but not a colourless one. A met threshold and a
  // paid receive read in the theme's positive colour after a check; nothing hard-codes a green.
  it("confirmed and paid keep their check and positive colour", () => {
    for (const file of ["ConfirmationsRow.vue", "QuoteStatusRow.vue"]) {
      const text = readFileSync(join(SRC, "components", file), "utf8");
      expect(text, file).toContain("CircleCheckIcon");
      expect(text, file).toContain("text-positive");
      expect(text, file).not.toMatch(
        /#(?:4ade80|15803d|21ba45|5eead4|0f766e)/i
      );
    }
  });

  // Owner 2026-10-29b, item 2: a row's trailing glyph takes its value's colour, so it sits
  // inside the value and no glyph rule names a colour of its own.
  it("detail row glyphs sit in the value and take its colour", () => {
    const row = readFileSync(join(SRC, "components/ui/DetailRow.vue"), "utf8");
    const template = row.match(/<template>([\s\S]*)<\/template>/)![1];
    const value = template.slice(template.indexOf('class="detail-value"'));
    expect(value).toContain('class="detail-item__chevron"');
    const css = row.match(/<style[^>]*>([\s\S]*?)<\/style>/)![1];
    expect(css).not.toMatch(
      /\.detail-(?:item__chevron|value__glyph|value__external)[^{]*\{[^}]*color:\s*var\(/
    );
  });

  // Owner 2026-10-29b, item 5: settings row titles sit on a whole-pixel line, so the text
  // centres on its 20px icon the same way in every browser (Quasar's 1.2em made 19.2px).
  it("settings row titles use a whole-pixel line height", () => {
    const css = readFileSync(join(SRC, "css/settings.scss"), "utf8");
    const rule = css.match(
      /\.settings-menu-group \.q-item__label:not\(\.q-item__label--caption\) \{([^}]*)\}/
    )?.[1];
    expect(rule).toMatch(/line-height:\s*20px/);
  });

  // Onboarding (owner 2026-10-29, items 16, 29, 32): one column on every step, the app's own
  // mode, and the standard outlined field.
  const welcomeFiles = vueFiles.filter(
    ({ file }) =>
      file.includes("pages/welcome/") || file.endsWith("pages/WelcomePage.vue")
  );
  const read = (f: string) => readFileSync(join(SRC, f), "utf8");

  it("welcome steps set no width or gutter of their own", () => {
    expect(
      welcomeFiles
        .filter(({ text }) => /max-width:\s*(500px|32ch)|\.spacer\b/.test(text))
        .map(({ file }) => file)
    ).toEqual([]);
    expect(
      offenders((t) => /mobile-?[gG]utter|themed-?[tT]ext/.test(t))
    ).toEqual([]);
    expect(read("css/elements.scss")).not.toMatch(
      /\.welcome-slide__(title|description)\s*\{[^}]*max-width/
    );
    const scaffold = read("components/ui/WelcomeSlideScaffold.vue");
    expect(scaffold).toMatch(/<FlowColumn[^>]*class="q-px-md/);
    expect(scaffold).toContain("<FlowFooter");
    expect(read("pages/WelcomePage.vue")).toContain("<FlowFooter");
  });

  it("onboarding follows the app's mode", () => {
    expect(read("css/base.scss")).not.toMatch(/--app-welcome-bg:\s*#/);
    expect(read("css/elements.scss")).not.toMatch(
      /\.welcome-surface\s*\{[^}]*--app-text/
    );
    expect(offenders((t) => /<BottomSheet\b[^>]*\sdark[\s>]/.test(t))).toEqual(
      []
    );
    expect(read("components/BottomSheet.vue")).not.toContain(
      "bottom-sheet--dark"
    );
    expect(read("pages/welcome/WelcomeSlide2.vue")).toMatch(
      /installImage[\s\S]*\$q\.dark\.isActive/
    );
  });

  it("the welcome seed phrase is the outlined field, masked by default", () => {
    const seed = read("pages/welcome/WelcomeSlide3.vue");
    expect(seed).toMatch(/<q-field\b[^>]*\soutlined[^>]*readonly-outlined/);
    expect(seed).toContain("{{ hiddenMnemonic }}");
    expect(seed).toMatch(/const hideMnemonic = ref\(true\)/);
    expect(read("css/app.scss")).toMatch(
      /readonly-outlined\s+\.q-field__control:before \{[^}]*var\(--app-field-edge\)/
    );
  });
});
