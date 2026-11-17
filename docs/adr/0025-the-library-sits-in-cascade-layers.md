# ADR-0025: The library sits in cascade layers, not in `:where()`

## Context

[ADR-0018](0018-foundations-are-tokens-and-semantic-html.md) kept component defaults
overridable by wrapping every selector in `:where()`, so they had zero specificity. That needed
discipline in every rule (a lint cap on `form.css`), left `cf-btn` and `cf-link` on plain
classes until they were next changed (#204), and only approximated the order the library
wanted: layout defaults below a component's own rules. `:where()` is meant for single
selectors that should be easy to beat. `@layer` is meant for ordering whole stylesheets, which
is what a library's defaults against its consumer's CSS are. Both routes were built and
compared (#205 for `:where()`, #207 for layers).

## Decision

The whole library sits in cascade layers, declared once in `src/index.css`:
`@layer ceefax.tokens, ceefax.base, ceefax.layout, ceefax.components;`, with each stylesheet
imported into its layer. Any CSS a consumer writes outside a layer beats every library rule,
whatever its specificity, with no `!important`. Inside the library, rules use ordinary
selectors. `:where()` stays only where a rule must lose to a component on purpose (the table's
colour ladder, a reveal's content indent), and its comment says so.

## Considered options

- **`:where()` on every selector** (#205): works in older browsers and keeps rule order the only
  tie-breaker, but every selector carries the wrapper, and layout-below-components is a
  convention, not a guarantee.
- **Plain class selectors**: the state before ADR-0018. Consumers had to out-specify the
  library to override it.

## Consequences

- Supersedes ADR-0018's "component defaults stay low-specificity (`:where()`)". The rest of
  ADR-0018 (tokens and semantic HTML, `data-*` for the teletext domain) stands.
- A consumer who uses their own layers, or Tailwind v4, chooses where `ceefax` sits in their
  order (e.g. `@layer theme, base, ceefax, components, utilities;`). Their layered CSS beats the
  library only if its layer comes later.
- `!important` reverses layer order: a library `!important` would beat a consumer's. The
  library ships none.
- `dist/index.css` keeps the layers; it needs browsers with cascade layers (all major ones since 2022).
- The classless spike (#26) pairs each class with its element inside `.cf-root` in the same
  rule (`.cf-btn, .cf-root button`): the layers keep both forms below consumer CSS, so the
  bare form needs no wrapper of its own.
