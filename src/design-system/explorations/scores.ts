// Council scores for each exploration set (design system board, round XV1, 2026-10-28):
// Sol (gpt-6.1-sol) and Opus (claude-opus-5-5), each scoring every variation 1-10 from the
// same captures. Index n is variation n (0 is the current design). The board orders each
// set's tabs by the mean, best first. Reviews: .council/reviews/xv/.

export type VariantScore = { sol: number; opus: number };

export const explorationScores: Record<string, VariantScore[]> = {
  callouts: [
    { sol: 8.7, opus: 7.8 },
    { sol: 8.1, opus: 6.4 },
    { sol: 9.1, opus: 8.4 },
    { sol: 7.0, opus: 5.2 },
    { sol: 7.2, opus: 6.0 },
    { sol: 7.8, opus: 6.8 },
    { sol: 8.4, opus: 7.3 },
    { sol: 6.8, opus: 6.6 },
  ],
  history: [
    { sol: 6.2, opus: 6.2 },
    { sol: 7.8, opus: 6.6 },
    { sol: 8.7, opus: 8.6 },
    { sol: 7.7, opus: 6.4 },
    { sol: 7.5, opus: 7.0 },
    { sol: 8.5, opus: 7.6 },
    { sol: 6.4, opus: 5.4 },
    { sol: 8.0, opus: 7.8 },
  ],
  "payment-request": [
    { sol: 6.6, opus: 6.0 },
    { sol: 8.0, opus: 7.4 },
    { sol: 8.8, opus: 8.2 },
    { sol: 8.5, opus: 7.3 },
    { sol: 7.8, opus: 7.2 },
    { sol: 7.2, opus: 6.8 },
    { sol: 7.5, opus: 6.6 },
    { sol: 6.9, opus: 5.3 },
  ],
  "pwa-prompt": [
    { sol: 6.0, opus: 4.2 },
    { sol: 8.9, opus: 8.6 },
    { sol: 8.2, opus: 8.1 },
    { sol: 8.6, opus: 7.0 },
    { sol: 7.2, opus: 7.6 },
    { sol: 7.7, opus: 6.4 },
    { sol: 8.0, opus: 7.2 },
    { sol: 6.7, opus: 6.8 },
  ],
  "segmented-control": [
    { sol: 7.9, opus: 6.4 },
    { sol: 8.4, opus: 7.3 },
    { sol: 7.4, opus: 6.2 },
    { sol: 8.2, opus: 7.0 },
    { sol: 6.2, opus: 5.2 },
    { sol: 8.0, opus: 6.6 },
    { sol: 9.0, opus: 8.4 },
    { sol: 7.7, opus: 7.0 },
  ],
  toasts: [
    { sol: 8.3, opus: 7.4 },
    { sol: 7.7, opus: 6.6 },
    { sol: 8.0, opus: 7.3 },
    { sol: 6.8, opus: 7.0 },
    { sol: 5.8, opus: 5.6 },
    { sol: 8.9, opus: 8.4 },
    { sol: 7.8, opus: 7.2 },
    { sol: 7.1, opus: 6.2 },
  ],
};
