# ADR-0025: The library sits in cascade layers, so unlayered consumer CSS always wins

## Context

[ADR-0018](0018-foundations-are-tokens-and-semantic-html.md) promised that consumer CSS wins
without `!important` and kept that promise by wrapping selectors in `:where()`, for zero
specificity. By [#204](https://github.com/peamlo/ceefax-ui/issues/204) that meant 157 `:where(`
wrappers, a `selector-max-specificity` cap on `form.css`, and `cf-btn` and `cf-link` still
outweighing a consumer's element selector. Zero specificity also flattened the library's own
order: a layout default and a component's own rule tied, and only source order decided between
them.

## Decision

`src/index.css` declares the order once and imports every stylesheet into a layer:

```css
@layer ceefax.tokens, ceefax.base, ceefax.layout, ceefax.components;
```

A later layer wins over an earlier one: tokens, then base (resets and the variant and band seams),
then layout (the primitives and page shell, including their defaults for what sits inside them),
then components. Layout sits below components, so a component's own size beats a primitive's
default. Unlayered CSS beats every layer, so consumer CSS wins over any library selector. The
stylesheets don't name their layer; the `@import … layer(…)` lines do. The tokens-only entry
(`src/tokens/_index.css`, `dist/tokens.css`) uses the same `ceefax.tokens` layer.

`:where()` stays only where precedence is meant to come from order, not weight: the table's colour
ladder (row stripe < `data-variant` < `data-band` < `aria-current`) and the reveal's content
indent, so a component's own margin still wins inside a reveal. A rule that must hand a property
back to a lower layer uses `revert-layer` (the header row returns its padding to the Screen frame's
inset).

## Considered options

- **`:where()` on every selector** ([#205](https://github.com/peamlo/ceefax-ui/pull/205)): no new
  CSS feature, but every new selector has to remember the wrapper, and the library's own layout
  and components can't be ordered by anything but source order.
- **One flat `ceefax` layer**: enough to make consumer CSS win, but layout and components would
  still tie inside it.

## Consequences

- Supersedes ADR-0018's `:where()` mechanism; its decision on tokens, semantic HTML and `data-*`
  stands.
- The layer names are public. A consumer with layers of their own (Tailwind v4 declares
  `theme, base, components, utilities`) places the library by naming `ceefax` in their order, for
  example `@layer theme, base, ceefax, components, utilities;`. Layers are ordered by where they
  first appear, so without that line a consumer layer first seen before the library's import
  loses to it. Renaming or reordering the layers is a breaking change.
- `!important` reverses layer order: an important declaration in an earlier layer beats one in a
  later layer or in unlayered CSS. The library ships no `!important`, and must not, or a consumer
  can't override it.
- Cascade layers and `revert-layer` are Baseline 2022. A browser older than that drops the
  layered rules, which is the whole library.
