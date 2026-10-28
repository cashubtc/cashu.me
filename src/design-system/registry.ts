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
    source: "src/components/ui/IconCircle.vue (sm 40, md 48, lg 56, xl 80)",
    usage: { tag: "IconCircle" },
    example: `<IconCircle :icon="ZapIcon" size="lg" />`,
  },
  {
    id: "icons",
    name: "Icons",
    group: "foundations",
    tier: "primitive",
    source: "lucide-vue-next (read from every import in src)",
    example: `import { Zap as ZapIcon } from "lucide-vue-next";
<ZapIcon :size="20" />`,
    note: "Every icon in the app, in one grid: Lucide line icons only (Quasar's own icons use the Lucide set in src/js/lucide-icons.ts, and a guard test rejects Material names). One icon per idea: Coins amount and ecash, CircleDollarSign unit, Banknote fiat, ReceiptText fee, Zap Lightning, Bitcoin on-chain, Landmark mint, FileText payment request, Hash ids and addresses, Network network, ClipboardPaste paste, Copy copy, Trash2 delete, RefreshCw refresh, ArchiveRestore restore, X close, CircleCheck / CircleAlert / TriangleAlert / Info for success, error, warning and info.",
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
    source: "src/components/WalletActions.vue",
    usage: { tag: "WalletActions" },
    example: `<WalletActions @receive="…" @scan="…" @send="…" />`,
    note: "Caps by design: the two strategic wallet actions, with scan in a tinted circle between them.",
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
    source: "src/components/ui/IconButton.vue",
    usage: { tag: "IconButton" },
    example: `<IconButton :label="$t('global.actions.close.label')" :icon="XIcon" :icon-size="24" floating />`,
    note: "Always labelled. Close, back and menu at 24px; actions at 20px. Busy shows the pending dots.",
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
    id: "copy-field",
    name: "Copy field",
    group: "forms",
    tier: "composite",
    source: "src/components/ui/CopyField.vue",
    usage: { tag: "CopyField" },
    example: `<CopyField :value="address" label="Your address" copy-label="Copy Lightning address" />`,
    note: "A read-only value to copy: the standard field's read-only look, with the copy button in the lock's place.",
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
    source: "src/components/ui/SegmentedControl.vue",
    usage: { tag: "SegmentedControl" },
    example: `<SegmentedControl v-model="unit" label="Currency" :options="[{ label: 'BTC', value: 'sat' }, { label: 'USD', value: 'usd' }]" />`,
    note: "Two to four equal choices on a sliding primary thumb; a radio group with arrow keys. Disabled keeps the choice visible.",
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
    id: "cjk-text",
    name: "CJK text",
    group: "foundations",
    tier: "primitive",
    source: "src/components/ui/CjkText.vue",
    usage: { tag: "CjkText" },
    example: `<CjkText tag="p" :text="$t('WelcomeSlide1.text')" />`,
    note: "Chinese and Japanese copy that only wraps between words (Intl.Segmenter). Other locales unchanged.",
  },
  {
    id: "flow-column",
    name: "Flow column",
    group: "layout",
    tier: "primitive",
    source: "src/components/ui/FlowColumn.vue",
    usage: { tag: "FlowColumn" },
    example: `<FlowColumn class="q-px-md q-mb-sm"><ChooseMint /></FlowColumn>`,
    note: "A flow's content column: centred, full width up to --app-column. Classes land on the column.",
  },
  {
    id: "tonal-chip",
    name: "Tonal chip",
    group: "actions",
    tier: "primitive",
    source: "src/components/ui/TonalChip.vue",
    usage: { tag: "TonalChip" },
    example: `<TonalChip @click="showQr = !showQr"><template #icon><QrCodeIcon :size="18" /></template>Show QR code</TonalChip>`,
    note: "A quiet secondary action: tint fill, no edge, leading glyph, 44px.",
  },
  {
    id: "mint-card-action",
    name: "Mint card action",
    group: "actions",
    tier: "primitive",
    source: "src/components/ui/MintCardAction.vue",
    usage: { tag: "MintCardAction" },
    example: `<MintCardAction :label="$t('MintSettings.discover.add')" @click="add"><template #icon><PlusIcon :size="16" /></template></MintCardAction>`,
    note: "A labelled text action on a mint card's name line. Default, disabled and busy.",
  },
  {
    id: "unit-toggle",
    name: "Unit toggle",
    group: "navigation",
    tier: "primitive",
    source: "src/components/ui/UnitToggle.vue",
    usage: { tag: "UnitToggle" },
    example: `<UnitToggle :label="activeUnitLabel" @toggle="toggleUnit()" />`,
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
    tier: "composite",
    source: "src/components/MintCard.vue",
    usage: { tag: "MintCard" },
    example: `<MintCard :name="mint.name" :url="mint.url" :balances="['₿2,289']" active>
  <template #status>…</template><template #action>…</template><template #meta>…</template>
</MintCard>
<MintCard skeleton />`,
    note: "Mints, Discover and Restore. The skeleton is the same card with placeholders in its boxes.",
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
    source: "src/components/ui/AppBadge.vue",
    usage: { tag: "AppBadge" },
    example: `<AppBadge tone="warning">Staging</AppBadge>`,
  },
  {
    id: "detail-row",
    name: "Detail row",
    group: "data",
    tier: "composite",
    source: "src/components/ui/DetailRow.vue",
    usage: { tag: "DetailRow" },
    example: `<DetailRow :icon="ClockIcon" label="Paid at" :value="date" />
<DetailRow :icon="CoinsIcon" label="Amount" value="Any amount" placeholder action @click="editAmount" />`,
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
      "src/components/ui/AmountHeadline.vue · AnimatedNumber.vue · ToggleUnit.vue",
    usage: { tag: "AmountHeadline" },
    example: `<div class="amount-headline">−₿101</div>`,
  },
  {
    id: "payment-status",
    name: "Payment status",
    group: "data",
    tier: "composite",
    source: "src/components/ui/PaymentStatus.vue",
    usage: { tag: "PaymentStatus" },
    example: `<PaymentStatus state="paid" :label="$t('…paid')" :caption="fee">₿100</PaymentStatus>`,
    note: "The outcome at the top of a payment: paid (green check), pending (dots) or none, the state in words, the amount, a muted caption.",
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
    id: "qr-copy-line",
    name: "QR copy line",
    group: "data",
    tier: "primitive",
    source: "src/components/ui/QrCopyLine.vue",
    usage: { tag: "QrCopyLine" },
    example: `<QrCopyLine :text="address" :copied="copied" @copy="copyAddress" />`,
    note: "The tap-to-copy text under every QR (on-chain address, Lightning address, payment request): the copy glyph turns into a check once copied.",
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
    note: "The mint message (MintMotdMessage) is this callout: info and dismissible while new, neutral once read.",
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
    name: "Pending and loading",
    group: "feedback",
    tier: "primitive",
    source:
      "src/components/ui/PendingDots.vue · BusyLabel.vue · each list component's skeleton prop",
    usage: { tag: "PendingDots" },
    example: `<PendingDots />
<template #loading><BusyLabel>Creating</BusyLabel></template>
<MintCard skeleton />  <ActivityRow skeleton />  <ReviewItem skeleton />`,
    note: "Anything pending or busy shows the three dots, never a ring or a pulse; a busy button's label is BusyLabel (dots before the text). Loading lists render their own rows with skeleton set, so nothing moves when data arrives.",
  },
  {
    id: "busy-label",
    name: "Busy label",
    group: "feedback",
    tier: "primitive",
    source: "src/components/ui/BusyLabel.vue",
    usage: { tag: "BusyLabel" },
    example: `<q-btn :loading="busy" …>Swap<template #loading><BusyLabel>Swapping</BusyLabel></template></q-btn>`,
    note: "A busy button keeps saying what it does: the pending dots before the label, on filled, outline and flat buttons.",
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
    tier: "composite",
    source: "src/components/ui/BlockingState.vue",
    usage: { tag: "BlockingState" },
    example: `<BlockingState :icon="SearchXIcon" :title="…" :text="…" :action="…" to="/" />`,
    note: "AlreadyRunning and the 404: the empty state's icon disc, a larger page title, one 320px action.",
  },
  {
    id: "flow-dialog",
    name: "Full-screen flow",
    group: "feedback",
    tier: "pattern",
    source: "src/components/ui/FlowDialog.vue",
    usage: { tag: "FlowDialog" },
    example: `<FlowDialog v-model="show">\n  <FullscreenDialogHeader :title="…" />\n  …\n  <FlowFooter>…</FlowFooter>\n</FlowDialog>`,
    note: "Pay, receive, send, invoice, lock key and payment request: full screen on phones, the centred 560px dialog on desktop. Closes on Escape, not on a backdrop tap.",
  },
  {
    id: "bottom-sheet",
    name: "Bottom sheet",
    group: "feedback",
    tier: "composite",
    source: "src/components/BottomSheet.vue",
    usage: { tag: "BottomSheet" },
    example: `<BottomSheet v-model="open" title="Send">
  <template #trailing><q-btn … /></template>
  …
</BottomSheet>`,
    note: "The only sheet: Send, Receive and every picker. Optional trailing header action, back mode for stacked sheets, one 16px content inset.",
  },
  {
    id: "option-row",
    name: "Option row",
    group: "feedback",
    tier: "composite",
    source:
      "src/components/ui/OptionRow.vue · SheetOption.vue (the sheet picker form)",
    usage: { tag: "OptionRow" },
    example: `<OptionRow :label="…" :caption="…" @click="…"><template #icon><ZapIcon :size="24" /></template></OptionRow>
<SheetOption label="Lightning" :selected="pick === 'ln'" @select="pick = 'ln'" />`,
  },
  {
    id: "confirm-dialog",
    name: "Confirm dialog",
    group: "feedback",
    tier: "composite",
    source: "src/components/ui/ConfirmDialog.vue",
    usage: { tag: "ConfirmDialog" },
    example: `<ConfirmDialog v-model="open" danger title="Remove this mint?" :summary="rows" :note="…" confirm-label="Remove mint" @confirm="remove" />`,
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
    id: "payment-request",
    name: "Payment request",
    group: "feature",
    tier: "feature",
    source: "src/components/PaymentRequestView.vue · PaymentRequestDialog.vue",
    usage: { tag: "PaymentRequestView" },
    example: `<PaymentRequestView :request="encoded" :payments="payments" @change="makeNewRequest" />`,
    note: "The same QR and detail table as the Lightning and on-chain receive screens: Amount, Unit and Mint are tappable rows (DetailRow action) that open the amount entry, the unit sheet and the mint picker. The dialog adds the header and the pager.",
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
    id: "ratings-summary",
    name: "Ratings summary",
    group: "feature",
    tier: "composite",
    source: "src/components/RatingsSummary.vue",
    usage: { tag: "RatingsSummary" },
    example: `<RatingsSummary :average="4.5" :distribution="{ 5: 8, 4: 3, 3: 1 }" />`,
  },
  {
    id: "review-item",
    name: "Review",
    group: "feature",
    tier: "composite",
    source: "src/components/ReviewItem.vue",
    usage: { tag: "ReviewItem" },
    example: `<ReviewItem author="satoshi" :rating="5" comment="…" date="2 days ago" />
<ReviewItem skeleton />`,
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
    example: `<WelcomeSlideScaffold :icon="KeyRoundIcon" :title="$t('…title')" :text="$t('…text')">…</WelcomeSlideScaffold>`,
  },
  {
    id: "flow-footer",
    name: "Flow footer",
    group: "layout",
    tier: "pattern",
    source: "src/components/ui/FlowFooter.vue",
    usage: { tag: "FlowFooter" },
    example: `<FlowFooter>\n  <q-btn class="full-width" unelevated rounded size="lg" color="primary">…</q-btn>\n</FlowFooter>`,
    note: "The main action pinned under a full-screen flow, in the app column. The above slot holds the keypad on amount steps.",
  },
];

export const dsItem = (id: string): DsItem | undefined =>
  DS_ITEMS.find((i) => i.id === id);
