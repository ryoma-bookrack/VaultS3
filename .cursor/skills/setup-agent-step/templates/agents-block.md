## Conventions

### Basic conventions

- AGENTS content is written for agents to read. Keep it clear, concise, and default to English.

## Agent skills

### Behavioral baseline

Karpathy guidelines apply to every change. See [.cursor/rules/karpathy-guidelines.mdc](.cursor/rules/karpathy-guidelines.mdc).

### Problem tracker

Local markdown under `.scratch/<problem-group>/NNN-<slug>.md`. See [docs/agents/problem-tracker.md](docs/agents/problem-tracker.md).

### Triage labels

Inline `Status:` headers in each `.scratch/*.md`. See [docs/agents/triage-labels.md](docs/agents/triage-labels.md).

### Domain docs

Single-context. Glossary at root [CONTEXT.md](CONTEXT.md); ADRs at `docs/adr/` (lazy). See [docs/agents/domain.md](docs/agents/domain.md).

### Skills index

This repo uses the **agent-step** suite. Run `setup-agent-step` first. Main pipeline:

`align-grill` → `domain-doc` → `plan-to-problems` (each slice gets `capability-first` decide) → `tdd-loop` (verify before coding; `tdd-review` at wrap-up); side paths: `diagnose` / `improve-architecture`.

- **capability-first**: Before coding, inventory in-repo code / installed deps / stdlib·native; compare reuse / add-dep / diy; new dependencies always require HITL.
- **tdd-review**: Lean review (list only, no edits); runs automatically at tdd wrap-up, or manually; does not block `done`.

Trigger and composition details live in each skill's `SKILL.md` and the convention docs under [docs/agents/](docs/agents/).
