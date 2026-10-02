---
name: tdd-review
description: >
  精简审查：只找过度工程与可删复杂度（对标 ponytail-review）。对当前 diff 或
  指定范围给出一行一条的删除/收缩清单；不改代码、不挡 Status: done。
  tdd-loop 收尾自动调用；也可随时手动「tdd-review / 有什么可删 / 是不是过度工程」。
license: MIT
---

# tdd-review

来源协议对齐 [ponytail-review](https://github.com/DietrichGebert/ponytail)（MIT）：专打过度工程，不管正确性 / 安全 / 性能。

**只列不改。** 不自动 apply。不阻止 Problem 标 `done`（由 [`tdd-loop`](../tdd-loop/SKILL.md) 决定何时 done）。

## 前置

须已跑过 **setup-agent-step**。若缺少脚手架，**停下来**提示 `/setup-agent-step`。

## 触发

- **自动**：[`tdd-loop`](../tdd-loop/SKILL.md) 在红绿通过、`Verify:` 勾选之后、写 `Status: done` 之前调用
- **手动**：用户说「tdd-review」「有什么可删」「是不是过度工程」「simplify review」等

## 范围

- 默认：当前工作区与本 Problem 相关的 `git diff`（含未暂存）
- 手动时可指定路径 / 文件

## 格式

一行一条：

`<path>:L<start>-<end>: <tag>: <要砍什么>. <用什么替代或 nothing>.`

单文件可省略 path。Tags：

| Tag | 含义 |
|---|---|
| `delete:` | 死代码、未用到的灵活性、投机功能。替代：nothing |
| `stdlib:` | 手写了标准库已有的东西。点名 stdlib API |
| `native:` | 依赖或代码做了平台已有能力。点名原生特性 |
| `yagni:` | 单实现接口、无人设置的配置、只有一个调用方的层 |
| `shrink:` | 同逻辑更短写法。给出更短形式 |

### 好例子

```
L12-38: stdlib: 27-line email validator. "@" in email + confirmation mail.
auth.ts:L4: native: moment.js for one format call. Intl.DateTimeFormat, 0 deps.
repo.py:L88: yagni: AbstractRepository with one impl. Inline until a second exists.
L52-71: delete: retry wrapper around idempotent local call. Nothing replaces it.
L30-44: shrink: manual loop builds dict. dict(zip(keys, values)), 1 line.
```

### 坏例子

冗长「也许可以考虑是否……」——禁止。

## 评分

结尾一行：`net: -<N> lines possible.`（能砍则估；砍不动则 `Lean already. Ship.`）

## 与 Capability decision 的关系

- Decision 已批准的 `add-dep` / 明确保留的 diy **不要**标成必须删除
- 若 diff 引入了 **未在 Decision 中批准** 的新依赖或明显重复造轮子 → 用 `native:` / `stdlib:` / `yagni:` 标出（仍只列不改）
- 能力选型门禁属于 [`capability-first`](../capability-first/SKILL.md)；本 skill 不重新跑 decide

## 写入 Problem（tdd-loop 自动调用时）

追加（或覆盖旧的）一节，**不**因此阻止 `done`：

```markdown
## Lean review

Date: <ISO date>
net: -<N> lines possible. | Lean already. Ship.

- `path:L..: tag: ...`
- ...
```

手动触发且用户未指定 Problem 时：只在对话输出即可。

## 边界

- **范围内**：过度工程与复杂度
- **范围外**：正确性 bug、安全漏洞、性能 —— 交给常规 review / [`diagnose`](../diagnose/SKILL.md)
- 单个 smoke / assert 自检、以及 Problem `Verify:` 所需测试 **不是** bloat，勿标 `delete:`
- 不 apply 修复

## 与其它 skill 的关系

- 由 [`tdd-loop`](../tdd-loop/SKILL.md) 收尾自动调用；也可独立手动跑
- 与 [`capability-first`](../capability-first/SKILL.md) 互补：一个管动手前选型，一个管动手后删减曝光
