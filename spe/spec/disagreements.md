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

## Round 2 defaults (autonomous respec)

| Item | Default | Why |
|---|---|---|
| P1 C root plus children | Adopted as config D | Tests whether the children add anything on top of a full root |
| P2 gate order in the predict child | Adopted, in D | r01 F3 |
| P3 bands | Adopted. Config C2 is C plus a bands rule. r02.yaml carries bands | r01 F2 |
| P4 last F number in T4 and T6, strict fentry | Adopted | r01 F1 |
| P5 way block after the scenario | Adopted for all configs | r01 F4 |
| P6 harder tasks | In part: H1 to H5 and a fixed n of 8. Paraphrases go to round 3 | Agent cap |
| P7 real tool trials | Deferred to round 3 | The `when: file_exists` gate checks the session project, so a fixture elsewhere would not measure the live stack fairly |
| P8 live tools: lane | Deferred | The user chose to wait for an upstream update |
| Config B | Dropped, D replaces it | r01 result |
| Engine live | Not in round 2 | The repair would replace the whole live ways corpus and install the attend plugin |
