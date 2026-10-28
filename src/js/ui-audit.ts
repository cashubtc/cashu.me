// Patterns still implemented more than once, shown in the Duplicates section of /ui
// (src/pages/UiKitPage.vue). The standard versions live in src/css/elements.scss; move each
// remaining copy onto them, then delete its entry here.

export type UiDuplicate = {
  pattern: string;
  places: string[];
  differs: string;
};

export const UI_DUPLICATES: UiDuplicate[] = [];
