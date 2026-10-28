// Token usage report (issue #52): every `--cf-*` token the token layer declares, with the
// files that read it through var(). A token nothing reads but a Foundations story shows is
// a warning (public-only is legitimate); one in neither fails, so a new token must be used
// or documented.
//
//   node scripts/token-report.mjs   # Markdown report on stdout, exit 1 on any error
import { globSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';

const TOKENS = 'src/tokens/*.css';
const CONSUMERS = ['src/**/*.css', 'src/elements/*.js', 'stories/**/*.js', 'demo/*.html'];
const FOUNDATIONS = 'stories/foundations/*.stories.js';

// Foundations stories name tokens with or without the leading `--` ('cf-row', css('--cf-row')).
const named = (token, text) => new RegExp(`(?<![\\w-])${token.slice(2)}(?![\\w-])`).test(text);
const reads = (token, text) => new RegExp(`var\\(\\s*${token}(?![\\w-])`).test(text);

export function tokenReport(root) {
  const read = (patterns) =>
    globSync(patterns, { cwd: root })
      .sort()
      .map((file) => [file, readFileSync(resolve(root, file), 'utf8')]);
  const tokens = new Set();
  for (const [file, css] of read(TOKENS))
    postcss.parse(css, { from: file }).walkDecls(/^--cf-/, (decl) => tokens.add(decl.prop));
  const consumers = read(CONSUMERS);
  const foundations = read(FOUNDATIONS);
  return [...tokens].map((token) => {
    const users = consumers.filter(([, text]) => reads(token, text)).map(([file]) => file);
    const documented = foundations.some(([, text]) => named(token, text));
    return { token, consumers: users, documented, verdict: users.length ? 'ok' : documented ? 'warn' : 'error' };
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const report = tokenReport(resolve(dirname(fileURLToPath(import.meta.url)), '..'));
  const count = (v) => report.filter((r) => r.verdict === v).length;
  const icon = { ok: '✅', warn: '⚠️', error: '❌' };
  console.log(
    [
      '## Token usage',
      '',
      `${report.length} tokens · ${count('ok')} consumed · ${count('warn')} only in a Foundations story · ` +
        `${count('error')} neither consumed nor documented`,
      '',
      '| | Token | Foundations | Consumers |',
      '| - | - | - | - |',
      ...report.map(
        (r) =>
          `| ${icon[r.verdict]} | \`${r.token}\` | ${r.documented ? 'yes' : 'no'} | ${r.consumers.join(', ') || '—'} |`,
      ),
    ].join('\n'),
  );
  for (const r of report) {
    if (r.verdict === 'warn') console.error(`warning: ${r.token} is only shown in a Foundations story`);
    if (r.verdict === 'error') console.error(`error: ${r.token} is neither consumed nor shown in a Foundations story`);
  }
  if (count('error')) process.exit(1);
}
