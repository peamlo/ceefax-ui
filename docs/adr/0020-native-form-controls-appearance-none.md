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
- The open select list and similar parts the browser draws itself stay native (amended below for the select list). Their dark-page colours (`color-scheme`) are left to a later theme decision. The number spinner and the search clear button stay the browser's own parts too, but drawn: a thin ▲▼ and ✕ in the field's own colour, like the select's arrow (#139). Clicking them still steps the number or clears the field. Chrome and Safari only: Firefox has no hook for either, so it keeps its own spinner and shows no clear button.

## Amendment: the open select list ([#140](https://github.com/peamlo/ceefax-ui/issues/140))

Chrome's `appearance: base-select` lets CSS draw the open select list, so where it is supported the list takes the field's own look: its border, the page background and type, a ► on the chosen option and the inversion on the hovered or focused one. The closed select keeps its drawn ▼. Keyboard and screen readers stay the browser's. Other browsers, and forced colours, keep the native list.

Under base-select Chrome sizes the closed select to its chosen option, not its widest, so it would change width with the choice, and the list would be wider than the select whenever a longer option exists. So the select has a fixed default width in every browser, that of a default `cf-input`, and the list is exactly as wide as the select: a longer choice is cut short in the select and wraps in the list. A consumer sets an `inline-size` for another width. This follows CSS libraries (Bootstrap, GOV.UK: the layout sets the width) and JS ones (Radix, MUI: the list is at least as wide as the trigger).
