// Packs the library as `npm publish` would, installs the tarball into a clean
// temp project, and asserts what a consumer gets (issue #45). Run after
// `npm run build` — the `package` job in .github/workflows/ci.yml does both.
//
//   npm run build && npm run assert-package
//
// Exits non-zero on the first failed check.
import { execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  realpathSync,
  statSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
// styleText drops the colour when stdout isn't a TTY or NO_COLOR is set.
import { styleText } from 'node:util';
import { chromium } from 'playwright';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const FONT_EXT = new Set(['.woff2', '.woff', '.ttf', '.otf']);

const npm = (args, cwd) =>
  execFileSync('npm', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });

const kB = (bytes) => `${(bytes / 1024).toFixed(1)} kB`;
let passed = 0;

function fail(name, detail) {
  console.error(`${styleText(['red', 'bold'], '✖')} ${name}`);
  console.error(styleText('dim', `  ${detail.replaceAll('\n', '\n  ')}`));
  process.exit(1);
}

function check(name, fn) {
  let note;
  try {
    note = fn();
  } catch (err) {
    fail(name, err?.message ?? String(err));
  }
  passed++;
  console.log(`${styleText('green', '✔')} ${name}${note ? styleText('dim', ` · ${note}`) : ''}`);
}

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
  );
}

const toPosix = (path) => path.split(sep).join('/');
// `./elements/cf-loader` -> `cf-loader`
const tagOf = (subpath) => subpath.split('/').pop();

// Flatten an `exports` value (string or nested conditions) to its target strings.
const targets = (value) =>
  typeof value === 'string' ? [value] : Object.values(value ?? {}).flatMap(targets);

// 1. Pack. --ignore-scripts: the build already ran, and lifecycle output would
//    corrupt the --json on stdout.
// realpath: macOS's tmpdir is a symlink, and require.resolve returns real paths.
const work = realpathSync(mkdtempSync(join(tmpdir(), 'ceefax-pack-')));
const [packed] = JSON.parse(
  npm(['pack', '--json', '--ignore-scripts', '--pack-destination', work], root),
);
const tarball = join(work, packed.filename);
console.log(
  `\n📦 ${styleText('bold', packed.filename)} ${styleText('dim', `· ${packed.files.length} files · ${kB(packed.size)} packed`)}\n`,
);
for (const f of packed.files) console.log(`  ${styleText('dim', kB(f.size).padStart(9))}  ${f.path}`);
console.log('');

// 2. Clean install into an empty consumer project.
const consumer = join(work, 'consumer');
mkdirSync(consumer);
npm(['init', '-y'], consumer);
npm(['install', '--ignore-scripts', '--no-audit', '--no-fund', tarball], consumer);
const pkgDir = join(consumer, 'node_modules', '@peamlo', 'ceefax-ui');
const pkg = JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf8'));
const files = walk(pkgDir).map((f) => toPosix(relative(pkgDir, f)));

