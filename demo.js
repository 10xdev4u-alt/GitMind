import { query, tool } from "gitclaw";
import simpleGit from "simple-git";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const git = simpleGit(__dirname);

// ── Ensure memory is clean for demo ─────────────────────
const prefsPath = join(__dirname, "memory", "runtime", "preferences.md");
const logPath = join(__dirname, "memory", "runtime", "dailylog.md");

// Reset memory for fresh demo
const freshPrefs = `# User Preferences

_No preferences learned yet. This file will be updated as I learn from our interactions._

## Format

Each preference entry follows this structure:

\`\`\`markdown
## [Category]: [Brief Description]

- **Learned**: [date]
- **Confidence**: [0-100]%
- **Category**: [preference|correction|fact|context|workflow]
- **Scope**: [global|project-specific|task-specific]
- **Source**: [interaction that triggered this]
- **Learning**: [what was learned]
- **Status**: [proposed|committed|merged]
- **Commit**: [git commit hash]
\`\`\`

## Learned Preferences

_No entries yet._`;

const freshLog = `# Daily Learning Log

_Learning log initialized. Entries will appear as I interact and learn._

## Format

| Date | Category | Learning | Confidence | Status | Commit |
|------|----------|----------|------------|--------|--------|
| — | — | — | — | — | — |

## Entries

_No learnings yet._`;

writeFileSync(prefsPath, freshPrefs);
writeFileSync(logPath, freshLog);

console.log("✓ Memory reset for demo");

// ── Demo Steps ──────────────────────────────────────────
const steps = [
  {
    label: "Step 1: Fresh agent — ask about Docker",
    prompt: "Explain what Docker is.",
  },
  {
    label: "Step 2: User corrects — wants short bullet responses",
    prompt: "Too wordy. Give me short answers with bullet points from now on.",
  },
  {
    label: "Step 3: Ask about Kubernetes — should see changed behavior",
    prompt: "Now explain Kubernetes.",
  },
  {
    label: "Step 4: Ask what agent learned",
    prompt: "What have you learned so far? Show me your learning history.",
  },
  {
    label: "Step 5: Show git evolution",
    prompt: "Show me how you've evolved using git log.",
  },
];

// ── Run Demo ────────────────────────────────────────────
async function runDemo() {
  for (const step of steps) {
    console.log(`\n${"═".repeat(60)}`);
    console.log(`🎯 ${step.label}`);
    console.log(`${"═".repeat(60)}`);
    console.log(`\nYou: ${step.prompt}\n`);
    console.log("GitMind: ");

    try {
      for await (const msg of query({
        prompt: step.prompt,
        dir: __dirname,
        maxTurns: 15,
      })) {
        if (msg.type === "delta") {
          process.stdout.write(msg.content);
        }
      }
    } catch (err) {
      console.error(`\n[Error: ${err.message}]`);
    }

    console.log("\n");

    // Show git status after learning steps
    if (step.label.includes("Step 2") || step.label.includes("Step 5")) {
      console.log("─── Git Status ───");
      try {
        const branches = await git.branchLocal();
        const learningBranches = branches.all.filter((b) =>
          b.startsWith("learning/")
        );
        if (learningBranches.length > 0) {
          console.log(`Branches: ${learningBranches.join(", ")}`);
        }
        const log = await git.log({ file: "memory/", maxCount: 5 });
        if (log.all.length > 0) {
          console.log("\nGit log (memory/):");
          for (const entry of log.all) {
            console.log(`  ${entry.hash.slice(0, 7)} ${entry.message}`);
          }
        }
      } catch (err) {
        console.log(`  [git status unavailable: ${err.message}]`);
      }
      console.log("");
    }
  }

  console.log("\n" + "═".repeat(60));
  console.log("🏆 Demo complete!");
  console.log("═".repeat(60));
  console.log("\nNext steps:");
  console.log("  git log --oneline memory/     — See learning history");
  console.log("  git branch -a                  — See learning branches");
  console.log("  cat memory/runtime/preferences.md — See learned preferences");
  console.log("");
}

runDemo();
