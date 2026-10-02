---
name: align-grill
description: 在动手前用一问一停的方式把模糊计划对齐到可执行——挑战 CONTEXT.md 中的术语、当场更新术语表、必要时写 ADR。当用户要做大改 / 计划有歧义 / 共识不足时使用。琐碎改动跳过本 skill。
license: MIT
---

# align-grill

来源：[mattpocock/skills](https://github.com/mattpocock/skills) 的 `grill-with-docs`（MIT）。本套件约定：术语表落在 `CONTEXT.md`，ADR 落在 `docs/adr/`（懒创建），单上下文。

## 前置

须已跑过 **setup-agent-step**。若缺少 `docs/agents/problem-tracker.md` / `triage-labels.md` / `domain.md` 或根 `CONTEXT.md`，**停下来**，提示用户先跑 `/setup-agent-step`，不要自行猜测约定或半吊子补文件。

## 触发条件

- 用户提到 grill / 对齐 / 压测计划 / 「我想清楚再做」
- 用户要做的改动涉及 ≥3 个模块、或会跨包 / 跨层传播
- 用户的描述中存在多种合理解读
- 用户使用了未定义在 `CONTEXT.md` 中的关键术语

**不触发**：单文件、单函数、小于约 30 行的改动；karpathy 简洁优先，琐碎改动直接进 [`tdd-loop`](../tdd-loop/SKILL.md)。

## what to do

像审讯一样追问，直到对齐共识。一次**只问一个问题**，等回答再继续。能通过读代码回答的就**别问**——去读代码。

走决策树：把计划拆成依赖分支，逐分支收敛；每问一次都给出**推荐答案**（不要单纯抛问题）。

## supporting info

### Domain awareness

探索代码库时一并读：

```
<project-root>/
├── CONTEXT.md            # 全仓术语表（必读）
└── docs/adr/             # 架构决策记录（若存在）
```

单上下文：不存在 `CONTEXT-MAP.md`，所有术语共享一份 `CONTEXT.md`。

### 期间的纪律

#### 与术语表对线

用户使用的词与 `CONTEXT.md` 已有定义冲突时**立刻指出**：「你说的『cancellation』在术语表里指 X，但你的描述指 Y——以哪个为准？」

#### 锐化模糊词

用户用了 vague / overloaded 的词，提议一个精确的 canonical 形式：「你说的『account』是 Customer 还是 User？这两个在本仓是不同概念。」

#### 用具体场景探边界

讨论领域关系时编**具体场景**压测：「如果用户在退款窗口内又下了一单，那条原始订单应该……？」

#### 与代码交叉验证

用户陈述「X 是这样工作的」时，**读代码确认**。发现矛盾立刻指出。

#### 当场更新 CONTEXT.md

一条术语对齐结束就**立刻**写入 `CONTEXT.md`，**不要**攒一批再写。格式：

```markdown
### <Term>

一段话定义。可附「反义 / 易混词：…」。
```

如果 `CONTEXT.md` 不存在，停下来引导 `/setup-agent-step`，不要自行发明布局。

### ADR 的极保守发布条件

仅当**三条同时成立**才提议写 ADR：

1. **Hard to reverse** — 改主意的代价是大的
2. **Surprising without context** — 未来读者会问「为什么」
3. **Result of a real trade-off** — 当时确有可选项

三条缺一，**不**写 ADR。ADR 格式见 `docs/agents/domain.md`。

`docs/adr/` 目录**懒创建**：第一次有 ADR 才建。

## 收尾

对齐结束时，给用户三个出口：

1. **直接干**：去 [`tdd-loop`](../tdd-loop/SKILL.md)（小改）
2. **静默成文**：去 [`domain-doc`](../domain-doc/SKILL.md)（综合成 docs/<topic>.md）
3. **落 Problem**：去 [`plan-to-problems`](../plan-to-problems/SKILL.md)（拆 vertical slice）

## 与其它 skill 的关系

- 上游：用户自然语言 / 一条 `Status: needs-info` 的 Problem
- 下游：[`domain-doc`](../domain-doc/SKILL.md) / [`plan-to-problems`](../plan-to-problems/SKILL.md) / [`tdd-loop`](../tdd-loop/SKILL.md)
- 副产品：`CONTEXT.md` 增订、可选的 `docs/adr/NNNN-*.md`
