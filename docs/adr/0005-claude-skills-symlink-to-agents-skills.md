# ADR-0005: `.claude/skills` is a symlink to `.agents/skills`

## Context

The engineering skills from [mattpocock/skills](https://github.com/mattpocock/skills)
are installed under `.agents/skills/` and tracked in `skills-lock.json` — that
directory is the **managed source of truth** and is regenerated from the lockfile.
Claude Code, however, only auto-discovers skills from `.claude/skills/` (and
`~/.claude/skills/` or plugins), so with no `.claude/` directory none of the skills
were invocable as `/slash` commands. The skills also cross-reference each other by
bare name at runtime (e.g. `improve-codebase-architecture` → `/codebase-design`,
`grill-with-docs` → `/grilling` + `/domain-modeling`), so they must be exposed as a
set, not cherry-picked.

## Decision

`.claude/skills` is a single **relative symlink** to `../.agents/skills`, committed
to the repo. This exposes all skills to Claude Code with one source of truth:
`.agents/skills` stays canonical, and the symlink is a zero-drift view of it.

## Considered Options

- **Copy or a sync script into `.claude/skills`** — rejected: any copy goes stale
  the moment the mattpocock tool regenerates `.agents/skills` from the lockfile.
- **Per-skill symlinks** — same zero-drift property but 22 links to maintain; kept
  as the fallback if a loader won't follow a symlinked `skills` directory, or if a
  single skill (see below) ever needs to be excluded.
- **Expose a curated subset** — rejected: the skills reference siblings by name, so
  a partial set produces dangling references.

## Consequences

- Updates to `.agents/skills` are reflected in Claude Code immediately; nothing to
  re-sync.
- The convention is tool-layered: `.agents/skills` is the tool-agnostic source;
  `.claude/skills` is the Claude Code-specific view. Don't "de-duplicate" the two
  directories — deleting either breaks skill discovery.
- One name clash is accepted: `code-review` overlaps Claude Code's built-in
  `/code-review`. Tolerated for now; if it misbehaves, drop to per-skill symlinks
  and omit that one.
- Reversible: delete the symlink to unwire, or replace it with per-skill links.
