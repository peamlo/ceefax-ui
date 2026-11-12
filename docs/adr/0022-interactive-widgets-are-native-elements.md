# ADR-0022: Interactive widgets are native elements opened by invokers

## Context

ADR-0001 deferred how logic-bearing components ship. The first ones (a modal, a popover, a disclosure) all
have a native element in current browsers (`<dialog>`, the `popover` attribute, `<details>`), and invoker
commands (`command` / `commandfor`) open and close them with no script. Consumers who need widgets the
platform lacks (tabs, menus with arrow-key focus, comboboxes) reach for headless behaviour libraries such as
Radix, Melt/Bits, Reka or Zag.

## Decision

An interactive component is a native element opened by invoker commands, and the library ships no
JavaScript for it. Its CSS keys off native and ARIA state only (`[open]`, `:modal`, `:popover-open`,
`aria-expanded`, `aria-selected`), never a library's own attributes (`data-state`, `data-open`,
`data-highlighted`), so the same stylesheet paints the widget whether the browser or a headless library
drives it. Components position only the native top-layer elements the browser drives (a popover anchored to
its invoker, gated on the native attribute, as the open `cf-select` list is gated on `base-select`); on a
headless library's own element they set the look only and never fight its positioning. Opt-in Web
Components under `./elements` stay deferred until a widget has no native element and a consumer without a
framework needs it.

Each interactive component implements a [WAI-ARIA Authoring Practices (APG)](https://www.w3.org/WAI/ARIA/apg/patterns/)
pattern, named in its README section. Where a native element covers the pattern, the native element is the
implementation. The library styles the pattern's markup and its ARIA states; keyboard behaviour belongs to
the browser or to the consumer's behaviour layer. APG is the reference, not the standard: HTML, WAI-ARIA and
ARIA in HTML decide what markup is allowed, and WCAG 2.2 AA decides what must be achieved.

## Considered options

- **Depend on a headless library** (Radix, Zag…): rejected. It would tie the CSS to that library's own
  attributes and to its framework.
- **Ship our own behaviour for every widget**: rejected for now. The native elements already cover the
  first three widgets.

## Consequences

- No new runtime; ADR-0001 holds.
- Older browsers without invoker commands need a polyfill, which the consumer adds.
- A headless library's portal must sit inside `.cf-page` (or the theme must be on `<html>`), or portalled
  content loses the Screen frame and theme scopes. The README documents this for each widget that
  portals (the Dialog section, #167).
- A global `data-*` rule can collide with the attributes these libraries set on positioned content;
  [#168](https://github.com/peamlo/ceefax-ui/issues/168) scopes `data-align`.
- A widget the platform lacks (tabs, menu, combobox) gets the same treatment: APG markup styled through its
  ARIA states. APG's `aria-activedescendant` patterns can't be styled from ARIA alone (CSS can't follow an
  ID reference); that one is decided in its own spec.
