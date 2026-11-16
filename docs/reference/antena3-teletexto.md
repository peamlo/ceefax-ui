# Antena 3 Teletexto — reference

External reference: <https://www.antena3.com/teletexto/home.htm>
([snapshot](https://web.archive.org/web/20260912032406/https://www.antena3.com/teletexto/home.htm)).
The web mirror of Teletexto Atresmedia, a Spanish teletext service that is still on air.
Use it to see a live, non-BBC service: current page layouts, colour-banded index pages and
subpage carousels, as broadcast today.

This file is a **pointer + summary**, not a mirror: the content belongs to Antena 3 Televisión.

## What's there

| Thing                         | What it is                                                                                                                                                                | Useful for ceefax-ui                                                             |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Index page 100                | Section bands (Noticias 101, Deportes 200, Servicios 300, Ocio 160, Programación 800, Subtitulados 879), each a coloured header row over dot-leader `Title....NNN` lines. | Index/menu layout and the dot-leader page-number pattern.                        |
| Fastext row                   | Coloured links across the bottom (El tiempo, Sorteos, Programación, Marcador).                                                                                            | Real-world Fastext labels and colours.                                           |
| Subpage carousel              | Each page is a frame (`100/100_0001.htm`) cycling PNG subpages on per-subpage delays (4–5 s), with a `Subpáginas` numbered picker.                                        | Carousel/subpage timing and how a subpage index is presented.                    |
| "Ir a pág." box + section nav | Web chrome around the page: jump-to-page input and a left menu (Noticias, Bolsa, Deportes, Loterías, El tiempo, DGT…).                                                    | How a web wrapper adds page-number entry; not part of the broadcast page itself. |

Pages are rendered as **PNG images** (exported by "FAB NC HTML Export"), with the page text in
`alt`. So it is a visual reference only: there's no cell-level markup to inspect.
