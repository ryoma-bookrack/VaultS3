# Problem tracker — local markdown under `.scratch/`

本仓的「Problem」以本地 markdown 文件形式存在，**不使用** GitHub Issues / Linear / Jira。

由 `setup-agent-step` 铺设；其它 agent-step skill 依赖本约定。

## 目录结构

```
.scratch/
├── README.md
├── <problem-group-1>/
│   ├── 001-<slug>.md
│   ├── 002-<slug>.md
│   └── ...
└── <problem-group-2>/
    └── 001-<slug>.md
```

每个 Problem 是一个 markdown 文件，编号 `NNN`（在该 Problem Group 内递增、三位补零），slug 用 kebab-case。

## Problem 头部约定

每份 Problem 文件首行一个 H1，紧随其后是元信息行（**plain markdown，不用 YAML frontmatter**，方便 `grep`）：

```markdown
# <一句话标题，少于 60 字>

Status: ready-for-agent
Type: AFK
Parent: <可选：父 Problem Group 名或父 Problem 路径>
Verify:
  - <可被独立运行的成功标准 1>
  - <可被独立运行的成功标准 2>
Blocked-by:
  - <可选：依赖的其它 Problem 路径>

## What to build

...

## Acceptance criteria

- [ ] ...

## 范围外（非目标）

...

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
| … | … | … | … | … |

### Decision notes
- …
```

`Status` 枚举见 [triage-labels.md](./triage-labels.md)。

`## Capability decision` 由 **capability-first**（decide）在发布前写入；缺此节或 `Blocked-on-user: true` 时不得标 `ready-for-agent`。tdd-loop 收尾可追加 `## Lean review`（tdd-review），不挡 `done`。

## CLI / 脚本入口

| 操作 | 命令 |
|---|---|
| 新建 Problem（自动算下一编号） | `node <path-to-plan-to-problems>/scripts/new-problem.mjs <problem-group> <slug>` |
| 列出某 Problem Group 下所有 Problem | `ls .scratch/<problem-group>/` |
| 找所有 ready-for-agent Problem | `rg -l '^Status: ready-for-agent' .scratch/` |
| 找所有未完成 Problem | `rg -l '^Status: (needs-triage\|needs-info\|ready-for-agent\|ready-for-human)' .scratch/` |

## 与其它 skill 的关系

- **plan-to-problems**：把 PRD / 计划拆成本地 Problem；每片必跑 **capability-first** decide
- **align-grill** → **domain-doc** → **plan-to-problems** 是典型链路
- **tdd-loop**：开写前 **capability-first** verify；收尾 **tdd-review**；/ **diagnose** 修 bug 时引用 Problem 路径

## 不要做的事

- 不要 `git rm` 已完成 Problem。完成的 Problem `Status` 改为 `done` 并保留——它是本仓的非正式 changelog。
- 不要在 `.scratch/<problem-group>/` 之外随意放 Problem。
- 不要给 Problem 加额外的「verdict / acceptance report」附加文件。验证由 tdd-loop / diagnose 在同一会话内完成，结果直接 inline 在 Problem 末尾。
