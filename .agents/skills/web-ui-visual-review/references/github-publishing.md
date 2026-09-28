# Publishing screenshots to a pull request

Follow this only after the user explicitly opts into a GitHub comment.

## Prepare a safe comment

The comment should contain:

- a unique hidden marker for idempotent verification
  (`<!-- web-ui-visual-review:<PR>:<AFTER_SHA> -->`)
- the browser and viewport used
- a statement that before is the target's actual merge-base
- concise visual findings
- paired before/after image tables, one per capture-matrix row
- fixture disclosure when artificial state was used
- limitations (motion/press states are not capturable in stills) and
  intentional non-changes
- disclosure of any bug found during review and fixed on the branch

Do not include:

- local paths or usernames
- device names, IPs, ports, or localhost URLs
- real messages, contacts, mints you personally use, balances, or any account
  information
- build logs

Scan the body locally for machine paths and identifiers before posting:

```sh
grep -nE "/Users/|/var/|/tmp/|localhost|:[0-9]{4}" comment.md && echo "FOUND" || echo "clean"
```

Use [../assets/pr-comment-template.md](../assets/pr-comment-template.md) as
the starting structure, replacing every placeholder and adding one table per
comparison state.

## Upload image bytes without changing a source branch

Native `gh pr comment` accepts Markdown but not binary files. The bundled
uploader uses `gh api` to place images on a PR-scoped custom Git ref:

```sh
python3 .agents/skills/web-ui-visual-review/scripts/upload_pr_images.py \
  --repo OWNER/REPO \
  --pr NUMBER \
  <ordered PNG files>
```

The helper:

- uploads only image bytes and basenames
- writes to `refs/uploads/issues/<NUMBER>`, outside `refs/heads/*`
- does not pass an author or committer override
- prints JSON containing stable GitHub blob URLs and ready-made Markdown
- does not post a comment

This is a GitHub repository write even though it does not create a visible
branch. The user's approval to publish authorizes this PR-scoped storage. If
repository policy rejects custom refs, ask the user for an approved image
host. Do not fall back to a source branch without separate authorization.

Use `--dry-run` first when validating new inputs.

## Post through gh

Build the final Markdown body with the returned URLs. Keep before and after in
the same table row, one table per capture-matrix row, ordered by surface.

Post once:

```sh
gh pr comment NUMBER --repo OWNER/REPO --body-file "<validated-comment.md>"
```

Record the returned comment URL.

## Verify the side effect

Read the comment back using `gh api`. Verify:

- the unique marker is present
- image embed count equals the requested screenshot count
- no local paths or identifiers were included
- the returned URL belongs to the intended PR

```sh
gh api repos/OWNER/REPO/issues/comments/<COMMENT_ID> \
  --jq '{marker: (.body | contains("web-ui-visual-review:<PR>")), images: ([.body | scan("!\\[")] | length)}'
```

If the posting command's outcome is ambiguous, query for the marker before
retrying. Do not create duplicate comments.

Report the comment URL to the user. Leave the PR-scoped image ref in place
while the comment depends on it; deleting the ref can eventually break the
images.
