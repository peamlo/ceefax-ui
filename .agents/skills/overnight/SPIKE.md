/prototype to answer spike ticket #<N>.

You are **AFK**: nobody answers questions or approves anything until morning. You end in exactly one of two states — **VERDICT POSTED** or **NEEDS DECISION**. Follow the Spikes section of `AGENTS.md`: no PR, nothing merges to `main`.

### 1. Sync

`git fetch origin && git rebase origin/main`.

### 2. Gate

Fetch the ticket with its comments. It passes the gate when it is unblocked (every blocker closed), its questions or acceptance criteria are concrete, and it still asks something worth answering (a later change hasn't already settled it).

A ticket that fails the gate is **HITL**. Post your open questions as one comment on the ticket, apply the `needs-info` role, and end your turn with a summary starting `NEEDS DECISION:`.

### 3. Answer it

Move the ticket's card to **In progress** (see the tracker config's project board section). Then work through `/prototype`, measuring everything the ticket asks for.

### 4. Post the verdict

Push the branch. Post one comment on the ticket: the verdict, the numbers, a link to the branch, and for a "no", the trigger to revisit. Don't close the ticket.

Move the card to **In review**. End your turn with a summary starting `VERDICT POSTED:`, the verdict in one line and the comment link. If a board move failed, say so in the summary.
