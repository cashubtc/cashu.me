// Patterns still implemented more than once, shown in the Duplicates section of /ui
// (src/pages/UiKitPage.vue). The standard versions live in src/css/elements.scss; move each
// remaining copy onto them, then delete its entry here.

export type UiDuplicate = {
  pattern: string;
  places: string[];
  differs: string;
};

export const UI_DUPLICATES: UiDuplicate[] = [
  {
    pattern: "Busy button",
    places: [
      "CreateInvoiceDialog.vue: dots spinner plus a label",
      "AddMintDialog, MintDiscovery, RestoreView, NostrMintRestore, PayInvoiceDialog, MultinutPaymentDialog, ParseInputComponent, SendPaymentRequest, DisplayTokenComponent: bare spinner",
    ],
    differs:
      "Only one busy button says what is happening; the rest replace the label with a spinner. Needs a busy label per action.",
  },
  {
    pattern: "Skeleton rows",
    places: [
      "MintDiscovery.vue .discover-skeleton__row",
      "MintRatingsComponent.vue inline-styled rects",
      "WalletPage.vue single rect",
      "MintInfoContainer.vue",
    ],
    differs: "No shared skeleton row; each screen draws its own.",
  },
  {
    pattern: "Amount entry wrappers",
    places: [
      "CreateInvoiceDialog.vue / SendTokenDialog.vue / PayInvoiceDialog.vue .amount-area, .keypad-wrapper",
      "CreateInvoiceDialog.vue / SendTokenDialog.vue wobble keyframes",
    ],
    differs:
      "Amount and fiat sizes are shared now; the layout wrappers and the error wobble are still copied.",
  },
  {
    pattern: "Dialog inner overrides",
    places: [
      "ReceiveTokenDialog.vue, PayInvoiceDialog.vue, NoMintWarnBanner.vue, WelcomePage.vue .q-dialog__inner > div",
    ],
    differs: "Each re-sets the sheet corners the shared rule already sets.",
  },
  {
    pattern: "Empty states",
    places: [
      "standard: .app-empty (MintRatingsComponent, MintDiscovery)",
      "NoMintWarnBanner.vue .no-mint-card (20px radius)",
      "HistoryTable.vue .history-empty (caption only)",
    ],
    differs: "Two screens still have their own empty state.",
  },
  {
    pattern: "Mint details rows",
    places: [
      "standard: app.scss .detail-item",
      "MintDetailsPage.vue .contact-item and .action-button rows",
    ],
    differs: "Contact and action rows use their own 16px text and 10px gaps.",
  },
  {
    pattern: "PWA install prompt",
    places: ["AndroidPWAPrompt.vue", "iOSPWAPrompt.vue"],
    differs:
      "Same apart from position and arrow direction; hard-coded black and grey.",
  },
];
