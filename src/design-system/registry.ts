// The component library, as shown on the design system board (/design-system, dev builds only).
// One entry per canonical element. The board renders each entry's live sample from
// src/pages/DesignSystemPage.vue (a <DsEntry id> block, in this order), reads props from the
// component itself and counts usage from the source (src/design-system/usage.ts), so only the
// name, tier, source and example are written here. test/vitest/__tests__/designSystem.test.ts
// fails if the board and this list disagree, or a component under src/components/ui is missing.

export type DsGroupId =
  | "foundations"
  | "actions"
  | "forms"
  | "navigation"
  | "containers"
  | "data"
  | "feedback"
  | "feature"
  | "layout";

export type DsTier =
  | "token"
  | "primitive"
  | "composite"
  | "feature"
  | "pattern";

export type DsItem = {
  id: string;
  name: string;
  group: DsGroupId;
  tier: DsTier;
  /** The one implementation: a .vue path (props are read from it) or a stylesheet selector. */
  source: string;
  /** What counts as a usage: a component tag, a class, or any other literal. */
  usage?: { tag?: string; className?: string; text?: string };
  example?: string;
  note?: string;
};

export const DS_GROUPS: Array<{ id: DsGroupId; title: string }> = [
  { id: "foundations", title: "Foundations" },
  { id: "actions", title: "Actions and buttons" },
  { id: "forms", title: "Form controls" },
  { id: "navigation", title: "Navigation" },
  { id: "containers", title: "Cards and containers" },
  { id: "data", title: "Data display" },
  { id: "feedback", title: "Feedback and overlays" },
  { id: "feature", title: "Feature components" },
  { id: "layout", title: "Layout and composition" },
];

