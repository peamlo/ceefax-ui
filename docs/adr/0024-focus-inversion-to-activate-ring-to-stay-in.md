# ADR-0024: Focus indicators: Inversion for controls you activate, a focus ring for controls you stay in

## Context

Two focus styles had grown up side by side. Buttons, links and fastext keys invert. Form controls draw an accent outline. Scroll regions fell back to the browser's ring. Nothing said which one a new component should use.

## Decision

A control you activate and leave (button, link, fastext key, a disclosure's summary) shows the Inversion on `:focus-visible`, the same as on hover. A control you stay in (text field, checkbox, radio, select, scroll region) shows the focus ring: a thin outline in the accent colour. No component invents a third indicator.

## Considered options

- **Focus ring everywhere**: one rule, and it survives forced colours unaided. But focus and hover would diverge, or hover would lose the Inversion, which is the library's signature teletext interaction. Bordered buttons and banded keys get a double border. And it rewrites every interactive component.
- **Inversion everywhere**: a field you are typing in becomes a solid block, a checkbox's mark nearly vanishes, and a scroll region's cells keep their own colours, so the region goes blank.

## Consequences

- The Inversion is colour only, so forced colours erases it. Its rules keep a transparent outline that the browser repaints as a ring there (#149).
- Both indicators change the whole control or surround it, which meets WCAG 2.4.13 Focus Appearance (AAA).
