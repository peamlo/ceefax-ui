---
name: demo
description: Update the demo pages with the showable features of a release, a commit range, or whatever the demos don't cover yet, and open one docs(demo) PR.
argument-hint: "[<release PR url|#N> | <ref> | audit]"
disable-model-invocation: true
---

# Demo

Keep the **demos** (the static pages in `demo/`, see `CONTEXT.md`) showing the library as it is now. Stories already test and document every variant; a demo shows the library in use, the way a consumer writes it.

Run it while a **release PR** is open and merge its PR first: the release tags `main` as it is when the release PR merges, and the release PR's branch can't carry the change (release-please rewrites it).

## Modes

Pick the mode from the argument:

- **Release PR** (`/demo #94`, or its URL): the range is the latest `v*` tag up to `origin/main`. Check the PR is open and titled `chore(release): …`; if not, say so and stop.
- **Ref** (`/demo v0.4.0`, a SHA, a branch): the range is that ref up to `origin/main`.
- **None** (`/demo`): the range is the latest `v*` tag up to `origin/main`.
- **Audit** (`/demo audit`): no range. The work list is every piece of public API that appears in no demo.

## Process

### 1. Build the work list

`git fetch` first; the range always ends at `origin/main`.

**Range modes.** Read every commit in the range, subject and body:

- `feat` touching components, layout, elements, theme or tokens → **showable**.
- Breaking change (`!` or a `BREAKING CHANGE:` footer) → **repair**: grep `demo/*.html` for each removed or renamed class, attribute or token and fix what you find. Not a showcase.
- Anything else (`fix`, `perf`, `refactor`, `docs`, `ci`, `chore`, `test`, `build`) → ignore.

A showable feat with no markup surface (a token-only change, like a new type scale) goes in the PR's "Not demoed" list instead of a new section.

**Audit mode.** The public API is everything `src/` exposes: every `.cf-*` class (parts included), every `data-*` attribute and each value its selectors match, every custom element name, and `data-theme="accessible"`. Tokens are out: `scripts/token-report.mjs` covers them. A piece is covered when it appears in the markup of some `demo/*.html`; the demo's own `<style>` doesn't count.

If the work list is empty, say so and stop. No branch, no PR.

### 2. Place each item

Add to the page where the feature fits: a new example section in `demo/index.html`, or a new state on `demo/screen.html` for anything about the Screen frame. Create a new page only for a feature that needs the whole viewport, and link it from `demo/index.html`.

Demos show the current library, not its history: never a page per release or per feature.

### 3. Write the markup

The contract applies (`AGENTS.md`). On top of it:

- HTML only. Never add images, `data:` URIs or any other binary, and never touch `docs/images/`: the live demo on Pages is the visual.
- Consume the library the real way: `../src/index.css` and plain markup, plus `../src/elements/index.js` for custom elements.
- The page's own `<style>` is demo chrome only (`--doc-*`). Nothing in it may style, fix or extend a library class.
- Match the existing example sections: in `demo/index.html` an example's markup lives once in its `<script type="text/plain">`, rendered both live and as code. Same voice too.

### 4. Check

- `npm run lint` (Prettier covers the HTML).
- Open every touched page in the browser and look at each new example, with and without the Accessible theme where the page has the switch. Fix anything broken before going on.

### 5. Open the PR

One branch from `origin/main`, one PR using `.github/PULL_REQUEST_TEMPLATE.md`, titled `docs(demo): show <features>`. `docs` keeps it out of the changelog and leaves the release PR's version alone.

In the body:

- the range (`v0.4.0..main`), and the release PR it's for, as a plain mention (`for #94`). Never comment on or edit the release PR: the mention backlinks it.
- one line per item: what it is and where it now lives.
- **Not demoed (no markup surface)**: the showable feats skipped in step 1, if any.
- **Repaired**: breaking-change fixes, if any.

Done when the PR is open, or you've said why there was nothing to do.
