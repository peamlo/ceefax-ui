# AGENTS.md

Working guide for coding agents in `ceefax-ui` — a framework-agnostic, **CSS-first** design system (design tokens + semantic CSS classes + self-hosted fonts, **no JS component runtime** except the `<cf-loader>` Web Component).

Read this, then `CONTEXT.md` (the glossary) and any relevant `docs/adr/` before making changes.

## The contract — do not drift

**One semantic class on the correct native element. State comes from native/ARIA attributes. `data-*` is only for presentational variants.** See `README.md` → "The contract" and `docs/adr/` for the reasoning.

- **Never** write state-modifier classes (`cf-btn--disabled`, `cf-btn--active`). Use the real `disabled` attribute, `:focus-visible`, `[aria-current]`, `[aria-pressed]`.
- `data-variant` is only a presentational colour — one of the six named authentic colours (`red`/`green`/`yellow`/`blue`/`cyan`/`magenta`), plus look-only `ghost` (button) and `nav` (link). The name→colour mapping lives once in the variant seam (`src/base.css`, ADR-0007), via `--cf-variant-*`; a component opts in by matching `[data-variant]` on itself and reading `--_variant` through a fallback. `data-size` is presentational too.
- No utility classes, no compound-class soup.
- Tokens layer strictly: `--cf-base-*` = the authentic 8 broadcast colours (never remapped); every other `--cf-*` colour = a semantic alias (including the `--cf-variant-*` tier the variant seam resolves through), the **only** colour tier component, layout and seam stylesheets reference. Themes (`[data-theme="accessible"]`, ADR-0010) remap aliases only. Need a colour in a component? Use (or add) a semantic alias, never `--cf-base-*` — the `Foundations/Token layering` guard story fails CI otherwise (ADR-0008).

## Commands

```sh
npm install
npm run storybook      # framework-agnostic Storybook (HTML mode) — every variant + live a11y checks
npm run build          # PostCSS → dist/index.css + dist/tokens.css
npm run build-storybook
npm run assert-package # after build: pack, clean-install and assert the tarball (CI `package` job)
```

Storybook (`@storybook/html-vite` + the a11y addon; interactions/`play()` are core) is the **living component documentation** — stories show the exact HTML contract and run WCAG checks. Add/update a story for any component or variant change.

## Where things are documented

- `README.md` — public consumer docs + the contract.
- `CONTEXT.md` — the glossary / ubiquitous language. Use its terms; don't drift to synonyms it marks `_Avoid_`.
- `docs/adr/` — Architecture Decision Records (why, not how). Flag output that contradicts an ADR.
- Storybook — live component behaviour and variants.
- `docs/agents/` — how agents consume the issue tracker, triage labels, and domain docs (see below).
- `docs/reference/` — external reference material (summaries + archive links, not mirrors), e.g. [zxnet teletext](docs/reference/zxnet-teletext.md) for authentic teletext behaviour and specs.
- `docs/reviews/` — dated, point-in-time reviews (e.g. CI checks). Snapshots, not living docs: the GitHub issues they spawn are canonical.

## Commit messages — Conventional Commits

Commit messages **must** follow [Conventional Commits](https://www.conventionalcommits.org/).
This is enforced automatically by commitlint on the git `commit-msg` hook
(`.husky/commit-msg`, config in `commitlint.config.js`), so a non-conforming
message will be rejected before the commit is created.

### Format

```
type(optional-scope): description

[optional body]

[optional footer(s)]
```

### Types

| Type | Use for |
|------|---------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation only |
| `style` | Formatting/whitespace, no code-behaviour change |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf` | Performance improvement |
| `test` | Adding or fixing tests |
| `build` | Build system or dependencies |
| `ci` | CI configuration |
| `chore` | Maintenance that doesn't fit above |
| `revert` | Reverts a previous commit |

### Rules

- Type is lowercase; subject is not empty and has **no trailing period**.
- Write the description in the **imperative mood** ("add", not "added"/"adds").
- Keep the subject line short (≤ ~72 chars); put detail in the body after a blank line.
- Breaking changes: append `!` after the type/scope (`feat!: …`) **or** add a
  `BREAKING CHANGE:` footer.

### Scopes

Scopes are optional and unrestricted. Suggested scopes for this project:
`storybook`, `tokens`, `components`, `fonts`, `build`.

### Examples

```
fix(storybook): scope PostCSS config to unblock the dev server
feat(storybook): document foundations and add Card story
docs: document commit convention in AGENTS.md
chore: add package-lock.json
```

## PRs

Every PR uses `.github/PULL_REQUEST_TEMPLATE.md`. Keep the repo self-documenting: if a change touches the contract, record it (ADR + `CONTEXT.md` + Storybook), and tick the template's "Docs updated" checklist.

PRs merge into `main` via **squash only** (merge-commit and rebase are disabled). The squash commit title is the **PR title**, so the **PR title must be a Conventional Commit** — it becomes the commit on `main`. It's validated in CI by `.github/workflows/pr-title-lint.yml`, which runs the same `commitlint.config.js` as the local hook. See `docs/adr/0002-squash-only-conventional-pr-titles.md`.

## Releasing

Don't bump `version` in a PR or run `npm publish` locally. Why and how: `docs/adr/0013-release-please-and-trusted-publishing.md`.

- After every merge to `main`, release-please (`.github/workflows/release-please.yml`) keeps one **release PR**, `chore(release): <version>`, open while there is releasable work (`feat`, `fix`, `perf` or any breaking change; bump rules in `release-please-config.json`). It holds the version bump and the `CHANGELOG.md` entry.
- Merging the release PR tags `v<version>` and creates the GitHub release. The tag starts `.github/workflows/release.yml`, which builds, runs `assert-package` and publishes to npm with provenance through trusted publishing (no npm token).
- Fallback if release-please misbehaves: push a `v*` tag matching `package.json` on `main` and `release.yml` publishes it the same way.
- Dry run: run the `release` workflow from the Actions tab with **dry-run** ticked. It proves the build and tarball gate only, not the OIDC login: the first real tag is the first real test of the trusted publisher.
- One-time setup: a GitHub App with `contents: write` and `pull-requests: write` on this repo only (`RELEASE_APP_CLIENT_ID` variable + `RELEASE_APP_PRIVATE_KEY` secret); an npm trusted publisher for `@peamlo/ceefax-ui` → `peamlo/ceefax-ui` / `release.yml`; then revoke every existing npm automation or publish token.

## Agent skills

Engineering skills from [mattpocock/skills](https://github.com/mattpocock/skills) are installed under `.agents/skills/` (editable; tracked in `skills-lock.json`). `.claude/skills` is a committed relative symlink to `.agents/skills` so Claude Code discovers them as `/slash` commands — `.agents/skills` stays the source of truth, don't de-duplicate the two dirs. See `docs/adr/0005-claude-skills-symlink-to-agents-skills.md`.

### Issue tracker

Work is tracked as **GitHub issues** on `peamlo/ceefax-ui` via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`), label string = role name. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
