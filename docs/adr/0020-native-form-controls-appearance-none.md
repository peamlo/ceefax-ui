# ADR-0020: Form controls keep the native element and restyle it with `appearance: none`

## Context

Teletext had no form controls, so ceefax-ui has to invent their look. Many libraries hide the native `<input>` and draw a fake checkbox with a sibling `<span>`, or replace controls with custom elements. ADR-0001 rules out a JS runtime, and the contract says state comes from native attributes.

## Decision

Every form control is the real native element with one semantic class (`cf-input`, `cf-textarea`, `cf-select`, `cf-checkbox`, `cf-radio`). Its look comes from `appearance: none` plus our own drawing. Validation styling reads native state (`:user-invalid`) and `aria-invalid`. Checkboxes and radios are drawn shapes by default. The opt-in `data-variant="character"` draws them as `[X]` and `(*)` with generated content on the input itself.

## Considered options

- **Hidden input + drawn sibling**: works everywhere, but needs extra markup, and the visible thing isn't the focusable thing.
- **Native look with `accent-color`**: no drawing at all, but each operating system draws its own rounded shape, which breaks the teletext look.
- **Character glyphs as the default**: the most teletext-like. But generated content on an `<input>` isn't in any spec ([w3c/csswg-drafts#12876](https://github.com/w3c/csswg-drafts/issues/12876)), even though Chrome, Safari and Firefox all draw it today.

## Consequences

- Keyboard, form submission, `:indeterminate`, `:user-invalid` and screen readers behave exactly as the browser's own controls do.
- The character variant depends on unspecified behaviour. A story test fails if its glyph stops rendering. If a browser drops it, only opt-in users are affected.
- The open select list and similar parts the browser draws itself stay native. Their dark-page colours (`color-scheme`) are left to a later theme decision. The number spinners and the search clear button are hidden instead, like the select's arrow: the arrow keys still step a number.
