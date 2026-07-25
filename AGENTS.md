# Repo conventions

Guidance for humans and AI agents working in this repository.

## Commit messages — Conventional Commits

Commit messages **must** follow [Conventional Commits](https://www.conventionalcommits.org/).
This is enforced automatically by commitlint on the git `commit-msg` hook
(`.husky/commit-msg`, config in `commitlint.config.js`), so a non-conforming
message will be rejected before the commit is created.

### Format

```
type(optional-scope): description

[optional body]

[optional footer(s)]
```

### Types

| Type | Use for |
|------|---------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation only |
| `style` | Formatting/whitespace, no code-behaviour change |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf` | Performance improvement |
| `test` | Adding or fixing tests |
| `build` | Build system or dependencies |
| `ci` | CI configuration |
| `chore` | Maintenance that doesn't fit above |
| `revert` | Reverts a previous commit |

### Rules

- Type is lowercase; subject is not empty and has **no trailing period**.
- Write the description in the **imperative mood** ("add", not "added"/"adds").
- Keep the subject line short (≤ ~72 chars); put detail in the body after a blank line.
- Breaking changes: append `!` after the type/scope (`feat!: …`) **or** add a
  `BREAKING CHANGE:` footer.

### Scopes

Scopes are optional and unrestricted. Suggested scopes for this project:
`storybook`, `tokens`, `components`, `fonts`, `build`.

### Examples

```
fix(storybook): scope PostCSS config to unblock the dev server
feat(storybook): document foundations and add Card story
docs: document commit convention in AGENTS.md
chore: add package-lock.json
```
