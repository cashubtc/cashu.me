// State the design system board shares with its entries: the search and the entry in view.
export type DsBoard = {
  readonly active: string;
  matches: (id: string) => boolean;
};
