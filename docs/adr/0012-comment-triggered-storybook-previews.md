# Storybook previews are comment-triggered, and no job holding the token runs PR code

A Storybook preview (see `CONTEXT.md`) is made only when a maintainer comments `/preview` on a pull request, because most PRs (docs, CI) don't need one and each deploy costs quota. It is uploaded to Cloudflare Pages, and the comment links that deployment's own immutable URL, never the moving per-branch alias, so the preview stays pinned to the commit it was made from. Every preview for the PR is deleted when the PR closes or merges.

`issue_comment` and `pull_request_target` are the only triggers that get repo secrets on fork and Dependabot PRs, and zizmor flags both as dangerous. They are accepted here under one rule: **no job that holds the Cloudflare token ever checks out or runs PR code.** The build job runs the PR's code with read-only permissions and no secrets, and hands over the static output as an artifact. The deploy job only uploads those files, and a separate job without the token smoke-tests the URL and comments it. The cleanup job on `pull_request_target: closed` only calls the Cloudflare API. Comments are acted on only from `OWNER`, `MEMBER` or `COLLABORATOR` authors. The Cloudflare API token is the one long-lived secret, unlike the token-free release flow (#49), because Cloudflare Pages has no GitHub OIDC login. So it is limited to Pages edit on one account and stored on a `main`-only GitHub environment that only the deploy and cleanup jobs use, and the zizmor `dangerous-triggers` ignore names the preview workflows only.

## Considered Options

- **A PR label as the trigger.** It runs on plain `pull_request`, so zizmor has no complaint, but it gets no secrets on fork or Dependabot PRs, which then can't have previews.
- **One job that builds and deploys.** It's simpler, but a commit pushed between the comment and the checkout could read the token.
- **Chromatic.** Its builds can't be deleted, so its previews can't be ephemeral.
- **A daily sweep for cleanup.** It needs no dangerous trigger, but previews would outlive their PR by up to a day.
