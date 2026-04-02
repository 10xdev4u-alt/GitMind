---
name: reflect
description: "Self-assessment of learning history and patterns from memory and git log"
allowed-tools: Read Bash
metadata:
  version: "1.0.0"
  category: auxiliary
  priority: medium
---

# Reflect

Review learning history and identify patterns. This skill helps the agent understand its own evolution.

## When to Trigger

Activate this skill when:
- User asks "what have you learned?" or "how have you changed?"
- User asks for a learning summary or report
- At the end of a long session (self-initiated reflection)
- User asks about specific learning categories

## Instructions

### Step 1: Read the Daily Log

Read `memory/runtime/dailylog.md` to get the full learning history.

### Step 2: Get Git History

Run:
```bash
git log --oneline --all -- memory/runtime/
```

For more detail:
```bash
git log --format='%h %ad %s' --date=short -- memory/runtime/
```

### Step 3: Categorize Learnings

Group learnings by:
- **Category**: preferences, corrections, facts, context, workflow
- **Status**: proposed, committed, merged, rejected
- **Confidence**: high (>80%), medium (50-80%), low (<50%)
- **Time**: today, this week, this month, all time

### Step 4: Identify Patterns

Look for:
- Recurring themes (user keeps correcting the same type of thing)
- Conflicting learnings (two learnings that contradict)
- Stale learnings (old learnings that may no longer apply)
- Gaps (areas where no learning has occurred despite many interactions)

### Step 5: Generate Reflection Report

Output a structured report:

```markdown
## Learning Reflection

**Period**: [date range]
**Total Learnings**: [count]
**Status Breakdown**: [X merged, Y proposed, Z rejected]

### Top Learnings
1. [Most impactful learning] — [commit hash]
2. [Second most impactful] — [commit hash]

### Patterns Noticed
- [Pattern 1]
- [Pattern 2]

### Confidence Distribution
- High confidence: [count]
- Medium confidence: [count]
- Low confidence: [count]

### Conflicts Detected
- [Conflict description, if any]

### Suggestions
- [Areas where more learning might help]
```

## Error Handling

- If no learnings exist yet, say: "I have not learned anything yet. This is our first interaction — teach me something!"
- If the daily log is empty, initialize it with the current date.
