---
name: commit-learning
description: "Commit extracted learnings to git with proper branching and descriptive messages"
allowed-tools: Bash Read Write
metadata:
  version: "1.0.0"
  category: core
  priority: critical
---

# Commit Learning

Take a proposed learning from `memory/runtime/` and commit it to git on a dedicated branch.

## Prerequisites

The `learn` skill must have already written the learning to `memory/runtime/` with status "proposed".

## Instructions

### Step 1: Create a Learning Branch

Create a new git branch with a descriptive name:

```bash
BRANCH_NAME="learning/[category]-[brief-slug]-$(date +%Y-%m-%d)"
git checkout -b "$BRANCH_NAME"
```

Examples:
- `learning/preference-concise-responses-2026-04-02`
- `learning/correction-api-status-code-2026-04-02`
- `learning/fact-team-database-choice-2026-04-02`

### Step 2: Stage the Learning Files

Add the modified/created files in `memory/runtime/`:

```bash
git add memory/runtime/
```

### Step 3: Verify No Sensitive Data

Before committing, check that no staged files contain:
- Strings matching patterns like `sk-`, `ghp_`, `AKIA` (API key prefixes)
- Email addresses (regex: `[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}`)
- Phone numbers
- Words like "password", "secret", "credential" in non-descriptive context

If sensitive data is found, remove it and re-stage.

### Step 4: Commit with Descriptive Message

```bash
git commit -m "learning: [category] - [brief description]

Learned from interaction on [date].
Confidence: [confidence]%
Scope: [scope]

[2-3 sentence explanation of what was learned and why it matters]"
```

Example:
```
git commit -m "learning: preference - user prefers concise responses

Learned from interaction on 2026-04-02.
Confidence: 95%
Scope: global

User explicitly stated they want 1-3 sentence responses by default.
Elaboration only when explicitly requested. This changes my default
communication style from detailed to concise."
```

### Step 5: Update the Daily Log

Update `memory/runtime/dailylog.md` with the commit hash:

```
| 2026-04-02 | preference | concise responses | 95% | committed | abc1234 |
```

### Step 6: Show the Diff to User

Run and display:
```bash
git diff main -- memory/runtime/
```

Tell the user:
"I have committed this learning on branch `[branch-name]` with commit `[hash]`. Here is the diff: [show diff]. You can review and approve by merging this branch, or tell me to revert if this is wrong."

## Error Handling

- If `git` commands fail, report the error to the user and do not proceed.
- If the commit would be empty (no changes), skip silently — the learning may already exist.
- If the branch already exists, append a timestamp: `learning/[category]-[slug]-[timestamp]`.
