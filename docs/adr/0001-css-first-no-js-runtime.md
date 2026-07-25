# ADR-0001: CSS-first, no JS component runtime

## Context

Mainstream component libraries and design systems have become heavy and complicated — a framework runtime, a build step, and a large dependency surface just to render a button. `ceefax-ui` exists as a reaction to that: by sticking to web standards and modern HTML/CSS features, we can ship an **accessible, lightweight, teletext-looking** design system that any consumer can use as plain `class="…"`.

## Decision

The library ships **design tokens + semantic CSS classes + self-hosted fonts, with no JS component runtime**. Components are consumed as semantic classes on native elements (see [the contract](../../README.md#the-contract-do-not-drift-from-this)); there is no framework binding, so it works identically in Astro, Svelte, or plain HTML. The immediate consumer is an Astro blog, but nothing in the core is Astro-specific.

The one exception is logic that genuinely cannot be expressed in CSS: it ships as a standard **Web Component** under the separate, opt-in `./elements` export (today just `<cf-loader>`), keeping the CSS core runtime-free.

## Consequences

- The core has zero framework lock-in and no runtime cost; consumers import one stylesheet.
- State and behaviour that CSS can express (focus, current page, disabled, variants) must be done in CSS — no reaching for JS.
- **Open / deferred:** we want richer, logic-bearing components in the future. Whether those ship as more opt-in Web Components (extending the `./elements` pattern) or some other mechanism is **not decided here** — it will get its own ADR when the first such component is actually needed. Until then, do not add a framework runtime to the core.
