// Compressed size budgets per public entry point (issue #47, ADR-0015). Brotli,
// like the bytes a browser downloads. A JS entry counts the files it imports
// (relative static imports), so the barrel carries every element.
//
//   node scripts/size.mjs <pkgDir> [basePkgDir]   # Markdown report, with deltas
//
// `assert-package` checks the budgets against the installed tarball.
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { brotliCompressSync } from 'node:zlib';

// Bytes, brotli. Sized to the open roadmap (ADR-0015), so they catch accidents,
// not planned components. Raising one is a deliberate, one-line change.
export const BUDGETS = {
  './css': 5000,
  './tokens': 1200,
  './elements': 6500,
  './elements/cf-loader': 1000,
};

const brotli = (file) => brotliCompressSync(readFileSync(file)).length;

// The entry file plus every file it reaches through `import … from './x.js'`.
function reachable(file, seen = new Set()) {
  if (seen.has(file)) return seen;
  seen.add(file);
  if (file.endsWith('.js'))
    for (const [, spec] of readFileSync(file, 'utf8').matchAll(
      /^\s*(?:import|export)\b[^'"]*['"](\.{1,2}\/[^'"]+)['"]/gm,
    ))
      reachable(resolve(dirname(file), spec), seen);
  return seen;
}

// { './css': bytes, … } for every file entry `pkgDir`'s exports define. `.` is
// `./css` again; wildcards (`./fonts/*`) are third-party assets, out of scope.
export function measure(pkgDir) {
  const { exports } = JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf8'));
  const sizes = {};
  for (const [key, target] of Object.entries(exports))
    if (key !== '.' && typeof target === 'string' && !target.includes('*'))
      sizes[key] = [...reachable(join(pkgDir, target))].reduce((sum, f) => sum + brotli(f), 0);
  return sizes;
}

// Entries over budget, missing, or with no budget, as messages.
export function overBudget(sizes) {
  const keys = new Set([...Object.keys(BUDGETS), ...Object.keys(sizes)]);
  return [...keys].flatMap((key) => {
    const size = sizes[key];
    const limit = BUDGETS[key];
    if (size === undefined) return [`${key}: not in exports`];
    if (limit === undefined) return [`${key}: no budget in scripts/size.mjs`];
    return size > limit ? [`${key}: ${size} B > ${limit} B budget`] : [];
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [head, base] = process.argv.slice(2);
  const now = measure(head);
  const was = base ? measure(base) : {};
  const sign = (n) => `${n > 0 ? '+' : ''}${n} B`;
  const rows = [...new Set([...Object.keys(BUDGETS), ...Object.keys(now)])].map((key) => {
    const size = now[key];
    const limit = BUDGETS[key];
    const delta = size === undefined ? '—' : was[key] === undefined ? 'new' : sign(size - was[key]);
    const status =
      size === undefined ? '❌ missing' : limit === undefined ? '❌ no budget' : size > limit ? '❌ over' : '✅';
    return `| \`${key}\` | ${size ?? '—'} B | ${base ? `${delta} | ` : ''}${limit ?? '—'} B | ${status} |`;
  });
  console.log(
    [
      '<!-- size-report -->',
      '### Size (brotli)',
      '',
      `| Entry point | Size | ${base ? 'Δ vs base | ' : ''}Budget | |`,
      `| --- | --- | ${base ? '--- | ' : ''}--- | --- |`,
      ...rows,
      '',
      'Budgets live in `scripts/size.mjs` (ADR-0015).',
    ].join('\n'),
  );
}
