// Token usage report (issue #52): every `--cf-*` token the token layer declares, with the
// files that read it through var(). A token nothing reads but a Foundations story shows is
// a warning (public-only is legitimate); one in neither fails, so a new token must be used
// or documented. A story "shows" a token when its source spells the name out ('cf-row' or
// '--cf-row'): a name built at runtime ('cf-space-' + n) is invisible here.
//
//   node scripts/token-report.mjs   # Markdown report on stdout, exit 1 on any error
import { globSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';

const TOKENS = 'src/tokens/*.css';
const CONSUMERS = ['src/**/*.css', 'src/elements/*.js', 'stories/**/*.js', 'demo/*.html'];
// The Foundations pages document tokens: their own styling (var(--cf-info) on a label) is not a use.
const FOUNDATIONS = 'stories/foundations/*.stories.js';

const VERDICTS = {
  ok: { icon: '✅' },
  warn: { icon: '⚠️', message: 'is only shown in a Foundations story', log: 'warning' },
  error: { icon: '❌', message: 'is neither consumed nor shown in a Foundations story', log: 'error' },
};

const spellsOut = (token, text) => new RegExp(`(?<![\\w-])${token.slice(2)}(?![\\w-])`).test(text);
const readsVar = (token, text) => new RegExp(`var\\(\\s*${token}(?![\\w-])`).test(text);

export function tokenReport(root) {
  const load = (patterns, exclude = []) =>
    globSync(patterns, { cwd: root, exclude })
      .sort()
      .map((file) => [file, readFileSync(resolve(root, file), 'utf8')]);
  const tokens = new Set();
  for (const [file, css] of load(TOKENS))
    postcss.parse(css, { from: file }).walkDecls(/^--cf-/, (decl) => tokens.add(decl.prop));
  const sources = load(CONSUMERS, [FOUNDATIONS]);
  const foundations = load(FOUNDATIONS);
  return [...tokens].map((token) => {
    const consumers = sources.filter(([, text]) => readsVar(token, text)).map(([file]) => file);
    const documented = foundations.some(([, text]) => spellsOut(token, text));
    return { token, consumers, documented, verdict: consumers.length ? 'ok' : documented ? 'warn' : 'error' };
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const report = tokenReport(resolve(dirname(fileURLToPath(import.meta.url)), '..'));
  const count = (v) => report.filter((r) => r.verdict === v).length;
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
          `| ${VERDICTS[r.verdict].icon} | \`${r.token}\` | ${r.documented ? 'yes' : 'no'} | ` +
          `${r.consumers.join(', ') || '—'} |`,
      ),
    ].join('\n'),
  );
  for (const r of report) {
    const { log, message } = VERDICTS[r.verdict];
    if (log) console.error(`${log}: ${r.token} ${message}`);
  }
  if (count('error')) process.exit(1);
}
