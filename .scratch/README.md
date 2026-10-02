# .scratch — 本仓 Problem tracker

Problem 以 markdown 文件存在，路径 `<problem-group>/NNN-<slug>.md`。

格式与状态机详见 [docs/agents/problem-tracker.md](../docs/agents/problem-tracker.md)
与 [docs/agents/triage-labels.md](../docs/agents/triage-labels.md)。

新建 Problem：在目标项目根运行 plan-to-problems 的脚本：

```bash
node <path-to-plan-to-problems>/scripts/new-problem.mjs <problem-group> <slug>
```
