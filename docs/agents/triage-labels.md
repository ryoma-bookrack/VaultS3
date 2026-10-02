# Triage labels — inline `Status:` header

本仓不使用外部 issue tracker 提供的 label 系统。每份 `.scratch/*.md` Problem 在头部用一行 `Status: <value>` 表达当前状态。

由 `setup-agent-step` 铺设；其它 agent-step skill 依赖本约定。

## 状态机

```
needs-triage  ──[评估]──>  needs-info  ──[等回信]──>  needs-triage
                  │
                  ├──[已具备执行所需全部上下文]──>  ready-for-agent  ──>  in-progress  ──>  done
                  │
                  ├──[需人手实现]──>  ready-for-human  ──>  in-progress  ──>  done
                  │
                  └──[拒收]──>  wontfix
```

## 状态枚举

| Status | 含义 | 谁来推进 |
|---|---|---|
| `needs-triage` | 刚建，待评估 | 维护者 |
| `needs-info` | 缺关键信息，已向 reporter / 上游问询 | reporter / 上游 |
| `ready-for-agent` | 上下文齐备，可交给 AFK Agent 拿走执行 | Agent |
| `ready-for-human` | 上下文齐备，但需人手实现（如设计判断、对外通信） | 人 |
| `in-progress` | 已开始执行（推荐附 `Owner: <agent-id 或 human-name>`） | 当前 owner |
| `done` | 完成；`Verify:` 列表全部通过 | — |
| `wontfix` | 不会执行；附一行 `Reason:` 说明 | — |

## 改状态的规则

- 任何状态变更**必须**直接编辑 `.scratch/<problem-group>/NNN-*.md` 的 `Status:` 行；不开附属文件。
- 从 `needs-triage` → `ready-for-agent` 之前，**必须**填好 `Verify:` 列表（可验证的成功标准）。
- 进入 `done` 之前，Problem 末尾追加一段 `## Verification` 章节，逐条勾选 `Verify:` 列表中的项；通过的写 `- [x]`，未通过的写 `- [ ]` 并说明原因。
- 完成的 Problem **不删除**，作为非正式 changelog 长期保留。

## 与其它 skill 的关系

- **plan-to-problems** 建 Problem 时默认 `Status: ready-for-agent`（若 `Verify:` 已填好）或 `needs-triage`（否则）。
- **align-grill** 暴露的 ambiguity 一般落到一条 `needs-info` Problem。
- **tdd-loop** 实现时把 `Status` 改 `in-progress`；红绿通过后改 `done` 并写 `## Verification`。
- **diagnose** 收尾时**可**把「未来防御措施」落成一条新 `Status: needs-triage` 的 Problem 交给维护者。
