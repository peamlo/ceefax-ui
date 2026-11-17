# ADR-0025: Repo scripts are TypeScript or shell

## Context

The scripts under `scripts/` hand data to each other and to CI: the size report's `{ entry: bytes }`, the token report's rows. That data's shape was written down only in comments, so nothing checked it. A font-subsetting script was also first written in Python (#175), which brought a second runtime into the toolchain.

## Decision

- Repo scripts are TypeScript, run directly by Node through type stripping (`node scripts/x.ts`), with no build step or loader. Thin glue can be POSIX shell, like the deploy smoke test.
- No Python or other runtime, unless TypeScript or shell can't do the job. The PR that adds one says why.
- `tsc` checks the types in `npm run lint`, with no emit, `strict`, `erasableSyntaxOnly` and the unused-code checks.
- ESLint doesn't lint the scripts, because `typescript-eslint` can't run on TypeScript 7.
- Tool config files (`*.config.js`) stay JavaScript, because the tools load them.

## Considered options

Spike #191 compared four:

- **Staying `.mjs`**: nothing checks the shapes the scripts share.
- **`.ts` with `typescript-eslint`**: pins TypeScript to 6.0 and adds about 8 MB and half a second of lint.
- **`.ts` without `typescript-eslint`** (chosen): `tsc`'s unused-code checks cover what ESLint caught.
- **JSDoc + `// @ts-check`**: checks the same things but reads worse, +22 lines on the size script against +4 for `.ts`.

## Consequences

- The data shapes the scripts share are checked where they are used.
- Only two devDependencies are added, `typescript` and `@types/node`. Type-checking adds about 0.15 s to lint.
- Scripts need Node ≥ 22.18, the first release where type stripping is on by default. CI pins 24.
- Revisit ESLint on the scripts once `typescript-eslint` supports TypeScript 7.