// 3. Every `exports` target is in the tarball.
check('exports targets exist', () => {
  const missing = [];
  for (const [key, value] of Object.entries(pkg.exports)) {
    for (const target of targets(value)) {
      const path = target.replace(/^\.\//, '');
      if (path.includes('*')) {
        const [prefix, suffix] = path.split('*');
        if (!files.some((f) => f.startsWith(prefix) && f.endsWith(suffix)))
          missing.push(`${key} -> ${target} (matches nothing)`);
      } else if (!files.includes(path)) {
        missing.push(`${key} -> ${target}`);
      }
    }
  }
  if (missing.length) throw new Error(missing.join('\n'));
  return `${Object.keys(pkg.exports).length} entries`;
});

// 4. Importing the CSS entry points pulls in no JavaScript (#45, story 7).
check('CSS exports are pure CSS', () => {
  const problems = [];
  for (const [key, value] of Object.entries(pkg.exports)) {
    if (key.startsWith('./elements')) continue;
    // Wildcard targets (`./fonts/*`) are covered by the woff2-only check.
    for (const target of targets(value))
      if (!target.endsWith('.css') && !target.endsWith('*')) problems.push(`${key} -> ${target} (not .css)`);
  }
  for (const css of files.filter((f) => f.endsWith('.css'))) {
    const text = readFileSync(join(pkgDir, css), 'utf8');
    if (/@import[^;]*\.m?js\b/.test(text)) problems.push(`${css}: @import of a .js file`);
  }
  if (problems.length) throw new Error(problems.join('\n'));
});

// 5. Every font url() in the packed CSS resolves to a packed file.
check('font url()s resolve', () => {
  const broken = [];
  let count = 0;
  for (const css of files.filter((f) => f.startsWith('dist/') && f.endsWith('.css'))) {
    const text = readFileSync(join(pkgDir, css), 'utf8');
    for (const [, , ref] of text.matchAll(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g)) {
      if (/^(data:|https?:|\/\/|#)/.test(ref)) continue;
      count++;
      const target = join(dirname(join(pkgDir, css)), ref.split(/[?#]/)[0]);
      if (!target.startsWith(pkgDir + sep) || !existsSync(target))
        broken.push(`${css}: url(${ref})`);
    }
  }
  if (broken.length) throw new Error(broken.join('\n'));
  if (!count) throw new Error('no url() found in dist/*.css — did the build run?');
  return `${count} refs`;
});

// 6. Fonts ship once, woff2 only.
check('fonts ship once, woff2 only', () => {
  const fonts = files.filter((f) => FONT_EXT.has(extname(f)));
  const problems = fonts.filter((f) => extname(f) !== '.woff2').map((f) => `not woff2: ${f}`);
  const seen = new Map();
  for (const f of fonts) seen.set(basename(f), [...(seen.get(basename(f)) ?? []), f]);
  for (const [name, paths] of seen)
    if (paths.length > 1) problems.push(`duplicate ${name}: ${paths.join(', ')}`);
  if (problems.length) throw new Error(problems.join('\n'));
  return `${fonts.length} fonts`;
});

// 7. Bundlers must keep the CSS and the self-registering elements.
check('sideEffects keeps CSS and elements', () => {
  const { sideEffects } = pkg;
  const required = ['*.css', './src/elements/*.js'];
  if (!Array.isArray(sideEffects) || required.some((r) => !sideEffects.includes(r)))
    throw new Error(
      `expected an array including ${required.join(', ')}; got ${JSON.stringify(sideEffects)}`,
    );
});

// npm rejects a provenance publish unless repository.url names the repo that
// built it (#49) — and a --dry-run never reaches that check.
check('repository.url matches GitHub (provenance)', () => {
  const url = pkg.repository?.url ?? '';
  if (!/^(git\+)?https:\/\/github\.com\/peamlo\/ceefax-ui(\.git)?$/.test(url))
    throw new Error(`expected git+https://github.com/peamlo/ceefax-ui.git; got ${JSON.stringify(url)}`);
});

// 8. publint over the tarball consumers install, not a fresh pack of the repo.
check('publint', () => {
  try {
    npm(['exec', '--no', '--', 'publint', 'run', tarball, '--level', 'error'], root);
  } catch (err) {
    // publint reports on stdout, which npm() captures.
    throw new Error(err.stdout?.trim() || err.message);
  }
});

// 9. Each element subpath, resolved through `exports` from the consumer, imports
//    and registers its tag(s) in a real browser — no bundler, no framework.
const resolveFromConsumer = createRequire(join(consumer, 'package.json'));
const elementKeys = Object.keys(pkg.exports).filter((k) => k.startsWith('./elements'));
const granularTags = elementKeys.filter((k) => k !== './elements').map(tagOf);
const server = createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (path === '/') {
    res.writeHead(200, { 'content-type': 'text/html' }).end('<!doctype html><title>smoke</title>');
    return;
  }
  const file = join(consumer, path);
  if (!file.startsWith(consumer + sep) || !existsSync(file) || !statSync(file).isFile()) {
    res.writeHead(404).end();
    return;
  }
  const type = extname(file) === '.js' ? 'text/javascript' : 'application/octet-stream';
  res.writeHead(200, { 'content-type': type });
  res.end(readFileSync(file));
}).listen(0, '127.0.0.1');
await new Promise((r) => server.once('listening', r));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch().catch((err) => {
  server.close();
  fail('launch Chromium', `${String(err?.message ?? err).split('\n')[0]}\nrun \`npx playwright install chromium\``);
});

try {
  for (const key of elementKeys) {
    const specifier = `${pkg.name}${key.slice(1)}`;
    let url;
    check(`resolve ${specifier}`, () => {
      const file = resolveFromConsumer.resolve(specifier);
      url = `${origin}/${toPosix(relative(consumer, file))}`;
      return relative(pkgDir, file);
    });
    // A fresh page per subpath, so a granular import can't lean on the barrel.
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(`${origin}/`);
    const tags = key === './elements' ? granularTags : [tagOf(key)];
    const result = await page.evaluate(
      async ([src, tags]) => {
        try {
          await import(src);
        } catch (e) {
          return { error: String(e) };
        }
        return { missing: tags.filter((t) => !customElements.get(t)) };
      },
      [url, tags],
    );
    await page.close();
    check(`import ${specifier} registers ${tags.join(', ')}`, () => {
      if (result.error) throw new Error(result.error);
      if (errors.length) throw new Error(errors.join('\n'));
      if (result.missing.length) throw new Error(`not registered: ${result.missing.join(', ')}`);
    });
  }
} finally {
  await browser.close();
  server.close();
}

console.log(`\n${styleText(['green', 'bold'], `✨ ${pkg.name}@${pkg.version} is good to publish`)} ${styleText('dim', `· ${passed} checks passed`)}`);
