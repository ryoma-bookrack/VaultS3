---
name: domain-doc
description: 把当前会话上下文与代码理解综合成一份文档，落到 docs/<topic>.md。不再访谈用户——只综合已知。当用户要从当前对齐结果出 PRD / 设计文档时使用。
license: MIT
---

# domain-doc

来源：[mattpocock/skills](https://github.com/mattpocock/skills) 的 `to-prd`（MIT）。本套件约定：产出物是 `docs/<topic>.md`；仅在写完之后由用户决定是否进 [`plan-to-problems`](../plan-to-problems/SKILL.md)。

## 前置

须已跑过 **setup-agent-step**。若缺少 `docs/agents/*` 或根 `CONTEXT.md`，**停下来**，提示用户先跑 `/setup-agent-step`，不要自行补脚手架。

## 触发条件

- 用户说「写 PRD / 写需求 / 写设计文档 / 把我们刚才聊的写下来」
- 上一步在 [`align-grill`](../align-grill/SKILL.md) 中已经对齐
- 需要把会话上下文转成长期可读的资产

**不触发**：未对齐的草案；冲突先回到 [`align-grill`](../align-grill/SKILL.md)。

## 过程

### 1. 探索代码

如果还没读过相关代码，先读。文档全文**强制**使用目标仓根 `CONTEXT.md` 中的术语；尊重 `docs/adr/` 已有决策（若有冲突则停下来，回到 [`align-grill`](../align-grill/SKILL.md) 评估是否要 supersede ADR）。

### 2. 草绘模块

勾画要新建 / 修改的主要模块。**主动寻找 deep modules**（小接口、深实现、稳定）的机会。

**Deep module**（[John Ousterhout, A Philosophy of Software Design]）：通过简单接口暴露大量功能；变化少；易测试。
**Shallow module**：接口几乎和实现一样复杂；删掉后复杂度只是移位，没消失。

与用户确认模块边界、确认哪些模块要写测。

### 3. 写文档

用以下模板写到 `docs/<topic>.md`（kebab-case；topic 用领域术语，参考 `CONTEXT.md`）。

不发布到 issue tracker。

```markdown
# <Topic>

> 状态：draft | accepted | superseded by <other-topic>
> 日期：<YYYY-MM-DD>

## Problem

用户视角的问题陈述。

## Solution

用户视角的解决方案。

## User stories

编号列表，长且充分：

1. As a <actor>, I want <feature>, so that <benefit>.

## Implementation decisions

- 主要模块清单（用 CONTEXT.md 术语）
- 关键接口形状（**不**贴具体文件路径或代码——会过期）
- 架构 / schema / 协议决策

例外：原型产出的 state machine / reducer / schema / type 这种「决策密集且语义稳定」的片段可以 inline，并注明「来自原型」。**不**贴可工作的 demo，**只**贴决策密集部分。

## Testing decisions

- 什么算「好测试」（只测外部行为，不测实现细节）
- 哪些模块需要测
- 仓内类似测试的参考

## Out of scope

明确不做的事。

## Further notes

补充说明。
```

### 4. 收尾

把文件路径报给用户。**不**自动调下游 skill；由用户决定是否进 [`plan-to-problems`](../plan-to-problems/SKILL.md)。

## 与其它 skill 的关系

- 上游：[`align-grill`](../align-grill/SKILL.md) 的对齐结果
- 下游：[`plan-to-problems`](../plan-to-problems/SKILL.md) 把本文档拆成 `.scratch/` Problem
- 关系：本 skill **不**发布到 issue tracker
