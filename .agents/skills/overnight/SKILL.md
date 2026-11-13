---
name: overnight
description: Fan a batch of tickets out to AFK sessions — one per ticket, three at a time, each running /implement and ending in a PR or a question on the ticket.
argument-hint: "Ticket numbers to work overnight, e.g. 41 46 52"
disable-model-invocation: true
---

# Overnight

Fan a batch of tickets out to **AFK** sessions while the user sleeps. Each session works one ticket alone and ends in exactly one of two states: a PR ready for review, or a question on the ticket. The user reviews both in the morning.

You are the dispatcher: start the sessions in batches, report, end your turn. The work itself happens in the sessions.

At most **3** sessions run at once — more makes the Mac restart. Change the cap here if the machine changes.

The issue tracker and triage label vocabulary should have been provided to you — run `/setup-matt-pocock-skills` if not.

## Process

### 1. Filter the batch

Fetch each ticket. Drop any that is closed or carries the `needs-info`, `ready-for-human` or `wontfix` role, and note why. Every ticket passed in is either kept or dropped with a reason.

Check that `gh` can move cards on the tracker's project board (`gh auth status` lists the `project` scope). If it can't, tell the user to run `gh auth refresh -s project` and carry on — sessions report board moves they couldn't make.

### 2. Start the first batch

Queue the kept tickets in the order given. Start the first 3 — one fresh local session per ticket, in its own worktree, in `auto` permission mode, with:

- **Title**: `#<N> <ticket title>`, under 60 characters
- **Name** and **branch**: `issue-<N>`
- **Prompt**: [BRIEF.md](BRIEF.md) with `<N>` filled in, sent verbatim — it opens with `/implement` so that skill fires

A session can only start in a permission mode up to the dispatcher's own. If `auto` is refused, start the sessions anyway and tell the user to switch each one to auto, or rerun `/overnight` from an auto-mode session.

Report (step 4) and end your turn.

### 3. Start the next batch

The app wakes you only once every session you started has stopped. Stopped is not done — a session also stops while it waits on its own review agents or test runs. A ticket is done when its session's latest summary starts `PR READY:` or `NEEDS DECISION:`.

On each wake-up: if any ticket in the batch isn't done, end your turn and wait for the next wake-up. Don't message or nudge the sessions. Once all are done, start the next 3 from the queue the same way and end your turn. When the queue is empty, report the night.

### 4. Report

One line per ticket: the session link, `queued`, or why it was dropped. Remind the user that a locked Mac keeps working; a sleeping one doesn't — plugged in, lid open. With tickets queued, add that the app stops waking the dispatcher after many wake-ups in a row with no user message, so a long queue can stall; any ticket still `queued` in the morning never started.

When the queue is empty, one line per ticket: the PR link, or the question it's waiting on.
