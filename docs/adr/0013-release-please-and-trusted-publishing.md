# Releases go through a release-please PR, and npm publishing uses trusted publishing

Releasing by hand got forgotten: fixes sat on `main` unpublished for a week. Now release-please reads the Conventional Commit titles that ADR-0002 already guarantees, and keeps one **release PR** open whenever `main` has unreleased `feat`, `fix` or `perf` work. Merging it is the only manual step, so the maintainer still chooses when to ship. On 0.x, breaking changes and `feat` bump the minor version, and `fix`/`perf` the patch. Merging tags `v<version>` and creates the GitHub release. The tag starts `release.yml`, which runs the same build and `assert-package` gate as the PR `package` job, checks that the tag matches `package.json`, and publishes through npm trusted publishing. The run's OIDC token is swapped for a one-off credential and signed provenance, so no npm token is stored anywhere.

release-please runs as a GitHub App, not with `GITHUB_TOKEN`. PRs, pushes and tags made with `GITHUB_TOKEN` start no workflows, so the release PR would never get its required checks and would stay BLOCKED, and its tag would never start the publish. The App can only write contents and pull requests on this repo. Its private key is a GitHub-scoped secret, not an npm credential.

## Considered Options

- **semantic-release.** It publishes on every qualifying merge with no PR, so releases can't be batched or held back.
- **Changesets.** Every PR would need a changeset file, when the commit title already says the same thing.
- **An npm automation token in repo secrets.** It is a long-lived credential that can leak and must be rotated, and it gives no provenance link to the commit.
