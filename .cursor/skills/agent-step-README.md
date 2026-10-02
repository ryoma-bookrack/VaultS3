# agent-step

可分发的工程工作流 skill 套件：对齐 → 成文 → 落 Problem → TDD / 诊断 / 架构加深；并在拆片与实现时强制**能力优先**（复用 / 选型），收尾做精简审查。

许可见本目录 [LICENSE](./LICENSE)。

## 必须先 setup

**本套件不是开箱即用。** 安装到目标项目后，必须先显式运行 `/setup-agent-step`，铺好：

- `.cursor/rules/karpathy-guidelines.mdc`
- `.cursor/rules/agent-step-base.mdc`
- `AGENTS.md` 的 `## Agent skills` 块
- `docs/agents/{problem-tracker,triage-labels,domain}.md`
- 根 `CONTEXT.md`
- `.scratch/README.md`

其余 skill **假设**上述产物已存在。若缺失，应停下来引导用户跑 setup，不要自行半吊子补文件。

## 索引

| Skill | 触发 | 产出 |
|---|---|---|
| [setup-agent-step](./setup-agent-step/SKILL.md) | 首次接入；切换 tracker / 词汇 / 文档布局 | 上表脚手架 |
| [align-grill](./align-grill/SKILL.md) | 大改 / 歧义 / 缺共识 | 对齐结论；`CONTEXT.md` 增订；必要时 ADR |
| [domain-doc](./domain-doc/SKILL.md) | 对齐结束、需要静默综合成文 | `docs/<topic>.md` |
| [plan-to-problems](./plan-to-problems/SKILL.md) | 把计划/PRD 落到可执行 Problem | `.scratch/<problem-group>/NNN-<slug>.md`（含 Capability decision） |
| [capability-first](./capability-first/SKILL.md) | plan 每片 decide；tdd 开写前 verify；或用户要求先审已有能力 | 库存 + 对比表 / `confirm\|drift\|escalate` |
| [tdd-loop](./tdd-loop/SKILL.md) | 实现 / 修 bug | 红绿重构循环（vertical slice） |
| [tdd-review](./tdd-review/SKILL.md) | tdd 收尾自动；或手动精简审查 | 过度工程删减清单（只列不改；不挡 done） |
| [diagnose](./diagnose/SKILL.md) | bug / 性能 / 回退 | 复现→最小化→假设→插桩→修→回归 |
| [improve-architecture](./improve-architecture/SKILL.md) | 周期性 / 熵增信号 | 架构改造建议 + 落地 Problem |

## 主干顺序

```
安装套件 → setup-agent-step（一次性 / 改约定时重跑）
         → align-grill → domain-doc → plan-to-problems
                              │            └─ 每片 capability-first decide
                              ▼
                         tdd-loop
                              ├─ 开写前 capability-first verify
                              └─ 收尾 tdd-review（不挡 done）
                                              ↘ diagnose → improve-architecture
```

`setup-agent-step` 是前置一次性脚手架；其它 skill 按需触发，不强求全走。  
`capability-first` / `tdd-review` 在主干上由 plan / tdd **强制调用**（每个 Problem 无豁免）。

## 行为基线

所有 skill 之上恒套用 karpathy 四条（由 setup 写入 `.cursor/rules/karpathy-guidelines.mdc`）：**编码前思考 / 简洁优先 / 精准修改 / 目标驱动**。

当「多问对齐」节奏与 karpathy 的「小改不啰嗦」原则冲突时，**karpathy 优先**：琐碎改动可跳过 grill。  
**例外**：`capability-first` 对每个 Problem **不豁免**（与 grill 的琐碎跳过不同）。

能力优先补充约定：

- 先盘点本仓 / 已装依赖 / stdlib·原生，再考虑自研
- 不够时用对比表评估加成熟库 vs diy；**新依赖一律 HITL**
- tdd 不得静默改 Capability decision；drift/escalate 时停写

## 安装后用法

1. 将本套件装入目标 agent 的 skills 目录（如 Cursor `.cursor/skills/`）。
2. 在目标项目根运行 `/setup-agent-step`（或执行 `setup-agent-step/scripts/init-skills.mjs`）。
3. 按需触发其余 skill。

脚本从 `process.cwd()` 向上找 `.git` 作为 project root，不假设 skill 安装在 `repo/skills/` 下。

## 来源致谢

- 改写自 [mattpocock/skills](https://github.com/mattpocock/skills)（MIT）
- 行为基线沿用 [multica-ai/andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills)（MIT）
- 能力优先 / 精简审查协议借鉴 [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail)（MIT）；本套件不引入其档位插件，且「加依赖」改为显式 HITL 对比
