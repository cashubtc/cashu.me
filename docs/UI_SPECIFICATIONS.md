# Cashu.me UI Design Specification

> **Purpose.** This document is the single source of truth for the visual and motion design of the Cashu.me wallet. It has two audiences:

> 1. **Builders** who want to recreate the Cashu.me UI from scratch — every color, distance, font, radius, shadow, and animation needed to reproduce the design is recorded here.
> 2. **Coding agents and contributors** who extend the wallet — follow the patterns, tokens, and conventions described here so that new UI is indistinguishable from existing UI.

> Every value in this document was measured from the source code. Where a value originates, the file is cited so it can be verified and kept in sync.

---

## Table of contents

1. [Foundations](#1-foundations)
2. [App shell & navigation](#2-app-shell--navigation)
3. [Home screen (WalletPage)](#3-home-screen-walletpage)
4. [Money & number display](#4-money--number-display)
5. [Bottom-sheet drawers](#5-bottom-sheet-drawers)
6. [Full-screen payment dialogs](#6-full-screen-payment-dialogs)
7. [Amount entry & keyboards](#7-amount-entry--keyboards)
8. [Token & invoice display (QR)](#8-token--invoice-display-qr)
9. [Transaction history](#9-transaction-history)
10. [Settings system](#10-settings-system)
11. [Mints UI](#11-mints-ui)
12. [Onboarding (welcome flow)](#12-onboarding-welcome-flow)
13. [Feedback: notifications, banners, loading, haptics](#13-feedback-notifications-banners-loading-haptics)
14. [Animation & motion catalog](#14-animation--motion-catalog)
15. [Iconography](#15-iconography)
16. [Accessibility](#16-accessibility)
17. [Conventions for new UI work](#17-conventions-for-new-ui-work)
18. [Appendices](#18-appendices)

---

## 1. Foundations

### 1.1 Technology baseline

| Layer             | Choice                                                            | Notes                                                                                                   |
| ----------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Framework         | Quasar v2 (`@quasar/app-vite`) on Vue 3                           | Options API + Pinia mappers; no `<script setup>` in existing files                                      |
| Language          | TypeScript / JavaScript                                           |                                                                                                         |
| Component library | Quasar (`q-*`)                                                    | Material Icon set                                                                                       |
| Icons             | `lucide-vue-next` + Quasar Material Icons                         | See §15                                                                                                 |
| CSS               | SCSS + Quasar utility classes                                     | Global sheets: `src/css/app.scss`, `src/css/base.scss`, `src/css/settings.scss`, `src/css/mintlist.css` |
| Animation         | Quasar `animations: "all"` (animate.css) + custom Vue transitions | See §14                                                                                                 |

Quasar is configured with `animations: "all"` in `quasar.config.js`, so the full animate.css class vocabulary (`animated fadeIn`, `pulse`, `tada`, `wobble`, `bounce`, `bounceIn`, `fadeInDown`, `fadeInUp`, `fadeOut`, …) is available everywhere. The Quasar plugins `LocalStorage` and `Notify` are registered.

### 1.2 Design language summary

Cashu.me is a **dark-first, mobile-first wallet**. The UI is built from a small set of repeating primitives:

- **Surfaces are near-black**, layered with translucent white overlays (`rgba(255,255,255,0.04–0.1)`) instead of lighter solid greys.
- **One theme accent** (`--q-primary`) drives all interactive color: buttons, links, icons, active states.
- **Large rounded corners** (20 px) on sheets and dialogs; medium radii (10–14 px) on cards and rows; pill shapes on primary buttons.
- **Big numeric typography** for money (up to `clamp(56px, 11vw, 80px)`), Inter as the sole UI typeface.
- **Motion is short and functional** (150–300 ms), with a few celebratory animate.css moments (`tada` on payment success, `bounce` on the welcome logo).

### 1.3 Color

#### 1.3.1 Base palette (Quasar brand variables)

Declared in `src/css/quasar.variables.scss`:

| Token        | Value     | Role                                                                   |
| ------------ | --------- | ---------------------------------------------------------------------- |
| `$primary`   | `#1976d2` | Quasar default; **overridden at runtime by the theme system** (§1.3.2) |
| `$secondary` | `#26a69a` | Quasar default                                                         |
| `$accent`    | `#9c27b0` | Quasar default                                                         |
| `$dark`      | `#1d1d1d` | Dark surfaces (`bg-dark`)                                              |
| `$dark-page` | `#121212` | Dark page background (`body.body--dark`)                               |
| `$positive`  | `#21ba45` | Success states, paid checkmarks                                        |
| `$negative`  | `#c10015` | Errors, destructive actions                                            |
| `$info`      | `#31ccec` | Informational                                                          |
| `$warning`   | `#f2c037` | Warnings                                                               |

Quasar also ships its grey scale (used via `text-grey-*` / `bg-grey-*` classes):

| Class suffix | Hex       | Typical use in this UI                                |
| ------------ | --------- | ----------------------------------------------------- |
| `grey-1`     | `#fafafa` | —                                                     |
| `grey-2`     | `#f5f5f5` | —                                                     |
| `grey-3`     | `#eeeeee` | —                                                     |
| `grey-6`     | `#9e9e9e` | Secondary text (fiat line, dates, captions, chevrons) |
| `grey-7`     | `#757575` | Placeholder icons                                     |
| `grey-8`     | `#616161` | Button hover (`custom-btn:hover`)                     |
| `grey-9`     | `#424242` | `custom-btn` background                               |
| `grey-10`    | `#212121` | —                                                     |

#### 1.3.2 Theme system (`data-theme`)

The app ships **9 selectable color themes**, defined twice (duplicated) in `src/css/app.scss` and `src/css/base.scss` as the `$themes` SCSS map. The active theme is set as a `data-theme` attribute on `<body>` (`windowMixin.changeColor`, `src/boot/base.js`); the choice persists in localStorage key `cashu.theme`. **Default theme: `monochrome`** (applied when nothing is stored).

Each theme defines six colors:

| Theme        | `primary` | `secondary` | `dark` (drawers/menus/body dark) | `info` (cards, steppers) |
| ------------ | --------- | ----------- | -------------------------------- | ------------------------ |
| `classic`    | `#935af5` | `#b45af5`   | `#1f2234`                        | `#333646`                |
| `bitcoin`    | `#ff9853` | `#ff8753`   | `#2d293b`                        | `#333646`                |
| `freedom`    | `#e22156` | `#b91a45`   | `#000000`                        | `#1b1b1b`                |
| `salvador`   | `#2d68d5` | `#1366cb`   | `#242424`                        | `#333646`                |
| `mint`       | `#3ab77d` | `#27b065`   | `#1f342b`                        | `#334642`                |
| `autumn`     | `#b7763a` | `#b07927`   | `#34291f`                        | `#463f33`                |
| `flamingo`   | `#ff64b4` | `#ff61b3`   | `#56353f`                        | `#56353a`                |
| `monochrome` | `#ededed` | `#d5d5d5`   | `#000000`                        | `#272727`                |
| `cyber`      | `#00ff00` | `#00ff00`   | `#000000`                        | `#1b1b1b`                |

Mechanics (per theme, from the SCSS loops):

- `--q-primary` and `--q-secondary` CSS variables are set on `[data-theme]`; all Quasar components inherit them.
- `.bg-{name}` / `.text-{name}` utility classes are generated for each theme color (`primary`, `secondary`, `dark`, `info`, `marginal-bg`, `marginal-text`).
- `body[data-theme].body--dark` background = `scale-color(dark, $lightness: -60%)` — the page background is a 60 %-darkened variant of the theme `dark` color.
- Dark drawers (`.q-drawer--dark`), dark menus (`.q-menu--dark`) and dark body use the theme `dark` color; dark cards (`.q-card--dark`) and steppers use the theme `info` color.
- Special cases: `monochrome`/`cyber` primary buttons and badges get `color: #0a0a0a` (dark text on bright accent); `freedom` forces header/drawer to `#0a0a0a`.

#### 1.3.3 Dark mode

- Controlled by Quasar `$q.dark`; persisted as `cashu.darkMode` in localStorage (`src/boot/base.js`).
- **Default: dark ON.** Dark is only disabled if the user explicitly toggled it off.
- Components branch with `$q.dark.isActive ? `'bg-dark'`:`'bg-white'`` on major surfaces (wallet tab panels, full-screen dialog columns).
- In dark mode, field error text is forced to `yellow` (better contrast than `$negative` on near-black).
- Dark tables are transparent (`body.body--dark .q-table--dark { background: transparent }`).

#### 1.3.4 Semantic & ad-hoc colors

| Use                              | Value                                                                                                   | Where                                          |
| -------------------------------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| Incoming/positive amounts        | `hsl(120, 88%, 58%)` (`.text-amount-positive`)                                                          | `HistoryTable.vue`                             |
| Pending amounts & secondary text | `text-grey-6` (`#9e9e9e`)                                                                               | History, fiat line, captions                   |
| Drawer card background           | `#1a1a1a` (`.drawer-card`)                                                                              | Send/Receive drawers                           |
| Mint unit badge                  | `#1d1d1d` bg, white 14 px/500 text                                                                      | `mintlist.css`, ratings                        |
| P2PK "locked to you" gold        | `#ffd700` gradient (`#b8860b → #ffd700 → #fff6b7`) + `text-shadow 0 0 6px rgba(255,215,0,0.35)`         | `TokenInformation.vue`                         |
| P2PK "locked to other" warning   | `#ff9800` + glow                                                                                        | `TokenInformation.vue`                         |
| Mint audit success gradient      | `#4CAF50` (100 %) → `#f44336` (0 %)                                                                     | `MintAuditSwapsBarChart.vue`                   |
| Audit chart chrome               | bg `#1e1e1e`, hover `#2d2d2d`, text `#888`, border `#444`                                               | `MintAuditSwapsBarChart.vue`                   |
| Links                            | `color: var(--primary-color)`, underline, **bold**; `a.inherit` resets to inherited color, no underline | `app.scss` (see §18.2 — variable is undefined) |

#### 1.3.5 Translucent white overlay scale

Layering on dark surfaces is done with white at fixed opacities. **Reuse these exact steps** instead of inventing new greys:

| Opacity                      | Used for                                                                                                                       |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `rgba(255,255,255,0.04)`     | Settings card background (`.settings-card`)                                                                                    |
| `rgba(255,255,255,0.05)`     | Mint selector button bg; row separators (`border-bottom` at 0.05)                                                              |
| `rgba(255,255,255,0.06)`     | Action row bg; settings card border (0.06); parse-input bg                                                                     |
| `rgba(255,255,255,0.08)`     | Hover states (rows, options)                                                                                                   |
| `rgba(255,255,255,0.1)`      | Icon circles; sheet top borders; mint selector border; welcome logo circle                                                     |
| `rgba(255,255,255,0.35–0.9)` | Text hierarchy on dark (0.35 chevrons, 0.45 captions, 0.55 section titles, 0.7 hints/terms, 0.8 descriptions, 0.9 option text) |

### 1.4 Typography

#### 1.4.1 Typeface

- **Inter** (Google Fonts, weights 300/400/500/600/700) is imported in `src/css/app.scss` and applied to `body` with the fallback stack:

  `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif`

- Roboto is also bundled as a Quasar extra but Inter wins via the `body` rule.
- **Monospace** (`font-family: monospace`) is used for machine strings: mint URLs (`.mint-url`), token strings.
- **Material Icons** font is self-hosted (`src/fonts/material-icons-v50.woff2`), default icon size 24 px.

#### 1.4.2 Type scale (Quasar defaults, used throughout)

| Class/element    | Size             | Line height | Weight | Letter spacing        | Typical use                                           |
| ---------------- | ---------------- | ----------- | ------ | --------------------- | ----------------------------------------------------- |
| `text-h3` / `h3` | 3 rem (48 px)    | 3.125 rem   | 400    | normal                | **Balance amount** (wrapped in `<strong>` → 700)      |
| `text-h4`        | 2.125 rem        | 2.5 rem     | 400    | 0.00735 em            | Payment-success headline                              |
| `text-h5`        | 1.5 rem (24 px)  | 2 rem       | 400    | normal                | Settings page titles; numeric key labels              |
| `text-h6`        | 1.25 rem (20 px) | 2 rem       | 500    | 0.0125 em             | Drawer titles, card titles                            |
| `text-subtitle1` | 1 rem            | 1.75 rem    | 400    | 0.00937 em            | Section subheads                                      |
| `text-subtitle2` | 0.875 rem        | 1.375 rem   | 500    | 0.00714 em            | Card subtitles                                        |
| `text-body1`     | 1 rem (16 px)    | 1.5 rem     | 400    | 0.03125 em            | Default body, action rows (with `text-weight-medium`) |
| `text-body2`     | 0.875 rem        | 1.25 rem    | 400    | 0.01786 em            | Secondary body                                        |
| `text-caption`   | 0.75 rem (12 px) | 1.25 rem    | 400    | 0.03333 em            | Captions, dates, "Pending"                            |
| `text-overline`  | 0.75 rem         | 2 rem       | 500    | 0.16667 em, uppercase | Token dialog status line (overridden, see below)      |

Weight utilities: `text-weight-light` 300, `text-weight-regular` 400, `text-weight-medium` 500, `text-weight-bold` 700.

#### 1.4.3 Custom text styles (measured)

| Style                                        | Spec                                                                             | Source                      |
| -------------------------------------------- | -------------------------------------------------------------------------------- | --------------------------- |
| `.dialog-header` (full-screen dialog titles) | 1.2 rem / 500, letter-spacing −0.01 em, line-height 1.5, no uppercase            | `app.scss`                  |
| Balance amount (`.balance-amount`)           | `h3` (3 rem), **700**, line-height 1.05, nowrap, min-height 50 px, centered flex | `BalanceView.vue`           |
| Balance secondary line                       | default size, **700**, min-height 24 px                                          | `BalanceView.vue`           |
| Amount entry primary (`.amount-display`)     | `clamp(56px, 11vw, 80px)` / 700, line-height 1.1, nowrap, max-width 90 vw        | `AmountInputComponent.vue`  |
| Amount entry fiat line (`.fiat-display`)     | 20 px, `text-grey-6`                                                             | `AmountInputComponent.vue`  |
| Settings section title                       | 12 px / 700, letter-spacing 0.08 em, uppercase, `rgba(255,255,255,0.55)`         | `settings.scss`             |
| Settings section caption                     | 12 px, line-height 1.4, `rgba(255,255,255,0.45)`                                 | `settings.scss`             |
| Welcome title                                | 2.2 rem / 700, letter-spacing −0.02 em, line-height 1.2                          | `WelcomeSlide1.vue`         |
| Welcome description                          | 1.1 rem, line-height 1.5, `rgba(255,255,255,0.8)`                                | `WelcomeSlide1.vue`         |
| Mint name (`.mint-name`)                     | 16 px / 600, line-height 20 px, wraps                                            | `mintlist.css`              |
| Mint URL (`.mint-url`)                       | 12 px monospace, line-height 16 px, `word-break: break-all`                      | `mintlist.css`              |
| History transaction label                    | 1 rem / 500                                                                      | `HistoryTable.vue`          |
| History amount                               | 1 rem / 700, line-height 1.2                                                     | `HistoryTable.vue`          |
| Token dialog status overline                 | `text-overline` overridden to 1 rem                                              | `DisplayTokenComponent.vue` |
| Wallet action buttons (Receive/Send)         | 1.2 rem, `min-width: 140px`, nowrap                                              | `WalletPage.vue`            |

#### 1.4.4 Dynamic font shrinking

`AmountInputComponent.adjustAmountFontSize()` measures `scrollWidth` vs container width after every amount change; if the amount overflows, the font size is scaled down by `containerWidth / scrollWidth × 0.95`, floored at **24 px**. This keeps huge amounts on one line without wrapping.

---

### 1.5 Spacing & sizing

#### 1.5.1 Quasar spacing scale

All `q-pa-*`, `q-px-*`, `q-mt-*`, `q-gutter-*` utilities use this scale — **never use raw pixel margins/padding in templates** when a class fits:

| Size token | Value | Example classes            |
| ---------- | ----- | -------------------------- |
| `xs`       | 4 px  | `q-mt-xs`, `q-pa-xs`       |
| `sm`       | 8 px  | `q-pb-sm`, `q-gutter-sm`   |
| `md`       | 16 px | `q-pa-md`, `q-gutter-y-md` |
| `lg`       | 24 px | `q-pt-lg`, `q-mb-lg`       |
| `xl`       | 32 px | `q-pt-xl`                  |
| `none`     | 0     | `q-my-none`                |

#### 1.5.2 Content width scale

The app uses a small set of max-widths, always horizontally centered (`margin: 0 auto` / `q-mx-auto`):

| Max width | Used for                                                                                                                        |
| --------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 400 px    | QR preview container in receive flow                                                                                            |
| 420 px    | Numeric keyboard grid                                                                                                           |
| 500 px    | History list, welcome slide content, `.qcard` dialog card width, token QR column                                                |
| 600 px    | `.full-width-card` (drawer cards), full-screen dialog content columns (`col-12 col-sm-11 col-md-8` + inline `max-width: 600px`) |
| 650 px    | Minimized dialog max width; numeric keyboard container                                                                          |
| 800 px    | `.settings-view` (settings pages)                                                                                               |

Content columns inside full-screen dialogs consistently use the grid pattern `col-12 col-sm-11 col-md-8` with `q-px-lg` (32 px horizontal padding), centered in a `row justify-center`.

#### 1.5.3 Touch targets & control heights

| Control                                  | Height / size                                      |
| ---------------------------------------- | -------------------------------------------------- |
| Primary CTA buttons (send/receive flows) | Quasar `size="lg"` (~46 px), full width, `rounded` |
| Wallet Receive/Send buttons              | dense rounded, min-width 140 px, font 1.2 rem      |
| Welcome primary button                   | 44 px, radius 22 px (pill)                         |
| Numeric keys                             | min-height 56 px, padding 12 px 0                  |
| Settings menu rows                       | min-height 60 px, padding 10 px 16 px              |
| Settings card rows                       | min-height 56 px, padding 12 px 16 px              |
| Mint selector chip                       | padding 16 px (dense: 12 px)                       |
| Add-mint text input                      | height 54 px, pill radius                          |
| Header icon buttons                      | `flat round dense` (~40 px touch area)             |
| Toolbar                                  | min-height 50 px                                   |

### 1.6 Shape (border radius)

| Radius           | Applied to                                                                                                                                            |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 3 px             | QR scanner video                                                                                                                                      |
| 4 px             | Base `q-card`, unit badges, history label hover, Quasar default                                                                                       |
| 8 px             | Numeric keys, `custom-btn`, language trigger, PWA prompt box                                                                                          |
| 10 px            | Mint cards (`.mint-card`), settings menu icon chips                                                                                                   |
| 12 px            | Action rows, mint selector chip, parse-input field                                                                                                    |
| 14 px            | Settings cards (`.settings-card`, `.settings-menu-group`)                                                                                             |
| 20 px            | **Dialog/sheet corners** — bottom drawers (top corners), minimized dialogs (all corners), numeric keyboard (top), bottom sheets (mint/language/terms) |
| 22 px            | Welcome primary button (pill, half of 44 px height)                                                                                                   |
| 50 % / `rounded` | Icon circles (48 px), balance unit dots, welcome logo circle, avatars                                                                                 |
| 100 px           | Add-mint text input (pill)                                                                                                                            |

Global dialog corner rules (`app.scss`): `.q-dialog__inner > div` gets bottom corners 20 px `!important` and top corners 0; `.q-dialog__inner--minimized > div` gets 20 px on all corners and `max-width: 650px`. Bottom sheets override to top 20 px / bottom 0 in their scoped styles.

### 1.7 Elevation & shadows

The UI is mostly flat; shadows are reserved for specific moments:

| Shadow                                                                                   | Used for                                                             |
| ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `0 1px 5px rgba(0,0,0,0.2), 0 2px 2px rgba(0,0,0,0.14), 0 3px 1px -2px rgba(0,0,0,0.12)` | `.q-card`, `.shadow-2` (Quasar `shadow-2` re-declared in `app.scss`) |
| `0 4px 12px rgba(0,0,0,0.3)`                                                             | Welcome primary button (hover: `0 6px 16px rgba(0,0,0,0.4)`)         |
| `0 -8px 16px rgba(0,0,0,0.05)`                                                           | Sticky bottom panel on token display                                 |
| `drop-shadow(0 4px 8px rgba(0,0,0,0.3))`                                                 | Welcome logo image                                                   |
| `0 0 6px rgba(255,215,0,0.35)` (text-shadow)                                             | P2PK gold "locked to you" text                                       |
| `0 0 0 2px rgba(var(--q-primary-rgb),0.1)`                                               | Seed-word chip focus ring (welcome)                                  |

### 1.8 Z-index layering

| Layer                                                              | z-index           |
| ------------------------------------------------------------------ | ----------------- |
| Splash screen (`#app-splash`)                                      | 99999             |
| PWA install prompts, mint/language/terms sheet overlays            | 9999              |
| Quasar notifications                                               | ~9500 (framework) |
| Quasar dialogs & backdrops                                         | ~6000 (framework) |
| P2PK overlay in send dialog                                        | 3                 |
| Floating header actions / locked badge / sticky bottom panel       | 1–2               |
| Balance lock spinner, scan button                                  | 1                 |
| Mint card loading spinner / error badge                            | 10 (local)        |
| PayInvoiceDialog state transition: entering pane 2, leaving pane 1 | 2 / 1 (local)     |

### 1.9 Breakpoints & responsive rules

Quasar breakpoints (grid + `$q.screen`): `xs` < 600 px, `sm` 600–1023, `md` 1024–1439, `lg` 1440–1919, `xl` ≥ 1920.

Custom rules on top:

| Rule                         | Effect                                         |
| ---------------------------- | ---------------------------------------------- |
| `$q.screen.width < 390`      | Balance carousel height grows 88 px → 118 px   |
| `$q.screen.lt.sm`            | Bottom drawers become maximized (full screen)  |
| `@media (max-width: 600px)`  | Numeric keyboard becomes full width            |
| `@media (max-height: 700px)` | Keyboard max-height 300 px, grid gap 16 → 6 px |
| `@media (max-height: 600px)` | Keyboard max-height 260 px, grid gap 0         |

### 1.10 Safe areas & platform chrome

- iOS PWA top inset: `--safe-area-inset-top: env(safe-area-inset-top)` is applied as **top margin** on `body`, `.q-drawer`, `.q-header`, and `.q-dialog__inner > div` (`app.scss`).
- Bottom panels add `padding-bottom: env(safe-area-inset-bottom, 0px)` (numeric keyboard panel, token display bottom panel, sheet option lists).
- `viewport-fit=cover` is set for Capacitor builds (`index.html`).
- **Status bar color sync** (`src/boot/base.js`): `theme-color` and `apple-mobile-web-app-status-bar-style` (`black-translucent`) meta tags are continuously synced to the computed background of `.q-header` → `.q-layout` → `.q-page-container` → `body` (first non-transparent), falling back to `#000000`. A MutationObserver watches header/body for theme and class changes; resize/orientationchange also trigger re-sync.
- Global touch hygiene: `user-select: none` on body, `-webkit-tap-highlight-color: transparent`, `overscroll-behavior: none` (no pull-to-refresh), `touch-action: manipulation` on all elements (no double-tap zoom delay), scrollbars hidden (`::-webkit-scrollbar { display: none }`).

---

## 2. App shell & navigation

### 2.1 Layouts

| Layout                 | Used by                                                                                               | Header                                      | Route transitions            |
| ---------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------- | ---------------------------- |
| `MainLayout.vue`       | `/` (wallet)                                                                                          | `MainHeader` (transparent)                  | none (plain `<router-view>`) |
| `FullscreenLayout.vue` | `/settings*`, `/mintdetails`, `/discoverMints`, `/mintratings`, `/createreview`, `/restore`, `/terms` | `FullscreenHeader` (`bg-dark`, back button) | **directional** (see §2.3)   |
| `BlankLayout.vue`      | `/welcome`, `/already-running`                                                                        | none                                        | none                         |

All layouts use Quasar view `lHh Lpr lFf`.

### 2.2 Headers

**MainHeader** (`src/components/MainHeader.vue`):

- `q-header` with `bg-transparent`; toolbar `min-height: 50px`, no wrapping.
- Left: hamburger (`icon="menu"`, `flat dense round`, `color="primary"`) → navigates to `/settings`. Disabled while the global mutex is locked.
- Right cluster: offline badge (red bg, black text) appearing with `animated wobble`; staging badge (yellow/black) on staging hosts; reload-countdown badge (`color="negative"`, white text, inline `q-spinner` 0.8 em) appearing with `animated pulse`; refresh button (`flat dense round`, `size="0.8em"`, refresh/close icon, primary/negative color).

**FullscreenHeader** (`src/components/FullscreenHeader.vue`):

- `q-header` with `bg-dark`; single back button (`icon="arrow_back_ios_new"`, `flat dense round`, `color="primary"`).
- Back behavior: `router.back()` when in-app history exists, else hierarchical parent route.

### 2.3 Page transitions (FullscreenLayout)

`src/layouts/FullscreenLayout.vue` wraps `<router-view>` in a `<transition mode="out-in">` whose name is chosen from `window.history.state.position` deltas:

| Transition         | Trigger                | Spec                                                                   |
| ------------------ | ---------------------- | ---------------------------------------------------------------------- |
| `page-slide-left`  | navigating forward     | enter from `translateX(+16px)`, leave to `translateX(−16px)`, fade 0→1 |
| `page-slide-right` | navigating back        | enter from `translateX(−16px)`, leave to `translateX(+16px)`, fade     |
| `page-fade`        | unknown/equal position | opacity only                                                           |

All three: `transition: opacity 0.15s ease, transform 0.15s ease` on both enter and leave.

The root `App.vue` additionally fades whole layouts: `layout-fade` = `opacity 0.15s ease`, `mode="out-in"`.

### 2.4 Splash screen

Implemented in `index.html` + `App.vue` — the first animation a user sees:

1. `#app-splash` covers the viewport (`position: fixed; inset: 0; z-index: 99999`), background `var(--cashu-splash-bg, #000000)` — set to `#000000` or `#ffffff` by an inline script that pre-reads `cashu.darkMode` from localStorage **before** the app boots (prevents a flash of the wrong color).
2. The logo (`icons/icon-192x192.png`, 96×96 px) starts at `opacity: 0` and fades in: `animation: app-splash-logo-in 0.4s ease 0.5s forwards` (keyframes only set `to { opacity: 1 }`).
3. On app mount, after a double `requestAnimationFrame`, `.app-splash-fade` is added → splash fades out over **0.4 s ease**; the node is removed 500 ms later.
4. `prefers-reduced-motion: reduce`: no fade — logo is instantly visible, splash removal has no transition.

### 2.5 Routing conventions

- History-mode routing; bottom-of-file catch-all renders `ErrorNotFound.vue`.
- `AlreadyRunning.vue` (BlankLayout) is shown when a second tab detects the wallet via `BroadcastChannel("app_channel")`.
- Dialogs are **not routed**; they are v-model driven from Pinia stores (`useUiStore`, `useSendTokensStore`, …). See §5–§8.

---

## 3. Home screen (WalletPage)

`src/pages/WalletPage.vue` — structure top to bottom:

```
row q-col-gutter-y-md justify-center (q-pt-sm q-pb-md)
└─ col-12 col-sm-11 col-md-8 text-center q-gutter-y-md
   ├─ NoMintWarnBanner            (only when zero mints)
   ├─ BalanceView                 (balance carousel, see §3.1)
   ├─ Action row                  (Receive / Scan / Send, see §3.2)
   ├─ History expansion           (tabs: History / Mints, see §9, §11)
   ├─ PWA install button          (only in browser mode with deferred prompt)
   └─ iOSPWAPrompt / AndroidPWAPrompt
```

### 3.1 BalanceView (`src/components/BalanceView.vue`)

**Wrapper:** `q-pt-xl q-pb-md`; the whole block appears with `animated fadeInDown` (duration overridden to **0.3 s**).

**Mutex spinner:** while `globalMutexLock`, a `q-spinner size="sm" color="primary"` floats centered above the balance (`position: absolute; top: -1.5rem; left: 50%`), entering with `animated pulse` (0.5 s) and leaving with `animated fadeOut`.

**Balance carousel:**

- `q-carousel`, `bg-transparent rounded-borders`, `control-color="primary"`, slide transitions `slide-left`/`slide-right`; swipeable + animated **only when the active mint supports multiple units**.
- Height: **88 px**, or **118 px** when `$q.screen.width < 390`.
- Horizontal overflow is clipped (`overflow-x: hidden`, `overscroll-behavior-x: contain`, `touch-action: pan-y`) so carousel swipes never scroll the page.
- One `q-carousel-slide` per unit (sat first, then alphabetical).

**Balance amount** (per slide):

- `<h3 class="balance-amount text-primary">` — 3 rem/700, line-height 1.05, min-height 50 px, nowrap, centered; `cursor-pointer`.
- Value rendered by `AnimatedNumber` with `formatCurrency(val, unit)` (see §4).
- Click toggles **hide-balance** mode (`****`).

**Secondary (converted) line:** `q-mt-sm`, min-height 24 px, **700**, shows the fiat equivalent for sat (or sat equivalent for fiat units) via `AnimatedNumber`; a `q-tooltip` shows the current BTC price (`1 BTC = {price}`). Rendered only when price data exists.

**Unit dots** (below carousel): 18 px-high row; each dot is a `<button>` 14×18 px painting a 7 px circle in `currentColor` (inherits `--q-primary`); inactive `opacity: 0.28`, active `opacity: 0.9; transform: scale(1.15)`; `transition: opacity 0.2s ease, transform 0.2s ease`; `focus-visible` gets a 2 px outline offset 4 px. Hidden (opacity 0, no pointer events) with a single unit. Dots are keyboard-focusable with `aria-label`/`aria-pressed`.

**Meta lines (below, `text-secondary`):**

- Mint error: `text-red text-weight-bold` + `error` icon (`size="xs"`).
- Mint label: `text-weight-light` "Mint: **{label}**", click → mints tab.
- Mint balance (only with >1 mint): regular weight label + **bold** `AnimatedNumber` of the active mint balance.

### 3.2 Action row (Receive / Scan / Send)

Container: `row items-center justify-center no-wrap q-pt-lg q-pb-md position-relative`.

- **Receive / Send buttons** (`q-btn rounded dense color="primary" class="wallet-action-btn q-px-md"`): `min-width: 140px`, font-size **1.2 rem**, nowrap. Receive gets `q-mr-md`, Send gets `q-ml-md`. Each sits in a `col-6 flex justify-center`. After mount and on every window resize, `equalizeButtonWidths()` measures both and sets both to the max width — **the two buttons are always pixel-identical in width**.
- **Scan button** (`q-btn size="lg" outline flat color="primary"` with `ScanIcon size="2em"`): absolutely centered over the gap between the two buttons (`.scan-button-container { position: absolute; z-index: 1; padding-bottom: 15px }`); appears with `animated pulse`.

### 3.3 NoMintWarnBanner

When no mints exist, the balance area is replaced by a centered card: `q-ma-lg bg-dark q-pa-md` with a 50 px `account_balance` primary icon, `text-h6` title, `text-subtitle2` subtitle, and two stacked actions: filled rounded primary "Add mint" (`q-pt-lg`) and outline rounded "Receive ecash" (`q-pt-md`).

---

## 4. Money & number display

### 4.1 Units & tickers

- Units: `sat`, `msat`, plus fiat units advertised by mints (e.g. `usd`, `eur`).
- Display labels: `sat` is presented as **"BTC"** in unit toggles (`ToggleUnit.vue`, `BalanceView.unitLabel`), `msat` as "mSAT", others upper-cased.
- `unitTickerShortMap` (`stores/ui.ts`): sat→"sats", msat→"msats", usd→"USD", eur→"EUR".

### 4.2 `formatCurrency(value, unit)` (`windowMixin`, `src/boot/base.js`)

| Unit          | Output                                                                                                                      |
| ------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `sat`         | `Intl.NumberFormat(locale).format(n) + " sat"` — or with BIP-177 enabled: `"₿" + grouped` (negative: `"-₿" + grouped(abs)`) |
| `msat`        | `grouped + " msat"`                                                                                                         |
| `usd` / `eur` | `Intl.NumberFormat(locale, { style: "currency" })` on `value/100` (minor→major); falls back to `grouped + " " + unit`       |

- Locale comes from `window.LOCALE` (default `"en"`).
- **Hide-balance mode** (`useUiStore().hideBalance`): every `formatCurrency` call returns `"****"` unless explicitly overridden with `showBalance = true`. Toggled by tapping the balance.
- BIP-177 (`₿` instead of "sat") is a user setting (`cashu.settings.bip177`).

### 4.3 AnimatedNumber (`src/components/AnimatedNumber.vue`)

The standard way to render any balance that can change:

- Props: `value: Number`, `format: Function`, `duration = 1000` (ms).
- On value change, interpolates **linearly** from old to new value over `duration` using `requestAnimationFrame`, formatting each frame.
- **First render is not animated**: the initial value is applied instantly; animation starts only after the first value > 0 has been set (`initialized` flag).
- Re-renders through `format` every frame, so grouping/currency formatting is preserved during the tween.

Usage contract: balances, converted amounts, and mint balances use `AnimatedNumber`; static invoice amounts may use `formatCurrency` directly.

### 4.4 Amount entry display (`AmountInputComponent.vue`)

The hero of every payment screen:

- **Primary amount:** absolutely positioned, horizontally centered (`left: 50%; transform: translateX(-50%)`), `clamp(56px, 11vw, 80px)`, weight 700, line-height 1.1, `white-space: nowrap`, `max-width: 90vw`. Container min-height 120 px reserves layout space.
- **Auto-shrink** to min 24 px when overflowing (§1.4.4).
- **Muted state** (e.g. insufficient funds): `text-grey-6`.
- **Fiat secondary line:** 20 px `text-grey-6`, centered at container bottom (18 px-high strip); clicking it (or the adjacent `swap_vert` 24 px grey-6 icon, 4 px left margin) swaps primary/secondary — the "fiat mode" toggle.
- **Mode swap animation** (`swap-primary` / `swap-secondary`) — the signature currency-mutation microanimation, keyed on `fiatMode`:

|          | Enter                                                                                             | Leave                                                                                    |
| -------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Duration | 0.3 s                                                                                             | 0.25 s                                                                                   |
| Easing   | `cubic-bezier(0.25, 0.46, 0.45, 0.94)`                                                            | `cubic-bezier(0.55, 0.06, 0.68, 0.19)`                                                   |
| From     | `translateX(-50%) translateY(-40px) scale(0.85)`, opacity 0 (primary; secondary mirrored `+40px`) | rest                                                                                     |
| To       | rest                                                                                              | `translateX(-50%) translateY(+40px) scale(0.85)`, opacity 0 (primary; secondary `−40px`) |

The two displays trade places vertically with a scale-and-fade — the new value arrives from the opposite side the old one left.

- **Input model:** keystrokes are buffered as strings; fiat entry works in cents with exactly 2 decimals; `sat`/`msat` disallow decimals; other units allow 2 decimals; hard cap `MAX_AMOUNT = 999,999,999`, plus optional min/max clamping that writes the clamp back into the buffer.
- A **global `keydown` listener** drives entry (ignored when an input/textarea/contenteditable is focused or with meta/ctrl/alt); `Enter` emits `enter` when amount > 0. The on-screen `NumericKeyboard` simply dispatches synthetic `KeyboardEvent`s into the same path.

---

## 5. Bottom-sheet drawers

Shared shell for `SendDialog.vue`, `ReceiveDialog.vue`, `ReceiveEcashDrawer.vue`:

| Property   | Value                                                                                                             |
| ---------- | ----------------------------------------------------------------------------------------------------------------- |
| `q-dialog` | `position="bottom"`, `:maximized="$q.screen.lt.sm"`, `transition-show="slide-up"`, `transition-hide="slide-down"` |
| Backdrop   | `backdrop-filter: blur(8px)`, `background: rgba(0,0,0,0.4)` (`:deep(.q-dialog__backdrop)`)                        |
| Card       | `.drawer-card` = `background: #1a1a1a`, `text-white`, `.full-width-card` (max-width 600 px, centered), `q-pb-lg`  |
| Corners    | top 20 px, bottom 0 (scoped override of the global dialog radii)                                                  |

**Header pattern:** `q-card-section row items-center q-pb-sm` — left: round flat dense close button (`color="primary"`, lucide `XIcon`, `v-close-popup`, `q-ml-sm`; `ReceiveEcashDrawer` uses `ChevronLeftIcon` + `goBack`); center: `text-h6` title; right: round flat dense scan button (`ScanIcon`, `color="primary"`, `q-mr-sm`).

**Action rows** (`.action-row`) — the canonical list-item button used across drawers:

```scss
background: rgba(255, 255, 255, 0.06);
border-radius: 12px;
padding: 12px 16px;
cursor: pointer;
transition: background 0.2s ease;
&:active {
  background: rgba(255, 255, 255, 0.1);
}
```

Accessibility: `role="button"`, `tabindex="0"`, `@keydown.enter`/`@keydown.space` handlers mirror `@click`.

Row anatomy: **icon circle** (48×48 px, `border-radius: 50%`, `rgba(255,255,255,0.1)`, centered lucide icon 24 px, white) + `q-ml-md` text (`text-body1 text-weight-medium`). Rows are stacked with `q-gutter-y-md` inside `q-pa-md`.

**ReceiveEcashDrawer** adds conditional rows: paste from clipboard, scan, payment request, P2PK lock, NFC (`q-spinner size="sm"` while scanning).

### 5.1 Teleported bottom sheets (ChooseMint, language, terms, ratings sort)

A second, non-Quasar sheet family (Vue `<teleport to="body">` + custom overlay):

| Layer        | Spec                                                                                                                                                                                                                                                   |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Overlay      | `position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); z-index: 9999; display: flex; align-items: flex-end`                                                                                                              |
| Sheet        | `background: rgba(20,20,20,0.98); backdrop-filter: blur(20px); border-top: 1px solid rgba(255,255,255,0.1); border-radius: 20px 20px 0 0; max-height: 70vh` (terms sheet: 85 vh); flex column, overflow hidden                                         |
| Sheet header | `padding: 20px 24px 16px 24px; border-bottom: 1px solid rgba(255,255,255,0.1)`; title 1.1 rem/600 white; close button `rgba(255,255,255,0.7)`                                                                                                          |
| Options      | `padding: 16px 24px`, 16 px/500, white 0.9; separators `rgba(255,255,255,0.05)`; hover `rgba(255,255,255,0.08)`; active `background: rgba(var(--q-primary-rgb), 0.2)` + `color: var(--q-primary)`; list bottom padded by `env(safe-area-inset-bottom)` |

**Transition** (`mint-overlay`): overlay `opacity 0.3s ease`; sheet `transform 0.3s ease` from `translateY(100%)` — both run together on enter/leave. The welcome language/terms sheets use the same visuals with `@keyframes fadeIn`/`slideUp` at 0.3 s.

### 5.2 ChooseMint chip (`src/components/ChooseMint.vue`)

The mint selector shown on every payment screen:

```scss
.mint-selector-btn {
  padding: 16px; /* dense variant: 12px */
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  transition: all 0.2s ease;
}
&:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}
```

Anatomy: `q-avatar` 48 px (dense 40 px) with mint icon (fallback `account_balance` grey-7 24 px) → name 16 px/500 white (with balance line 14 px grey-6, or red error text) → `expand_more` chevron grey-6 20 px.

---

## 6. Full-screen payment dialogs

Shared shell for `SendTokenDialog.vue`, `CreateInvoiceDialog.vue`, `PayInvoiceDialog.vue`, `InvoiceDetailDialog.vue`, `ReceiveTokenDialog.vue`:

| Property       | Value                                                                                                                                               |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `q-dialog`     | `maximized`, `transition-show="fade"`, `transition-hide="fade"`, `no-backdrop-dismiss`, manual `@keydown.esc` close                                 |
| Backdrop       | `backdrop-filter="blur(2px) brightness(60%)"`                                                                                                       |
| Card           | `q-pa-none q-pt-none qcard` (`.qcard { width: 500px }`, moot when maximized)                                                                        |
| Content column | `column fit` + dark-mode-aware bg (`bg-dark` / `bg-white`), full-height flex patterns (`send-fullscreen`, `pay-fullscreen`) with `overflow: hidden` |

**Header pattern** (identical across these dialogs):

- Row `q-pa-md`, `position: relative`.
- **Close:** `flat round icon="close" color="grey"`, absolutely positioned `left: 16px; top: 50%; transform: translateY(-50%)` (`.floating-close-btn`), `z-index: 1`.
- **Title:** centered, `.fixed-title-height` (24 px flex box) + `.dialog-header` typography; dark-mode-aware text color.
- **Right cluster** (`position: absolute; right: 16px`, `q-gutter-sm`): unit toggle (`flat dense size="lg" color="primary"`, label = active unit, `sat` shown as `BTC`); optional extras — P2PK lock button (send), `B11`/`B12` invoice-type toggle (receive).

**Body pattern:** `ChooseMint` chip → flexible centered **amount area** (`AmountInputComponent`) → **bottom panel**:

```scss
.bottom-panel {
  margin-top: auto;
  background: var(--q-color-grey-1); /* see §18.2 */
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
```

containing the `NumericKeyboard` and, below it, the primary CTA: `q-btn full-width unelevated size="lg" rounded color="primary"` inside a `max-width: 600px; max-height: 60px` column, with a `:loading` slot (`q-spinner q-mr-sm` + label) and explicit `:disable` rules (e.g. amount null/≤ 0, insufficient funds, invalid P2PK key).

### 6.1 SendTokenDialog specifics

- **P2PK overlay:** clicking the lock button floats an input panel (`.p2pk-overlay`, absolute top, `z-index: 3`) over the amount area with `animated fadeIn`/`fadeOut`. Row: outlined clearable `q-input` (red when the key is invalid) + paste (`content_paste`) and scan buttons.
- **Locked badge:** once locked, a `q-badge rounded color="positive"` floats above the amount (`top: -50px`, centered, `z-index: 2`) with a lock icon + "locked" (14 px/500).
- **Insufficient funds:** amount turns muted grey; a warning badge appears below the amount (`.amount-warning-badge`, 16 px `text-grey-6`, `pointer-events: none`) whose text **wobbles on every amount change** (`transition name="wobble" mode="out-in"` re-keyed by amount — see §14.4).
- Payment-request flows replace the CTA with `SendPaymentRequest` and show `PaymentRequestInfo` above the mint selector; mint-mismatch warnings render as `q-banner dense rounded bg-red-1 text-red-9`.
- After sending, the same dialog swaps to `DisplayTokenComponent` (§8).

### 6.2 CreateInvoiceDialog specifics

- Right header cluster adds the `B11`/`B12` toggle (`flat dense size="lg" color="primary"`).
- Content switches between amount entry and QR preview with `receive-content` (`mode="out-in"`): `opacity 180ms ease`, enter-from/leave-to opacity 0; **disabled under `prefers-reduced-motion`**.
- QR preview: white padded QR container (`.qr-container`, cursor-pointer to copy), max-width 400 px; reusable-address (npub.cash) errors show a centered warning state (42 px warning icon, title, reconnect button).

### 6.3 PayInvoiceDialog specifics

- Parses any pasted input (invoice, address, offer) via `ParseInputComponent`: a 120 px-high textarea, `border-radius: 12px`, `background: rgba(255,255,255,0.06)`, 16 px padding/font, placeholder white 50 %, floating paste button (absolute right 20 px top 16 px).
- Invoice states (details → paying → paid/error) swap with `slide-down`: enter from `translateY(-20px)` opacity 0, leave to `translateY(+20px)`, both **0.4 s ease**; the leaving pane is absolutely positioned (z 1) under the entering one (z 2).
- Paid state: `text-h4 text-weight-bold` "Paid" + formatted amount.

### 6.4 InvoiceDetailDialog specifics

- QR (`vue-qrcode`, responsive square, `rounded-borders`) wrapped in a link; below it a 2 px-high `q-linear-progress indeterminate color="primary"` while waiting for payment.
- **Paid confirmation** — the app’s signature success moment: a `.checkmark-overlay` (absolute inset 0, flex centered, `background: rgba(30,30,30,0.94)` in dark mode) covers the QR, with a `check_circle` icon (`color="positive"`) sized `clamp(100px, 35vw, 200px)` entering with **`animated tada`**.

---

## 7. Amount entry & keyboards

### 7.1 NumericKeyboard (`src/components/NumericKeyboard.vue`)

| Element    | Spec                                                                                                                                                                                                                                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Container  | top corners 20 px, `q-pa-md q-pb-lg q-pt-lg`, full width, max-width 650 px, centered; enters with `slide-up-fade` (from `translateY(100%)` + fade, 0.3 s ease)                                                                                                                                               |
| Grid       | CSS grid, 3 equal columns, `gap: 16px`, max-width 420 px                                                                                                                                                                                                                                                     |
| Keys       | `q-btn flat text-h5` (1.5 rem), `border-radius: 8px`, `font-weight: 600`, `min-height: 56px`, `padding: 12px 0`, `text-transform: capitalize`, `transition: none`, ripple only on the "4" key (quirk), bg `var(--q-color-grey-2)` / text `var(--q-color-grey-10)` (see §18.2), hover `var(--q-color-grey-3)` |
| Layout     | digits 1–9, invisible spacer ("•"), 0, backspace (`chevron_left` icon `size="md"`); optional Close / Enter text buttons                                                                                                                                                                                      |
| Compaction | `@media (max-height: 700px)`: max-height 300 px, gap 6 px; `@media (max-height: 600px)`: max-height 260 px, gap 0                                                                                                                                                                                            |

Keys emit synthetic `KeyboardEvent`s consumed by `AmountInputComponent` (§4.4). Closing the keyboard persists the `useNumericKeyboard` setting off and shows a bottom toast.

### 7.2 Keypad (legacy `.keypad` grid, `WalletPage.vue` styles)

4×4 CSS grid, 8 px gap; `.btn-confirm` spans rows 1–4 of column 4. Retained for reference; new work should use `NumericKeyboard`.

---

## 8. Token & invoice display (QR)

### 8.1 DisplayTokenComponent (`src/components/DisplayTokenComponent.vue`)

Full-screen (`height: 100dvh`, column flex, `overflow: hidden`) token/QR view shown after sending and from history:

- **Header:** floating close (left 16 px) + `.floating-actions` (right 16 px, `z-index: 2`): a `more_horiz` expander reveals copy-as-emoji (NutIcon 16 px), share (16 px), copy-link (`link` icon), scan, NFC write (with loading state), and delete (`color="negative"`, `size="sm"`). Title is a `text-overline` forced to 1 rem: "Sent / Pending / Received Ecash".
- **Content area:** `flex: 1; overflow-y: auto; max-width: 600px; margin: 0 auto`.
- **QR block:** `q-responsive` 1:1 square wrapping `vue-qrcode` (rendered 600×600, `rounded-borders`, `width/height: 100%`); clicking the QR copies the token. Directly below, a **2 px-high** `q-linear-progress indeterminate color="primary"` runs while animated-QR fragments cycle.
- **Animated QR controls** (for large tokens via `bc-ur` fragmenting): two flat grey 10 px buttons with `speed` / `zoom_in` icons (8 px icon gap) showing "Speed: {label}" and "Size: {label}"; clicking cycles fragment speed/size.
- **Below the QR:** `TokenInformation` (token details, `q-pt-lg`), `PaymentRequestInfo`, `MeltQuoteInformation` when relevant.
- **Sticky bottom panel:** `margin-top: auto; position: sticky; bottom: 0; z-index: 2; box-shadow: 0 -8px 16px rgba(0,0,0,0.05); padding-bottom: env(safe-area-inset-bottom, 0px)` — holds copy/share CTAs.

### 8.2 TokenInformation (`src/components/TokenInformation.vue`)

- Displays amount, unit, mint, memo, fee and proof details in label/value rows; token strings in monospace with `word-break: break-all`.
- **P2PK states:** a token locked to the viewer renders the pubkey/label with the **gold shine** treatment (§14.5): gradient text `#b8860b → #ffd700 → #fff6b7 → #ffd700 → #b8860b`, `-webkit-background-clip: text`, `animation: shine 2.5s linear infinite`, `text-shadow: 0 0 6px rgba(255,215,0,0.35)`. A token locked to someone else renders `#ff9800` with an orange glow.

### 8.3 Quote information components

`MintQuoteInformation.vue` / `MeltQuoteInformation.vue` render detail rows (`.detail-item`, `q-mb-md` between): left side an icon (lucide, 20 px, themed color) + label (`.detail-name`), right side the value. Dynamic on-chain status text swaps with `chain-status-fade`: `opacity 0.2s ease`, `mode="out-in"`, keyed by status string; confirmed status turns `text-positive`.

---

## 9. Transaction history

`HistoryTable.vue` (inside the home-screen expansion item):

- **Container:** `q-pa-xs`, `max-width: 500px`, centered. While hydrating, a `q-skeleton type="rect" height="260px"` (max-width 500 px) placeholder is shown.
- **Expansion:** the history/mints area lives in a `q-expansion-item` whose header is only a centered chevron (`keyboard_arrow_up/down`, `color="primary"`); expansion state persists (`cashu.ui.expandHistory`). Tabs: `q-tabs no-caps` with `text-secondary` labels ("History", "Mints") over `q-tab-panels animated`, background dark/white by mode.
- **Rows:** `q-item clickable v-ripple q-px-md q-py-md`:
  - Avatar cell: `q-avatar` 32 px (`min-width: 40px`, `q-pr-md`) containing a 20 px lucide icon in `--q-primary`: `CoinsIcon` (ecash), `BitcoinIcon` (on-chain), `ZapIcon` (lightning).
  - Main cell: label row — left `text-weight-medium` 1 rem label; right amount 1 rem/700, prefixed `+` for incoming, colored `hsl(120, 88%, 58%)` when settled-positive, `text-grey-6` when pending, default color for outgoing.
  - Caption row: left date (`formatDistanceToNow`, grey-6); right "Pending" (grey-6 caption) or a non-breaking space to keep row height stable.
  - Side cell (pending only): small flat round `sync` button; **long-press (1 s)** on it for incoming ecash switches the icon to `arrow_circle_down` and releases into the receive flow.
  - Label hover: `background-color: rgba(0,0,0,0.04)`, 4 px radius, `transition: background-color 0.2s ease`.
- **Filters:** centered row (`q-mt-lg`) of small rounded outline buttons (`size="sm"`, `q-px-md`): "Filter pending" / "Ecash only" — `color="primary"` when active, `grey` otherwise.
- **Pagination:** `q-pagination` with `max-pages="5"`, `direction-links`, `boundary-links`, page size 5.
- **Empty state:** centered caption in `text-primary`.

---

## 10. Settings system

Shared design system in `src/css/settings.scss` + `SettingsPageShell.vue` / `SettingsSection.vue`. **All new settings-style pages must use these primitives.**

### 10.1 Page shell

```
SettingsPageShell (bg-dark text-white q-pa-md)
└─ .settings-view        max-width: 800px; margin: 0 auto; overflow-x: hidden
   ├─ .settings-page-header   q-px-xs q-pt-sm q-pb-md
   │   ├─ title     text-h5 text-weight-bold
   │   └─ caption   text-caption text-grey-6 q-mt-xs
   └─ SettingsSection × n
```

The shell forces `box-sizing: border-box` and `min-width: 0` on all descendants, clamps items/fields/buttons to 100 % width, allows `overflow-wrap: anywhere` on labels and inputs, and lets button content wrap — settings pages must never overflow horizontally.

### 10.2 Sections & cards

| Class                                     | Spec                                                                                                                                  |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `.settings-section`                       | `margin-bottom: 24px`                                                                                                                 |
| `.settings-section-header`                | `padding: 0 6px; margin-bottom: 10px`                                                                                                 |
| `.settings-section-title`                 | 12 px/700, uppercase, letter-spacing 0.08 em, `rgba(255,255,255,0.55)`                                                                |
| `.settings-section-caption`               | 12 px, line-height 1.4, `rgba(255,255,255,0.45)`, margin-top 4 px                                                                     |
| `.settings-card` / `.settings-menu-group` | `background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; padding: 4px 0; overflow: hidden` |
| `.settings-card .q-item`                  | min-height 56 px, padding 12 px 16 px; stacked labels gap 4 px                                                                        |
| `.settings-control-item`                  | rows holding a form control: padding 8 px top / 16 px bottom                                                                          |

### 10.3 Settings menu (root page)

`SettingsPage.vue` renders grouped menu groups (`q-mb-lg` between) of `.settings-menu-item` rows (`clickable v-ripple :to=...`):

- `.settings-menu-item`: min-height 60 px, padding 10 px 16 px.
- `.settings-menu-icon`: 36×36 px, radius 10 px, flex-centered, `color: var(--q-primary)`, holding a 20 px lucide icon.
- Label `text-weight-medium` + caption below.
- `.settings-menu-chevron`: 18 px `ChevronRight`, `rgba(255,255,255,0.35)`.

Groups: **Wallet** (Backup, Lightning address, Nostr), **Connections** (Payment requests, NWC, P2PK, Hardware/NFC when supported), **Preferences** (Appearance, Language, Privacy), **Advanced** (Experimental, Advanced, About).

### 10.4 Appearance page

Theme rows are `q-item`s whose avatar is a `format_color_fill` Material icon tinted in the theme’s primary color; the active theme row shows a check (`color="primary"`, grey otherwise). Selecting a theme calls `changeColor(name)` → `data-theme` swap + status-bar re-sync (§1.10).

---

## 11. Mints UI

### 11.1 Mint cards & lists (`src/css/mintlist.css`)

Shared by `MintSettings.vue`, `RestoreView.vue`, `NostrMintRestore.vue`:

| Element                                  | Spec                                                                                                                               |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `.mint-card`                             | `border-radius: 10px; border: 1px solid rgba(128,128,128,0.2); padding: 0; position: relative; transition: border-color 0.2s ease` |
| `.mint-card:hover`                       | `border-color: rgba(128,128,128,0.4)`                                                                                              |
| `.mint-card.q-loading`                   | `opacity: 0.5; pointer-events: none`                                                                                               |
| `.mint-name`                             | 16 px/600, line-height 20 px, wraps anywhere                                                                                       |
| `.mint-url`                              | 12 px monospace, line-height 16 px, `word-break: break-all`                                                                        |
| `.currency-unit-badge`                   | radius 4 px, bg `#1d1d1d`, padding 4 px 8 px, margin 4 px 4 px 4 px 0                                                              |
| `.currency-unit-text`                    | white, 14 px/500                                                                                                                   |
| `.mint-item-selected`                    | `border-color: var(--q-primary)`, bg `rgba(var(--q-primary-rgb), 0.1)` (§18.2)                                                     |
| `.mint-loading-spinner` / `.error-badge` | absolute, top 12/4 px, right 30 px, z-index 10                                                                                     |

### 11.2 MintSettings (home "Mints" tab)

- **Add-mint block:** description 14 px/500 (line-height 24 px, `margin-bottom: 24px`); pill input — `.mint-input .q-field__control { height: 54px; border-radius: 100px }`, Inter; the block has `margin-bottom: 32px`.
- Mint rows swap between view/edit with `animated fadeIn`/`fadeOut` transitions.
- `AddMintDialog` content fades similarly; discovery entry points link to `MintDiscoveryPage`.

### 11.3 MintDetailsPage

- Mint icon, name, and a 300 px `vue-qrcode` of the mint URL (`rounded-borders`) revealed with `smooth-slide` (see §14.4): enter `all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)` (slight overshoot), leave `all 0.25s cubic-bezier(0.4, 0, 0.2, 1)`, both clamped to `max-height: 350px` with a 16 px bottom margin.
- MOTD message appears with `animated pulse` + `smooth-slide`.
- Section dividers: `.section-divider` = line / text / line row (`q-mb-md`).

### 11.4 Mint ratings & audit

- Ratings use `q-rating` with icon size forced to `1em`; the sort sheet reuses the §5.1 bottom-sheet visuals with `fadeIn`/`slideUp` 0.3 s keyframes.
- `MintAuditSwapsBarChart.vue`: per-mint swap success bars; color interpolates `#4CAF50` (100 % success) → `#f44336` (0 %); chrome colors bg `#1e1e1e`, hover `#2d2d2d`, text `#888`, border `#444`.

---

## 12. Onboarding (welcome flow)

`WelcomePage.vue` — a persistent full-screen `q-dialog` (`transition-show="slide-up"`, `transition-hide="fadeOut"`) hosting a full-height `q-carousel` (`animated`, `control-color="primary"`). Slides: intro → features → choice (new/recover) → seed display or seed input → mint setup → (recover) restore ecash. Bottom nav (`q-pa-md flex justify-between`): flat "Previous" (`arrow_left` icon) when available, language `q-select` (dense, max-width 200 px), primary "Next".

### 12.1 WelcomeSlide1 (design reference for all slides)

| Element              | Spec                                                                                                                                                                           |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Slide                | flex column, space-between, centered; `background: var(--q-dark)`; `padding: 40px 20px 20px`; text centered                                                                    |
| Logo                 | 120×120 px circle, `rgba(255,255,255,0.1)`, centered 80 px image with `drop-shadow(0 4px 8px rgba(0,0,0,0.3))`; enters with **`animated bounce`** (1 s); `margin-bottom: 30px` |
| Title                | 2.2 rem/700, letter-spacing −0.02 em, line-height 1.2, white, `margin: 0 0 20px`                                                                                               |
| Description          | 1.1 rem, line-height 1.5, `rgba(255,255,255,0.8)`, `margin: 0 0 50px`, max-width 500 px, left-aligned                                                                          |
| Content width        | title/actions/language blocks share `max-width: 500px; width: 100%`                                                                                                            |
| Primary button       | full-width, 44 px, radius 22 px, weight 600, 1 rem, `text-transform: none`, `box-shadow: 0 4px 12px rgba(0,0,0,0.3)`, `transition: all 0.3s ease`                              |
| Primary button hover | `transform: translateY(-2px)`, `box-shadow: 0 6px 16px rgba(0,0,0,0.4)`                                                                                                        |
| Terms text           | 0.85 rem, `rgba(255,255,255,0.7)`, margin-top 16 px; link span underlined                                                                                                      |
| Language trigger     | 0.9 rem/500, `rgba(255,255,255,0.7)`, padding 8 px 16 px, radius 8 px, gap 8 px, hover white 0.9                                                                               |

### 12.2 Other slides

- **WelcomeSlide2:** feature content enters with `animated bounceIn` (1 s) and `animated tada` accents.
- **WelcomeSlide3 / WelcomeRecoverSeed:** seed words render as chips; focused/selected chip gets `border-color: rgba(var(--q-primary-rgb), 0.5)` + `box-shadow: 0 0 0 2px rgba(var(--q-primary-rgb), 0.1)`; helper text in `rgba(var(--q-primary-rgb), 0.8)`.
- **WelcomeMintSetup:** mint cards reuse §11.1; selected state `rgba(var(--q-primary-rgb), 0.1–0.2)`.

### 12.3 Language & terms sheets

Use the §5.1 sheet visuals (overlay `rgba(0,0,0,0.5)` + blur 4 px; sheet `rgba(20,20,20,0.98)` + blur 20 px; top corners 20 px) with `fadeIn`/`slideUp` 0.3 s keyframes. Language options: 16 px vertical padding rows, 1 rem/500, white 0.9, centered; active `rgba(var(--q-primary-rgb), 0.2)` bg + primary text. Terms sheet: 85 vh, scrollable content.

---

## 13. Feedback: notifications, banners, loading, haptics

### 13.1 Toast notifications (`src/js/notify.ts` + `windowMixin`)

| Helper            | Type/color                            | Position                 | Timeout                | Extras                                                       |
| ----------------- | ------------------------------------- | ------------------------ | ---------------------- | ------------------------------------------------------------ |
| `notifySuccess`   | `positive`                            | top (copy toast: bottom) | 5000 ms                | progress bar, white close action                             |
| `notifyError`     | `color: red`                          | top                      | default                | progress bar, caption support                                |
| `notifyWarning`   | `warning`                             | top                      | 5000 ms (configurable) | progress bar, black close                                    |
| `notifyApiError`  | 400/401 → `warning`, 500 → `negative` | top                      | 5000 ms                | caption = `"400 BAD REQUEST"`-style status line, upper-cased |
| `notifyRefreshed` | `positive`                            | top                      | 500 ms                 | minimal                                                      |
| generic `notify`  | `color: grey`                         | top/bottom               | 5000 ms                | used for keyboard-closed info                                |

### 13.2 Banners & badges

- **Offline:** red badge, black text, enters `animated wobble` (MainHeader).
- **Staging:** yellow badge, black text (host contains "staging").
- **Reload countdown:** `color="negative"` badge with inline white `q-spinner` (0.8 em, thickness 10); enters via `transition-group` with `animated pulse`; clicking cancels.
- **Mint unreachable (receive):** centered warning state — 42 px warning icon, title, caption, flat primary "Reconnect mint" with loading.

### 13.3 Loading & busy states

- **Global mutex:** small primary `q-spinner` pulsing above the balance (§3.1); header menu/refresh disabled.
- **Buttons:** Quasar `:loading` with explicit slots (`q-spinner q-mr-sm` + progress label).
- **Skeletons:** history list placeholder (§9).
- **Mint cards:** `q-loading` → 50 % opacity, no pointer events; spinner top-right.
- **Indeterminate progress:** 2 px `q-linear-progress` under QR codes while waiting for payment / cycling fragments.

### 13.4 Haptics

`useUiStore().vibrate()`: `Haptics.vibrate({ duration: 200 })` on Capacitor, `navigator.vibrate(200)` fallback. Currently fired on successful multinut payments. Use sparingly for confirmed, user-initiated successes only.

### 13.5 QR scanner

`QrcodeReader.vue` inside a `q-dialog` with `backdrop-filter="blur(2px) brightness(60%)"`; the video element has 3 px radius.

---

## 14. Animation & motion catalog

This section is normative: **reuse the named patterns below instead of inventing new timings.**

### 14.1 Motion principles

1. **Fast and functional:** UI transitions run 150–300 ms. Longer animations (400–600 ms) only for state celebrations (payment success) or large surface changes (sheets, splash).
2. **Easing vocabulary:**
   - Default UI easing: `ease` (CSS) — used for fades, hovers, dots, rows (0.2–0.3 s).
   - Expressive entrances: `cubic-bezier(0.25, 0.46, 0.45, 0.94)` ("Apple-like" ease-out, amount swap).
   - Expressive exits: `cubic-bezier(0.55, 0.06, 0.68, 0.19)` (ease-in, amount swap).
   - Playful overshoot: `cubic-bezier(0.34, 1.56, 0.64, 1)` (mint QR reveal).
   - Smooth collapse: `cubic-bezier(0.4, 0, 0.2, 1)` (Material standard).
3. **Celebrate outcomes, not interactions:** big animate.css moments (`tada`, `bounce`, `wobble`, `pulse`) mark events (paid, offline, logo) — never hovers or taps.
4. **Directional continuity:** elements leave toward where their replacement comes from (amount swap, page slides).
5. **Reduced motion:** honor `prefers-reduced-motion` for anything non-essential (already implemented for splash and `receive-content`).

### 14.2 Master duration table

| Duration | Used for                                                                                                                                                                   |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 150 ms   | Page/layout fades and 16 px slides (`layout-fade`, `page-*`)                                                                                                               |
| 180 ms   | Receive-flow content swap (`receive-content`)                                                                                                                              |
| 200 ms   | Hovers & state changes: action rows, mint selector, mint cards, unit dots, history label; `chain-status-fade`; haptic pulse length (200 ms vibrate)                        |
| 250 ms   | Expressive exits (amount swap leave); `smooth-slide` leave                                                                                                                 |
| 300 ms   | Standard transitions: `slide-up-fade` keyboard, sheet overlays/slides, `fadeInDown` balance entrance, bottom-sheet keyframes, primary-button hover lift, amount swap enter |
| 400 ms   | Splash fade in/out; `slide-down` invoice-state swap                                                                                                                        |
| 500 ms   | `smooth-slide` enter (overshoot); `pulse` balance mutex spinner                                                                                                            |
| 600 ms   | `wobble` warning shake                                                                                                                                                     |
| 1000 ms  | `AnimatedNumber` balance tween; animate.css `tada`/`bounce`/`bounceIn`; PWA prompt bob cycle                                                                               |
| 2500 ms  | P2PK gold `shine` loop                                                                                                                                                     |

### 14.3 Vue transition catalog (custom)

| Name                                                 | Where                           | Spec                                                                                                 |
| ---------------------------------------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `layout-fade`                                        | `App.vue`                       | opacity 0.15 s ease, `mode="out-in"`                                                                 |
| `page-fade` / `page-slide-left` / `page-slide-right` | `FullscreenLayout.vue`          | opacity + `translateX(±16px)`, 0.15 s ease, `out-in`; direction from history position                |
| `swap-primary` / `swap-secondary`                    | `AmountInputComponent.vue`      | see §4.4 — 0.3 s/0.25 s expressive beziers, ±40 px travel, scale 0.85                                |
| `slide-up-fade`                                      | `NumericKeyboard.vue`           | from `translateY(100%)` + fade, transform/opacity 0.3 s ease                                         |
| `mint-overlay`                                       | `ChooseMint.vue`                | overlay opacity 0.3 s; sheet `translateY(100%)→0` 0.3 s ease, combined                               |
| `receive-content`                                    | `CreateInvoiceDialog.vue`       | opacity 180 ms ease, `out-in`; off with reduced motion                                               |
| `slide-down`                                         | `PayInvoiceDialog.vue`          | enter −20 px→0, leave →+20 px, all 0.4 s ease; leave absolute (z 1) under enter (z 2)                |
| `smooth-slide`                                       | `MintDetailsPage.vue`           | height-reveal: enter 0.5 s overshoot bezier, leave 0.25 s Material bezier; `max-height: 350px` clamp |
| `chain-status-fade`                                  | `Mint/MeltQuoteInformation.vue` | opacity 0.2 s ease, `out-in`, keyed by status text                                                   |
| `wobble`                                             | `SendTokenDialog.vue`           | `wobble-keyframes` 600 ms ease-out on enter; leave disabled; re-keyed per amount                     |
| `fade` (named)                                       | `ReceiveTokenDialog.vue`        | simple opacity crossfade between receive states                                                      |
| `fade-*` (global, `mintlist.css`)                    | restore views                   | `transform 1s ease, opacity 1s ease`                                                                 |

### 14.4 Custom keyframes

**`wobble-keyframes`** (`SendTokenDialog.vue`, 600 ms, insufficient-funds warning):

| %   | transform                        |
| --- | -------------------------------- |
| 0   | `translateX(0) rotate(0)`        |
| 15  | `translateX(-8px) rotate(-3deg)` |
| 30  | `translateX(8px) rotate(3deg)`   |
| 45  | `translateX(-6px) rotate(-2deg)` |
| 60  | `translateX(6px) rotate(2deg)`   |
| 75  | `translateX(-3px) rotate(-1deg)` |
| 100 | `translateX(0) rotate(0)`        |

**`shine`** (`TokenInformation.vue`, 2.5 s linear infinite): `background-position: -200px 0 → 200px 0` sweeping across the gold gradient text.

**`moveUpDown`** (`iOSPWAPrompt.vue`, `AndroidPWAPrompt.vue`, 1 s infinite): `translateY(0) → translateY(-10px) → translateY(0)` — a gentle bob drawing attention to the install instructions.

**`fadeIn` / `slideUp`** (`WelcomeSlide1.vue`, `MintRatingsComponent.vue`, 0.3 s): opacity 0→1 and `translateY(100%)→0` for overlay sheets.

**`app-splash-logo-in`** (`index.html`, 0.4 s, 0.5 s delay): opacity → 1 (see §2.4).

### 14.5 animate.css usage map

Quasar loads the full animate.css set (`animations: "all"`). Global overrides (`app.scss`): `tada`, `bounceIn`, `bounce` run at 1 s. Component overrides: `pulse` 0.5 s, `fadeInDown` 0.3 s (`BalanceView.vue`).

| Class                         | Where                                                                                                                                                 | Moment                          |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| `animated tada`               | `InvoiceDetailDialog`                                                                                                                                 | **paid checkmark** on QR (§6.4) |
| `animated tada`               | `WelcomeSlide2`                                                                                                                                       | feature highlight               |
| `animated bounce`             | `WelcomeSlide1`                                                                                                                                       | logo entrance                   |
| `animated bounceIn`           | `WelcomeSlide2`                                                                                                                                       | content entrance                |
| `animated pulse`              | `WalletPage` scan button, `BalanceView` mutex spinner, `MainHeader` countdown badge, `MintDetailsPage` MOTD, `MultinutPaymentDialog`, `MintAuditInfo` | attention/activity              |
| `animated wobble`             | `MainHeader` offline badge                                                                                                                            | offline warning                 |
| `animated fadeInDown`         | `BalanceView` (0.3 s), `AndroidPWAPrompt`                                                                                                             | entrances from top              |
| `animated fadeInUp`           | `iOSPWAPrompt`                                                                                                                                        | entrance from bottom            |
| `animated fadeIn` / `fadeOut` | `MintSettings`, `AddMintDialog`, `SendTokenDialog` P2PK overlay, `ReceiveTokenDialog`                                                                 | content swaps                   |

### 14.6 Quasar built-in transitions

| Component prop                                | Value                        | Where                              |
| --------------------------------------------- | ---------------------------- | ---------------------------------- |
| `transition-show/hide` on bottom drawers      | `slide-up` / `slide-down`    | Send/Receive/Ecash drawers         |
| `transition-show/hide` on full-screen dialogs | `fade` / `fade`              | payment dialogs                    |
| `transition-show/hide` on welcome dialog      | `slide-up` / `fadeOut`       | `WelcomePage`                      |
| `q-carousel` transitions                      | `slide-left` / `slide-right` | balance carousel, welcome carousel |
| `q-tab-panels animated`                       | default slide                | home history/mints tabs            |

### 14.7 Number & currency mutation animations (summary)

Three distinct mechanisms cover every way money text changes — **pick per context, do not mix:**

| Mechanism                       | When                                                             | Effect                                                 |
| ------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------ |
| `AnimatedNumber` tween          | An existing displayed value changes (balance after send/receive) | 1 s linear interpolation, formatting applied per frame |
| `swap-primary`/`swap-secondary` | The **meaning** of the value changes (sat ↔ fiat mode)           | 0.3 s bezier swap with ±40 px travel + scale           |
| Direct re-render                | Typing in the amount buffer                                      | immediate, no animation (plus auto-shrink §1.4.4)      |

Unit **labels** (sat→BTC toggles in headers) change instantly with no transition.

---

## 15. Iconography

Two icon systems coexist — keep the split:

| System                                                      | Use                                                                                                                                                                                                                                          | Sizing                                                                                                                                                                       |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **lucide-vue-next** (imported as `{ Name as NameIcon }`)    | Custom UI: actions, drawers, settings menu, history types, close/scan rows                                                                                                                                                                   | explicit `size` prop: 16 px (token actions), 18 px (chevrons), 20 px (settings/history icons, quote details), 24 px (action rows) or em-based (`1.2em`, `1.5em`, `2em` scan) |
| **Material Icons** (`q-icon name="..."`, self-hosted woff2) | Quasar chrome: navigation (`menu`, `arrow_back_ios_new`, `close`, `expand_more`, `keyboard_arrow_*`), status (`check_circle`, `error`, `sync`), fields (`content_paste`, `speed`, `zoom_in`, `swap_vert`, `more_horiz`, `format_color_fill`) | default 24 px; via `size` prop (`xs`–`lg`, px, em)                                                                                                                           |

Rules:

- Header/drawer action buttons are `flat round dense` with `color="primary"`.
- Icons inside 48 px circles or avatars are white or themed; standalone navigation icons are `primary`.
- Ratings icons render at `1em` (`q-rating__icon` override).

---

## 16. Accessibility

- **Focus visible:** balance unit dots get `outline: 2px solid currentColor; outline-offset: 4px` on `:focus-visible`.
- **Keyboard operability:** drawer action rows are `role="button" tabindex="0"` with Enter/Space handlers; the amount flow is fully keyboard-driven (global keydown).
- **ARIA:** unit dots expose `aria-label`/`aria-pressed` and `aria-hidden` when collapsed; swap icon button has `aria-label`/`aria-pressed`; header buttons have `aria-label`s.
- **Reduced motion:** splash and `receive-content` disable transitions under `prefers-reduced-motion` — new animations must do the same.
- **Touch:** global `touch-action: manipulation` removes 300 ms tap delay; tap highlight is transparent; text selection disabled app-wide for a native feel (inputs excepted by platform behavior).
- **Hit areas:** primary controls ≥ 44 px (§1.5.3).

---

## 17. Conventions for new UI work

**Do:**

1. Compose with Quasar utility classes first (`q-pa-md`, `q-gutter-y-md`, `row`, `col-12 col-sm-11 col-md-8`); add scoped CSS only for what utilities cannot express.
2. Reach for existing primitives: `.settings-card`/`.settings-section` (settings), `.action-row` + `.icon-circle` (drawers), `.mint-card` (mint lists), `.dialog-header` (dialog titles), `AnimatedNumber` (money), `windowMixin.formatCurrency` (amounts), `copyText` mixin (clipboard + toast).
3. Keep dialogs in the two established shells: bottom sheet (§5) or maximized fade dialog (§6) — including their header patterns and safe-area padding.
4. Color through theme variables (`--q-primary`, `text-primary`, `bg-dark`) and the white-overlay scale (§1.3.5); never hardcode hex for new surfaces.
5. Animate with the catalog (§14): 150–300 ms, named easings, celebrate only real outcomes.
6. Keep Options API + Pinia mappers style; register shared components via existing patterns.
7. Support both dark and light surfaces on new full-screen flows (`$q.dark.isActive` branching).
8. Add `prefers-reduced-motion` guards to new non-essential animations.
9. Persist UI preferences via `useLocalStorage("cashu.<area>.<key>", ...)` like existing stores.

**Don’t:**

1. Don’t introduce new fonts, font sizes outside §1.4, or new spacing values outside §1.5.
2. Don’t use `<script setup>` in existing components, or relative imports (use the `src/` alias).
3. Don’t hardcode white/black text where theme classes exist; monochrome/cyber themes invert button text (`#0a0a0a`).
4. Don’t animate layout properties (`top/left/width`) — use `transform` + `opacity`.
5. Don’t add box-shadows beyond the §1.7 list.
6. Don’t reference undefined CSS variables (§18.2) — define tokens first or use `color-mix()`.

### 17.1 File map for designers

| What                                             | Where                                               |
| ------------------------------------------------ | --------------------------------------------------- |
| Theme colors                                     | `src/css/app.scss`, `src/css/base.scss` (`$themes`) |
| Global rules (dialogs, cards, links, scrollbars) | `src/css/app.scss`                                  |
| Settings design system                           | `src/css/settings.scss`                             |
| Mint list system                                 | `src/css/mintlist.css`                              |
| Quasar brand variables                           | `src/css/quasar.variables.scss`                     |
| Currency/date formatting                         | `src/boot/base.js`, `src/stores/ui.ts`              |
| Notifications                                    | `src/js/notify.ts`                                  |
| Splash                                           | `index.html`, `src/App.vue`                         |
| Page transitions                                 | `src/layouts/FullscreenLayout.vue`                  |

---

## 18. Appendices

### 18.1 LocalStorage keys that affect presentation

| Key                                       | Effect                       |
| ----------------------------------------- | ---------------------------- |
| `cashu.theme`                             | active `data-theme` name     |
| `cashu.darkMode`                          | dark mode on/off             |
| `cashu.language`                          | UI language                  |
| `cashu.ui.hideBalance`                    | `****` balance masking       |
| `cashu.ui.tab` / `cashu.ui.expandHistory` | home tab + history expansion |
| `cashu.settings.bip177`                   | ₿ symbol instead of "sat"    |
| `cashu.settings.useNumericKeyboard`       | on-screen keyboard enabled   |
| `cashu.settings.bitcoinPriceCurrency`     | fiat conversion currency     |

### 18.2 Known quirks (do not cargo-cult)

- **`--q-primary-rgb` is referenced but never defined.** Rules like `rgba(var(--q-primary-rgb), 0.2)` (selected mint items, sheet active options, seed chips) currently resolve to nothing. New code should either define the variable per theme (e.g. in the `$themes` loop) or use `color-mix(in srgb, var(--q-primary) 20%, transparent)`.
- **`--q-color-grey-1/2/3/10` are referenced but never defined** (`NumericKeyboard`, `bottom-panel`s). Backgrounds fall back to transparent/inherited. Use explicit rgba values or the overlay scale instead.
- **`var(--primary-color)` in the global `a` rule is undefined**; links fall back to inherited color while keeping underline+bold.
- **Theme map is duplicated** in `app.scss` and `base.scss` (identical `$themes`). Edit both or extract to a shared partial when changing themes.
- **`.q-card` radius is declared twice** (20 px top corners early in `app.scss`, then `border-radius: 4px` later, which wins). Dialog corner shaping comes from the `.q-dialog__inner` rules instead.
- Only the "4" key of the numeric keyboard has a ripple; `custom-btn` (80 px, grey-9) is legacy and unused by current flows.

### 18.3 PWA & platform chrome facts

- Manifest registers `web+cashu` and `web+lightning` protocol handlers; theme/background color `#000000`; portrait orientation; maskable icons 128–512 px.
- iOS status bar style is always `black-translucent`; `theme-color` tracks the header color (§1.10).
- PWA install prompts (`iOSPWAPrompt`/`AndroidPWAPrompt`): fixed bottom-centered, black content box (10 px padding, 1 px `#ccc` border, 8 px radius) with a 10 px white triangle pointer, bobbing via `moveUpDown`; iOS enters `fadeInUp`, Android `fadeInDown`.

---

_End of specification. Values measured from the Cashu.me codebase; when code and this document disagree, the code wins — then update this document._
