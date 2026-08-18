# Design Update — Mint Details Page Pattern

This document specifies the design pattern introduced with the rework of
`src/pages/MintDetailsPage.vue` (branch `feat/wallet-ui-polish`). It is written
as a **reusable specification**: the same pattern applies to any detail /
settings-style page in the app (token details, invoice details, settings
subpages).

The pattern is grounded in two principles:

1. **Hierarchy through grouping, not chrome.** Sections are separated by a
   small uppercase muted label and whitespace — not by heavy divider lines.
   Related rows live together in a single rounded "surface card", iOS
   grouped-list style.
2. **Every interaction has instant, physical feedback.** Pressable elements
   scale subtly on pointer-down, enters use strong ease-out curves, exits are
   faster than enters, and nothing animates properties that trigger layout.

---

## 1. Page structure & element ordering

The page reads as a top-down narrative: **identity → communication → facts →
trust → actions.** Progressive disclosure keeps advanced content one tap away
instead of cluttering the first viewport.

| # | Block | Contents | Ordering rationale |
| - | ----- | -------- | ------------------ |
| 1 | **Header card** | Mint avatar (64px), mint name, QR toggle | Answers "where am I?" instantly. The QR (secondary, rarely needed) is hidden behind a small icon button anchored to the card's top-right corner. |
| 2 | **Descriptions** | MOTD banner (dismissible), `description`, `description_long` | What the mint wants to communicate. MOTD is dismissible and collapses smoothly. |
| 3 | **CONTACT** | One row per contact method (icon · value · copy) | Only rendered when contacts exist — no empty chrome. |
| 4 | **MINT DETAILS** | URL, Nuts, Currency, Currency units, Version | Objective facts about the mint. Nuts collapse behind "View all" (progressive disclosure). |
| 5 | **AUDIT INFO** | Audit status (only when the auditor is enabled) | Trust assessment comes after the facts. |
| 6 | **ACTIONS** | Edit · Copy URL · Review · **Delete** | What the user can do. The destructive action is last and visually isolated in red. |

Layout rules:

- Page content is capped at `max-width: 600px`, centered, in **normal document
  flow** (no absolute-position hacks, no magic `margin-top` offsets).
- Vertical rhythm comes from the section labels (`margin: 28px 0 8px 4px`),
  not from ad-hoc spacers between blocks.
- The page root is theme-aware:
  `:class="$q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-dark'"`.

---

## 2. Design tokens

### 2.1 Color — theme-aware via CSS custom properties

All colors on the page resolve through locally scoped custom properties, so
the page works in dark and light mode without branching markup:

```scss
.mint-details {
  --md-text: #ffffff;
  --md-muted: #8e8e93;           // secondary text, icons
  --md-surface: rgba(255, 255, 255, 0.05);
  --md-surface-hover: rgba(255, 255, 255, 0.1);
  --md-danger: #ff453a;          // destructive actions
}
body:not(.body--dark) .mint-details {
  --md-text: #1d1d1d;
  --md-muted: #6e6e73;
  --md-surface: rgba(0, 0, 0, 0.04);
  --md-surface-hover: rgba(0, 0, 0, 0.08);
  --md-danger: #d70015;
}
```

Never hardcode `#9E9E9E`-style greys in templates; use `var(--md-muted)`.
Brand-dependent accents use `var(--q-primary)` so all nine app themes work.

### 2.2 Motion — shared tokens (defined in `src/css/app.scss`)

```scss
:root {
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);      // enter / UI interactions
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);  // on-screen movement
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);     // hover / color changes
  --ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);   // sheets

  --dur-press: 160ms;  // press feedback
  --dur-fast: 200ms;   // small UI (hovers, tooltips)
  --dur-ui: 250ms;     // expands, small panels
}
```

Built-in CSS easings (`ease`, `ease-in`) are too weak for UI — always use the
tokens. **Never `ease-in` on entering elements** (delayed initial movement
feels sluggish).

---

## 3. Typography

Hierarchy is built from **weight + size + tracking as a set**, not size alone.
All type is Inter.

