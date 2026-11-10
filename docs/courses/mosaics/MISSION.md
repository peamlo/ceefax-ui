# Mission: How cf-mosaic's characters draw pictures

## Why

Pedro maintains ceefax-ui and ships `cf-mosaic`, but the character side is a black box: a string like
`🬝🬎🬎🬬 🬝🬎🬎🬬` draws a logo and it isn't clear how. The goal is to own the component: read a mosaic
string and know what it draws, review mosaic art in PRs, and change or debug the component with confidence.

## Success looks like

- Look at a mosaic character and say which of its six blocks are lit, and the reverse.
- Explain, end to end, why the Banner story's few characters render as the CF logo, the WEATHER title and
  the dotted rule: Unicode, the Bedstead font and the CSS in `src/components/mosaic.css`.
- Explain contiguous vs separated mosaics and the two colours a cell can have (`data-variant`, `data-band`).
- Hand-edit a small mosaic (fix a pixel in the logo) without any tool, and know when a hand edit is enough and when
  art should be generated (and later drawn in the planned live editor).

## Constraints

- Short lessons, grounded in this repo's real stories and code.
- Stored in the repo under `docs/courses/mosaics/`.

## Out of scope

- Broadcast teletext internals (packets, control characters, Level 2.5 enhancements), beyond what explains
  why the component looks the way it does.
- Font engineering (how Bedstead's outlines are generated).
