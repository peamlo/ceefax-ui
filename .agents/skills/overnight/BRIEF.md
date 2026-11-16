/implement ticket #<N>.

You are **AFK**: nobody answers questions or approves anything until morning. You end in exactly one of two states — **PR READY** or **NEEDS DECISION**.

### 1. Sync

`git fetch origin && git rebase origin/main`.

### 2. Gate

Fetch the ticket with its comments. It passes the gate when it is unblocked (every blocker closed), its acceptance criteria are concrete, and building it needs no design or API choice the ticket leaves open and no departure from an ADR or the contract in `AGENTS.md`.

A ticket that fails the gate is **HITL**. Post your open questions as one comment on the ticket, apply the `needs-info` role, and end your turn with a summary starting `NEEDS DECISION:`. The questions are the deliverable; the code waits for the answers.

### 3. Implement

Move the ticket's card to **In progress** (see the tracker config's project board section). Then work through `/implement`, acting on every finding `/code-review` raises.

### 4. Open the PR

Push the branch and open a PR against `main`:

- **Title**: a Conventional Commit — it becomes the squash commit
- **Body**: `.github/PULL_REQUEST_TEMPLATE.md` filled in, with `Closes #<N>`
- **Needs human review**: a section listing every judgement call you made and every check you couldn't run, when there are any

Move the card to **In review**. End your turn with a summary starting `PR READY:` and the PR link. If a board move failed, say so in the summary.
