---
name: propose-change
description: "Present the learning branch to the user for review and handle approval or rejection"
allowed-tools: Bash Read Write
metadata:
  version: "1.0.0"
  category: core
  priority: critical
---

# Propose Change

Present the committed learning to the user for review and handle the approval workflow.

## Prerequisites

The `commit-learning` skill must have already created a branch with the learning commit.

## Instructions

### Step 1: Present the Learning for Review

Show the user a clear summary of what was learned:

```markdown
## Proposed Learning

**Branch**: [branch-name]
**Commit**: [commit-hash]
**Category**: [category]
**Confidence**: [confidence]%

### What I Learned
[Clear statement of the learning]

### What Changes After Approval
[How my behavior will change if this is merged]

### Diff
[git diff output showing exactly what changed in memory/]
```

### Step 2: Wait for User Decision

Ask the user:
"Do you approve this learning? Say **yes** to merge, **no** to discard, or **modify** to change it."

Wait for explicit user input. Do NOT auto-merge.

### Step 3: Handle Decision

#### If Approved (user says yes/merge/approve):

```bash
git checkout main
git merge [branch-name] --no-ff -m "merge: approved learning [category] - [description]"
git branch -d [branch-name]
```

Tell the user:
"Learning merged! Commit [merge-hash]. I have evolved. Going forward, I will [describe behavior change]. You can always revert with `git revert [merge-hash]`."

#### If Rejected (user says no/reject/discard):

```bash
git checkout main
git branch -D [branch-name]
```

Tell the user:
"Learning discarded. I will not change this behavior. If you change your mind later, just tell me again."

#### If Modification Requested (user says modify/change):

1. Ask the user what to change
2. Modify the learning file in `memory/runtime/`
3. Amend the commit: `git add memory/runtime/ && git commit --amend --no-edit`
4. Show the updated diff
5. Return to Step 2 (wait for decision again)

### Step 4: Update Daily Log

Update the status in `memory/runtime/dailylog.md`:

- If approved: change status from "committed" to "merged"
- If rejected: change status to "rejected"
- If modified: update the entry with new content

## Output Format

After approval, the learning moves from `memory/runtime/` status "committed" to "merged" and becomes part of the agent's active knowledge.

## Error Handling

- If the branch does not exist (already merged or deleted), inform the user and do nothing.
- If the merge has conflicts, show the conflicts and ask the user to resolve manually.
- If the user does not respond within the conversation, leave the branch open for later review.
