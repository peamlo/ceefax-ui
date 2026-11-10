# Separated row: add to 0x51, and always sum − 1

Two slips on separated code points, both fixed with feedback:

1. **Misconception:** Pedro carried lesson 2's "last two digits = offset" shortcut over and got U+1CE0B for sum 12.
   That shortcut only works when the row starts at `…00`; separated starts at U+1CE51, so the offset has to be
   added (81 + 11 = 92 = `0x5C`).
2. **Interleaving slip:** after the fix, Pedro used the contiguous ranges (48 − 3) on a separated sum. Separated
   is always sum − 1 (48 → 47 → 81 + 47 = 128 = `0x80`).

**Evidence**: separated sum 20 → 19 + 81 = 100 → `0x64` → U+1CE64 correct. Sum 48 → 45 + 81 = 126 → `0x7E`:
correct hex conversion, wrong subtraction (2026-11-03).

**Implications**: Pedro now converts hex ↔ decimal reliably, including adding through decimal. The weak point
is choosing which rule applies to which row. Next session, mix contiguous and separated questions (interleaving)
in the warm-up, including one carry case. Lesson 3 now has a contiguous/separated comparison table and a
sum-48 trap question whose wrong options match these two slips.
