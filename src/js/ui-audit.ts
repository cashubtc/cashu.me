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
    pattern: "Dialog corner overrides",
    places: [
      "PayInvoiceDialog.vue .q-dialog__inner > div (square top corners)",
      "ReceiveTokenDialog.vue .q-dialog__inner > div (20px top corners)",
      "WelcomePage.vue .q-dialog__inner (full viewport)",
    ],
    differs:
      "Scoped overrides of the shared sheet shape; each needs checking on a device before it can go.",
  },
];
