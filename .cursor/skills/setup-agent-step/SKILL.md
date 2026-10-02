---
name: setup-agent-step
description: 在目标项目中一次性铺好 .cursor/rules、AGENTS.md 的 ## Agent skills 块、docs/agents/、CONTEXT.md、.scratch/ —— 让 align-grill / domain-doc / plan-to-problems / capability-first / tdd-loop / tdd-review / diagnose / improve-architecture 知道本仓的 Problem tracker、triage 标签、领域文档布局。首次接入 agent-step 时必须运行；之后只在切换 Problem tracker / 词汇 / 文档布局时再次运行。
license: MIT
disable-model-invocation: true
---

# Setup agent-step

把其它工程 skill 需要的「每仓配置」一次性写好。

**agent-step 不是开箱即用**：安装套件后必须先跑本 skill，再使用其余 skill。

这是一个 **prompt-driven** 的 skill，配套幂等 Node 脚本 [scripts/init-skills.mjs](./scripts/init-skills.mjs) 执行实际写入；脚本不做破坏性操作，对已存在内容采取保守策略（详见下方 §4）。

## 固定决策（意见化，不再询问）

| 决策 | 选择 | 原因 |
|---|---|---|
| Problem tracker | **Local markdown** at `.scratch/<problem-group>/NNN-<slug>.md` | 不依赖外部 issue tracker |
| Triage labels | **Inline `Status:` headers** in each `.scratch/*.md` | 不依赖 tracker label 系统 |
| Domain docs | **Single-context** —— `CONTEXT.md` at root, `docs/adr/` lazy-created | 单上下文；ADR 真有需要时再建 |
| 行为基线 | karpathy 四条作 `.cursor/rules/*.mdc`，alwaysApply | 整仓一致的行为约束 |

若需切换到不同 issue tracker 或多上下文布局，先改本 SKILL.md 与 [init-skills.mjs](./scripts/init-skills.mjs) 中的常量，再 rerun。

## 流程

### 1. Dry-run 预览

在**目标项目根**执行（脚本从 cwd 向上找 `.git` 作为 project root）：

```bash
node <path-to-this-skill>/scripts/init-skills.mjs --dry-run
```

打印将要创建 / 更新的文件清单，**不写盘**。

### 2. 实际执行

```bash
node <path-to-this-skill>/scripts/init-skills.mjs
```

会产出：

- `.cursor/rules/karpathy-guidelines.mdc`（alwaysApply，karpathy 四条）
- `.cursor/rules/agent-step-base.mdc`（alwaysApply，指向 AGENTS.md 的 `## Agent skills` 段）
- `AGENTS.md`：若不存在则创建；末尾追加 / 更新 `## Agent skills` 块（**不动**原有其它段）
- `docs/agents/problem-tracker.md`（从 [templates/problem-tracker-local.md](./templates/problem-tracker-local.md)）
- `docs/agents/triage-labels.md`（从 [templates/triage-labels.md](./templates/triage-labels.md)）
- `docs/agents/domain.md`（从 [templates/domain.md](./templates/domain.md)）
- `CONTEXT.md`（占位最小术语表，若已存在则不动）
- `.scratch/README.md`（命名约定与状态机说明，若已存在则不动）

如果 `AGENTS.md` 中已存在 `## Agent skills` 块，脚本会**整块替换**为最新版本（来自 `templates/agents-block.md`），其它段保持不动；同时产出 `AGENTS.md.bak`。

### 3. 验证

```bash
diff AGENTS.md AGENTS.md.bak | head -50     # 若有备份，看看动了什么
ls .cursor/rules/                            # 两份 .mdc 应在
ls docs/agents/                              # 三份 .md 应在
```

确认无误后删除备份：

```bash
rm -f AGENTS.md.bak
```

## 4. 幂等性 / 安全性保证

| 情境 | 行为 |
|---|---|
| 目标文件不存在 | 创建 |
| 目标文件存在、内容相同 | 跳过 |
| `.cursor/rules/*.mdc` 已存在但内容不同 | 覆盖（视为模板更新） |
| `docs/agents/*.md` 已存在但内容不同 | **跳过**（视为用户自定义） |
| `AGENTS.md` 不存在 | **创建**最小文件并写入 `## Agent skills` 块 |
| `AGENTS.md` 存在但无 `## Agent skills` 块 | 在文件末尾追加 |
| `AGENTS.md` 存在且已有 `## Agent skills` 块 | 整块替换为最新版本；备份 `AGENTS.md.bak` |
| `CONTEXT.md` / `.scratch/README.md` 已存在 | **跳过**（视为用户编辑） |

任何一步出错都 fail-fast，不留半成品。

## 5. 与其它 skill 的关系

- 所有其它工程 skill 都假设 `docs/agents/*.md` 与 `CONTEXT.md` 已经存在；若不符合预期，应**先 rerun 本 skill**。
- 当本仓改变其中任意一个固定决策时，**先改本 SKILL.md 与 `init-skills.mjs` 的常量**，再 rerun。

## 6. 来源

改写自 [mattpocock/skills](https://github.com/mattpocock/skills) 的 `setup-matt-pocock-skills`（MIT）。
原版交互式问 3 个问题；本版预设答案，不问。
