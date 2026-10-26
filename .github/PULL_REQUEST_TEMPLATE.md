<!--
ceefax-ui PR template. Keep sections; delete guidance comments and any block
that genuinely does not apply. The goal is a PR that a future agent (or human)
can understand without reading the diff first.
-->

## Summary

<!-- What does this change do, and why? One or two sentences. -->

## Changes

<!-- Bullet the notable changes. -->
-

## Contract impact

<!--
Does this touch the public contract? (See README "The contract" + CONTEXT.md.)
Tick all that apply, or write "None — internal only".
-->
- [ ] New or changed semantic class (`cf-*`)
- [ ] New or changed `data-*` presentational variant
- [ ] Token change (`--cf-base-*` authentic colours / `--cf-*` semantic aliases)
- [ ] State model change (`:focus-visible`, `[aria-current]`, `[aria-pressed]`, `disabled`)
- [ ] None — internal only

## Docs updated

<!-- The repo is self-documenting; keep it that way. Tick what you touched. -->
- [ ] ADR added/updated (`docs/adr/`)
- [ ] Glossary updated (`CONTEXT.md`)
- [ ] `AGENTS.md` / `README.md` updated
- [ ] Storybook story added/updated
- [ ] No docs needed (explain why): 

## Testing

<!-- How you verified this. -->
- [ ] `npm run build` passes (`dist/index.css` + `dist/tokens.css`)
- [ ] `npm run assert-package` passes (packaging, exports, fonts)
- [ ] `npm run storybook` — Storybook a11y checks pass for affected components
- [ ] Keyboard/focus behaviour verified (focus inversion, `▸` caret on `[aria-current]`)
- [ ] Reduced-motion respected where relevant (`<cf-loader>` blink, `:active` scale)

## Screenshots / Storybook

<!-- Before/after screenshots or a link to the relevant Storybook story. -->

## Related issues

<!-- e.g. Closes #123 -->
