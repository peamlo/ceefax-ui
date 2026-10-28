# ADR-0016: Stylelint echoes the contract; the stories stay the gate

## Context

The contract's mechanical rules (only `cf-*` block and `__element` classes, no state-modifier classes, colours only through semantic aliases, `--cf-base-*` only in the token layer) were enforced by review and, for the base tier only, by the `Foundations/Token layering` guard story. Authors found out about drift from a reviewer or a failed storybook-tests run, minutes after pushing. There was no linter or formatter at all. Issue #48.

ADR-0008 rejected "a standalone lint script" for the base-tier rule because it would be a second test surface beside the stories (ADR-0006).

## Decision

**Add Stylelint, ESLint and Prettier as an earlier, faster echo of the contract, not a replacement for the stories.** Stylelint encodes the contract's mechanical rules for every stylesheet. ESLint covers the custom elements, stories and config. Prettier formats everything. All three run on staged files from the husky pre-commit hook and as one `lint` job in CI (`npm run lint`).

The `Foundations/Token layering` story stays the gate for the base tier (ADR-0006, ADR-0008). If the lint rule and the story ever disagree, the story wins and the lint rule is fixed.

## Considered options

- **Stories only (status quo)**: one surface, but feedback only arrives after a Storybook build, and nothing checks class names or raw colours.
- **Replace the guard story with the lint rule**: one surface again, but it moves a contract assertion out of the stories ADR-0006 makes the test surface.

## Consequences

- This partly reverses ADR-0008's "standalone lint script" option: the overlap is accepted because the lint rule is advisory to the story, not a peer.
- The shadow-DOM `<style>` blocks inside the elements' JS template strings, and the demo pages' inline `<style>`, are out of Stylelint's reach.
- Purely stylistic `stylelint-config-standard` rules that fight the source (grouped token blocks, authentic 6-digit hex, exact 1/64 fractions) are off. Formatting is Prettier's job.
- The one-time reformat landed as its own `style:` PR so `git blame` can skip its squash commit via `.git-blame-ignore-revs`.
