---
name: web-ui-visual-review
description: Analyze a cashu.me pull request, branch, or commit for user-visible changes and produce reproducible before/after screenshots from isolated dev-server builds with Playwright. Use this skill whenever the user asks for PR screenshots, branch UI comparisons, visual regression evidence, before/after captures, dark/light theme or viewport comparisons, populated-wallet-state screenshots, or GitHub comments containing web UI evidence — even if they only say "show me what changed", "post screenshots to the PR", or "comment before/after pics". Also use it to determine and document that a suspected UI change has no visual delta. Do not use it for implementing a new UI, ordinary code review without visual evidence, or functional/e2e testing.
compatibility: Requires git, node/npm, python 3, gh (for PR targets and publishing), and a way to run Playwright scripts (the local playwright-skill runner or a resolvable playwright module).
---

# Web UI Visual Review

Turn a PR or branch into trustworthy visual evidence. The comparison is only
useful when the before and after builds use the correct commits, the same
fixtures, the same viewport/theme, and the same navigation path — and when
someone actually looks at every screenshot.

## Collect the two user choices

Before starting, resolve:

1. **Target** — a PR URL/number or a branch/commit. If it is missing, ask.
   For a branch, ask for the intended base when it cannot be inferred safely;
   otherwise default to the repository's `main`.
2. **Publishing** — for a PR target, ask whether the final screenshots stay
   local or get posted as a PR comment. Do not perform any GitHub write unless
   the user explicitly chooses publishing. A prior explicit request such as
   "post these to the PR" already answers this question.

Do not block on the publishing choice while doing read-only analysis.

## Read the routed guidance

- Read [references/cashu-me-playbook.md](references/cashu-me-playbook.md) for
  every run. It contains the dev-server mechanics, storage keys, fixture
  recipes, selectors, and the pitfalls that make captures lie (several of them
  are non-obvious and will silently produce wrong screenshots).
- Read [references/github-publishing.md](references/github-publishing.md) only
  when the user has opted into a PR comment.

## Create an isolated review session

Never switch the user's active checkout between before and after revisions —
it disturbs their work and invites mistakes. Run from the repository root:

```sh
.agents/skills/web-ui-visual-review/scripts/create_review_worktree.sh \
  --target "<PR URL, PR number, branch, or commit>"
```

For a branch with a non-default base add `--base "<base ref>"`.

The script resolves PR heads, computes the **actual merge-base** (not the
current tip of main), creates a detached temporary worktree at the before SHA,
symlinks `node_modules` into it, and prints a session directory, worktree
path, artifact directory, and both SHAs. Keep artifacts outside the worktree
so checkouts cannot remove them. If a review session already exists and its
SHAs are verified, reuse it — do not create a second worktree for the same run.

## Establish the visual contract

Use the actual diff, not the PR title, to decide what should be visible.

1. Record `git diff --stat`, `--name-status`, and the focused diff between the
   before and after SHAs.
2. Trace changed UI symbols to their components, state sources, entry points,
   and prerequisites (routes, tabs, dialogs, feature flags).
3. Separate direct visual changes from indirect ones (theme tokens, shared
   CSS, store-driven labels, default data).
4. Produce a capture matrix before building. Each row defines: surface,
   navigation path, fixture, viewport, theme, and the expected difference.
5. Include a control state where the UI should remain unchanged — it lets
   reviewers distinguish intentional change from regression, and documents
   "no visual delta" claims with evidence.
6. Cover both dark and light themes for any surface whose styles changed.

When the diff contains no UI/style/state-to-UI change, say so. If the user
asked for a screenshot of every target anyway, capture the nearest affected
surface before/after and label the expected result **no visual delta**. Do not
invent a UI claim for a behavioral fix.

## Run the before and after builds sequentially

The review worktree shares `node_modules` with the main checkout via symlink,
which means they also share Vite's cache directory. **Quasar/Vite caches
compiled output under `node_modules/.q-cache` keyed loosely enough that a
server started in one checkout can serve stale files from the other.** This
has produced real "before" screenshots that actually showed after-code (and
vice versa). Two rules prevent it:

1. `rm -rf node_modules/.q-cache` before **every** dev-server start.
2. Run only one review server at a time: start before-build → capture → kill
   → clear cache → start after-build → capture → kill.

Start each build on its own port from the appropriate directory:

```sh
npm run dev -- --port 8014   # before build: in the review worktree
npm run dev -- --port 8013   # after build: in the target branch worktree
```

Wait for an HTTPS 200 before capturing (`curl -sk -o /dev/null -w "%{http_code}"`).
The dev server uses a self-signed certificate, so Playwright contexts need
`ignoreHTTPSErrors: true`.

## Capture with Playwright

Use [scripts/capture_starter.js](scripts/capture_starter.js) as the starting
point — it already contains the fixture helpers that are easy to get wrong
(welcome bypass, Quasar-encoded dark-mode flag, IndexedDB history seeding,
screenshot helper). Copy it, then extend the interaction section with the
navigation path from your capture matrix. Run it with the playwright-skill
runner or any environment where `require("playwright")` resolves:

```sh
BUILD=before BASE_URL=https://localhost:8014 \
  node /Users/cc/.agents/skills/playwright-skill/run.js capture.js
```

Rules that keep captures honest:

- **One fixture, injected identically into both builds.** Same mints, same
  history rows, same synthetic labels and amounts. If a state cannot be
  expressed in both builds, drop it from the matrix or disclose why.
- **Fresh browser profile per run** (new Playwright context) so no real
  wallet data can leak into evidence.
- **Wait out animations** before shooting: the balance count-up (~600ms),
  transitions (≤300ms), dialog/sheet entrances. A fixed generous wait after
  load plus a short wait after each interaction is more reliable than clever
  waiting.
- **Inspect every screenshot immediately** by viewing the PNG. A successful
  command is not proof the intended screen was visible — persisted tabs,
  below-the-fold targets, half-finished animations, and missing fixture data
  have all produced plausible-but-wrong shots. Re-running a capture is cheap;
  publishing a wrong one is not.
- Name files `before-<surface>-<state>-<theme>.png` / `after-...png`.

If a capture reveals a **visual bug in the after build** (broken contrast,
overflow, misalignment), that is a finding, not a nuisance: fix it on the
target branch, commit, re-capture the affected states, and disclose the fix in
the report. Visual review exists to catch exactly these.

## Validate and report

Create `capture-manifest.json` in the artifact directory using
[assets/capture-manifest.example.json](assets/capture-manifest.example.json)
as the shape. Use paths relative to the manifest and omit local absolute
paths. Validate it:

```sh
python3 .agents/skills/web-ui-visual-review/scripts/validate_capture_manifest.py \
  "<artifact-directory>/capture-manifest.json"
```

The validator checks that every referenced image exists, is a real PNG, and
that each before/after pair has identical pixel dimensions.

Write a Markdown report next to the manifest with: target and exact
before/after SHAs, browser and viewport, concise code analysis, visual
findings (including intentional non-changes), side-by-side tables, fixture
disclosure, and limitations.

End the local run only after:

- the manifest validates cleanly
- every screenshot has been visually inspected
- the review worktree has no leftover modifications (`git status` clean)
- dev servers are stopped and the temporary worktree is removed
  (`git worktree remove --force <path>`)

## Publish only when asked

If the user opted into a PR comment, follow
[references/github-publishing.md](references/github-publishing.md): upload
image bytes to a PR-scoped git ref (never a source branch), build the comment
from [assets/pr-comment-template.md](assets/pr-comment-template.md), scan it
for local paths and identifiers, post once with a unique hidden marker, and
verify by reading the comment back.
