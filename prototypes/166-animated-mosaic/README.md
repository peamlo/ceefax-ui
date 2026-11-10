# PROTOTYPE, throwaway: animated mosaic strip (#166)

Never merge this branch. It is the primary source for the decisions in
[#166](https://github.com/peamlo/ceefax-ui/issues/166).

## Questions and answers

1. **Can a teletext-style frame animation be pure CSS?** Yes. All frames are written one under another in one
   mosaic text block (the strip). A window one frame tall clips it, and one shared `@keyframes`
   moves the strip with `steps(var(--frames))`, so no per-frame-count keyframes are needed. Checked in
   Chromium, Firefox and WebKit (Playwright) at 1× and 2× density. `strip.html` is built by `gen.mjs`
   and driven by `run.cjs`.
2. **Why a blank row after every frame?** Bedstead draws mosaic glyphs slightly above their row. Without a
   gap, the next frame's top edge shows as a thin line under the current one (`grid-a.png`, `crop-a.png`).
   With a blank row it's clean (`grid-as.png`, `crop-b.png`). Cutting the window 1px shorter
   (`crop-c.png`) also hid it in Chromium, but it trims every frame, and the right cut depends on size,
   density and engine. **Verdict: blank row.**

`mosaic-strip-blank-row.html` is the self-contained three-variant page (Bedstead and the crops are
inlined). Open it from disk and switch variants with ← →.

`gen.mjs` and `run.cjs` hard-code the absolute path of the worktree they ran in. Change `REPO` to rerun
them.
