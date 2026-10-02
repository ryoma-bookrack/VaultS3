---
name: diagnose
description: 顽固 bug / 性能回退的系统化诊断循环——构造反馈环 → 复现 → 假设 → 插桩 → 修 → 回归测。用户说 diagnose / debug / 报告 bug / 性能回退时使用。
license: MIT
---

# diagnose

来源：[mattpocock/skills](https://github.com/mattpocock/skills) 的 `diagnose`（MIT）。本套件约定：

- **测试 / 反馈命令不写死**：从目标仓的 `package.json` / `Makefile` / `README` / CI / 用户指定推断
- 浏览器端可用 Cursor IDE Browser MCP 或 Playwright 等；不要写 HITL 脚本兜底（除非真的构造不出环）

探索代码时用根 `CONTEXT.md` 建立心智模型；检查涉及区域的 `docs/adr/`。

## 前置

须已跑过 **setup-agent-step**。若缺少 `docs/agents/*` 或根 `CONTEXT.md`，**停下来**，提示用户先跑 `/setup-agent-step`，不要自行补脚手架。

## Phase 1 — 构造反馈环

**这是本 skill 的灵魂**。其它都是机械动作。**有**一条快速、确定、agent-runnable 的 pass/fail 信号——bisection、假设检验、插桩都只是消费这条信号。**没有**——盯着代码看也没用。

在这里花成倍的力气。**激进、有创意、不放弃。**

### 构造顺序（粗略优先级）

1. **失败测试**，挑能触达 bug 的 seam（单测 / 集成 / e2e）
2. **curl / HTTP 脚本** 打本地 dev server
3. **CLI 调用** + fixture 输入，diff stdout 与 known-good snapshot
4. **headless 浏览器脚本**（Playwright / Puppeteer），断言 DOM / console / network
5. **回放 captured trace**：把真实请求 / payload / event log 存盘，离线在代码路径上回放
6. **一次性 harness**：拉起最小子系统（一个服务 + mocked deps），一个函数调用就触发 bug
7. **property / fuzz 循环**：bug 是「偶发输出错误」 → 1000 个随机输入找失败模式
8. **bisection harness**：bug 出现在两个 known state 之间（commit、dataset、版本）→ 自动化 "boot at X → check → repeat"，给 `git bisect run`
9. **differential 循环**：同输入跑两份（旧版 vs 新版 / 两种 config），diff 输出
10. **HITL bash 脚本**：最后一招。必须人点击时，用 hitl loop 模板**驱动他们**，让循环仍然结构化

### 把环本身当产品迭代

有了**一个**环后追问：

- 能更快吗？（缓存启动、跳无关 init、缩窄测试范围）
- 信号更锐吗？（断言**具体症状**，不是「没崩」）
- 更确定吗？（钉时间、seed RNG、隔离文件系统、冻结网络）

30 秒 flaky 的环不比没有强多少。2 秒确定的环是调试超能力。

### 非确定性 bug

目标不是「干净 repro」而是**更高的复现率**。循环 100 次、并行、加压、缩窄时序窗口、注入 sleep。50% flake 可调；1% 不可调——把率拉到可调为止。

### 真的构造不出来时

**显式停下来**说「我构造不出反馈环」。列出尝试过的方案。向用户索要：(a) 能复现的环境、(b) captured 工件（HAR、log dump、core dump、带时间戳的录屏）、(c) 加临时生产插桩的权限。**不要**没有环就进 Phase 2 瞎假设。

不进 Phase 2，直到你有相信的环。

## Phase 2 — 复现

跑环。看 bug 出现。

确认：

- [ ] 环产出的失败模式是**用户**描述的那个——不是附近某个**类似**的失败。错 bug = 错修。
- [ ] 失败在多次运行间可复现（或对非确定性 bug，复现率高到可调）
- [ ] 已捕获精确症状（错误消息、错误输出、慢时序），后续 phase 可据此验证修复是否真解决

不复现，不进下一步。

## Phase 3 — 假设

测试任何一个前先产 **3–5 个排序的假设**。单一假设会锚到第一个貌似合理的想法上。

每个假设**必须 falsifiable**：陈述它的预言。

> 格式：「如果 <X> 是原因，那 <改 Y> 会让 bug 消失 / <改 Z> 会让 bug 更糟。」

陈述不出预言的就是 vibe——丢掉或锐化。

**把排序的假设列表给用户看，再开始测**。用户常有领域知识能瞬间重排或划掉已排除的。用户 AFK 就按你的排序走。

## Phase 4 — 插桩

每个探针**对应** Phase 3 的某条预言。**一次只改一个变量**。

工具优先级：

1. **debugger / REPL inspection** 如果环境支持。一个断点胜十条 log。
2. **靶向 log** 打在能区分假设的边界
3. **决不「全打 log 再 grep」**

**每条 debug log 加唯一前缀**，如 `[DEBUG-a4f2]`。收尾时 `grep` 这个前缀一次性删干净。未标记的 log 留下；标记的死掉。

**性能分支**：性能回退用 log 通常错。改用：建 baseline 测量（timing harness、`performance.now()`、profiler、query plan），然后 bisect。**先测量，后修**。

## Phase 5 — 修 + 回归测

**先**写回归测**再**修——但**只有当存在正确的 seam 时**。

正确的 seam 是测试**在调用点真实场景下**触发 bug 的位置。如果唯一可达的 seam 太浅，在那里写回归测会给**假信心**。

**没正确 seam 本身就是结论**。记下来。代码架构在阻止 bug 被锁住。把这条 flag 给 Phase 6。

正确 seam 存在时：

1. 把最小化 repro 变成在那个 seam 的失败测
2. 看它失败
3. 应用修复
4. 看它通过
5. 把 Phase 1 的反馈环对**原始（未最小化）**场景再跑一次

## Phase 6 — 收尾 + 复盘

声明 done 前必须：

- [ ] 原始 repro 已不复现（重跑 Phase 1 的环）
- [ ] 回归测通过（或 seam 缺失已记录）
- [ ] 所有 `[DEBUG-...]` 插桩已删（`grep` 前缀）
- [ ] 一次性原型已删（或挪到明确标记的 debug 位置）
- [ ] **正确的那条假设**写进 commit / PR message——下一个调试者好学

**然后问：什么能预防这条 bug？** 答案涉及架构变更（缺好 seam、调用方纠缠、隐藏耦合）时，交棒 [`improve-architecture`](../improve-architecture/SKILL.md)，附具体发现。**修完再提**建议，不要修前提。

## 与 Problem 的协作

bug 修复一般来自 `.scratch/bugs/NNN-*.md` Problem。进入本 skill：`Status` 改 `in-progress`。修完且回归测通过：`Status: done`，Problem 末尾追加 `## Verification` 段（同 [tdd-loop](../tdd-loop/SKILL.md) 的约定）。

## 与其它 skill 的关系

- 上游：用户报的 bug / 一条 `bug` 类 Problem / 性能回退报告
- 平行：bug 修复的代码改动仍按 [`tdd-loop`](../tdd-loop/SKILL.md) 节奏
- 下游：架构层根因 → [`improve-architecture`](../improve-architecture/SKILL.md)