| Role | Spec | Notes |
| ---- | ---- | ----- |
| Mint name | 22px / 600 / `letter-spacing: -0.02em` | Display text gets *negative* tracking |
| Section label | 12px / 600 / `letter-spacing: 0.08em` / uppercase / `--md-muted` | The only "chrome" between sections |
| Description | 16px / 600 / line-height 24px / `-0.01em` | |
| Long description | 14px / 500 / line-height 20px / `--md-muted` | |
| Row label | 15px / 500 / `--md-muted` | Left side of a detail row |
| Row value | 15px / 600 / `--md-text` | Right side, truncates with ellipsis |
| Numeric values | `font-variant-numeric: tabular-nums` | `.tnum` utility or inline; prevents jitter |

---

## 4. Component recipes

### 4.1 Section label

```html
<div class="section-label">{{ $t("...") }}</div>
```

```scss
.section-label {
  color: var(--md-muted);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  margin: 28px 0 8px 4px;   /* whitespace creates the grouping */
  text-transform: uppercase;
}
```

Replaces the old `line — TEXT — line` dividers. The 4px left offset aligns
the label optically with the 10px row padding inside the card.

### 4.2 Surface card (group container)

```scss
.surface-card {
  background-color: var(--md-surface);
  border-radius: 16px;
  overflow: hidden;   /* clips row press/hover backgrounds to the radius */
  padding: 4px;       /* rows float inside with 12px radius */
  width: 100%;
}
```

One card per section. Rows inside the card have `border-radius: 12px` so
their hover/press backgrounds read as inset, not as sharp rectangles
touching the card edge.

### 4.3 Detail row (label left, value right)

```html
<div class="detail-item detail-item--clickable pressable cursor-pointer">
  <div class="detail-label">
    <link-icon :size="18" class="detail-icon" />
    <div class="detail-name">URL</div>
  </div>
  <div class="detail-value">
    <span class="detail-value-text">https://…</span>
    <copy-icon :size="14" class="detail-value-icon" />
  </div>
</div>
```

- Row: `min-height: 44px` (touch target), `padding: 8px 10px`.
- Icon: 18px, `--md-muted`, `margin-right: 12px` — same size across all rows.
- Label: muted, 15px/500. Value: 15px/600, right-aligned, `max-width: 60%`,
  truncates with ellipsis.
- If the row performs an action (copy): add `detail-item--clickable
  pressable cursor-pointer` and a small (14px) trailing affordance icon.
- If the row only expands content (Nuts): the value becomes a toggle in
  `var(--q-primary)` with a chevron that rotates 180° when open
  (`transition: transform var(--dur-ui) var(--ease-out)`).

### 4.4 Expansion content (Nuts chips)

Expanded content renders as chips, not bare text lines:

```scss
.nut-pill {
  background-color: var(--md-surface);
  border-radius: 8px;
  padding: 8px 12px;
}
.nut-number {
  color: var(--md-muted);
  font-variant-numeric: tabular-nums;
  min-width: 18px;        /* numbers align in a clean column */
  margin-right: 8px;
}
```

Single-column, `gap: 6px`, inset inside the details card.

### 4.5 Action row

```html
<div class="action-button pressable cursor-pointer">
  <pencil-icon :size="18" class="action-icon" />
  <div class="action-label">Edit mint</div>
</div>
```

- Row: `min-height: 44px`, `padding: 10px`, `gap: 14px`, `border-radius: 12px`.
- Icon 18px `--md-muted`; label 15px/500.
- **Destructive** (`.delete-button`): icon + label in `var(--md-danger)`;
  hover background `color-mix(in srgb, var(--md-danger) 10%, transparent)`;
  active background at 14%. Danger is communicated by color alone — never by
  animation.

### 4.6 Header card + anchored toggle

The page header is a surface card containing identity (avatar, name).
Secondary affordances (QR code toggle) are **anchored to the card** as small
icon buttons — not floating loose in the layout:

```scss
.mint-header { position: relative; }
.qr-toggle-btn {
  color: var(--md-muted);
  position: absolute;
  right: 10px;
  top: 10px;
}
```

The revealed content (QR) expands *inside* the same card via the
`smooth-slide` transition, so the spatial relationship trigger → content is
obvious.

