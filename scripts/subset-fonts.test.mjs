import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parse, runs } from './subset-fonts.mjs';

test('-other runs merge small gaps, never over a ranged code point the font lacks', () => {
  const cmap = parse('U+41, U+400, U+405, U+2710, U+2720, U+3000');
  const other = parse('U+400, U+405, U+2710, U+2720, U+3000');
  const ranged = parse('U+0-17F, U+2700-27BF');
  // 401–404 are missing but unranged: merged. 2711–271F are missing and ranged (a ✓ the
  // font lacks): split. 2721–2FFF is more than 1024 missing: split.
  assert.equal(runs(other, cmap, ranged), 'U+400-405, U+2710, U+2720, U+3000');
});
