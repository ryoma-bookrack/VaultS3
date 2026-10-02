#!/usr/bin/env node
// plan-to-problems/scripts/new-problem.mjs
//
// 在目标仓 .scratch/<problem-group>/ 下创建下一编号的 Problem markdown。
//
// 用法（在目标项目根执行）：
//   node <path-to-this-skill>/scripts/new-problem.mjs <problem-group> <slug> [--title "..."]
//
// project root：从 process.cwd() 向上找 .git；找不到则用 cwd。
// problem-group / slug 必须是 kebab-case：[a-z0-9][a-z0-9-]*。
// 编号自动取该 Problem Group 下现有最大编号 + 1（三位补零）。

import { readdirSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const findProjectRoot = (start) => {
  let dir = resolve(start);
  while (true) {
    if (existsSync(join(dir, ".git"))) return dir;
    const parent = dirname(dir);
    if (parent === dir) return resolve(start);
    dir = parent;
  }
};

const repoRoot = findProjectRoot(process.cwd());

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error("Usage: new-problem.mjs <problem-group> <slug> [--title \"...\"]");
  process.exit(1);
}

const [problemGroup, slug, ...rest] = args;
let title = "";
for (let i = 0; i < rest.length; i++) {
  if (rest[i] === "--title" && rest[i + 1]) {
    title = rest[i + 1];
    i++;
  }
}

const kebab = /^[a-z0-9][a-z0-9-]*$/;
if (!kebab.test(problemGroup)) {
  console.error(`problem-group 必须 kebab-case：${problemGroup}`);
  process.exit(1);
}
if (!kebab.test(slug)) {
  console.error(`slug 必须 kebab-case：${slug}`);
  process.exit(1);
}

const groupDir = resolve(repoRoot, ".scratch", problemGroup);
mkdirSync(groupDir, { recursive: true });

let maxN = 0;
if (existsSync(groupDir)) {
  for (const name of readdirSync(groupDir)) {
    const m = name.match(/^(\d{3})-/);
    if (m) maxN = Math.max(maxN, Number(m[1]));
  }
}
const nextN = String(maxN + 1).padStart(3, "0");
const fileName = `${nextN}-${slug}.md`;
const filePath = resolve(groupDir, fileName);

if (existsSync(filePath)) {
  console.error(`已存在：${filePath}`);
  process.exit(1);
}

const titleLine = title || slug.replace(/-/g, " ");

const body = `# ${titleLine}

Status: needs-triage
Type: AFK
Verify:
  - <在 ready-for-agent 之前必须填好这里>

## What to build

简明描述这一 vertical slice 的端到端行为。

## Acceptance criteria

- [ ] 标准 1
- [ ] 标准 2

## 范围外（非目标）

明确不做的事。

## Capability decision

Mode: decide
Approach: <reuse | add-dep | diy — 由 capability-first decide 拍板后填写>
Blocked-on-user: true
Recommended: <reuse | add-dep | diy>

### Inventory
- In-repo: <待 capability-first decide>
- Installed deps: <待 capability-first decide>
- Stdlib/native: <待 capability-first decide>
- Gap: <待 capability-first decide>

### Comparison
| approach | option | fit | cost | risk |
|---|---|---|---|---|
| reuse | | | | |
| diy | | | | |
| add-dep | | | | |

### Decision notes
- <用户拍板要点；diy 时写明为何不引库；add-dep 时写包名与边界>
`;

writeFileSync(filePath, body);
console.log(filePath);
