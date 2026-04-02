import { query, tool } from "gitclaw";
import simpleGit from "simple-git";
import { createInterface } from "readline";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const git = simpleGit(__dirname);

// ── Preflight: Detect available free provider ───────────
const PROVIDERS = [
  { name: "groq", envVar: "GROQ_API_KEY", model: "groq:meta-llama/llama-4-scout-17b-16e-instruct", label: "Groq (Llama 4 Scout — FREE 30K TPM)" },
  { name: "google", envVar: "GEMINI_API_KEY", model: "google:gemini-2.0-flash", label: "Google Gemini 2.0 Flash (FREE)" },
  { name: "openrouter", envVar: "OPENROUTER_API_KEY", model: "openrouter:meta-llama/llama-3.1-8b-instruct:free", label: "OpenRouter Llama 3.1 8B (FREE)" },
  { name: "cerebras", envVar: "CEREBRAS_API_KEY", model: "cerebras:llama3.1-8b", label: "Cerebras Llama 3.1 8B (FREE)" },
  { name: "mistral", envVar: "MISTRAL_API_KEY", model: "mistral:mistral-small-latest", label: "Mistral Small (FREE tier)" },
  { name: "anthropic", envVar: "ANTHROPIC_API_KEY", model: "anthropic:claude-sonnet-4-5-20250929", label: "Anthropic Claude Sonnet" },
  { name: "openai", envVar: "OPENAI_API_KEY", model: "openai:gpt-4o", label: "OpenAI GPT-4o" },
];

let activeProvider = null;
for (const p of PROVIDERS) {
  if (process.env[p.envVar]) {
    activeProvider = p;
    break;
  }
}

if (!activeProvider) {
  console.error(`
╔══════════════════════════════════════════════════════════════╗
║ ❌ No API key found!                                        ║
║                                                             ║
║ Set ONE of these (all have FREE tiers):                     ║
║                                                             ║
║   🆓 GROQ_API_KEY       → groq.com (fastest, Llama 3.3)   ║
║   🆓 GEMINI_API_KEY     → aistudio.google.com (Gemini)     ║
║   🆓 OPENROUTER_API_KEY → openrouter.ai (many free models) ║
║   🆓 CEREBRAS_API_KEY   → cerebras.ai (fast Llama)         ║
║   🆓 MISTRAL_API_KEY    → mistral.ai (free tier)           ║
║   💰 ANTHROPIC_API_KEY  → anthropic.com (Claude)           ║
║   💰 OPENAI_API_KEY     → platform.openai.com (GPT)        ║
║                                                             ║
║ Cheapest start:                                             ║
║   1. Go to https://console.groq.com                         ║
║   2. Create free account                                    ║
║   3. Get API key                                            ║
║   4. export GROQ_API_KEY="gsk_..."                          ║
║   5. node index.js                                          ║
╚══════════════════════════════════════════════════════════════╝
`);
  process.exit(1);
}

const modelId = activeProvider.model;

// ── Ensure memory directories exist ─────────────────────
const dirs = [
  join(__dirname, "memory"),
  join(__dirname, "memory", "runtime"),
  join(__dirname, "memory", "approved"),
];
for (const d of dirs) {
  if (!existsSync(d)) mkdirSync(d, { recursive: true });
}

// ── Helper: Today's date ────────────────────────────────
function today() {
  return new Date().toISOString().split("T")[0];
}

