# ADR-0019: Scrollbars are a page-shell look, styled through inherited private properties

## Context

Teletext had no scrollbar, but a web page needs one everywhere, and the OS bar breaks the
look. Browsers split on how much they let you style: `::-webkit-scrollbar-*` controls shape
in Chrome and Safari, while Firefox only takes `scrollbar-color`/`scrollbar-width` (two
colours plus a width keyword). Chrome ignores the webkit pseudo-elements whenever the
standard properties are set on the element.

## Decision

- The scrollbar is styled only inside the Page shell (`:where(.cf-page, .cf-page *)`). It's a
  look, not a frame constraint ([ADR-0014](0014-screen-frame-is-the-authentic-mode.md)), so it
  applies inside and outside the Screen frame alike.
- Variants are a presentational `data-scrollbar` attribute (`fastext`, `mosaic`, `thin`;
  **block** by default). Each variant sets inherited private `--_sb-*` properties that a
  single rule set reads, the same pattern as the variant seam
  ([ADR-0007](0007-variant-colour-seam.md)). Every variant sets every property a nested
  variant could show, so the nearest attribute wins with nothing leaking from an outer one,
  and an unknown value sets nothing, so the element keeps what it inherited.
- Standard properties are set only under `@supports not selector(::-webkit-scrollbar)`, so
  Chrome keeps the shaped bar and Firefox gets the variant's two flat colours.
- Sizes are in `em`, so the bar scales with the Screen frame: `0.75em` for block and mosaic,
  `1em` for fastext, `0.5em` for `thin` (Firefox's own thin width at the 16px body size).
  Chromium's native thin bar is 11px, too close to block's 12px to read as thin.
- Colours are existing semantic aliases. The exception is the fastext arrow glyph: an inline
  SVG that can't read custom properties, left at SVG's default black, which is the readable
  ink on the cyan button in every shipped theme.
- `Foundations/Scrollbar` asserts the `--_sb-*` properties: an explicit exception to
  [ADR-0006](0006-stories-are-the-test-surface.md)'s "never a private `--_var`", because
  browsers don't expose the computed style of `::-webkit-scrollbar-*` to JS.

## Considered options

- **Global styling** (`html`, `*`): too invasive for an imported library.
- **An opt-in attribute on each scroller:** too much markup, when `.cf-page` is already the
  hook.
- **Reusing `data-variant`:** reserved for colours plus `ghost`/`nav`.
- **New `--cf-scrollbar-*` tokens:** YAGNI, since overriding an alias already re-tints the
  bar. Either can be added later without a breaking change.
- **Standard properties everywhere:** no shape in any browser.
- **Webkit only:** Firefox would get the OS bar.

## Consequences

- Firefox shows two flat colours, no shape, no hover.
- A classic scrollbar takes width from its container. Inside the Screen frame that narrows
  the body by roughly one cell, which matters for the 40-cell grid (#74).
- A custom property resolves its `var()` where it is declared, so the aliases resolve on
  `.cf-page` or the `[data-scrollbar]` element and inherit as finished colours. An alias
  override or a `data-theme` recolours the bar only on one of those elements, not on a
  plain scroller inside them. Re-resolving on every scroller needs `@scope` proximity
  instead of inheritance; not done here.
- Fastext's step buttons are designed for vertical bars only; a horizontal fastext bar has
  none.
- Adding a variant costs one rule. Pinned by `Foundations/Scrollbar`;
  `Foundations/Token layering` and Stylelint cover the stylesheet.
