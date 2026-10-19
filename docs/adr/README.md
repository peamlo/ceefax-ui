# Architecture Decision Records

Each ADR records **one** decision that was hard to reverse, surprising without context, and the result of a real trade-off — the "why", not the "how". Keep them short (a paragraph is fine).

- Number sequentially: `0001-slug.md`, `0002-slug.md`, … (highest existing number + 1).
- Format: see `.agents/skills/domain-modeling/ADR-FORMAT.md`.
- New decisions are usually surfaced by `/grill-with-docs` (a `/grilling` session using `/domain-modeling`).

## Index

- [0001 — CSS-first, no JS component runtime](./0001-css-first-no-js-runtime.md)
- [0002 — Squash-only merges with Conventional-Commit PR titles](./0002-squash-only-conventional-pr-titles.md)
- [0004 — `<cf-canvas>` canvas pixel-art element and its char-grid source](./0004-cf-canvas-pixel-art.md)
- [0003 — Layout primitives: data-attribute config + intrinsic responsive grid](./0003-layout-primitives-data-attr-config.md)
- [0005 — `.claude/skills` is a symlink to `.agents/skills`](./0005-claude-skills-symlink-to-agents-skills.md)
- [0006 — The stories are the executable test surface](./0006-stories-are-the-test-surface.md)
- [0007 — One seam resolves a variant name to its colour](./0007-variant-colour-seam.md)
- [0008 — Authentic colours are `--cf-base-*`, and CI enforces the token layering](./0008-cf-base-token-tier.md)
- [0009 — The 4:3 screen frame is a `data-frame` variant of the page shell](./0009-screen-frame-data-attr.md)