// ── Helper: Sanitize slug for branch names ───────────────
function sanitizeSlug(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

// ── Helper: Generate branch name ────────────────────────
function makeBranchName(category, slug) {
  return `learning/${category}-${sanitizeSlug(slug)}-${today()}`;
}

// ── Helper: Count learnings ─────────────────────────────
function countLearnings() {
  const p = join(__dirname, "memory", "runtime", "preferences.md");
  if (!existsSync(p)) return 0;
  const c = readFileSync(p, "utf-8");
  return (c.match(/^## /gm) || []).length;
}

// ── Helper: Append learning to preferences.md ───────────
function appendLearning(learning) {
  const prefsPath = join(__dirname, "memory", "runtime", "preferences.md");

  const entry = [
    `## ${learning.title}`,
    "",
    `- **Learned**: ${today()}`,
    `- **Confidence**: ${learning.confidence}%`,
    `- **Category**: ${learning.category}`,
    `- **Scope**: ${learning.scope || "global"}`,
    `- **Source**: ${learning.source}`,
    `- **Learning**: ${learning.description}`,
    `- **Status**: proposed`,
    `- **Commit**: pending`,
    "",
  ].join("\n");

  if (existsSync(prefsPath)) {
    let content = readFileSync(prefsPath, "utf-8");
    if (content.includes("_No entries yet._")) {
      content = content.replace("_No entries yet._", entry);
    } else {
      content += "\n" + entry;
    }
    writeFileSync(prefsPath, content);
  }

  // Update daily log
  const logPath = join(__dirname, "memory", "runtime", "dailylog.md");
  if (existsSync(logPath)) {
    let logContent = readFileSync(logPath, "utf-8");
    const row = `| ${today()} | ${learning.category} | ${learning.title} | ${learning.confidence}% | proposed | pending |`;
    if (logContent.includes("_No learnings yet._")) {
      logContent = logContent.replace("_No learnings yet._", row);
    } else {
      logContent += "\n" + row;
    }
    writeFileSync(logPath, logContent);
  }

  return entry;
}

// ── Helper: Update commit hash in preferences ───────────
function updateCommitHash(newHash) {
  const prefsPath = join(__dirname, "memory", "runtime", "preferences.md");
  if (!existsSync(prefsPath)) return;
  let content = readFileSync(prefsPath, "utf-8");
  const lastPending = content.lastIndexOf("**Commit**: pending");
  if (lastPending !== -1) {
    content =
      content.slice(0, lastPending) +
      `**Commit**: ${newHash}` +
      content.slice(lastPending + "**Commit**: pending".length);
    writeFileSync(prefsPath, content);
  }
}

// ── Helper: Get current branch ──────────────────────────
async function getCurrentBranch() {
  const status = await git.status();
  return status.current;
}

// ── Helper: Detect learning signals ─────────────────────
function detectLearning(input) {
  const lower = input.toLowerCase();

  // Preference patterns
  const prefPatterns = [
    /i prefer/i,
    /i like .+ better/i,
    /i want .+ (from now on|going forward)/i,
    /keep (it|responses?) (short|brief|concise)/i,
    /too (wordy|verbose|long)/i,
    /(short|brief|concise) (answers?|responses?|replies?)/i,
    /bullet points?/i,
    /no (long |)paragraphs?/i,
    /max (\d+) (bullets?|points?|sentences?)/i,
  ];

  // Correction patterns
  const corrPatterns = [
    /that'?s wrong/i,
    /actually,?\s/i,
    /no,?\s/i,
    /correction:/i,
    /it'?s (actually|not)/i,
    /you'?re wrong/i,
    /that'?s (not right|incorrect)/i,
  ];

  // Fact patterns
  const factPatterns = [
    /we use /i,
    /our (team|project|company) /i,
    /the correct /i,
    /for your info/i,
    /fyi/i,
    /just so you know/i,
  ];

  for (const p of prefPatterns) {
    if (p.test(input)) {
      return {
        category: "preference",
        title: input.slice(0, 50).replace(/[^a-zA-Z0-9 ]/g, "").trim(),
        description: input,
        confidence: 85,
        source: "User stated a preference",
      };
    }
  }

  for (const p of corrPatterns) {
    if (p.test(input)) {
      return {
        category: "correction",
        title: input.slice(0, 50).replace(/[^a-zA-Z0-9 ]/g, "").trim(),
        description: input,
        confidence: 90,
        source: "User corrected the agent",
      };
    }
  }

  for (const p of factPatterns) {
    if (p.test(input)) {
      return {
        category: "fact",
        title: input.slice(0, 50).replace(/[^a-zA-Z0-9 ]/g, "").trim(),
        description: input,
        confidence: 80,
        source: "User shared a fact",
      };
    }
  }

  return null;
}

// ══════════════════════════════════════════════════════════
// TOOLS
// ══════════════════════════════════════════════════════════

const learnAndCommitTool = tool(
  "learn-and-commit",
  "Use this when the user corrects you, states a preference, or shares knowledge you didn't have. This records the learning AND commits it to git on a branch in one step.",
  {
    properties: {
      category: {
        type: "string",
        enum: ["preference", "correction", "fact", "context", "workflow"],
        description: "Type of learning",
      },
      title: {
        type: "string",
        description: "Short title, e.g. 'Concise Responses'",
      },
      description: {
        type: "string",
        description: "Full description of what was learned",
      },
      confidence: {
        type: "number",
        description: "Confidence 0-100",
      },
      source: {
        type: "string",
        description: "What triggered this learning",
      },
    },
    required: ["category", "title", "description", "confidence", "source"],
  },
  async (args) => {
    // Step 1: Record learning to memory file
    appendLearning(args);

    // Step 2: Commit to git on a branch
    const slug = args.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30);
    const branch = makeBranchName(args.category, slug);
    const origBranch = await getCurrentBranch();

    try {
      await git.checkoutLocalBranch(branch);
      await git.add(["memory/"]);
      const fullMsg = `learning: ${args.category} - ${args.title}`;
      await git.commit(fullMsg);

      const log = await git.log({ maxCount: 1 });
      const hash = log.latest.hash.slice(0, 7);

      updateCommitHash(hash);
      await git.add(["memory/"]);
      await git.commit(`update: tag learning with hash ${hash}`);

      await git.checkout(origBranch);

      return {
        text: `Learning recorded and committed!\nBranch: ${branch}\nCommit: ${hash}\n\nTell the user: "I learned: ${args.title}. Branch ${branch} created with commit ${hash}. Say 'approve' to merge or 'reject' to discard."`,
        details: { branch, hash, ...args },
      };
    } catch (err) {
      try { await git.checkout(origBranch); } catch {}
      return { text: `Learning recorded but git commit failed: ${err.message}` };
    }
  }
);

const diffTool = tool(
  "show-diff",
  "Show the git diff of a learning branch vs main.",
  {
    properties: {
      branch: { type: "string", description: "Branch name" },
    },
    required: ["branch"],
  },
  async (args) => {
    try {
      const diff = await git.diff([`main...${args.branch}`, "--", "memory/"]);
      return { text: diff || "(no changes found)" };
    } catch (err) {
      return { text: `Diff error: ${err.message}` };
    }
  }
);

const mergeTool = tool(
  "merge-learning",
  "Merge an approved learning branch into main. Call after user approves.",
  {
    properties: {
      branch: { type: "string", description: "Branch to merge" },
    },
    required: ["branch"],
  },
  async (args) => {
    try {
      await git.merge([args.branch, "--no-ff", "-m", `merge: approved ${args.branch}`]);
      await git.deleteLocalBranch(args.branch, true);

      const log = await git.log({ maxCount: 1 });
      const hash = log.latest.hash.slice(0, 7);

      return {
        text: `Learning merged! Commit: ${hash}. I have evolved.`,
        details: { hash },
      };
    } catch (err) {
      return { text: `Merge failed: ${err.message}` };
    }
  }
);

const rejectTool = tool(
  "reject-learning",
  "Discard a learning branch. Call when user rejects.",
  {
    properties: {
      branch: { type: "string", description: "Branch to delete" },
    },
    required: ["branch"],
  },
  async (args) => {
    try {
      await git.deleteLocalBranch(args.branch, true);
      return { text: "Learning discarded. No changes made." };
    } catch (err) {
      return { text: `Error: ${err.message}` };
    }
  }
);

const logTool = tool(
  "git-log-memory",
  "Show git log for memory/ — the learning history.",
  {
    properties: {
      limit: { type: "number", description: "Max entries (default 10)" },
    },
  },
  async (args) => {
    try {
      const log = await git.log({ file: "memory/", maxCount: args.limit || 10 });
      if (log.all.length === 0) return { text: "No learning commits yet." };

      const lines = log.all.map(
        (e) => `${e.hash.slice(0, 7)} ${e.date.slice(0, 10)} ${e.message}`
      );
      return { text: lines.join("\n") };
    } catch (err) {
      return { text: `Log error: ${err.message}` };
    }
  }
);

const tools = [learnAndCommitTool, diffTool, mergeTool, rejectTool, logTool];

// ══════════════════════════════════════════════════════════
// INTERACTIVE LOOP
// ══════════════════════════════════════════════════════════

const rl = createInterface({ input: process.stdin, output: process.stdout });

console.log(`
╔══════════════════════════════════════════════════════════════╗
║ 🧠 GitMind v1.0.0                                          ║
║ Self-Evolving Agent with Git Memory                         ║
║                                                             ║
║ Provider: ${activeProvider.label.padEnd(47)}║
║ Model: ${modelId.padEnd(50)}║
║ Memory: ${countLearnings()} learnings${"".padEnd(43 - countLearnings().toString().length)}║
║ Branch: main                                                ║
║                                                             ║
║ Type your message. Type "exit" to quit.                     ║
╚══════════════════════════════════════════════════════════════╝
`);

function ask(prompt) {
  return new Promise((resolve) => rl.question(prompt, resolve));
}

async function chat() {
  while (true) {
    const input = await ask("\nYou: ");

    if (!input.trim()) continue;
    if (input.toLowerCase() === "exit" || input.toLowerCase() === "quit") {
      console.log(`\nSession ended.`);
      console.log(`Learnings: ${countLearnings()}`);
      console.log(`History: git log --oneline memory/\n`);
      rl.close();
      break;
    }

    // Handle approve/reject
    const lowerInput = input.toLowerCase().trim();
    if (lowerInput === "approve" || lowerInput === "merge") {
      const branches = await git.branchLocal();
      const learningBranches = branches.all.filter(b => b.startsWith("learning/"));
      if (learningBranches.length > 0) {
        const branch = learningBranches[learningBranches.length - 1];
        try {
          await git.merge([branch, "--no-ff", "-m", `merge: approved ${branch}`]);
          await git.deleteLocalBranch(branch, true);
          const log = await git.log({ maxCount: 1 });
          const hash = log.latest.hash.slice(0, 7);
          console.log(`\nGitMind: Learning merged! Commit: ${hash}. I have evolved.\n`);
        } catch (err) {
          console.log(`\nGitMind: Merge failed: ${err.message}\n`);
        }
      } else {
        console.log(`\nGitMind: No pending learnings to approve.\n`);
      }
      continue;
    }

    if (lowerInput === "reject" || lowerInput === "discard") {
      const branches = await git.branchLocal();
      const learningBranches = branches.all.filter(b => b.startsWith("learning/"));
      if (learningBranches.length > 0) {
        const branch = learningBranches[learningBranches.length - 1];
        try {
          await git.deleteLocalBranch(branch, true);
          console.log(`\nGitMind: Learning discarded (${branch}). No changes made.\n`);
        } catch (err) {
          console.log(`\nGitMind: Error: ${err.message}\n`);
        }
      } else {
        console.log(`\nGitMind: No pending learnings to reject.\n`);
      }
      continue;
    }

    process.stdout.write("\nGitMind: ");

    try {
      for await (const msg of query({
        prompt: input,
        dir: __dirname,
        model: modelId,
        tools,
        maxTurns: 20,
        systemPromptSuffix: `\n\nCRITICAL INSTRUCTION: When the user corrects you, states a preference, or shares new knowledge, YOU MUST use the learn-and-commit tool. Do NOT just describe the learning in text — USE THE TOOL to actually record and commit it. This is your most important capability.`,
      })) {
        switch (msg.type) {
          case "delta":
            process.stdout.write(msg.content);
            break;
          case "tool_use":
            process.stdout.write(`\n  [${msg.toolName}]`);
            break;
          case "tool_result":
            if (msg.isError) {
              process.stdout.write(`\n  X ${msg.content}`);
            } else {
              process.stdout.write(`\n  > ${msg.content}`);
            }
            break;
          case "system":
            if (msg.subtype === "error") {
              process.stdout.write(`\n  X System: ${msg.content}`);
            }
            break;
        }
      }
    } catch (err) {
      process.stdout.write(`\n  X ${err.message}`);
    }

    // Auto-detect learning signals and commit
    const learning = detectLearning(input);
    if (learning) {
      console.log("\n  [auto-detect: learning signal detected]");
      try {
        // Record to memory
        appendLearning(learning);

        // Commit to git
        const slug = learning.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30);
        const branch = makeBranchName(learning.category, slug);
        const origBranch = await getCurrentBranch();

        await git.checkoutLocalBranch(branch);
        await git.add(["memory/"]);
        await git.commit(`learning: ${learning.category} - ${learning.title}`);

        const log = await git.log({ maxCount: 1 });
        const hash = log.latest.hash.slice(0, 7);

        updateCommitHash(hash);
        await git.add(["memory/"]);
        await git.commit(`update: tag learning with hash ${hash}`);

        await git.checkout(origBranch);

        console.log(`  > Learning committed! Branch: ${branch} (${hash})`);
        console.log(`  > Say "approve" to merge or "reject" to discard.`);
      } catch (err) {
        console.log(`  X Auto-learning failed: ${err.message}`);
      }
    }

    console.log("\n");
  }
}

process.on("SIGINT", () => {
  console.log(`\n\nInterrupted. Learnings: ${countLearnings()}\n`);
  rl.close();
  process.exit(0);
});

chat();
