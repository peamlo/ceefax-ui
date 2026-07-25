# AGENTS.md

Working guide for coding agents in `ceefax-ui` — a framework-agnostic, **CSS-first** design system (design tokens + semantic CSS classes + self-hosted fonts, **no JS component runtime** except the `<cf-loader>` Web Component).

Read this, then `CONTEXT.md` (the glossary) and any relevant `docs/adr/` before making changes.

## The contract — do not drift

**One semantic class on the correct native element. State comes from native/ARIA attributes. `data-*` is only for presentational variants.** See `README.md` → "The contract" and `docs/adr/` for the reasoning.

- **Never** write state-modifier classes (`cf-btn--disabled`, `cf-btn--active`). Use the real `disabled` attribute, `:focus-visible`, `[aria-current]`, `[aria-pressed]`.
- `data-variant` is only the presentational fastext colour (`red`/`green`/`yellow`/`blue`) and card border colour; `data-size` is presentational too.
- No utility classes, no compound-class soup.
- Tokens layer strictly: `--ceefax-*` = the authentic 8 broadcast colours (never remapped); `--cf-*` = semantic aliases (the **only** layer components reference).

## Commands

```sh
npm install
npm run storybook      # framework-agnostic Storybook (HTML mode) — every variant + live a11y checks
npm run build          # PostCSS → dist/index.css + dist/tokens.css
npm run build-storybook
```

Storybook (`@storybook/html-vite` + a11y + interactions addons) is the **living component documentation** — stories show the exact HTML contract and run WCAG checks. Add/update a story for any component or variant change.

## Where things are documented

- `README.md` — public consumer docs + the contract.
- `CONTEXT.md` — the glossary / ubiquitous language. Use its terms; don't drift to synonyms it marks `_Avoid_`.
- `docs/adr/` — Architecture Decision Records (why, not how). Flag output that contradicts an ADR.
- Storybook — live component behaviour and variants.
- `docs/agents/` — how agents consume the issue tracker, triage labels, and domain docs (see below).

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

## Agent skills

Engineering skills from [mattpocock/skills](https://github.com/mattpocock/skills) are installed under `.agents/skills/` (editable; tracked in `skills-lock.json`).

### Issue tracker

Work is tracked as **GitHub issues** on `peamlo/ceefax-ui` via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`), label string = role name. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
