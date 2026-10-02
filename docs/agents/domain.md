# Domain docs — single-context

本仓**只有一个领域上下文**。术语表与架构决策记录的固定布局如下（由 `setup-agent-step` 铺设）：

```
<project-root>/
├── CONTEXT.md            # 全仓共用术语表（glossary）
└── docs/adr/             # 架构决策记录（lazy create）
    ├── 0001-<slug>.md
    └── 0002-<slug>.md
```

## `CONTEXT.md` 的用法

- **只放术语 / glossary**：每条术语 `### <Term>` 一段定义；**不放**实现细节、不放规格、不放草稿。
- **当场更新**：align-grill 在每条术语对齐结束时**立即**写入 `CONTEXT.md`，不批量积压。
- **术语冲突**：用户用词与 `CONTEXT.md` 已有定义冲突时，立刻指出并请求决议。
- **大小写 / 复数规约**：术语首字母大写、不变复数（"Project" 不是 "Projects"）。

## `docs/adr/` 的用法

只在以下三条**同时**成立时写一份新 ADR：

1. **难以回滚**：决定改主意的代价是大的；
2. **缺上下文会惊讶**：未来读者会问「为什么当时这么做」；
3. **是真权衡的结果**：当时确实有可选项，挑了 A 不是因为没看到 B。

三条只要缺一条，**不**写 ADR。

ADR 格式：

```markdown
# ADR-<NNN>: <Title>

Date: <YYYY-MM-DD>
Status: accepted | superseded by ADR-NNN | deprecated

## Context

为什么需要做这个决定？当时面对的约束是什么？

## Decision

我们决定 ...

## Consequences

正向 / 负向后果各列若干条。
```

`docs/adr/` 目录**懒创建**：第一次有 ADR 才建。

## 与其它 skill 的关系

- **align-grill** 是 `CONTEXT.md` 和 ADR 的主要写入者。
- **domain-doc** / **plan-to-problems** / **tdd-loop** 在命名变量、写文档、写测试名时**强制使用** `CONTEXT.md` 中的术语。
- **improve-architecture** 在提议改造前会读全 `docs/adr/`，避免和已 accepted 的决策矛盾。

## 不要做的事

- 不要在 `CONTEXT.md` 里写「如何实现」。
- 不要把 PRD / Problem 内容塞进 ADR。
- 不要在 `docs/adr/` 之外的位置写 ADR-NNN 的副本。
