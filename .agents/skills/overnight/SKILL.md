---
name: overnight
description: Fan a batch of tickets out to AFK sessions — one per ticket, each running /implement and ending in a PR or a question on the ticket.
argument-hint: "Ticket numbers to work overnight, e.g. 41 46 52"
disable-model-invocation: true
---

# Overnight

Fan a batch of tickets out to **AFK** sessions while the user sleeps. Each session works one ticket alone and ends in exactly one of two states: a PR ready for review, or a question on the ticket. The user reviews both in the morning.

You are the dispatcher: start the sessions, report, end your turn. The work itself happens in the sessions.

The issue tracker and triage label vocabulary should have been provided to you — run `/setup-matt-pocock-skills` if not.

## Process

### 1. Filter the batch

Fetch each ticket. Drop any that is closed or carries the `needs-info`, `ready-for-human` or `wontfix` role, and note why. Every ticket passed in is either kept or dropped with a reason.

Check that `gh` can move cards on the tracker's project board (`gh auth status` lists the `project` scope). If it can't, tell the user to run `gh auth refresh -s project` and carry on — sessions report board moves they couldn't make.

### 2. Start one session per ticket

For each kept ticket, start a fresh local session in its own worktree, in `auto` permission mode, with:

- **Title**: `#<N> <ticket title>`, under 60 characters
- **Name** and **branch**: `issue-<N>`
- **Prompt**: [BRIEF.md](BRIEF.md) with `<N>` filled in, sent verbatim — it opens with `/implement` so that skill fires

A session can only start in a permission mode up to the dispatcher's own. If `auto` is refused, start the sessions anyway and tell the user to switch each one to auto, or rerun `/overnight` from an auto-mode session.

Done when every kept ticket has a running session.

### 3. Report

One line per ticket: the session link, or why it was dropped. Remind the user that a locked Mac keeps working; a sleeping one doesn't — plugged in, lid open.
