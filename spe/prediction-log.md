# Prediction log

## Round 1 (2026-10-21)

Prediction: [predictions/r01.yaml](predictions/r01.yaml), committed at ff04b736 (18:47Z) before any build or trial. The full run started at 19:06Z.

The prediction gave no error band per number. So this log uses a rule set after the run: a hit is a measured value within 0.15 of the prediction. That is about one trial at n=5 to 7. See failures.md F2.

"Pre-registered" uses the checks as committed. "Regraded" uses the disclosed `fentry` variant in `grade.py` (failures.md F1). Verdicts use the pre-registered column.

### Pass rates

| Task | Config | Predicted | Measured (pre-registered) | Measured (regraded) | Verdict |
|---|---|---|---|---|---|
| T1 kickoff | A | 0.20 | 0.00 | 0.00 | miss |
| T1 kickoff | B | 0.90 | 0.86 | 0.86 | hit |
| T1 kickoff | C | 0.80 | 1.00 | 1.00 | miss |
| T2 respec | A | 0.20 | 0.00 | 0.00 | miss |
| T2 respec | B | 0.80 | 1.00 | 1.00 | miss |
| T2 respec | C | 0.70 | 1.00 | 1.00 | miss |
| T3 workflow script | A | 0.40 | 0.00 | 0.00 | miss |
| T3 workflow script | B | 0.80 | 1.00 | 1.00 | miss |
| T3 workflow script | C | 0.70 | 0.86 | 0.86 | hit |
| T4 close-out | A | 0.20 | 0.00 | 0.00 | miss |
| T4 close-out | B | 0.90 | 0.57 | 1.00 | miss |
| T4 close-out | C | 0.80 | 1.00 | 1.00 | miss |
| T5 unattended | A | 0.40 | 0.00 | 0.00 | miss |
| T5 unattended | B | 0.80 | 1.00 | 1.00 | miss |
| T5 unattended | C | 0.70 | 1.00 | 1.00 | miss |
| T6 trap | A | 0.60 | 0.14 | 1.00 | miss |
| T6 trap | B | 0.90 | 0.00 | 0.80 | miss |
| T6 trap | C | 0.90 | 0.57 | 0.86 | miss |
| T7 approved plan | A | 0.30 | 0.00 | 0.00 | miss |
| T7 approved plan | B | 0.90 | 0.14 | 0.14 | miss |
| T7 approved plan | C | 0.85 | 1.00 | 1.00 | miss |

C-T3 rounds to a hit under the rule (0.86 against 0.70 is a gap of 0.16, rounded from 6 of 7). It is listed as a hit, which is generous.

### Summary metrics

| Metric | Predicted | Measured | Naive guess | Verdict | Closer |
|---|---|---|---|---|---|
| Mean pass A | 0.33 | 0.02 (regraded 0.14) | n/a | miss | n/a |
| Mean pass B | 0.86 | 0.65 (regraded 0.83) | n/a | miss (regraded hit) | n/a |
| Mean pass C | 0.78 | 0.92 (regraded 0.96) | n/a | miss | n/a |
| B minus A | at least 0.45 | 0.63 (regraded 0.69) | n/a | hit | n/a |
| B minus C | +0.08 | -0.27 (regraded -0.13) | 0 (B = C) | miss | naive |
| Tokens added by B | +2,500 | about +1,300 to +1,450 (5.2k to 5.8k characters) | n/a | miss | n/a |
| Tokens added by C | +2,000 | about +1,000 (4.0k characters) | n/a | miss | n/a |
| Prompt trigger recall | at least 0.90 | 20 of 20 | n/a | hit | n/a |
| Prompt false positives | at most 1 of 15 | 0 of 15 | n/a | hit | n/a |
| Hook cases | 12 of 12 | not built as a separate script. Covered by the session_sim tool scenario and 5 hooks-test checks, all passing | n/a | not measured as planned | n/a |
| Workflow hooks fire Pre and Post | 0.85 | yes (claude -p probe) | n/a | hit | n/a |
| EnterPlanMode and ExitPlanMode hooks fire | 0.75 to 0.85 | documented for ExitPlanMode, unverified live (not offered in -p) | n/a | open | n/a |
| ExitPlanMode tool_input has the plan | 0.60 | documented: `plan` and `planFilePath` are injected | n/a | hit (docs only) | n/a |
| Engine gates green within 2 fix cycles | all of lint, test-unit, test-sim, test-hooks | 2 fix cycles. test-sim 44 of 44, ways crate 807 tests under a clean HOME. make lint and test-unit fail in crates the change does not touch, and one TUI test is flaky | n/a | partial | n/a |
| Engine size | 300 to 450 lines, about 15 files | 491 insertions, 35 files | n/a | miss | n/a |
| Refire in a later round of one session | 0.80 | fires at 900k tokens, held at 2k | n/a | hit | n/a |

Token counts are estimates at 4 characters per token. Guided answers were also longer. The median response for T3 was 11.8k characters for A, 25.0k for B, and 30.5k for C.

### Which Why broke

- **T7, B 0.90:** "Without the moment's guidance, Claude jumps to the harness and saves late." The save itself held: B saved and committed the prediction first in every trial. But the predict child names no eval gates, so B trials skipped the selftest and dry run in their first actions. The Why assumed the predict child was self-sufficient for its moment. It is not (F3).
- **T4 and T6, B 0.90:** these misses came from the grader (F1). After the regrade, B is at 1.00 and 0.80.
- **C below B on every task:** the plan predicted the tree would beat the slim file by about 0.08, "inside the noise". The assumption was that a root plus the right child carries more relevant detail. In this eval every trial got its guidance fresh and in full, so the slim file's complete checklist beat a root plus one child. The eval cannot measure the tree's real advantage, which is timing in a long session (F7, F9).
- **A everywhere:** the plan assumed the live plan-mode and evals ways would carry A to 0.2 to 0.6. A's judge means were high on T2 (6.0) and T6 (6.3), but A failed the house-format code checks. Part of the A-to-B gap is format, not method (F6).
- **Everything near 0.8:** the predictions bunched near 0.8 for guided configs and 0.2 to 0.6 for A. The results were at the floor and the ceiling. The predictions hedged toward the middle instead of committing.

### What round 1 shows

- Any SPE guidance moves the agent from 0.02 to 0.65 or more on these tasks. That holds even after the format caveat.
- The slim file (C) beat the tree (B) at fewer tokens. The only difference that is clearly not noise is T7 (one-sided Fisher p about 0.008).
- Claude's predictions were not better than the naive guess on the one comparison the naive guess covers (B against C).
