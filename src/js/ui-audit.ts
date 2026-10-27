// Patterns implemented more than once, shown in the Duplicates section of /ui
// (src/pages/UiKitPage.vue). Each entry lists the separate implementations and how they differ,
// so they can be merged into one. Remove an entry once it has been consolidated.

export type UiDuplicate = {
  pattern: string;
  places: string[];
  differs: string;
};

export const UI_DUPLICATES: UiDuplicate[] = [
  {
    pattern: "Round icon slot",
    places: [
      "SendDialog.vue .icon-circle (48px, tint token)",
      "ReceiveDialog.vue .icon-circle (48px, tint token)",
      "ParseInputComponent.vue .qr-icon-circle (48px)",
      "ReceiveEcashDrawer.vue .icon-circle (48px, white 10%)",
      "PaymentRequestInfo.vue .icon-circle (48px, white 10%)",
      "welcome/* .icon-circle ×5 (80px, white 10%)",
      "SheetOption.vue .sheet-option__icon (40px)",
      "MintDiscovery.vue .discover-empty__icon (56px)",
    ],
    differs:
      "Sizes 40/48/56/80px; half use the tint token, half a white literal that breaks light mode.",
  },
  {
    pattern: "Tappable option row (icon, label, caption)",
    places: [
      "SheetOption.vue .sheet-option",
      "SendDialog.vue / ReceiveDialog.vue .action-row",
      "ReceiveEcashDrawer.vue .action-row (white literals, no light mode)",
      "PaymentRequestInfo.vue .payment-request-info",
      "ParseInputComponent.vue .qr-scanner-row",
      "welcome/WelcomeSlideChoice.vue .option (14px radius, 72px, bordered)",
    ],
    differs:
      "Radius 12 or 14px, heights 56–72px, borders on some; label and caption text styles copied three times.",
  },
  {
    pattern: "Warning and info callouts",
    places: [
      "settings.scss .settings-section-caption--warning (tokens)",
      "MintAuditWarningBox.vue (orange outline #f18408)",
      "MintMotdMessage.vue (same structure, 8px padding)",
      "MultinutPaymentDialog.vue .warning-content (amber fill)",
      "CreateInvoiceDialog.vue .mint-error-warning (amber fill)",
      "ReceiveTokenDialog.vue .receive-error (red tint)",
      "ToolTipInfo.vue + .swap-info-tip ×2 (blue tint)",
    ],
    differs:
      "Four colour schemes, radii 8 or 12px, padding 8–16px; only the settings one uses tokens.",
  },
  {
    pattern: "Sheet top corners and title height",
    places: [
      "app.scss sheet radius (shared)",
      "SendDialog / ReceiveDialog / ReceiveEcashDrawer .q-dialog__inner--bottom",
      ".qcard radius in InvoiceDetail, P2PK, PayInvoice, PaymentRequest, ReceiveDialog",
      ".fixed-title-height ×8 fullscreen sheets",
    ],
    differs: "Identical copies of the shared rule.",
  },
  {
    pattern: "Header close button",
    places: [
      "fullscreen sheets: grey close icon",
      "drawers: primary XIcon",
      "BottomSheet.vue .bottom-sheet-close (text colour)",
      "MultinutPaymentDialog.vue .close-icon (white)",
      "MintDetailsPage.vue .top-icons",
    ],
    differs: "Three colours and two icon sets for the same control.",
  },
  {
    pattern: "Amount entry (big amount, fiat, keypad area)",
    places: [
      "AmountInputComponent.vue .amount-display / .fiat-display 17px",
      "CreateInvoiceDialog.vue copies (fiat 14px)",
      "SendTokenDialog.vue copies (fiat 14px)",
      "PayInvoiceDialog.vue .amount-area / .keypad-wrapper",
    ],
    differs: "Fiat line 14 or 17px; wobble keyframes and wrappers copied.",
  },
  {
    pattern: "Large amount headings",
    places: [
      "app.scss .amount-headline 36/700",
      "MultinutPaymentDialog.vue .multinut-amount 32/600",
      "BalanceView.vue .balance-amount",
    ],
    differs: "Three sizes and weights for the same role.",
  },
  {
    pattern: "Label and value detail rows",
    places: [
      "app.scss .detail-item (shared)",
      "AddMintDialog.vue redefines .detail-* (16/600, 10px gap)",
      "MintDetailsPage.vue .contact-item and .action-button rows",
    ],
    differs: "Text 15 or 16px, weights 400–600, icon gap 10 or 12px.",
  },
  {
    pattern: "Swap section",
    places: [
      "ReceiveTokenDialog.vue .swap-section*",
      "SwapIncomingTokenToKnownMint.vue .swap-section* (byte-for-byte copy)",
    ],
    differs: "Identical.",
  },
  {
    pattern: "Empty states",
    places: [
      "MintRatingsComponent.vue .empty-state (card, 26px icon, 18/600)",
      "MintDiscovery.vue .discover-empty (56px disc, 15px)",
      "NoMintWarnBanner.vue .no-mint-card (20px radius)",
      "HistoryTable.vue .history-empty (caption only)",
      "app.scss .blocking-state (22px title)",
    ],
    differs: "Five layouts, icon sizes and title sizes.",
  },
  {
    pattern: "Tinted bordered box",
    places: [
      "MintRatingsComponent.vue .section-card",
      "AddMintDialog.vue .mint-preview-pill",
      "app.scss .council-dialog__summary (14px)",
      "AdvancedSettings.vue .keyset-counter-list",
      "MintDiscovery.vue .discover-skeleton__row (10px)",
    ],
    differs: "Radii 10/12/14/16/20px.",
  },
  {
    pattern: "Skeleton rows",
    places: [
      "MintDiscovery.vue custom skeleton row",
      "MintRatingsComponent.vue inline-styled rects",
      "WalletPage.vue single rect",
      "MintInfoContainer.vue",
    ],
    differs: "No shared skeleton row.",
  },
  {
    pattern: "Small badges and pills",
    places: [
      "mintlist.css .currency-unit-badge (4px)",
      "MintDetailsPage.vue .currency-unit-pill / .nut-pill (4px)",
      "MultinutPaymentDialog.vue .total-balance-badge / .allocation-badge",
      "MintRatingsComponent.vue .own-review-chip (pill)",
      "settings.scss .q-badge outline (pill)",
    ],
    differs: "4px squares and full pills for the same kind of label.",
  },
  {
    pattern: "Primary button heights",
    places: [
      "52px: full-width pills, welcome next, wallet actions, blocking action",
      "48px: confirm dialogs, edit mint, add mint (defined twice), discover, multinut pay",
      "36px: WelcomeMintSetup .add-mint-btn",
      "app.scss / ReceiveTokenDialog .custom-btn (grey, 60 or 80px)",
    ],
    differs: "Three heights for primary actions plus a legacy grey button.",
  },
  {
    pattern: "Busy button",
    places: [
      "CreateInvoiceDialog.vue: dots spinner plus a label",
      "AddMintDialog, MintDiscovery, RestoreView, NostrMintRestore, PayInvoiceDialog, MultinutPaymentDialog, ParseInputComponent, SendPaymentRequest, DisplayTokenComponent: bare spinner",
    ],
    differs:
      "Only one busy button says what is happening; the rest replace the label with a spinner.",
  },
  {
    pattern: "Fixed bottom action bar",
    places: [
      "app.scss .bottom-panel",
      "MultinutPaymentDialog.vue .action-buttons-section (dark background)",
    ],
    differs:
      "Different background; the class name means three things in three files.",
  },
  {
    pattern: "Selected row tint",
    places: [
      "SheetOption.vue .sheet-option--selected (selected tokens)",
      "mintlist.css .mint-item-selected",
      "MultinutPaymentDialog.vue .mint-card-selected/-success/-error",
      "PayInvoiceDialog.vue .fee-option-row--selected",
    ],
    differs:
      "Only SheetOption and the mint cards use the selected tokens; the others use an undefined --q-primary-rgb, so their tint never renders.",
  },
  {
    pattern: "Monospace token and key text",
    places: [
      "ReceiveTokenDialog / PayInvoiceDialog .cashub-nowrap",
      "CreateInvoiceDialog / InvoiceDetailDialog .qr-copy-text",
      "P2PKDialog .p2pk-key-text",
      "AdvancedSettings .keyset-id",
    ],
    differs: "Four classes for one style.",
  },
  {
    pattern: "Welcome slide scaffold",
    places: [
      "welcome/WelcomeRecoverSeed, WelcomeSlide3, WelcomeSlideChoice, WelcomeMintSetup, WelcomeRestoreEcash, WelcomeSlide1",
    ],
    differs:
      "Title, description, icon and media block copied into six files with white literals.",
  },
  {
    pattern: "Toolbar",
    places: [
      "MainHeader.vue .main-toolbar",
      "FullscreenHeader.vue .fullscreen-toolbar",
    ],
    differs: "Identical.",
  },
  {
    pattern: "PWA install prompt",
    places: ["AndroidPWAPrompt.vue", "iOSPWAPrompt.vue"],
    differs: "Same apart from position and arrow direction.",
  },
];
