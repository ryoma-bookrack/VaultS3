#!/usr/bin/env node
// setup-agent-step/scripts/init-skills.mjs
//
// 一次性铺好目标仓的 .cursor/rules、AGENTS.md ## Agent skills 块、
// docs/agents/、CONTEXT.md、.scratch/。幂等；详见 ../SKILL.md §4。
//
// 用法（在目标项目根执行）：
//   node <path-to-this-skill>/scripts/init-skills.mjs            # 写盘
//   node <path-to-this-skill>/scripts/init-skills.mjs --dry-run  # 只预览
//
// project root：从 process.cwd() 向上找 .git；找不到则用 cwd。

import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from "node:fs";
import { dirname, resolve, relative, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const skillDir = resolve(__dirname, "..");
const tmplDir = resolve(skillDir, "templates");

const findProjectRoot = (start) => {
  let dir = resolve(start);
  while (true) {
    if (existsSync(join(dir, ".git"))) return dir;
    const parent = dirname(dir);
    if (parent === dir) return resolve(start);
    dir = parent;
  }
};

const repoRoot = findProjectRoot(process.cwd());
const DRY = process.argv.includes("--dry-run");

const AGENTS_BLOCK_RE = /^## Agent skills\s*$/m;

const log = (kind, path, extra = "") => {
  const rel = relative(repoRoot, path) || ".";
  const tag = DRY ? `[dry] ${kind}` : kind;
  console.log(`${tag.padEnd(14)} ${rel}${extra ? `  (${extra})` : ""}`);
};

const ensureDir = (path) => {
  if (DRY) return;
  mkdirSync(path, { recursive: true });
};

const writeIfChanged = (path, content, { overwriteIfExists = true } = {}) => {
  if (existsSync(path)) {
    const cur = readFileSync(path, "utf8");
    if (cur === content) {
      log("skip-same", path);
      return;
    }
    if (!overwriteIfExists) {
      log("skip-keep", path, "user-edited");
      return;
    }
    log("update", path);
  } else {
    log("create", path);
  }
  if (DRY) return;
  ensureDir(dirname(path));
  writeFileSync(path, content);
};

const copyTemplate = (templateName, dest, opts) => {
  const src = resolve(tmplDir, templateName);
  const content = readFileSync(src, "utf8");
  writeIfChanged(dest, content, opts);
};

console.log(`project root: ${repoRoot}`);

// ============================================================
// 1) .cursor/rules/*.mdc —— 可覆盖（视为模板）
// ============================================================
const karpathyRule = `---
description: Karpathy guidelines — reduce common LLM coding mistakes
alwaysApply: true
---

# Karpathy Guidelines

Behavioral guidelines to reduce common LLM coding mistakes.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan, each step with its verify check.

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

## 优先级

当本规则与 agent-step 任一 skill 的"多问对齐"节奏冲突时，**本规则优先**：琐碎改动可跳过 grill。
`;

const agentStepBaseRule = `---
description: agent-step 入口规则（指向 AGENTS.md ## Agent skills 段）
alwaysApply: true
---

# agent-step base

本仓已接入 agent-step 时，**默认**遵循以下事实：

1. **行为基线**：karpathy-guidelines.mdc 已 alwaysApply；本规则不再复述。
2. **流程主干**：使用 agent-step 套件的 skill 组合完成开发任务，不存在线性的"阶段"。须先跑过 setup-agent-step。主干含 plan-to-problems（每片 capability-first decide）与 tdd-loop（开写前 verify；收尾 tdd-review）。
3. **Problem tracker**：本地 markdown，路径 \`.scratch/<problem-group>/NNN-<slug>.md\`。**不要**让 Agent 主动创建 GitHub Issues / Linear / Jira 条目。Problem 须含 \`## Capability decision\` 方可 \`ready-for-agent\`。
4. **领域术语**：根 [CONTEXT.md](../../CONTEXT.md)；变量 / 函数 / 文件名应**优先使用** \`CONTEXT.md\` 中的术语。
5. **能力优先**：动手前盘点本仓 / 已装依赖 / stdlib·原生；新依赖一律 HITL。见 capability-first / tdd-review。
6. **领域约定**：见 [docs/agents/](../../docs/agents/) 与 [AGENTS.md](../../AGENTS.md) 的 \`## Agent skills\` 块。

完整契约见 [AGENTS.md](../../AGENTS.md) 的 \`## Agent skills\` 块。
`;

const cursorRulesDir = resolve(repoRoot, ".cursor", "rules");
ensureDir(cursorRulesDir);
writeIfChanged(resolve(cursorRulesDir, "karpathy-guidelines.mdc"), karpathyRule);
writeIfChanged(resolve(cursorRulesDir, "agent-step-base.mdc"), agentStepBaseRule);

// ============================================================
// 2) AGENTS.md —— 创建 / 末尾追加 / 整块替换 ## Agent skills
// ============================================================
const agentsPath = resolve(repoRoot, "AGENTS.md");
const agentsBlock = readFileSync(resolve(tmplDir, "agents-block.md"), "utf8").trimEnd() + "\n";

if (!existsSync(agentsPath)) {
  const seed = `# AGENTS.md\n\n${agentsBlock}`;
  writeIfChanged(agentsPath, seed);
} else {
  const agentsCurrent = readFileSync(agentsPath, "utf8");
  const blockMatch = AGENTS_BLOCK_RE.exec(agentsCurrent);
  const blockIdx = blockMatch ? blockMatch.index : -1;

  let agentsNext;
  if (blockIdx === -1) {
    agentsNext = agentsCurrent.replace(/\s*$/, "") + "\n\n" + agentsBlock;
  } else {
    const before = agentsCurrent.slice(0, blockIdx);
    const after = agentsCurrent.slice(blockIdx + blockMatch[0].length);
    const nextH2 = /^## (?!#)/m.exec(after);
    const tail = nextH2 ? after.slice(nextH2.index).replace(/^\n+/, "\n\n") : "";
    agentsNext = before.replace(/\s*$/, "") + "\n\n" + agentsBlock + (tail ? tail : "");
  }

  if (agentsNext !== agentsCurrent) {
    if (!DRY) copyFileSync(agentsPath, agentsPath + ".bak");
    log(blockIdx === -1 ? "append" : "replace", agentsPath, blockIdx === -1 ? "no block found" : "replacing existing block");
    if (!DRY) writeFileSync(agentsPath, agentsNext);
  } else {
    log("skip-same", agentsPath);
  }
}

// ============================================================
// 3) docs/agents/*.md —— 已存在则保留（视为用户自定义）
// ============================================================
const docsAgents = resolve(repoRoot, "docs", "agents");
ensureDir(docsAgents);
copyTemplate("problem-tracker-local.md", resolve(docsAgents, "problem-tracker.md"), { overwriteIfExists: false });
copyTemplate("triage-labels.md", resolve(docsAgents, "triage-labels.md"), { overwriteIfExists: false });
copyTemplate("domain.md", resolve(docsAgents, "domain.md"), { overwriteIfExists: false });

// ============================================================
// 4) CONTEXT.md —— 已存在则保留
// ============================================================
const contextPath = resolve(repoRoot, "CONTEXT.md");
const contextSeed = `# CONTEXT.md — 领域术语表

> 本文件是术语 glossary，**不**放实现细节、规格、草稿。新条目由
> agent-step 的 align-grill 在对齐过程中**当场**写入。

## 约定

- 术语首字母大写，不变复数（\`Project\` 而非 \`Projects\`）。
- 每条术语一段定义；冲突 / 歧义当场指出并解决。
- 当用户口语与本表冲突时，**本表优先**，直到用户显式改本表。

## 术语

### Project

一个 git 仓库根目录所代表的工作单元。所有 agent-step skill 都假设"当前工作目录落在某个 Project 内"。

### Skill

一项可触发的 Agent 能力（\`SKILL.md\`）。Agent 在满足触发条件时**自动**或**应用户指令**调用之；不强制按顺序串联。

### Problem

\`.scratch/<problem-group>/NNN-<slug>.md\` 这一份 markdown 文件。本仓开发流程中使用的工单。状态由文件首部的 \`Status:\` 行表达。

### Problem Group

\`.scratch/<problem-group>/\` 这一层目录所代表的功能 / 主题分组。一个 Problem Group 可以包含若干 Problem。
`;
writeIfChanged(contextPath, contextSeed, { overwriteIfExists: false });

// ============================================================
// 5) .scratch/README.md —— 已存在则保留
// ============================================================
const scratchReadme = resolve(repoRoot, ".scratch", "README.md");
const scratchSeed = `# .scratch — 本仓 Problem tracker

Problem 以 markdown 文件存在，路径 \`<problem-group>/NNN-<slug>.md\`。

格式与状态机详见 [docs/agents/problem-tracker.md](../docs/agents/problem-tracker.md)
与 [docs/agents/triage-labels.md](../docs/agents/triage-labels.md)。

新建 Problem：在目标项目根运行 plan-to-problems 的脚本：

\`\`\`bash
node <path-to-plan-to-problems>/scripts/new-problem.mjs <problem-group> <slug>
\`\`\`
`;
writeIfChanged(scratchReadme, scratchSeed, { overwriteIfExists: false });

// ============================================================
// 完成
// ============================================================
console.log("");
console.log(DRY ? "Dry-run done. Re-run without --dry-run to write." : "Done.");
