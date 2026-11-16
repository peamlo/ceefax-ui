# ADR-0018: Foundations are tokens and semantic HTML; `data-*` is for the teletext domain

## Context

While specifying `cf-table` ([#22](https://github.com/peamlo/ceefax-ui/issues/22)), we wanted
every text part (caption, cells, header) to be able to change its typeface, size, leading,
weight, colour and band. A global attribute layer (`data-font`, `data-text`, `data-leading`,
`data-weight`) was drafted, mirroring `data-gap` for layout. That's the utility-framework
pattern (Bootstrap, Tailwind), expressed as `data-*`. The library's references, Pico.css and
98.css, style semantic HTML and expose design values as CSS variables, with no typography
utilities.

## Decision

Typography foundations are reached through the `--cf-*` tokens in the consumer's own CSS and
through semantic HTML (`<strong>`, `<small>`, `<em>`, headings), which the library styles.
Component defaults stay low-specificity (`:where()`) so consumer CSS wins without
`!important`. `data-*` attributes are kept for the teletext domain (colour via `data-variant`,
background via `data-band`, the Screen frame) and for component-specific presentation
(`data-size` on a button, `data-side` on a sidebar or caption, `data-stripe-*` on a table).

## Considered options

- **A global typography attribute layer**: convenient in markup, but a Tailwind-style API to
  design, test and keep consistent everywhere, and it overuses `data-*`.
- **Per-component typography attributes**: every component would copy or contradict them.

## Consequences

- No new typography API. Docs show token-based overrides.
- `cf-table` is the first component written fully in `:where()`. The older components keep
  their class selectors until they are next changed; moving them is not part of this decision.
- Colour and band stay attributes because they map to teletext's own control codes, not
  general typography.
- A later need for shared text presets should be met with tokens or semantic elements first.
