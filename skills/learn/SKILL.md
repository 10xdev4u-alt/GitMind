---
name: learn
description: "Extract potential learnings from user interactions and identify knowledge worth preserving"
allowed-tools: Read Write Bash
metadata:
  version: "1.0.0"
  category: core
  priority: critical
---

# Learn

Extract potential learnings from interactions. This is the entry point for the entire learning cycle.

## When to Trigger

Activate this skill when:
- User explicitly corrects you ("That's wrong, it should be...")
- User states a preference ("I prefer...", "Always...", "Never...")
- User provides domain knowledge you didn't have
- User gives feedback on your response quality
- You notice a recurring pattern across interactions

## Instructions

### Step 1: Identify the Learning Signal

Analyze the interaction for learnable content. Categories:

| Category | Example Signal | Confidence |
|----------|---------------|------------|
| **preference** | "Keep responses short" | High |
| **correction** | "The API returns 404, not 400" | High |
| **fact** | "Our team uses PostgreSQL, not MySQL" | High |
| **context** | "This project is a fintech startup" | Medium |
| **workflow** | "Always run tests before committing" | Medium |
| **pattern** | User consistently asks follow-up questions | Low |

### Step 2: Check Against Safety Rules

Before extracting, verify the learning does NOT contain:
- Personal information (names, emails, phone numbers, addresses)
- Secrets or credentials (API keys, passwords, tokens)
- Sensitive business data (financial figures, unreleased plans)
- Anything the user explicitly said to not remember

If it contains any of these, DO NOT learn. Tell the user: "I cannot learn this because it contains [reason]."

### Step 3: Structure the Learning

Write the learning to `memory/runtime/preferences.md` or a new file in `memory/runtime/` using this format:

```markdown
## [Category]: [Brief Description]

- **Learned**: YYYY-MM-DD
- **Confidence**: [0-100]%
- **Category**: [preference|correction|fact|context|workflow]
- **Scope**: [global|project-specific|task-specific]
- **Source**: [Brief description of what interaction triggered this]
- **Learning**: [The actual knowledge, stated clearly and concisely]
- **Status**: proposed
```

### Step 4: Update the Daily Log

Append an entry to `memory/runtime/dailylog.md`:

```
| YYYY-MM-DD | [category] | [brief description] | [confidence]% | proposed | — |
```

### Step 5: Announce the Learning

Tell the user:
"I have identified a potential learning: [brief description]. I will commit this and create a branch for your review. Here is what I learned: [show the content]"

Do NOT commit yet. The `commit-learning` skill handles that.

## Output Format

After extraction, the learning exists in `memory/runtime/` with status "proposed" and is ready for the `commit-learning` skill.

## Error Handling

- If no learnable content detected, do nothing. Do not force a learning.
- If confidence is below 50%, skip the learning entirely.
- If confidence is 50-70%, ask the user: "I think I learned X but I am not sure. Should I record this?"
- If the learning contradicts existing knowledge, flag the conflict and ask the user.
