# Fonts (self-hosted)

`src/tokens/typography.css` loads these (exact names):

- `bedstead-3.261-regular.woff2`
- `bedstead-3.261-bold.woff2`
- `space-mono-v15-latin-regular.woff2`
- `space-mono-v15-latin-700.woff2`

The npm package ships only these `.woff2` files and `OFL.txt` from this folder (the built
`dist/*.css` point here). The Space Mono TTFs stay in the repo as its regeneration sources (the demo
loads them too); Bedstead is regenerated from its upstream release zip.

## Licences

Both faces are free for commercial use and self-hosting.

- **Bedstead** — the display face, in both weights so the Screen frame can also set body text in it. A recreation
  of the Mullard SAA5050 teletext character generator by Ben Harris.
  Source: <https://bjh21.me.uk/bedstead/>, version **3.261** (2026-02-07), `bedstead.otf` and
  `bedstead-bold.otf` from `bedstead-3.261.zip`.
  **Public domain**: the generator and every newly designed glyph are dedicated to the public
  domain by the author (CC0 1.0, the `COPYING` file in the release). The underlying SAA5050
  shapes are believed to be public domain in the UK: CDPA 1988 s.55 limits protection of an
  industrially produced typeface design to 25 years, which ran out around 2005. Typeface shapes
  are not copyrightable in the US. No notice is required; this note is the record.
- **Space Mono** — the body face. SIL Open Font License 1.1 (`OFL.txt`).

## Regenerating

The `.woff2` files are compressed from the OTFs in Bedstead's release zip and the Space Mono TTFs here:

```sh
pip install fonttools brotli
curl -fsSLO https://bjh21.me.uk/bedstead/bedstead-3.261.zip && unzip -q bedstead-3.261.zip
fonttools ttLib.woff2 compress -o bedstead-3.261-regular.woff2 bedstead-3.261/bedstead.otf
fonttools ttLib.woff2 compress -o bedstead-3.261-bold.woff2 bedstead-3.261/bedstead-bold.otf
rm -r bedstead-3.261 bedstead-3.261.zip
fonttools ttLib.woff2 compress -o space-mono-v15-latin-regular.woff2 SpaceMono-Regular.ttf
fonttools ttLib.woff2 compress -o space-mono-v15-latin-700.woff2 SpaceMono-Bold.ttf
```

To move to a newer Bedstead, change the version in the zip URL and file names above, rename the
`.woff2` files (and their `@font-face` URLs), and update the version here.
