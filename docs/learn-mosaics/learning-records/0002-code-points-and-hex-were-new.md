# Code points and hex were new: teach the vocabulary before the formula

The first sum-to-code-point lesson lost Pedro at "The sextants are in sum order": it used code point, `U+`, hex
and offset without introducing them. Lesson 0002 (code points and hex) now sits between cells and the formula.

**Evidence**: "I am not getting lesson 2 from here 'The sextants are in sum order'" (2026-11-03).

**Implications**: Don't assume general Unicode or number-base knowledge. Introduce each new term with a concrete
example from the repo before using it in an explanation. For later lessons, `unicode-range`, `@font-face` and
font fallback will probably need the same groundwork.
