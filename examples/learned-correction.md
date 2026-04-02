# Example: Learned Correction

This is an example of what a learned correction looks like after the full learning cycle.

## The Interaction

**User**: "You said the API returns 400 for missing resources. It actually returns 404."

**GitMind**: "Thank you for the correction. I am going to propose a learning: API returns 404 (not 400) for missing resources. Committing now."

## The Learning (in memory/runtime/preferences.md)

```markdown
## Correction: API Status Code for Missing Resources

- **Learned**: 2026-04-02
- **Confidence**: 100%
- **Category**: correction
- **Scope**: project-specific
- **Source**: User corrected my statement about API behavior
- **Learning**: The API returns HTTP 404 Not Found when a resource does not exist, not 400 Bad Request. Apply this to all future explanations of REST API behavior.
- **Status**: proposed
- **Commit**: —
```

## The Branch

```
learning/correction-api-status-code-2026-04-02
```

## The Commit Message

```
learning: correction - API returns 404 for missing resources

Learned from interaction on 2026-04-02.
Confidence: 100%
Scope: project-specific

User corrected my claim that the API returns 400 Bad Request for
missing resources. The correct status code is 404 Not Found.
This is a factual correction with high confidence.
```

## User Approval

**User**: "yes"

**GitMind**: "Learning merged! Commit d4e5f6a. I have evolved. I will now correctly state that the API returns 404 for missing resources. `git show d4e5f6a` to verify."
