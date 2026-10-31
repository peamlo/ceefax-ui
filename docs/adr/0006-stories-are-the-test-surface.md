# ADR-0006: The stories are the executable test surface

## Context

The library's real interface is [the contract](../../README.md#the-contract-do-not-drift-from-this):
one semantic class on the correct native element, state via native/ARIA
attributes, `data-*` only for presentational variants. Every behavioural claim
(focus/hover invert the colours, `[aria-current="page"]` shows the caret,
`disabled` suppresses the hover inversion, colour is never the sole cue, the
palette never drifts) lived only as prose and was checked by a human eyeballing
Storybook. The a11y + interactions addons ran in the Storybook UI but never in
CI, so refactors (the variant-seam collapse #7, the accessible theme #12) could
not be made with confidence. This is issue #8.

Two questions had genuine alternatives:

1. **What is the test surface?** A separate unit harness (jsdom + vitest) was an
   option, but the contract is _rendered-DOM / computed-CSS / ARIA_ behaviour — it
   needs a real browser, and jsdom does not do layout, `:focus-visible`, or axe
   contrast. The stories already build the exact contract markup.
2. **Where do assertions that need real input live?** CSS `:hover`,
   `:focus-visible`, media queries and `prefers-reduced-motion` only respond to
   _real_ input — a real pointer, keyboard, viewport or emulated media. The
   synthetic in-page `userEvent` cannot produce them.

## Decision

**The story is the seam — every assertion lives in its `play()`, no parallel
harness.** CI runs the stories through the Storybook Vitest addon
(`@storybook/addon-vitest`) in Vitest browser mode: Playwright, headless Chromium,
no built Storybook. One mechanism, one surface:

- **`play()` functions** carry every contract assertion: ARIA/role/text, computed
  styles, pure logic (`parseCharGrid`, which runs in the browser because importing
  `cf-canvas.js` registers a custom element), and the real-input contracts. Vitest
  browser mode drives a real pointer, keyboard, viewport and emulated media; the
  setup file (`.storybook/vitest.setup.js`) exposes them and `play()` reaches them
  through `stories/_real-input.js`, never by importing Vitest, so the same story
  still loads in the Storybook UI. The UI has no real input, so there a `play()`
  skips its real-input steps; under Vitest a missing API throws, so a skipped step
  can never pass.
- **axe** comes from addon-a11y's test integration: `a11y.test: 'error'` on the
  `Components/*` stories and the Layout/Page screen-frame story. The Foundations
  swatch pages deliberately render the raw palette (known contrast tradeoffs), so
  they keep the default `'todo'` and never fail the build. A real-input `play()`
  leaves nothing hovered, so axe audits the resting state.
- **Both themes:** `vitest.config.js` defines one Vitest project per theme. The
  `accessible` project sets an `axeTheme` global; an `afterEach` in
  `.storybook/preview.js` then switches `<html>` to `data-theme="accessible"` and
  enables AAA contrast (`color-contrast-enhanced`, #12) after `play()` and before
  the addon's axe pass (Storybook runs `afterEach` finalizers in reverse, so the
  preview's goes first; it throws if axe has already run). `play()` asserts under the
  authentic theme in both projects; a `play()` that checks an accessible-theme contract
  (the fastext hover inversion) sets the theme for that step and restores it.

Assertions target the **highest seam** — rendered DOM and computed styles a consumer
would see — never a private `--_var` or an internal selector.

The gate is the stories **tagged `contract`** — issue #8's tested modules (button,
link, card, fastext, `<cf-canvas>`), the later components, the palette-drift, variant,
token-layering, accessible-theme and scrollbar guards, the Layout/Page shell and
Foundations/Brand (`<cf-loader>` follows `--cf-fg`, #73). Two lists, both on the story files: the
`contract` tag says which stories run (the Vitest plugin ignores `test.include`, and
the other story files are reported as skipped), and `a11y.test: 'error'` says which of
them axe gates. Per [ADR-0002](0002-squash-only-conventional-pr-titles.md) this is a **hard** gate: the
`main protection` ruleset requires `test-storybook`, so a red run blocks merge.

The Foundations/Layout **documentation** stories stay out of the gate: they assert no
contract claim. Under the old `@storybook/test-runner` several also hung for ~60s with
a "navigation" error. Widening the gate is tracked separately; it is a tag, not a
change to the runner.

## Consequences

- Documentation and verification are the **same artefact**: a new component's
  behavioural assertions go in its story — one place, next to the markup.
- `play()` still runs in the Storybook UI's interactions panel for debugging; its
  real-input steps only run under Vitest (`npm run test-storybook`).
- This replaces the earlier split (#8): `@storybook/test-runner`
  over a built Storybook, with real input and axe in a `postVisit` hook keyed on story
  titles. Storybook 10 ended test-runner support, and the hook was a second place to
  maintain. Gone with it: `axe-playwright`, the Jest-era dependencies and the `uuid`
  override.
- Deps: `@storybook/addon-vitest`, `vitest`, `@vitest/browser`,
  `@vitest/browser-playwright`, and Playwright Chromium in CI. Since Storybook 9 the
  `play()` helpers (`expect`, `within`) come from core (`storybook/test`).
- **Exception — packaging:** `scripts/assert-package.mjs` (issue #45) drives
  Playwright outside the stories. It is not a parallel component harness: it
  tests the _installed tarball_ (exports resolve, elements register from a clean
  install), which no story can see. Component behaviour still belongs in stories.
- **Exception — dead code:** `scripts/token-report.mjs` (issue #52) reads the token
  layer and every stylesheet, story and demo page to list which `--cf-*` tokens are
  used or shown in a Foundations story. It checks the source tree, not rendered
  behaviour, so its verdicts are pinned by a `node:test` file beside it
  (`scripts/token-report.test.mjs`) and both run in the advisory `dead-code` CI job.
- Out of scope here, enabled by this: contrast under `[data-theme="accessible"]`
  (#12) reuses this surface; the Astro adapter (#9) proves its output against these
  same assertions rather than building a parallel one.