---

## 5. Motion specification

### 5.1 Rules

1. **Only `transform` and `opacity` animate** (plus `max-height`/margins for
   expand-collapse, accepted as a pragmatic exception — see below).
   Never `transition: all`; always list explicit properties.
2. **Enter = strong ease-out. Never ease-in.**
3. **Asymmetric timing:** enter slower, exit faster (the interface responds
   quickly when dismissing, arrives gently when appearing).
4. **Never animate from `scale(0)`.** Start at `scale(0.95)`–`0.98` + opacity 0
   — nothing in the real world appears from nothing.
5. UI transitions stay **≤ 300ms**.

### 5.2 Expand / collapse (`smooth-slide`, `expand`)

Used for the QR reveal and the Nuts list:

```scss
.smooth-slide-enter-active {
  transition: max-height 0.3s var(--ease-out), opacity 0.25s var(--ease-out),
    transform 0.3s var(--ease-out), margin-bottom 0.3s var(--ease-out);
  max-height: 350px;
}
.smooth-slide-leave-active {
  transition: max-height 0.2s var(--ease-out), opacity 0.15s var(--ease-out),
    transform 0.2s var(--ease-out), margin-bottom 0.2s var(--ease-out);
  max-height: 350px;
}
.smooth-slide-enter-from,
.smooth-slide-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}
```

`expand` is the same pattern with `max-height: 1200px` for long content
(transform left out — plain height/opacity reveal).

> Expanding stacked content needs a height change; `max-height` is the
> pragmatic tool. Keep the cap close to the real content height (350px QR,
> 1200px nuts) so the easing curve maps honestly to the visible motion.

### 5.3 Press feedback

Defined globally in `app.scss`; the details page consumes it via `q-btn` and
`.pressable`:

```scss
.q-btn { transition: transform var(--dur-press) var(--ease-out), box-shadow 0.2s var(--ease-standard); }
.q-btn:active { transform: scale(0.97); }

.pressable { transition: transform var(--dur-press) var(--ease-out),
                         background-color var(--dur-press) var(--ease-standard); }
.pressable:active { transform: scale(0.98); }
```

Press feedback fires on **pointer-down**, not on release — that is what makes
the interface feel like it's listening.

### 5.4 Hover states

Only on devices with a real pointer; on touch, `:hover` sticks after the tap:

```scss
@media (hover: hover) and (pointer: fine) {
  .action-button:hover { background-color: var(--md-surface-hover); }
}
```

### 5.5 Reduced motion

```scss
@media (prefers-reduced-motion: reduce) {
  .smooth-slide-enter-active, .expand-enter-active /* … */ {
    transition: opacity 0.15s ease;
    transform: none;
  }
}
```

Reduced motion keeps **opacity/color** feedback (comprehension) and drops
**movement** (vestibular safety).

---

## 6. Interaction checklist for new rows/buttons

When adding a row or button in this pattern, verify:

- [ ] Tap target ≥ 44px tall.
- [ ] Press feedback present (`q-btn` or `.pressable`), scale 0.97–0.98.
- [ ] Hover styles only inside `@media (hover: hover) and (pointer: fine)`.
- [ ] Transition lists explicit properties; durations from tokens; ease-out.
- [ ] Colors via `--md-*` / `var(--q-primary)` — no hardcoded hex in markup.
- [ ] Icon-only buttons have an `aria-label`.
- [ ] Destructive actions come last, colored `var(--md-danger)`.
- [ ] Numbers use `tabular-nums`.
- [ ] Icon sizes consistent within a context (18px rows, 14–16px affordances).
- [ ] New expands/collapses reuse `smooth-slide`/`expand`; new swaps reuse
      the keyed micro-transition pattern (leaving element `position: absolute`
      so layout doesn't jump).

---

## 7. Reference implementation

- Page: `src/pages/MintDetailsPage.vue` (structure, tokens, recipes above)
- Shared tokens & global press/hover/reduced-motion rules: `src/css/app.scss`
- Micro-transition pattern (keyed swap with absolute leaving element):
  `src/components/BalanceView.vue` → `.mint-chip-*`
