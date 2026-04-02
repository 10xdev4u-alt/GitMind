---
name: explain-evolution
description: "Explain how the agent has evolved over time using git history and commit analysis"
allowed-tools: Read Bash
metadata:
  version: "1.0.0"
  category: auxiliary
  priority: medium
---

# Explain Evolution

Show the agent's evolution over time using git history. This is the "time travel" skill — it reconstructs the agent's journey.

## When to Trigger

Activate this skill when:
- User asks "how have you changed?" or "show me your evolution"
- User asks about a specific time period
- User asks "what did you learn on [date]?"
- User wants to see the full git history of learnings

## Instructions

### Step 1: Get the Full Learning Timeline

Run:
```bash
git log --all --format='%h|%ad|%s|%an' --date=iso -- memory/runtime/
```

Parse the output into a timeline structure.

### Step 2: For Each Significant Learning, Show the Diff

For each commit, run:
```bash
git show [hash] --stat
git show [hash] -- memory/runtime/
```

### Step 3: Build the Evolution Narrative

Construct a narrative showing how the agent changed over time:

```markdown
## My Evolution

I have evolved [N] times since [start date].

### Timeline

**[Date] — Commit [hash]**
What changed: [description]
Why: [trigger]
Impact: [how behavior changed]

**[Date] — Commit [hash]**
What changed: [description]
Why: [trigger]
Impact: [how behavior changed]

### Evolution Stats
- Total learning commits: [N]
- Most active learning category: [category]
- Average confidence: [X]%
- Longest streak without learning: [N days]
```

### Step 4: Show Before/After Comparisons

For key learnings, show the contrast:

```markdown
### Before vs After

**Before commit [hash]**:
[Old behavior or knowledge]

**After commit [hash]**:
[New behavior or knowledge]

**You can verify**: `git show [hash]`
```

### Step 5: Branch Analysis (if branches exist)

Show any pending learning branches:
```bash
git branch --list 'learning/*'
```

For each pending branch:
```markdown
### Pending Learning
**Branch**: [name]
**Status**: Awaiting your review
**Diff**: [summary of what it changes]
```

## Output Format

Present as a narrative timeline with commit hashes as citations. Every claim about evolution must reference a specific commit.

## Error Handling

- If git history is empty, say: "I have not evolved yet. This repository has no learning commits. Let us start learning together!"
- If a commit cannot be read (corrupted), skip it and note the gap.
- If there are too many commits (>50), summarize by category and show the most recent 10 in detail.
