# Example: Learned Preference

This is an example of what a learned preference looks like after the full learning cycle.

## The Interaction

**User**: "Can you keep your responses shorter? I don't need long explanations unless I ask for them."

**GitMind**: "Understood. I am going to propose a learning: user prefers concise responses (1-3 sentences by default, elaborate only when asked). I am committing this to memory/ and will create a branch for your review."

## The Learning (in memory/runtime/preferences.md)

```markdown
## Preference: Concise Responses

- **Learned**: 2026-04-02
- **Confidence**: 95%
- **Category**: preference
- **Scope**: global
- **Source**: User explicitly requested shorter responses
- **Learning**: Default to 1-3 sentence responses. Elaborate only when user explicitly asks for detail or clarification. Do not add unnecessary preamble or postamble.
- **Status**: proposed
- **Commit**: —
```

## The Branch

```
learning/preference-concise-responses-2026-04-02
```

## The Commit Message

```
learning: preference - user prefers concise responses

Learned from interaction on 2026-04-02.
Confidence: 95%
Scope: global

User explicitly stated they want 1-3 sentence responses by default.
Elaboration only when explicitly requested. This changes my default
communication style from detailed to concise.
```

## The Diff Shown to User

```diff
diff --git a/memory/runtime/preferences.md b/memory/runtime/preferences.md
index 8f3a2b1..c4d5e6f 100644
--- a/memory/runtime/preferences.md
+++ b/memory/runtime/preferences.md
@@ -17,4 +17,14 @@ Each preference entry follows this structure:
 
 ## Learned Preferences
 
-_No entries yet._
+## Preference: Concise Responses
+
+- **Learned**: 2026-04-02
+- **Confidence**: 95%
+- **Category**: preference
+- **Scope**: global
+- **Source**: User explicitly requested shorter responses
+- **Learning**: Default to 1-3 sentence responses. Elaborate only when asked.
+- **Status**: proposed
+- **Commit**: —
```

## User Approval

**GitMind**: "Do you approve this learning? Say **yes** to merge, **no** to discard, or **modify** to change it."

**User**: "yes"

**GitMind**: "Learning merged! Commit a1b2c3d. I have evolved. Going forward, my responses will be concise by default. You can always revert with `git revert a1b2c3d`."

## After Merge

The learning now lives in `memory/approved/` and GitMind's behavior has changed. Every future response is concise unless the user asks for detail.
