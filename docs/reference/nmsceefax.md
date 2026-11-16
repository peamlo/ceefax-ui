# NMS Ceefax — reference

External reference: <https://nmsceefax.co.uk/> (by Nathan Dane, Nathan Media Services)
([snapshot](http://web.archive.org/web/20261113004838/https://nmsceefax.co.uk/)).
A full, live re-creation of BBC Ceefax: news, sport, weather, TV listings and regional variants, generated
automatically from current feeds and broadcast as real teletext. Use it to see what a Ceefax index, section
and story page looks like with today's content, page by page, in a TV-style viewer with a remote.

This file is a **pointer + summary**, not a mirror: the content belongs to its authors.

## What's there

| Section                                            | What it is                                                                                                                                   | Useful for ceefax-ui                                                                              | Archive                                                                                |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| [Viewer](https://nmsceefax.co.uk/)                 | The live service in a browser viewer: on-screen remote, keyboard page entry, channel up/down. The header row turns green while a page loads. | Live Ceefax layouts (index 100, section headers, story pages, Fastext rows) with current content. | [snapshot](http://web.archive.org/web/20261113004838/https://nmsceefax.co.uk/)         |
| [Pages From Ceefax](https://nmsceefax.co.uk/live/) | The service as a "Pages From Ceefax" stream, as BBC2 ran it overnight.                                                                       | Carousel and page-cycling behaviour, in motion.                                                   | [snapshot](http://web.archive.org/web/20260912162729/https://nmsceefax.co.uk/live/)    |
| [History](https://nmsceefax.co.uk/history/)        | How the re-creation was built: wxTED, then the makenews / MakeCeefax / CIMS page generators, vbit2, Raspberry Pi inserters.                  | Background only.                                                                                  | [snapshot](http://web.archive.org/web/20260912211445/https://nmsceefax.co.uk/history/) |

## How it renders

The viewer is the same `teletext-viewer` as [zxnet's online viewer](zxnet-teletext.md) (NMS Ceefax is
also channel 2 there). It receives packets over a WebSocket and draws them on a `<canvas>` from a glyph
sheet (`teletext-resources/chardata.png`). So, like [Antena 3](antena3-teletexto.md), it is a **visual
reference only**: there is no cell-level markup to inspect. For the page source of a recreated service,
see the TTI archives linked from [zxnet](zxnet-teletext.md).
