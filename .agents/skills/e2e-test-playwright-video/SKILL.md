---
name: e2e-test-playwright-video
description: Record, assemble, validate, and present watchable Playwright E2E demo videos for Cashu.me. Use this skill whenever a user asks to watch, record, share, or make a video or montage of wallet browser tests, payment flows, mint or melt operations, ecash transfers, or existing Playwright recordings, even if they do not explicitly name the skill.
compatibility: Requires Node.js 24+, Playwright Chromium, Docker Compose v2, FFmpeg, and FFprobe.
---

# Playwright E2E test video

Turn Cashu.me's real browser tests into a short, labeled demo while preserving
the tests as the source of truth. The bundled renderer records the successful
incoming, outgoing, and two-wallet ecash flows, then assembles them into an
H.264 MP4 with a title card and a contact sheet for visual review.

## Workflow

1. Work from the Cashu.me repository root and read `test/e2e/README.md` when the
   suite or prerequisites are unfamiliar.
2. Confirm `ffmpeg`, `ffprobe`, Docker Compose, and Playwright Chromium are
   available. Let the test runner report missing project dependencies normally.
3. Run the bundled renderer:

   ```bash
   node .agents/skills/e2e-test-playwright-video/scripts/render.mjs
   ```

   This invokes the real `mint.spec.ts`, `melt.spec.ts`, and `ecash.spec.ts`
   tests with `E2E_VIDEO=on`. It stops immediately if any test fails, because a
   polished montage must never disguise a broken wallet operation.

4. Inspect the generated contact sheet. Check that the incoming and outgoing
   chapters show the wallet UI and that both ecash wallets are visible side by
   side. If it is malformed, fix the renderer or source test and rerun it.
5. Report the test result, video duration and resolution, and provide the final
   MP4 using an absolute local file link. Embed the local video when the client
   supports media rendering.

## Reusing recordings

When the current `test-results/` already contains a complete video-enabled run,
skip Docker and the browser tests:

```bash
node .agents/skills/e2e-test-playwright-video/scripts/render.mjs --skip-tests
```

Use `--speed` to adjust pacing and `--output` to choose another repository-local
destination:

```bash
node .agents/skills/e2e-test-playwright-video/scripts/render.mjs \
  --skip-tests \
  --speed 1.5 \
  --output artifacts/wallet-e2e-fast.mp4
```

Run the script with `--help` for the concise option reference.

## Output and safety

- The default MP4 is `artifacts/wallet-e2e-demo.mp4`; its contact sheet sits
  beside it with `-contact-sheet.png` appended to the basename.
- Raw Playwright recordings remain below `test-results/`. The ecash test saves
  stable `sender.webm` and `receiver.webm` copies so the montage cannot swap the
  two roles accidentally.
- Generated videos and rendering assets are ignored by Git. Do not commit them
  unless the user explicitly requests a durable media artifact and repository
  policy permits it.
- Keep normal CI economical: `E2E_VIDEO=on` is opt-in, while ordinary runs retain
  recordings only on failure.
- Preserve the suite's hermetic design. Do not replace the local CDK fake rails
  with public Lightning, Bitcoin, price, Nostr, or mint services just to produce
  more dramatic footage.

## Troubleshooting

- A missing source recording usually means the tests were not run with
  `E2E_VIDEO=on`; rerun without `--skip-tests`.
- A missing `sender.webm` or `receiver.webm` means the ecash spec predates the
  stable video-copy behavior; run the current spec again.
- If the suite fails, preserve Playwright's trace, screenshot, and failure video,
  report the failing operation, and do not create a success montage from stale
  clips.
- If FFmpeg cannot encode H.264, report the missing encoder and leave the raw
  WebM recordings intact rather than silently changing the output contract.
