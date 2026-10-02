---
name: plan-to-problems
description: 把一份计划 / 规格 / PRD / 已对齐的 ADR 拆成可独立拿走执行的 Problem（vertical slices）。本仓 Problem 是 .scratch/<problem-group>/NNN-<slug>.md 这种本地 markdown 文件。用户要把计划落 Problem、把会话拆成 Problem 时使用。每片发布前必须跑 capability-first（decide）。
license: MIT
---

# plan-to-problems

来源：[mattpocock/skills](https://github.com/mattpocock/skills) 的 `to-issues`（MIT）。本套件约定：

- Problem 是本地 markdown 文件，路径 `.scratch/<problem-group>/NNN-<slug>.md`
- 不调 `gh issue create`；用 [scripts/new-problem.mjs](./scripts/new-problem.mjs) 帮助分配编号
- 状态用 inline `Status:` 行表达，不依赖 label 系统
- HITL / AFK 仍然区分，但落在 Problem 首部 `Type: HITL | AFK` 一行
- **每片发布前**必须跑 [`capability-first`](../capability-first/SKILL.md) 的 **decide**（无豁免）

## 前置

须已跑过 **setup-agent-step**。若缺少 `docs/agents/*` 或根 `CONTEXT.md`，**停下来**，提示用户先跑 `/setup-agent-step`，不要自行补脚手架。

## 触发条件

- 用户要把 `docs/<topic>.md` / 会话上下文 / 旧 Problem 拆成可执行 Problem
- 用户说「把这个拆成 Problem / 切片 / ticket」

**不触发**：单步任务；直接进 [`tdd-loop`](../tdd-loop/SKILL.md)（tdd 仍会强制 `capability-first` verify；若无 Decision 则退回 decide）。

## 过程

### 1. 收集上下文

从会话或用户指定的 `docs/<topic>.md` / `.scratch/<problem-group>/NNN-*.md` 路径读全。

### 2. 探索代码（可选）

如未读过涉及的代码，先读。Problem 标题与正文**强制**使用根 `CONTEXT.md` 术语，尊重 `docs/adr/` 决策。

### 3. 草拟 vertical slice

拆成 **tracer bullet** 切片。每一片是**贯穿所有层**的薄垂直切片（schema / API / UI / 测试一通到底），**不是**单层的水平切片。

切片可以是 **HITL** 或 **AFK**。HITL 需要人工介入（设计判断、架构决策、对外通信、**未批准的新依赖**），AFK 可以让 Agent 全自动跑完。**尽量 AFK**。

切片规则：

- 每片是窄但**完整**的端到端路径
- 一片完成后可独立 demo / 验证
- **多薄片优于少厚片**

### 4. 与用户对线（切片）

把建议的拆分以编号列表呈现，每片含：

- **Title**
- **Type**: HITL / AFK
- **Blocked by**: 依赖哪些其它片
- **User stories covered**（若上游有）

问用户：

- 粒度合适吗？（太粗 / 太细）
- 依赖关系对吗？
- 哪些片需要合 / 拆？
- HITL / AFK 标对吗？

迭代直到用户认可切片列表。

### 5. 每片：capability-first decide（必跑）

对**每一个**将发布的切片，调用 [`capability-first`](../capability-first/SKILL.md) **decide**：

1. 盘点 In-repo / Installed deps / Stdlib·native / Gap
2. 产出 reuse / diy / add-dep 对比表 + `recommended:`
3. **在对线中展示，等用户拍板**（本步不替用户选）
4. 将拍板结果准备为 `## Capability decision` 块（格式见该 skill）

规则：

- `Approach: add-dep` 且用户尚未批准安装 → 该片 `Type: HITL`，`Blocked-on-user: true`，**不得**标 `ready-for-agent`
- 禁止「先当 AFK 发布、实现时再想用什么库」

### 6. 发布 Problem

按依赖顺序（blocker 先），在**目标项目根**用脚本创建每条 Problem：

```bash
node <path-to-this-skill>/scripts/new-problem.mjs <problem-group> <slug>
```

脚本从 cwd 向上找 `.git` 作为 project root，自动算下一编号、用模板填首部。然后**编辑**生成的文件，填好 `What to build` / `Acceptance criteria` / `Blocked by` / **`## Capability decision`**。

Problem 模板（脚本会预填，自己填的话照搬）：

```markdown
# <一句话标题>

Status: ready-for-agent
Type: AFK
Parent: <可选：上游 docs/<topic>.md 或父 Problem 路径>
Verify:
  - <可独立运行的成功标准 1>
  - <可独立运行的成功标准 2>
Blocked-by:
  - <可选：依赖的其它 Problem 路径，若无则省略整段>

## What to build

简明描述这一 vertical slice 的端到端行为；**不**贴具体文件路径或代码（会过期）。

例外：原型产出的 state machine / reducer / schema / type 等决策密集片段可以 inline，并注明「来自原型」。

## Acceptance criteria

- [ ] 标准 1
- [ ] 标准 2
- [ ] 标准 3

## 范围外（非目标）

明确不做的事。

## Capability decision

Mode: decide
Approach: reuse | add-dep | diy
Blocked-on-user: false
Recommended: …

### Inventory
- In-repo: …
- Installed deps: …
- Stdlib/native: …
- Gap: …

### Comparison
| approach | option | fit | cost | risk |
|---|---|---|---|---|
| reuse | … | … | … | … |
| diy | … | … | … | … |
| add-dep | … | … | … | … |

### Decision notes
- …
```

`Status` 枚举见 `docs/agents/triage-labels.md`：
默认填 `ready-for-agent`（若 `Verify:` 已齐 **且** Capability decision 已拍板且 `Blocked-on-user: false`）或 `needs-triage` / `ready-for-human`（否则）。

**不**修改 / 关闭上游 `docs/<topic>.md` 或父 Problem。

## 与其它 skill 的关系

- 上游：[`domain-doc`](../domain-doc/SKILL.md) 的 `docs/<topic>.md`；或者用户直接给的会话上下文 / 旧 Problem 路径
- 必调：[`capability-first`](../capability-first/SKILL.md)（decide）
- 下游：[`tdd-loop`](../tdd-loop/SKILL.md)（实现 AFK 切片）/ 人工实现（HITL 切片）/ [`diagnose`](../diagnose/SKILL.md)（bug 切片）

## 不要做的事

- 不要发布到 GitHub Issues / Linear / Jira
- 不要在 `.scratch/<problem-group>/` 之外乱放 Problem
- 不要给完成的 Problem 额外写「验收报告」——验证段直接 inline 在 Problem 末尾
- 不要跳过 capability-first decide，或在无 Decision 时标 `ready-for-agent`
- 不要擅自安装新依赖
