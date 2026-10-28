// The token report's verdicts on a fixture tree (issue #52): a consumed token passes,
// an unconsumed one shown in a Foundations story warns, one in neither fails.
//   node --test scripts/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { tokenReport } from './token-report.mjs';

const fixture = (files) => {
  const root = mkdtempSync(join(tmpdir(), 'token-report-'));
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), text);
  }
  return root;
};

test('verdict per token: consumed → ok, documented only → warn, neither → error', () => {
  const root = fixture({
    'src/tokens/colors.css': ':root { --cf-used: red; --cf-shown: blue; --cf-orphan: green; --cf-orphan-2: 0 }',
    'src/components/x.css': '.cf-x { color: var(--cf-used); }',
    'stories/foundations/Colors.stories.js': "const NAMES = ['cf-shown', 'cf-orphan-2-not'];",
  });
  const verdicts = Object.fromEntries(tokenReport(root).map((r) => [r.token, r.verdict]));
  assert.deepEqual(verdicts, {
    '--cf-used': 'ok',
    '--cf-shown': 'warn',
    '--cf-orphan': 'error', // a longer name in a story or var() doesn't count
    '--cf-orphan-2': 'error',
  });
});

test('consumers: var() in the elements, stories and demo; theme redeclarations are not uses', () => {
  const root = fixture({
    'src/tokens/colors.css': ':root { --cf-a: 1; --cf-b: 2; --cf-c: 3; --cf-d: 4 } [data-theme] { --cf-d: 5 }',
    'src/elements/el.js': 'const css = `:host{color:var(--cf-a,#fff)}`;',
    'stories/Thing.stories.js': "el.style.color = 'var( --cf-b)';",
    'demo/index.html': '<p style="color:var(--cf-c)">',
  });
  const report = tokenReport(root);
  assert.deepEqual(
    report.map((r) => [r.token, r.consumers, r.verdict]),
    [
      ['--cf-a', ['src/elements/el.js'], 'ok'],
      ['--cf-b', ['stories/Thing.stories.js'], 'ok'],
      ['--cf-c', ['demo/index.html'], 'ok'],
      ['--cf-d', [], 'error'],
    ],
  );
});
