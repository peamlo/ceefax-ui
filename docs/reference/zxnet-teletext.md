# zxnet "Teletext Stuff" — reference

External reference: <https://zxnet.co.uk/teletext/> (by "ZXGuesser"),
plus its companion [Teletext Wiki](https://teletext.wiki.zxnet.co.uk/wiki/Main_Page).
Use it when you need ground truth on how broadcast teletext actually looked and behaved —
colours, mosaics, page layout, real Ceefax pages — before designing a component or token.

This file is a **pointer + summary**, not a mirror: the content belongs to its authors.
Each entry has an [Internet Archive](https://web.archive.org/) link so the reference
survives if the site goes away. Checked 2026-10-27; "—" means no snapshot existed then
(use `https://web.archive.org/web/*/<url>` to look again).

## Site sections

| Section | What it is | Useful for ceefax-ui | Archive |
|---|---|---|---|
| [Online teletext viewer](https://zxnet.co.uk/teletext/viewer/) | TV-style viewer with a remote: browse live recreated services (Ceefax, Teefax, ChunkyText…) page by page. | Seeing authentic pages, Fastext rows and page-number behaviour in motion. | [snapshot](http://web.archive.org/web/20261014000501/https://zxnet.co.uk/teletext/viewer/) |
| [Teletext editor](https://zxnet.co.uk/teletext/editor/) | Browser editor for Level 1 / 2.5 pages, incl. enhancement (X/26) data and CLUT editing. Built-in help screen lists the controls. | Building pixel-accurate mock pages, checking which attribute combos are legal, Level 2.5 palette. | — |
| [Teletext gallery](https://zxnet.co.uk/teletext/gallery/) | Collections of recovered and artist teletext pages. | Visual reference for layout, typography and mosaic art. | — |
| [Turner the Worm archive](https://zxnet.co.uk/teletext/turner-archive/) | Playable archive of the Teletext Ltd. strip cartoon, page by page, with reveal. | Mosaic-art and animation reference; `reveal` (concealed text) behaviour. | — |
| [Emulating teletext adapters](https://zxnet.co.uk/teletext/emulators/) | Guide to running VBIT2 as a packet server (ChunkyText, recreated Ceefax, Teefax, Spark) and feeding BBC Micro (BeebEm + ATS ROM) / ZX Spectrum (Fuse, TTX2000 S) emulators. | Running real services locally to compare our rendering against a decoder. | [snapshot](http://web.archive.org/web/20260409061105/https://zxnet.co.uk/teletext/emulators/) |
| [VHS teletext recovery](https://zxnet.co.uk/teletext/recovery/) | Notes on recovering teletext from VHS using `vhs-teletext` (VBI capture + pattern matching). | Provenance of the recovered pages in the gallery/viewer. Background only. | — |
| [The "Insertomatic 4000"](https://zxnet.co.uk/teletext/insertomatic/) | Hardware write-up: four Raspberry Pis running `raspi-teletext` into UHF modulators for Teletext Block Party. | Background only. | [snapshot](http://web.archive.org/web/20260217033418/https://zxnet.co.uk/teletext/insertomatic/) |
| [Index](https://zxnet.co.uk/teletext/) | Landing page linking the above. | — | [snapshot](http://web.archive.org/web/20260430141056/https://zxnet.co.uk/teletext/) |

## Teletext Wiki — pages worth knowing

| Page | Why | Archive |
|---|---|---|
| [Teletext specifications](https://teletext.wiki.zxnet.co.uk/wiki/Teletext_specifications) | Where to get the primary specs: 1976 Broadcast Teletext Specification (BBC/IBA/BREMA), World System Teletext (1990), EBU SPB 492, **ETS 300 706** (Enhanced Teletext — the current spec, free from etsi.org), ETR 287 code of practice. Cite these, not blogs, when a decision depends on spec behaviour. | — |
| [Teletext art](https://teletext.wiki.zxnet.co.uk/wiki/Teletext_art) | Canvas and page construction (40×25 cells, 2×3 mosaics, Level 2.5) plus a history of teletext art from the 1970s to ITAF. | — |
| [Ceefax](https://teletext.wiki.zxnet.co.uk/wiki/Ceefax) | The BBC service this design system is named after. | [snapshot](http://web.archive.org/web/20250530012203/https://teletext.wiki.zxnet.co.uk/wiki/Ceefax) |
| [Page function and coding](https://teletext.wiki.zxnet.co.uk/wiki/Page_function_and_coding) | How pages are typed and coded. | — |
| [Teletext packets](https://teletext.wiki.zxnet.co.uk/wiki/Teletext_packets) | Row/packet structure (header row 0, display rows 1–24, Fastext X/27, enhancements X/26). | [snapshot](http://web.archive.org/web/20240415021010/https://teletext.wiki.zxnet.co.uk/wiki/Teletext_packets) |
| [Edit.tf](https://teletext.wiki.zxnet.co.uk/wiki/Edit.tf), [Zxnet teletext editor](https://teletext.wiki.zxnet.co.uk/wiki/Zxnet_teletext_editor), [QTeletextMaker](https://teletext.wiki.zxnet.co.uk/wiki/QTeletextMaker), [wxTED](https://teletext.wiki.zxnet.co.uk/wiki/WxTED) | Page editors, if you need to author a reference page. | — |
| [TTI](https://teletext.wiki.zxnet.co.uk/wiki/MRG_TTI_format), [EP1](https://teletext.wiki.zxnet.co.uk/wiki/EP1_format), [TTA](https://teletext.wiki.zxnet.co.uk/wiki/TTA_format), [T42](https://teletext.wiki.zxnet.co.uk/wiki/T42_packet_stream) | Page/stream file formats you'll meet in archives. | — |
| [Main Page](https://teletext.wiki.zxnet.co.uk/wiki/Main_Page) | Full index. | [snapshot](http://web.archive.org/web/20250815190757/https://teletext.wiki.zxnet.co.uk/wiki/Main_Page) |

## Related projects named on the site

- [VBIT2](https://github.com/peterkvt80/VBIT2) — teletext inserter / packet server.
- [vhs-teletext](https://github.com/ali1234/vhs-teletext) — VHS recovery tools.
- [raspi-teletext](https://github.com/ali1234/raspi-teletext) — teletext out of a Raspberry Pi's composite port.
