# Splits a font into unicode-range subsets (ADR-0023), so a page downloads only the
# glyphs it shows: Latin text with the symbols UIs use, the mosaics, and everything else.
# The ranges must match the @font-face rules in src/tokens/typography.css.
#
#   pip install fonttools brotli
#   python3 scripts/subset-fonts.py <font> <out-prefix>
#
# Writes <out-prefix>-latin.woff2, -other.woff2 and, if the font has any, -mosaic.woff2,
# and prints the -other unicode-range to copy into the CSS.
import sys

from fontTools import subset
from fontTools.ttLib import TTFont

LATIN = '0-17F,2000-206F,20A0-20CF,2100-214F,2190-22FF,25A0-25FF,2700-27BF'
MOSAIC = '2580-259F,1FB00-1FB3B,1CE51-1CE8F,EE00-EE7F'

src, prefix = sys.argv[1:]
cmap = set(TTFont(src).getBestCmap())
ranged = set(subset.parse_unicodes(f'{LATIN},{MOSAIC}'))
latin, mosaic = (cmap & set(subset.parse_unicodes(r)) for r in (LATIN, MOSAIC))
other = cmap - latin - mosaic
for name, unicodes in (('latin', latin), ('mosaic', mosaic), ('other', other)):
    if not unicodes:
        continue
    font = TTFont(src, recalcTimestamp=False)
    subsetter = subset.Subsetter(subset.Options(layout_features=['*'], name_IDs=['*'], notdef_outline=True))
    subsetter.populate(unicodes=unicodes)
    subsetter.subset(font)
    font.flavor = 'woff2'
    font.save(f'{prefix}-{name}.woff2')

# -other's range: its code points, merged over gaps so the rule stays short. A character
# in the range that the font lacks downloads -other for nothing, so a gap is merged only
# if it holds no Latin or mosaic code point the font lacks (✓ in Space Mono, say) and at
# most 1024 the font lacks elsewhere.
ranges = []
for cp in sorted(other):
    gap = range(ranges[-1][1] + 1, cp) if ranges else ()
    missing = [c for c in gap if c not in cmap]
    if ranges and len(missing) <= 1024 and not ranged.intersection(missing):
        ranges[-1][1] = cp
    else:
        ranges.append([cp, cp])
print(f'{prefix}-other: unicode-range:', ', '.join(f'U+{a:X}' + (f'-{b:X}' if b > a else '') for a, b in ranges))