export const DS_ITEMS: DsItem[] = [
  // Foundations
  {
    id: "colour-tokens",
    name: "Colour tokens",
    group: "foundations",
    tier: "token",
    source: "src/css/base.scss (--app-*)",
    usage: { text: "var(--app-" },
    example: `color: var(--app-text-muted);\nbackground: var(--app-tint);`,
    note: "Per mode and theme. Status tones: --app-info, --app-success, --app-warning, --app-danger.",
  },
  {
    id: "shape-tokens",
    name: "Radius, shadow and focus",
    group: "foundations",
    tier: "token",
    source:
      "src/css/base.scss (--app-radius-*, --app-shadow-md, --app-focus-ring)",
    usage: { text: "var(--app-radius-" },
    example: `border-radius: var(--app-radius-lg);\nbox-shadow: var(--app-shadow-md);`,
  },
  {
    id: "type-scale",
    name: "Type scale",
    group: "foundations",
    tier: "token",
    source:
      "app.scss .amount-headline, .sheet-title · settings.scss .settings-section-title",
    usage: { className: "sheet-title" },
    example: `<div class="sheet-title">Receive</div>`,
  },
  {
    id: "icon-circle",
    name: "Icon circle",
    group: "foundations",
    tier: "primitive",
    source:
      "src/css/elements.scss .app-icon-circle (--sm 40, 48, --lg 56, --xl 80)",
    usage: { className: "app-icon-circle" },
    example: `<div class="app-icon-circle app-icon-circle--lg"><ZapIcon :size="26" /></div>`,
  },
  {
    id: "machine-text",
    name: "Machine text",
    group: "foundations",
    tier: "primitive",
    source: "src/css/elements.scss .app-mono (+ --wrap)",
    usage: { className: "app-mono" },
    example: `<div class="app-mono app-mono--wrap">{{ invoice }}</div>`,
  },

  // Actions and buttons
  {
    id: "wallet-actions",
    name: "Wallet actions",
    group: "actions",
    tier: "pattern",
    source: "src/pages/WalletPage.vue .wallet-action-btn",
    usage: { className: "wallet-action-btn" },
    example: `<q-btn rounded unelevated color="primary" class="wallet-action-btn">Receive</q-btn>`,
    note: "Caps by design: the two strategic wallet actions.",
  },
  {
    id: "primary-button",
    name: "Full-width primary",
    group: "actions",
    tier: "primitive",
    source: "src/css/app.scss .q-btn--rounded.full-width (52px)",
    usage: { text: "full-width" },
    example: `<q-btn rounded unelevated color="primary" class="full-width" :loading="busy">\n  Continue\n  <template #loading><q-spinner-dots size="20px" class="on-left" />Continue</template>\n</q-btn>`,
  },
  {
    id: "secondary-buttons",
    name: "Secondary, flat, disabled, danger",
    group: "actions",
    tier: "primitive",
    source: "q-btn outline / flat · src/css/elements.scss busy state",
    usage: { text: "<q-btn" },
    example: `<q-btn rounded outline no-caps color="primary">Cancel</q-btn>`,
  },
  {
    id: "icon-buttons",
    name: "Icon buttons",
    group: "actions",
    tier: "primitive",
    source: "src/css/elements.scss .app-icon-btn · .floating-close-btn",
    usage: { className: "app-icon-btn" },
    example: `<q-btn flat round class="app-icon-btn" :aria-label="$t('global.actions.close.label')">\n  <XIcon :size="20" />\n</q-btn>`,
  },
  {
    id: "copy-button",
    name: "Copy button",
    group: "actions",
    tier: "primitive",
    source: "src/components/ui/CopyButton.vue",
    usage: { tag: "CopyButton" },
    example: `<CopyButton :value="lightningAddress" tooltip="Copy" />`,
  },
  {
    id: "inline-confirm",
    name: "Inline confirm",
    group: "actions",
    tier: "composite",
    source: "src/components/ui/InlineConfirm.vue",
    usage: { tag: "InlineConfirm" },
    example: `<InlineConfirm question="Remove all proofs?" cancel-label="Cancel" confirm-label="Remove"\n  @confirm="remove" @cancel="confirming = false" />`,
  },

  // Form controls
  {
    id: "text-fields",
    name: "Text fields",
    group: "forms",
    tier: "primitive",
    source: "q-input outlined · src/css/app.scss field edge and fill tokens",
    usage: { text: "<q-input" },
    example: `<q-input v-model="url" outlined label="Mint URL" />`,
  },
  {
    id: "select",
    name: "Select",
    group: "forms",
    tier: "composite",
    source: "src/components/SheetSelect.vue",
    usage: { tag: "SheetSelect" },
    example: `<SheetSelect v-model="sort" :options="options" label="Sort" />`,
    note: "Every choice from a list opens this bottom sheet; there are no popover menus.",
  },
  {
    id: "mint-picker",
    name: "Mint picker",
    group: "forms",
    tier: "feature",
    source: "src/components/ChooseMint.vue",
    usage: { tag: "ChooseMint" },
    example: `<ChooseMint />`,
  },
  {
    id: "amount-entry",
    name: "Amount entry and keypad",
    group: "forms",
    tier: "composite",
    source:
      "src/components/AmountKeypadPanel.vue · NumericKeyboard.vue · elements.scss .amount-display",
    usage: { tag: "AmountKeypadPanel" },
    example: `<AmountKeypadPanel v-model="sendData.amount" :busy="sending" />`,
  },
  {
    id: "segmented-control",
    name: "Segmented control",
    group: "forms",
    tier: "primitive",
    source: "src/css/app.scss .invoice-type-toggle",
    usage: { className: "invoice-type-toggle" },
    example: `<q-btn-toggle v-model="type" class="invoice-type-toggle" rounded unelevated no-caps\n  toggle-color="primary" :options="options" />`,
  },
  {
    id: "toggles",
    name: "Toggle",
    group: "forms",
    tier: "primitive",
    source: "q-toggle · src/css/app.scss .q-toggle",
    usage: { text: "<q-toggle" },
    example: `<q-toggle v-model="on" color="primary" />`,
  },
  {
    id: "settings-toggle-row",
    name: "Settings toggle row",
    group: "forms",
    tier: "composite",
    source: "src/components/ui/SettingsToggleRow.vue",
    usage: { tag: "SettingsToggleRow" },
    example: `<SettingsToggleRow v-model="checkIncoming" :label="$t('…toggle')" :caption="$t('…description')" />`,
  },
  {
    id: "checkbox-radio",
    name: "Checkbox and radio",
    group: "forms",
    tier: "primitive",
    source: "q-checkbox · q-radio (src/css/app.scss)",
    usage: { text: "<q-checkbox" },
    example: `<q-checkbox v-model="selected" color="primary" />`,
  },
  {
    id: "settings-radio-row",
    name: "Settings radio row",
    group: "forms",
    tier: "composite",
    source: "src/components/ui/SettingsRadioRow.vue",
    usage: { tag: "SettingsRadioRow" },
    example: `<SettingsRadioRow :selected="lang === 'en'" label="English" @select="lang = 'en'" />`,
  },
  {
    id: "slider-rating",
    name: "Rating and slider",
    group: "forms",
    tier: "primitive",
    source: "src/components/ui/AppRating.vue · q-slider",
    usage: { tag: "AppRating" },
    example: `<AppRating v-model="rating" :size="32" :label="$t('…rating.label')" />`,
  },

  // Navigation
  {
    id: "tabs",
    name: "Tabs",
    group: "navigation",
    tier: "primitive",
    source: "q-tabs · src/css/app.scss .q-tab",
    usage: { text: "<q-tabs" },
    example: `<q-tabs v-model="tab" no-caps><q-tab name="history" label="History" /></q-tabs>`,
  },
  {
    id: "pagination",
    name: "Pagination",
    group: "navigation",
    tier: "primitive",
    source: "q-pagination · src/css/elements.scss",
    usage: { text: "<q-pagination" },
    example: `<q-pagination v-model="page" :max="6" :max-pages="5" direction-links boundary-links />`,
  },
  {
    id: "settings-link-row",
    name: "Settings link row",
    group: "navigation",
    tier: "composite",
    source: "src/components/ui/SettingsLinkRow.vue",
    usage: { tag: "SettingsLinkRow" },
    example: `<SettingsLinkRow :icon="ShieldIcon" label="Privacy" caption="Network checks" to="/settings/privacy" />`,
  },
  {
    id: "settings-action-row",
    name: "Settings action row",
    group: "navigation",
    tier: "composite",
    source: "src/components/ui/SettingsActionRow.vue",
    usage: { tag: "SettingsActionRow" },
    example: `<SettingsActionRow label="Restore" caption="From a seed phrase" to="/restore" />`,
  },
  {
    id: "sheet-header",
    name: "Sheet header",
    group: "navigation",
    tier: "pattern",
    source: "src/css/app.scss .drawer-header + .sheet-title",
    usage: { className: "drawer-header" },
    example: `<q-card-section class="row items-center no-wrap drawer-header">…</q-card-section>`,
    note: "Send, Receive and Receive ecash; candidates to move onto BottomSheet.",
  },
  {
    id: "fullscreen-dialog-header",
    name: "Fullscreen dialog header",
    group: "navigation",
    tier: "composite",
    source: "src/components/ui/FullscreenDialogHeader.vue",
    usage: { tag: "FullscreenDialogHeader" },
    example: `<FullscreenDialogHeader :title="$t('ReceiveTokenDialog.title')" balanced />`,
  },
  {
    id: "expansion-row",
    name: "Expansion row",
    group: "navigation",
    tier: "primitive",
    source: "q-expansion-item",
    usage: { text: "<q-expansion-item" },
    example: `<q-expansion-item label="Advanced" dense>…</q-expansion-item>`,
  },

  // Cards and containers
  {
    id: "mint-cards",
    name: "Mint card",
    group: "containers",
    tier: "pattern",
    source: "src/css/app.scss .mint-card*",
    usage: { className: "mint-card" },
    example: `<q-item class="mint-card"><div class="mint-card__body">…</div></q-item>`,
    note: "Installed, add and restore variants share the classes; the markup is still per list.",
  },
  {
    id: "mint-identity-header",
    name: "Mint identity header",
    group: "containers",
    tier: "feature",
    source: "src/components/MintIdentityHeader.vue",
    usage: { tag: "MintIdentityHeader" },
    example: `<MintIdentityHeader :mint="mint" />`,
  },
  {
    id: "settings-section",
    name: "Settings section",
    group: "containers",
    tier: "composite",
    source:
      "src/pages/settings/SettingsSection.vue · settings.scss .settings-menu-group",
    usage: { tag: "SettingsSection" },
    example: `<SettingsSection title="Locked ecash" caption="…" warning>…</SettingsSection>`,
  },
  {
    id: "box",
    name: "Box",
    group: "containers",
    tier: "primitive",
    source: "src/css/elements.scss .app-box",
    usage: { className: "app-box" },
    example: `<div class="app-box q-pa-md">…</div>`,
  },
  {
    id: "section-divider",
    name: "Section divider",
    group: "containers",
    tier: "primitive",
    source: "src/components/ui/SectionDivider.vue",
    usage: { tag: "SectionDivider" },
    example: `<SectionDivider :label="$t('MintSettings.add.title')" />`,
  },

  // Data display
  {
    id: "badges",
    name: "Badge",
    group: "data",
    tier: "primitive",
    source:
      "src/css/elements.scss .app-badge (--solid, --primary, --success, --warning, --danger)",
    usage: { className: "app-badge" },
    example: `<span class="app-badge app-badge--warning">Staging</span>`,
  },
  {
    id: "detail-row",
    name: "Detail row",
    group: "data",
    tier: "composite",
    source: "src/components/ui/DetailRow.vue",
    usage: { tag: "DetailRow" },
    example: `<DetailRow :icon="ClockIcon" label="Paid at" :value="date" />`,
  },
  {
    id: "activity-row",
    name: "Activity row",
    group: "data",
    tier: "composite",
    source: "src/components/ActivityRow.vue",
    usage: { tag: "ActivityRow" },
    example: `<ActivityRow :icon="CoinsIcon" direction="in" label="Ecash" amount="+₿500" caption="5 minutes ago" />`,
  },
  {
    id: "amounts",
    name: "Amounts",
    group: "data",
    tier: "primitive",
    source:
      "src/css/app.scss .amount-headline · AnimatedNumber.vue · ToggleUnit.vue",
    usage: { className: "amount-headline" },
    example: `<div class="amount-headline">−₿101</div>`,
  },
  {
    id: "qr-code",
    name: "QR code",
    group: "data",
    tier: "primitive",
    source: "src/components/QrBlock.vue",
    usage: { tag: "QrBlock" },
    example: `<QrBlock :value="invoice" />\n<QrProgress :active="checking" />`,
  },
  {
    id: "qr-progress",
    name: "QR progress",
    group: "data",
    tier: "primitive",
    source: "src/components/QrProgress.vue",
    usage: { tag: "QrProgress" },
    example: `<QrProgress :active="checking" />`,
  },
  {
    id: "tooltip",
    name: "Tooltip",
    group: "data",
    tier: "primitive",
    source: "q-tooltip (hover only)",
    usage: { text: "<q-tooltip" },
    example: `<q-tooltip>Copied to clipboard</q-tooltip>`,
  },

  // Feedback and overlays
  {
    id: "callouts",
    name: "Callout",
    group: "feedback",
    tier: "primitive",
    source: "src/components/AppCallout.vue",
    usage: { tag: "AppCallout" },
    example: `<AppCallout variant="warning" title="Experimental" text="Paying from several mints can fail part way." />`,
  },
  {
    id: "toasts",
    name: "Toast",
    group: "feedback",
    tier: "primitive",
    source: "src/js/notify.ts · src/css/app.scss body .q-notification",
    usage: { text: "notifySuccess(" },
    example: `notifySuccess("Received ₿500");`,
  },
  {
    id: "loading",
    name: "Loading",
    group: "feedback",
    tier: "primitive",
    source: "src/components/SkeletonRow.vue · busy buttons · .qr-progress",
    usage: { tag: "SkeletonRow" },
    example: `<SkeletonRow avatar="34px" :lines="['55%', '35%']" />`,
  },
  {
    id: "empty-state",
    name: "Empty state",
    group: "feedback",
    tier: "composite",
    source: "src/components/ui/EmptyState.vue",
    usage: { tag: "EmptyState" },
    example: `<EmptyState :icon="SearchIcon" title="No mints found" text="Try again, or add one by URL.">\n  <template #actions><q-btn …>Discover mints</q-btn></template>\n</EmptyState>`,
  },
  {
    id: "blocking-state",
    name: "Blocking state",
    group: "feedback",
    tier: "pattern",
    source: "src/css/app.scss .blocking-state",
    usage: { className: "blocking-state" },
    example: `<div class="blocking-state">…</div>`,
    note: "Only AlreadyRunning and the 404; their tops differ (icon vs code), so no component yet.",
  },
  {
    id: "bottom-sheet",
    name: "Bottom sheet",
    group: "feedback",
    tier: "composite",
    source: "src/components/BottomSheet.vue",
    usage: { tag: "BottomSheet" },
    example: `<BottomSheet v-model="open" title="Sort reviews">…</BottomSheet>`,
  },
  {
    id: "option-row",
    name: "Sheet option row",
    group: "feedback",
    tier: "composite",
    source: "src/components/SheetOption.vue · elements.scss .app-option-row",
    usage: { tag: "SheetOption" },
    example: `<SheetOption label="Lightning" caption="Create an invoice" :selected="pick === 'ln'" @select="pick = 'ln'">\n  <template #icon><ZapIcon :size="20" /></template>\n</SheetOption>`,
  },
  {
    id: "confirm-dialog",
    name: "Confirm dialog",
    group: "feedback",
    tier: "pattern",
    source: "src/css/app.scss .council-dialog*",
    usage: { className: "council-dialog" },
    example: `<q-dialog v-model="open"><q-card class="council-dialog">…</q-card></q-dialog>`,
  },

  // Feature components
  {
    id: "history",
    name: "History",
    group: "feature",
    tier: "feature",
    source: "src/components/HistoryTable.vue",
    usage: { tag: "HistoryTable" },
    example: `<HistoryTable />`,
  },
  {
    id: "mint-review-summary",
    name: "Mint review summary",
    group: "feature",
    tier: "feature",
    source: "src/components/MintReviewSummary.vue",
    usage: { tag: "MintReviewSummary" },
    example: `<MintReviewSummary :average="4.5" :count="2" fallback-label="See reviews" @open="openReviews" />`,
  },
  {
    id: "chain-status-row",
    name: "Chain status row",
    group: "feature",
    tier: "feature",
    source: "src/components/ChainStatusRow.vue",
    usage: { tag: "ChainStatusRow" },
    example: `<ChainStatusRow :metadata="txMetadata" :loading="fetching" />`,
  },
  {
    id: "mint-motd",
    name: "Mint message",
    group: "feature",
    tier: "feature",
    source: "src/components/MintMotdMessage.vue",
    usage: { tag: "MintMotdMessage" },
    example: `<MintMotdMessage :mint-url="url" :message="motd" />`,
  },
  {
    id: "pwa-prompt",
    name: "Install prompt",
    group: "feature",
    tier: "feature",
    source: "src/components/PwaPrompt.vue",
    usage: { tag: "PwaPrompt" },
    example: `<PwaPrompt platform="ios" />`,
    note: "Shows itself only in a browser that can install the wallet; forced open here.",
  },
  {
    id: "terms-text",
    name: "Terms of service text",
    group: "feature",
    tier: "feature",
    source: "src/components/TermsOfServiceText.vue",
    usage: { tag: "TermsOfServiceText" },
    example: `<TermsOfServiceText class="terms-body" />`,
  },

  // Layout and composition
  {
    id: "welcome-slide",
    name: "Welcome slide scaffold",
    group: "layout",
    tier: "pattern",
    source: "src/components/ui/WelcomeSlideScaffold.vue",
    usage: { tag: "WelcomeSlideScaffold" },
    example: `<WelcomeSlideScaffold icon="key" :title="$t('…title')" :text="$t('…text')">…</WelcomeSlideScaffold>`,
  },
];

export const dsItem = (id: string): DsItem | undefined =>
  DS_ITEMS.find((i) => i.id === id);
