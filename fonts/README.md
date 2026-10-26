# Fonts (self-hosted, SIL OFL 1.1)

Both faces are free for commercial use and self-hosting under the SIL Open Font License 1.1 (`OFL.txt`).

`src/tokens/typography.css` loads these (exact names):

- `vt323-v17-latin-regular.woff2`
- `space-mono-v15-latin-regular.woff2`
- `space-mono-v15-latin-700.woff2`

The npm package ships only these `.woff2` files and `OFL.txt` from this folder (the built
`dist/*.css` point here); the TTFs stay in the repo as the regeneration sources.

They are compressed from the TTFs here, so regenerate them if a TTF changes:

```sh
pip install fonttools brotli
fonttools ttLib.woff2 compress -o vt323-v17-latin-regular.woff2 VT323-Regular.ttf
fonttools ttLib.woff2 compress -o space-mono-v15-latin-regular.woff2 SpaceMono-Regular.ttf
fonttools ttLib.woff2 compress -o space-mono-v15-latin-700.woff2 SpaceMono-Bold.ttf
```
