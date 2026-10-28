// Asserts the hand-kept doc indexes are complete (issue #53): every
// docs/adr/NNNN-*.md is linked from docs/adr/README.md, in numeric order, and
// every dated docs/reviews/*.html|md is linked from docs/reviews/README.md.
// Link targets resolving is lychee's job; this only checks the lists.
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const errors = [];

function check(dir, pattern, ordered) {
  const files = readdirSync(resolve(root, dir)).filter((f) => pattern.test(f)).sort();
  const index = readFileSync(resolve(root, dir, 'README.md'), 'utf8');
  const linked = [...index.matchAll(/\]\((?:\.\/)?([^)#]+)/g)].map((m) => m[1]);
  for (const f of files) {
    if (!linked.includes(f)) errors.push(`${dir}/README.md: missing ${f}`);
  }
  const listed = linked.filter((f) => pattern.test(f));
  if (ordered && listed.join() !== [...listed].sort().join()) {
    errors.push(`${dir}/README.md: not in numeric order: ${listed.join(', ')}`);
  }
}

check('docs/adr', /^\d{4}-.+\.md$/, true);
check('docs/reviews', /^\d{4}-\d{2}-\d{2}-.+\.(html|md)$/, false);

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log('doc indexes OK');
