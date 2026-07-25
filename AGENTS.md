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

## PRs

Every PR uses `.github/PULL_REQUEST_TEMPLATE.md`. Keep the repo self-documenting: if a change touches the contract, record it (ADR + `CONTEXT.md` + Storybook), and tick the template's "Docs updated" checklist.

## Agent skills

Engineering skills from [mattpocock/skills](https://github.com/mattpocock/skills) are installed under `.agents/skills/` (editable; tracked in `skills-lock.json`).

### Issue tracker

Work is tracked as **GitHub issues** on `peamlo/ceefax-ui` via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`), label string = role name. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
