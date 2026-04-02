# 🧠 GitMind — The Self-Evolving Agent

> An AI agent that learns from interactions, commits knowledge to git, and evolves through the same collaboration workflow developers use for code.

## ⚡ Quick Start (3 Commands)

```bash
git clone https://github.com/princetheprogrammerbtw/gitmind.git
cd gitmind && npm install
node index.js
```

## 🤯 What Makes GitMind Different

| Traditional AI Agent | GitMind |
|---------------------|---------|
| Learns in a black box | Every learning is a git commit |
| No audit trail | Full git history of evolution |
| Can't undo learning | `git revert` any learning |
| Solo improvement | Branch-based collaborative review |
| Trust me, I learned | Here's the diff of what I learned |

## 🔄 The Learning Cycle

```
User Interaction
      │
      ▼
┌─────────────┐     ┌──────────────────┐     ┌────────────────┐
│    LEARN    │────▶│ COMMIT-LEARNING  │────▶│ PROPOSE-CHANGE │
│             │     │                  │     │                │
│ Extract     │     │ Create branch    │     │ Show diff      │
│ learning    │     │ Write to memory/ │     │ Ask for review │
│ from chat   │     │ Git commit       │     │ Merge on OK    │
└─────────────┘     └──────────────────┘     └────────────────┘
                                                      │
                                                      ▼
                                            ┌────────────────┐
                                            │    REFLECT     │
                                            │                │
                                            │ "What did I    │
                                            │  learn today?" │
                                            └────────────────┘
                                                      │
                                                      ▼
                                            ┌────────────────┐
                                            │ EXPLAIN-       │
                                            │ EVOLUTION      │
                                            │                │
                                            │ "How have I    │
                                            │  changed?"     │
                                            │  via git log   │
                                            └────────────────┘
```

## 💬 Example Interaction

```
You: Explain what Docker is.

GitMind: Docker is a platform for containerizing applications.
It packages code with dependencies into portable containers...
[detailed verbose response]

You: Too wordy. Give me short answers with bullet points.

GitMind: 📝 I've identified a learning opportunity.

PROPOSED LEARNING:
┌──────────────────────────────────────────┐
│ Category: user-preference                │
│ Learning: User prefers bullet points     │
│          over paragraph explanations     │
│ Confidence: 95%                          │
│ Branch: learning/pref-bullet-points      │
└──────────────────────────────────────────┘

Here's the diff:

--- a/memory/runtime/preferences.md
+++ b/memory/runtime/preferences.md
@@ -1,3 +1,8 @@
 # User Preferences
+
+## Response Format
+- **Learned**: 2026-04-03
+- **Preference**: Bullet points over paragraphs
+- **Confidence**: 95%
+- **Source**: Direct user feedback

Do you approve this learning? (y/n): y

GitMind: ✅ Learning merged! (commit: a1b2c3d)
I'll use bullet points from now on.

You: Explain Kubernetes.

GitMind: • Container orchestration platform
• Automates deployment and scaling
• Key parts: Pods, Services, Deployments
• Self-heals failed containers
• Uses YAML manifests for config

_(Response shaped by learning a1b2c3d)_
```

## 📊 Architecture

GitMind treats git as a **learning infrastructure**, not just storage:

| Git Feature | GitMind Usage |
|-------------|---------------|
| Commits | Each learning = one atomic commit |
| Branches | Safe experimentation with new knowledge |
| Diffs | See exactly what the agent learned |
| Merge | Human approves learning |
| Revert | Undo a bad learning |
| Log | Full audit trail of agent evolution |

## 🛠 Built With

- [gitagent](https://github.com/open-gitagent/gitagent) — Agent standard
- [gitclaw](https://github.com/open-gitagent/gitclaw) — Agent runtime
- [simple-git](https://github.com/steveukx/git-js) — Git operations
- Git — The learning mechanism itself

## 📁 Structure

```
gitmind/
├── agent.yaml           # Manifest
├── SOUL.md              # Identity
├── RULES.md             # Learning governance
├── index.js             # Interactive runtime
├── demo.js              # Automated demo script
│
├── skills/
│   ├── learn/SKILL.md           # Extract learning from interactions
│   ├── commit-learning/SKILL.md # Commit to git on branch
│   ├── propose-change/SKILL.md  # Present for review
│   ├── reflect/SKILL.md         # Self-assessment
│   └── explain-evolution/SKILL.md # Git history narration
│
├── tools/
│   └── git-ops.yaml     # Git tool schema
│
├── memory/
│   ├── runtime/         # Active learning state
│   └── approved/        # Merged learnings
│
└── examples/            # Demo examples for judges
```

## 🏆 Built for GitAgent Hackathon 2026

Solo submission. Deadline: April 3, 2026.

## License

MIT
