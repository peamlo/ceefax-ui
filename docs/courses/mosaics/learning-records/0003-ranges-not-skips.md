# Ranges, not skips: sum → code point clicked as three ranges

The "skip one place after 21, another after 42" explanation (and `cell()`'s `- (bits > 21) - (bits > 42)`)
didn't land. Reframed as three ranges, it did: sums 1–20 → sum − 1, 22–41 → sum − 2, 43–62 → sum − 3, with
21/42/63 outside the row.

**Evidence**: from the ranges table alone, Pedro worked sum 30 → 30 − 2 = 28 = 1 × 16 + 12 = `0x1C` and sum 50 →
50 − 3 = 47 = 2 × 16 + 15 = `0x2F`. Range, subtraction and hex conversion were all correct (2026-11-03). They
stopped at the offset, so the "last two digits of the code point" step from lesson 2 needs reinforcing.

**Implications**: Pedro takes in a rule more easily as a lookup table than as an algorithm with corrections, so
lead with tables and worked examples, and introduce the code's compact form afterwards. Lesson 3 and the
builder now use the ranges. Next session: one warm-up question that asks for the full code point (U+1FB…).
