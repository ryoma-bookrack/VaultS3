---
name: capability-first
description: >
  能力优先：动手前先盘点本仓封装、已装依赖、stdlib/原生能力，并用对比表评估
  reuse / add-dep / diy；禁止无脑偏底层自研。plan-to-problems 用 decide 模式；
  tdd-loop 开写前用 verify 模式（confirm | drift | escalate）。用户说「先看已有能力」
  「能不能复用」「该不该加库」「capability-first」时使用。新依赖一律 HITL，本 skill
  不加包、不改代码。
license: MIT
argument-hint: "[decide|verify]"
---

# capability-first

灵感来自 [ponytail](https://github.com/DietrichGebert/ponytail) 的 ladder（本仓复用 → stdlib → 原生 → 已装依赖），但**反转**「尽量不加依赖」：现有能力不够时，必须显式对比「加成熟库 vs 自研」，新依赖由用户批准。

## 前置

须已跑过 **setup-agent-step**。若缺少 `docs/agents/*` 或根 `CONTEXT.md`，**停下来**，提示先跑 `/setup-agent-step`。

## 模式

| 模式 | 谁调用 | 做什么 |
|---|---|---|
| **decide** | [`plan-to-problems`](../plan-to-problems/SKILL.md)（每片发布前必跑） | 完整盘点 + 对比表 + `recommended:`；写入 Problem |
| **verify** | [`tdd-loop`](../tdd-loop/SKILL.md)（红绿前必跑） | 对照已有 Decision；只输出 `confirm` / `drift` / `escalate` |

无参数时：若当前 Problem 已有 `## Capability decision` → **verify**；否则 → **decide**。

**每个 Problem 必跑，无豁免**（含小改）。

## 库存范围（decide 与 verify 都要过）

按序审查，并留下可核对的证据（读过的文件 / 搜过的命令）：

1. **In-repo** — 本仓已有 helper / service / pattern（搜 `CONTEXT.md` 术语、相关目录）
2. **Installed deps** — 清单文件（`package.json` / `pyproject.toml` / `Cargo.toml` / `go.mod` 等）及项目内已有用法
3. **Stdlib / native** — 语言标准库、平台原生能力（如 HTML 控件、DB 约束、OS API）
4. **Gap** — 以上仍盖不住的缺口（一句话）

## decide

### 过程

1. 读清本片要交付的行为（来自计划 / 对线中的 slice / 草稿 Problem）。
2. 做完上方库存。
3. **强制**产出对比表，至少三行方案（有成熟库候选时库方案写 1–2 个；确实无库生态则注明 `n/a` 并仍保留 diy / reuse 行）：

| approach | option | fit | cost | risk |
|---|---|---|---|---|
| reuse | … | … | … | … |
| diy | … | … | … | … |
| add-dep | `<pkg>` … | … | … | … |

4. 给出一行 `recommended: reuse | add-dep | diy` 与一句理由。
5. **不替用户拍板。** 在 plan 对线时展示，等用户确认后再写入 Problem。
6. 若用户确认 `add-dep`：记下包名与范围；**不要**执行安装。未确认前 `blocked_on_user: true`。
7. 若用户确认 `diy`：必须有一句「为何不 reuse / 不 add-dep」。

### 写入 Problem 的格式

用户拍板后，把下列块写入对应 Problem（覆盖旧块，勿追加多份）：

```markdown
## Capability decision

Mode: decide
Approach: reuse | add-dep | diy
Blocked-on-user: false
Recommended: <与 Approach 一致，或注明用户否决了 recommended>

### Inventory
- In-repo: <路径或「无」>
- Installed deps: <包名或「无相关」>
- Stdlib/native: <能力或「无」>
- Gap: <一句话>

### Comparison
| approach | option | fit | cost | risk |
|---|---|---|---|---|
| reuse | … | … | … | … |
| diy | … | … | … | … |
| add-dep | … | … | … | … |

### Decision notes
- <用户拍板要点；diy 时必含「为何不引库」>
- If add-dep: 包名 / 用途边界 / 待安装（由人批准后安装）
```

### 与 Type / Status

- `Approach: add-dep` 且依赖尚未安装、用户未明确「已批准安装」→ `Blocked-on-user: true`，Problem **`Type: HITL`**，且不得标 `ready-for-agent`（保持 `needs-triage` / `needs-info` 或 `ready-for-human`）。
- `reuse` / `diy`（或 add-dep 已批准且记下包名）→ `Blocked-on-user: false`，方可按原规则标 `ready-for-agent`。

## verify

### 输入

当前 Problem 的 `## Capability decision`。若缺失 → **停**，提示先跑 decide（或退回 plan-to-problems），禁止开写。

### 过程

1. 快速重做库存（同一范围），对照 Decision 是否仍成立。
2. **只**输出三态之一，不要重新选型：

| 结果 | 何时 | 下一步 |
|---|---|---|
| **confirm** | 库存与 Approach 仍匹配；缺口未扩大；未发现未批准的新依赖需求 | tdd-loop 可进入红绿 |
| **drift** | 现实变了（本仓已有封装、deps 变更、缺口变化）但未必要加新库 | **停写**；更新 Decision 或退回 plan；再 verify |
| **escalate** | 实现需要新依赖 / 换库，或 Decision 是 reuse/diy 但已不可行 | **停写**；HITL；**禁止**擅自 `npm install` / 改锁文件 |

### 输出格式（对话 + 可选追加到 Problem）

```markdown
## Capability verify

Result: confirm | drift | escalate
Checked: <对照的 Approach / 关键库存证据一句>
Action: <continue | update-decision | hitl>
```

`confirm` 时可只在对话里确认；`drift` / `escalate` **必须**写进 Problem 并停写。

## 不要做的事

- 不要安装或升级依赖
- 不要在 verify 里静默改 `Approach`
- 不要跳过任一 Problem
- 不要把「还没搜过」当成「没有可复用能力」
- 正确性 / 安全 / 性能专项审查不在本 skill（交给 diagnose / 常规 review）

## 与其它 skill 的关系

- 上游调用方：[`plan-to-problems`](../plan-to-problems/SKILL.md)、[`tdd-loop`](../tdd-loop/SKILL.md)
- 平行：过度工程清单见 [`tdd-review`](../tdd-review/SKILL.md)
- 行为基线仍服从 karpathy；本 skill 专门补「复用与选型」门禁
