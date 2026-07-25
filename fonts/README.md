# Fonts (self-hosted, SIL OFL 1.1)

Both faces are free for commercial use and self-hosting under the SIL Open Font License 1.1.

Place these two files here (exact names — they're referenced from `src/tokens/typography.css`):

- `vt323-v17-latin-regular.woff2`
- `space-mono-v15-latin-regular.woff2`
- `space-mono-v15-latin-700.woff2`

### Easiest way to get them
Use **google-webfonts-helper** (https://gwfh.mranftl.com/fonts):
1. Search "VT323" → charset **latin**, style **regular** → download → grab the `.woff2`, rename to `vt323-v17-latin-regular.woff2`.
2. Search "Space Mono" → charset **latin**, styles **regular + 700** → download → rename to the two `space-mono-*` names above.
3. Copy the site's OFL license text into `OFL.txt` next to the fonts.

Until the files are present, the CSS falls back to the `monospace` system font.
