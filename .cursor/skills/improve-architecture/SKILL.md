---
name: improve-architecture
description: 在代码库中找「加深机会」（deepening opportunities）——把浅模块变深，目标是可测性与 AI 可导航性。读 CONTEXT.md 和 docs/adr/ 后探索代码，呈现候选项，对选中候选进入 grilling 决策树。用户要做架构改造、找重构机会、收敛紧耦合模块、提升可测性时使用；周期性运行（如每隔几天）。
license: MIT
---

# improve-architecture

来源：[mattpocock/skills](https://github.com/mattpocock/skills) 的 `improve-codebase-architecture`（MIT）。本套件约定：

- 候选改造产出**仍是 Problem**：进 [`plan-to-problems`](../plan-to-problems/SKILL.md) 切成 `.scratch/architecture/NNN-*.md`
- 不引入新词汇——继续用本 SKILL 的术语 + `CONTEXT.md` 中的领域术语

## 前置

须已跑过 **setup-agent-step**。若缺少 `docs/agents/*` 或根 `CONTEXT.md`，**停下来**，提示用户先跑 `/setup-agent-step`，不要自行补脚手架。

## Glossary（架构术语，固定用词）

在每条建议中**严格**使用这套术语。不要漂移到 "component / service / API / boundary"。

- **Module** — 任何有接口与实现的东西（函数、类、包、切片）。
- **Interface** — 调用者使用模块**必须知道的一切**：类型、不变量、错误模式、顺序、配置。不只是类型签名。
- **Implementation** — 模块内部的代码。
- **Depth** — 接口上的杠杆。**Deep** = 高杠杆（小接口 + 大量行为）。**Shallow** = 接口几乎与实现同样复杂。
- **Seam** — 接口所在之处；可以不动现场修改行为的位置。**用这个词，不用 "boundary"**。
- **Adapter** — 在某 seam 上具体满足接口的实现。
- **Leverage** — 调用者从 depth 中得到的东西。
- **Locality** — 维护者从 depth 中得到的东西：变更、bug、知识集中在一处。

关键原则：

- **Deletion test**：想象删掉这个模块。如果复杂度**消失**，它本就是 pass-through。如果复杂度**在 N 个调用方重现**，它确实在干活。
- **接口即测试面**。
- **一个 adapter = 假想 seam；两个 adapter = 真 seam**。

本 skill _被_ 项目领域模型**通知**。领域语言给好 seam 命名；ADR 记录的不再重审。

## 流程

### 1. 探索

**先**读根 `CONTEXT.md` 与改造区域涉及的 `docs/adr/`。

然后用 Explore subagent 走查代码。**不**用刚性启发式——有机地走，标注**摩擦点**：

- 哪里理解一个概念要在很多小模块之间来回跳？
- 哪里模块是**浅**的——接口几乎和实现一样复杂？
- 哪里 pure function 是「为可测性抽出来」的，但真 bug 藏在调用方（没 locality）？
- 哪里紧耦合模块在 seam 上漏边界？
- 哪里没测，或难以**通过现有接口**测？

对怀疑是浅模块的，跑 deletion test。

### 2. 呈现候选

编号列表，每条候选：

- **Files** — 涉及哪些文件 / 模块
- **Problem** — 为什么当前架构有摩擦
- **Solution** — 平白英文描述要改什么
- **Benefits** — 用 locality 与 leverage 解释；附「测试会如何改善」

**对领域用 `CONTEXT.md` 词汇，对架构用本 SKILL 的 Glossary**。如果 `CONTEXT.md` 定义了 "Order"，就说 "the Order intake module"，**不**说 "the FooBarHandler"，也**不**说 "the Order service"。

**与 ADR 冲突**：候选与已有 ADR 矛盾时，只在**摩擦足够大、值得重开 ADR** 时呈上。明确标记（"contradicts ADR-0007 — but worth reopening because …"）。**不**穷举每条 ADR 禁止的理论重构。

**此时不提议接口**。问用户：「你想探哪一项？」

### 3. Grilling 循环

用户挑了候选 → 进入 [`align-grill`](../align-grill/SKILL.md) 风格的对话。走决策树：约束、依赖、加深后模块的形状、seam 背后是什么、哪些测试能存活。

副作用在决策结晶时**就地**发生：

- **加深后的模块名不在 `CONTEXT.md`？** 当场写入 `CONTEXT.md`（与 [`align-grill`](../align-grill/SKILL.md) 同纪律）。
- **对话中锐化了某个模糊词？** 就地更新 `CONTEXT.md`。
- **用户用「承重理由」否决候选？** 提议写 ADR：_"要不要把这条记成 ADR，避免下次架构 review 又提一遍？"_ 只在「理由确实是未来探索者需要的」时提议；省略 ephemeral（「现在不值」）和 self-evident 的。
- **想探多个接口形状？** 与用户列出 2-3 个候选接口，用 deletion test / 测试面对比。

### 4. 落地

决策定稿后，**不**当场写代码。进 [`plan-to-problems`](../plan-to-problems/SKILL.md)，把架构改造切成 vertical slice Problem，每片单独跑 [`tdd-loop`](../tdd-loop/SKILL.md)。

## 与其它 skill 的关系

- 上游：周期性触发 / [`diagnose`](../diagnose/SKILL.md) 收尾时移交的架构发现 / [`tdd-loop`](../tdd-loop/SKILL.md) 发现「测不住」
- 平行：每个候选改造的 grilling 阶段复用 [`align-grill`](../align-grill/SKILL.md) 的纪律
- 下游：[`plan-to-problems`](../plan-to-problems/SKILL.md) 切片 → [`tdd-loop`](../tdd-loop/SKILL.md) 实现

## 不要做的事

- 不要在第 1 步呈现候选时就提议接口
- 不要在 grilling 期间写实现代码
- 不要漂移本 SKILL 的 Glossary 用词
- 不要重审已 accepted 的 ADR——除非摩擦真大到值得重开
