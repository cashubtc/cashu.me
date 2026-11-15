# Bombadil exploration

[Bombadil](https://antithesishq.github.io/bombadil/) drives the wallet in a
browser with random taps, typing, scrolling, back and reload, and checks a set
of rules after every step. It complements the scripted Playwright suite in
`test/e2e`: nobody writes the steps, so it reaches orders of events a script
would not think to try.

## Install

Download the binary for your platform from the
[Bombadil releases](https://github.com/antithesishq/bombadil/releases) with
`curl` (macOS blocks a browser download), make it executable and put it on your
`PATH`. This spec was written against v0.7.10. No npm package is needed; the
binary resolves the `@antithesishq/bombadil` imports itself.

## Run

Start the wallet, then point Bombadil at it:

```bash
E2E=true npm run dev -- --port 4173

bombadil browser test --time-limit 10m --width 390 --height 844 \
  --output-path artifacts/bombadil --output-path-overwrite \
  http://127.0.0.1:4173 test/bombadil/wallet.bombadil.ts

bombadil browser inspect artifacts/bombadil
```

Add `--headless` to run without a visible browser window. The inspector shows
every step with a screenshot and marks the steps where a rule broke. The test
command also prints a `--reproduce` line that replays the same steps.

Each run starts with empty browser storage. Several short runs cover more
ground than one long one, because a run that gets stuck stays stuck.

## What the rules check

`wallet.bombadil.ts` re-exports Bombadil's default rules (no uncaught errors,
no unhandled promise rejections, no console errors, no failed requests) and
adds wallet rules:

| Rule                           | Breaks when                                                  |
| ------------------------------ | ------------------------------------------------------------ |
| `neverBlank`                   | the page has no visible text for 15 seconds                  |
| `neverShowsBrokenText`         | "NaN", "undefined", "[object Object]" or "Infinity" is shown |
| `neverShowsRawTranslationKeys` | a translation key is shown instead of its text               |
| `neverStaysTooWide`            | the page stays wider than the window for 3 seconds           |
| `spinnersFinish`               | a spinner is still showing after 30 seconds                  |
| `errorToastsGoAway`            | an error notification is still showing after 15 seconds      |
| `dialogsDoNotPileUp`           | more than two dialogs stay open for 3 seconds                |
| `tapTargetsAreBigEnough`       | a visible button or link is under 32px wide or tall          |

Add a rule for anything the wallet should always or never do, and let Bombadil
look for a counterexample.

## Limits

- The run is not offline. Bombadil can reach Discover mints and add public
  mints. It does not use the local CDK mints from `test/e2e`, so the wallet
  never has a balance and the payment flows are not exercised.
- The test browser has no camera and denies clipboard reads, so scanning and
  pasting always take their refusal paths.
- Screenshots lag a step behind and many land mid-animation.
- A rule break is a lead, not a confirmed bug. Check it by hand before filing.
