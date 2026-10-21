# Open decisions

| ID | Question | Option A | Option B | Work affected | Decides | Status |
|---|---|---|---|---|---|---|
| D1 | Who authors the prediction? | Keep harness predictions apart from the team's (guide p7) | The approved plan is the prediction (user practice) | Every round's `rNN.yaml` author line | The user | Default B: "Claude, approved by the user in plan mode" |
| D2 | What is the name of the new frontmatter field? | `tools:` (matches `commands:` and `files:`) | `tool_names:` or `on_tools:` (no clash with agent definitions) | The engine lane and every way that uses it | The upstream maintainer | Default A, with the alternatives listed in ADR-704 |
| D3 | Which base branch? | `feat/eval-ways` (the user's first pick) | Fresh `origin/main` (needed for an engine PR) | The whole branch | The user | Default B, after the hooks correction |

## Round 1 defaults

| Item | Default | Why |
|---|---|---|
| Way id | `evaluative/spe` | Upstream already has the live `evaluative/` domain. The personal copy uses the same id, so it shadows cleanly |
| Shipped matcher | `EnterPlanMode\|ExitPlanMode\|Workflow` | Spawning the binary on every tool call (`.*`) costs time on each call |
| Phase field | `tool_phase: pre\|post\|both`, default `pre` | ADR-188 item 2: a Post lane skips failures |
| Trial and judge model | Opus 5.5 | House rule. Never Haiku |
