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
2. **Where do assertions that need real input live?** CSS `:hover` and
   `:focus-visible` only respond to a _real_ pointer/keyboard; the synthetic
   in-page `userEvent` cannot produce them, so a `play()` cannot observe the
   button's inversion.

## Decision

**The story is the seam — assertions cross it, no parallel harness.** We run
`@storybook/test-runner` (Playwright, headless) over the built Storybook in CI.
Two mechanisms, one surface:

- **`play()` functions** carry everything in-page code can observe: ARIA/role/text,
  static computed styles (the `aria-current` caret), and pure logic
  (`parseCharGrid`). The `parseCharGrid` self-check runs in the browser rather than
  Node because importing `cf-canvas.js` registers a custom element (needs a DOM).
- **`.storybook/test-runner.js` `postVisit`** carries the assertions that need real
  browser input — button hover / `:focus-visible` inversion and disabled
  hover-suppression, driven through Playwright's real pointer/keyboard — plus the
  **axe** contrast/label/role pass. axe is gated to `Components/*`: the Foundations
  swatch pages deliberately render the raw palette (known contrast tradeoffs), so
  running axe over them would fail the build on non-contract stories. Every story it
  visits also gets **html-validate** over its rendered HTML (#127, rules in `.htmlvalidate.js`).

Assertions target the **highest seam** — rendered DOM and computed styles a consumer
would see — never a private `--_var` or an internal selector.

CI (`.github/workflows/storybook-tests.yml`) builds Storybook, serves it, and runs
the test-runner **scoped by file path to the contract stories** — issue #8's tested
modules (button, link, card, fastext, `<cf-canvas>`) plus the palette-drift guard.
Per [ADR-0002](0002-squash-only-conventional-pr-titles.md) this is a **hard** gate: the
`main protection` ruleset requires `test-storybook`, so a red run blocks merge.

The Foundations/Layout **documentation** stories are deliberately _not_ in the CI gate.
They are out of #8's scope (they assert no contract claim — they are visual token/layout
demos) and, more practically, they currently destabilise the test-runner: several hang
for ~60s with a "most likely because of a navigation" error and time out, reproducibly,
even at `--maxWorkers=1` and on the CI runner. The one exception is Foundations/Brand,
which carries a contract claim (`<cf-loader>` follows `--cf-fg`, #73) and runs cleanly, so
it is in the gate by path like the contract stories. Scoping by path (rather than a tag +
`--includeTags`, which reports every other story as "skipped") keeps the run and its
output limited to what it actually gates. Making the whole story catalogue runnable
under the test-runner is tracked separately; when fixed, the path filter is dropped and
the gate widens with no change to the stories.

## Consequences

- Documentation and verification are the **same artefact**: adding a story is where
  a new component's behavioural assertions go — no second place to maintain.
- The split is deliberate but surprising: **why is the button's inversion asserted in
  `test-runner.js` and not in `Button.stories.js`?** Because synthetic events can't
  trigger the CSS state; a `play()`-based hover test would fail on the enabled button
  and pass _vacuously_ on the disabled one. Real input has to come from Playwright.
- New deps: `@storybook/test-runner`, `axe-playwright`, `html-validate` (#127), and Playwright browsers in
  CI. Since Storybook 9 the `play()` helpers (`expect`, `within`) come from core
  (`storybook/test`), so `@storybook/test` is no longer a separate package. Storybook
  10 needs test-runner 0.26+, which still depends on `uuid@8` (a moderate advisory),
  so `package.json` overrides `uuid` to `^11.1.1`. Drop the override once
  test-runner stops pulling `uuid@8`.
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
