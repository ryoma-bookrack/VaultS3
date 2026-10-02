---
name: tdd-loop
description: 用红-绿-重构循环实现功能或修 bug；以 vertical slice / tracer bullet 推进，一测一实现。当用户要 TDD、提到红绿重构、想要 integration-style 测试、或要测试驱动开发时使用。开写前必跑 capability-first verify；收尾自动跑 tdd-review（只列不改，不挡 done）。
license: MIT
---

# tdd-loop

来源：[mattpocock/skills](https://github.com/mattpocock/skills) 的 `tdd`（MIT）。本套件约定：

- **测试命令不写死**：从目标仓的 `package.json` / `Makefile` / `README` / CI 配置 / 用户指定推断（如 `npm test`、`pnpm vitest`、`cargo test`、`pytest` 等）
- 单测、集成测、端到端测均用同一节奏；不区分「单元 / 集成 SKILL」
- 实现完成时不写「验收报告」——把 `Verify:` 列表的勾选直接 inline 进 Problem 末尾
- Problem 状态变更：进入本 skill 改 `Status: in-progress`；红绿全过且 `Verify:` 全勾时改 `Status: done`
- **开写前**必跑 [`capability-first`](../capability-first/SKILL.md) **verify**（无豁免）
- **收尾**自动跑 [`tdd-review`](../tdd-review/SKILL.md)（只列不改；**不**阻止 `done`）

## 前置

须已跑过 **setup-agent-step**。若缺少 `docs/agents/*` 或根 `CONTEXT.md`，**停下来**，提示用户先跑 `/setup-agent-step`，不要自行补脚手架。

## 哲学

**核心**：测试**通过公共接口**验证**行为**，不是测实现细节。代码可全换，测试不该跟着挂。

**好测试** 是 integration-style：跑真实代码路径，通过公共 API 调；描述「系统**做什么**」，不描述「系统**怎么做**」。一个好测的名字读起来像 spec —— `user can checkout with valid cart` 一眼看出能力存在。

**坏测试** 与实现耦合：mock 内部协作者、测私有方法、绕过接口直查数据库。**告警信号**：重构后行为没变但测挂了——你测的是实现不是行为。

## 反模式：水平切片

**不要**先写所有测试，再写所有实现。这种「水平切片」会产生**烂测试**：

- 批量写的测试在测**想象中的**行为，不是**实际**行为
- 测的是「形状」（数据结构、签名），不是用户行为
- 对真实变化失敏：行为坏了它还过，行为对了它反挂
- 没看实现就先承诺接口形状，跑在你的车灯前面了

**正确节奏**：vertical slice via tracer bullets。**一测 → 一实现 → 循环**。每一测都是上一轮经验的回响。

```
错：red(t1,t2,t3,t4,t5) → green(impl1..impl5)
对：red(t1)→green(impl1)→red(t2)→green(impl2)→...
```

## 流程

### 0. Capability verify（必跑，在写任何测试/实现之前）

调用 [`capability-first`](../capability-first/SKILL.md) **verify**，对照当前 Problem 的 `## Capability decision`：

| Result | 行为 |
|---|---|
| **confirm** | 继续下方计划 / 红绿 |
| **drift** | **停写**；更新 Decision 或退回 [`plan-to-problems`](../plan-to-problems/SKILL.md)；再次 verify 通过前禁止编码 |
| **escalate** | **停写**；HITL（尤其是需要新依赖时）；**禁止**擅自安装依赖或改锁文件 |

若 Problem 无 `## Capability decision`：先跑 capability-first **decide**（或退回 plan），拍板写入后再 verify——**不要**裸奔进红绿。

实现过程中发现 Decision 失效（例如必须加库）→ 立即按 `escalate` 处理，不得静默改路线。

### 1. 计划

读相关代码时**用领域术语**（根 `CONTEXT.md`）；尊重 `docs/adr/` 已有决策。

先确认本仓如何跑测试（读 `package.json` scripts、`Makefile`、README、CI，或问用户）。

写任何代码前：

- [ ] capability-first verify = `confirm`
- [ ] 与用户确认要改 / 加哪个公共接口
- [ ] 与用户确认**先测哪些行为**（按重要性排）
- [ ] 主动寻找 **deep module** 机会（小接口、深实现）
- [ ] 为可测性设计接口
- [ ] 列要测的**行为**（**不**列实现步骤）
- [ ] 取得用户对计划的批准
- [ ] 实现计划与 `## Capability decision` 的 Approach 一致（reuse / 已批准的 add-dep / diy）

问用户：「公共接口该长什么样？哪些行为最值得测？」

**你不能什么都测**。和用户确认优先级；测关键路径与复杂逻辑，不测每个边角。

### 2. Tracer bullet

写**一个**测试，确认系统的**一件事**：

```
RED:   写第一个行为的测试 → 测失败
GREEN: 写最小代码让它过 → 测通过
```

这是 tracer bullet —— 证明端到端通路打通。GREEN 阶段只写让当前测试通过的最小代码，且不超出已确认的 Capability decision。

### 3. 增量循环

对每个剩余行为：

```
RED:   写下一个测试 → 失败
GREEN: 最小代码让它过 → 通过
```

规则：

- 一次一测
- 只写够当前测试通过的代码
- **不预期**未来的测试
- 测试聚焦可观察行为
- **不**引入未在 Decision 中批准的新依赖

### 4. 重构

所有测试都绿后，找重构机会：

- 抽公共
- 加深模块（把复杂度搬到简单接口背后）
- 自然时机下应用 SOLID
- 思考新代码揭示了既有代码的什么
- 每一步重构后跑测

**RED 期间不重构**。先到 GREEN。

### 5. Verify 勾选 + Lean review + done

红绿全过、`Verify:` 列表全勾时：

1. 在 Problem 末尾追加 `## Verification`（见下）
2. **自动**调用 [`tdd-review`](../tdd-review/SKILL.md)：对本次 diff 出精简清单，写入 Problem `## Lean review`
3. 将 `Status:` 改为 `done`（**即使** Lean review 仍有建议项——审查不挡 done）
4. 若用户要求根据审查改代码：再开一轮红绿 / 手工修改；可再次手动跑 tdd-review

## 每轮 checklist

```
[ ] 测试描述行为，不是实现
[ ] 测试只用公共接口
[ ] 测试能在内部重构后存活
[ ] 当前测试代码量最小
[ ] 没加 speculative 功能
[ ] 未引入未批准依赖；实现符合 Capability decision
```

## 与 Problem 的协作

进入本 skill 时把当前 Problem 的 `Status:` 改 `in-progress` 并加 `Owner: <agent-id>`。

红绿全过、`Verify:` 列表全勾时改 `Status: done`，并在 Problem 末尾追加：

```markdown
## Verification

- [x] <Verify 项 1> — <一两句证据，如实际跑过的测试命令>
- [x] <Verify 项 2> — <...>

## Lean review

Date: <ISO date>
net: -<N> lines possible. | Lean already. Ship.

- `path:L..: tag: ...`
```

**未通过**的 Verify 项保持 `- [ ]` 并写一句原因；若有 `- [ ]` 残留，`Status` 不许设 `done`。  
Lean review 的未处理项**不**阻止 `done`。

## 与其它 skill 的关系

- 上游：[`plan-to-problems`](../plan-to-problems/SKILL.md) 出的 `ready-for-agent` Problem；或用户直接给的需求
- 必调：[`capability-first`](../capability-first/SKILL.md)（verify；缺 Decision 时先 decide）
- 收尾必调：[`tdd-review`](../tdd-review/SKILL.md)（也可随时手动）
- 平行：bug 处理切到 [`diagnose`](../diagnose/SKILL.md)
- 下游：发现「测不住」的架构问题 → 收尾时移交 [`improve-architecture`](../improve-architecture/SKILL.md)

## 不要做的事

- 不要在 RED 期间重构
- 不要为单测可达性而抽 pure function，让真 bug 留在调用链里没人测（无 locality）
- 不要 mock 内部协作者；mock 限于不可控的外部依赖
- 不要先把所有测一次写完
- 不要跳过 capability-first verify，或在 drift/escalate 时继续编码
- 不要擅自安装新依赖
- 不要让 tdd-review 自动改代码；也不要因审查建议而拒绝标 `done`（除非用户要求先改）
