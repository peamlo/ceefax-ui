# Notes

- Started 2026-11-03 from the Banner story: "how can so few characters render this?"
- Ground every lesson in this repo's stories (Banner, Picture, Rule, Bar chart) and code.
- Words follow the Storybook Mosaic docs: **cell** (one character), **block** (one of its six
  pixels), **sum** (the cell's value, 1–63), **contiguous** / **separated**, **ink** (`data-variant`) and
  **band** (`data-band`). No GLOSSARY.md until Pedro can use them back.
- Show it, don't tabulate it: colour and shape decisions need a rendered visual.
- Lessons need http (`npm run demo`, then `/docs/learn-mosaics/lessons/…`): from disk the font and scripts don't load.
  The app keeps stopping its own preview server, so run `npx --yes serve . -l 3000` in a terminal tab of Pedro's.
- **Styling (2026-11-03, replaces the earlier paper-page decision):** "B2" from `prototype-ceefax-styles.html`.
  Every page loads `src/index.css` then `assets/course.css` and sits in the `cf-page` shell (header row
  `P40n MOSAICS`, `main.cf-page__body > .cf-center`, fastext footer). Teletext black background, off-white text
  (`--cf-fg: #dfe3e8`), relaxed leading, Space Mono prose, Bedstead `h1` in the accent colour, `h2` as a cyan band.
  Widgets use cf-btn / cf-input / cf-checkbox. The teletext palette is the default; kit.js adds an "Accessible
  palette" on/off switch (`data-theme` on `<html>`, remembered in localStorage). Pedro rejected a charcoal
  background and, earlier, a harsher library-only page; keep text off-white and avoid new bright boxes.

## Roadmap (draft, re-plan after each lesson)

1. Six pixels in one character: cell, blocks, sum. (0001)
2. Code points and hex: a character is a number, hex digits, start + offset. (0002, added after Pedro got lost in the sum-to-code-point lesson)
3. From sum to code point: the formula and the three skipped cells (▌ ▐ █). (0003)
4. Why the cells tile: Bedstead fills the cell; `white-space: pre`, `line-height: 1`, `letter-spacing: 0`. (0004: CSS lab + spot-the-missing-line quiz)
5. Read the Banner end to end: the logo is cut-out blocks, the title is 3-row lettering, the rule is sum 12. (0005: CF → CE hand edit, HTML/JS code point escapes)
6. Separated mosaics and `data-mosaic="separated"`. (0006: gap geometry measured, attribute is a label, convert ▌▐██)
7. Two colours per cell: ink and band, colour runs, forced colours. (0007, last core lesson; font loading folded in as its closing section. Demos load the real mosaic.css + tokens.)
8. ~~Font loading~~ folded into 0007. Course complete against MISSION.md; next is spaced review or real PR reviews.
