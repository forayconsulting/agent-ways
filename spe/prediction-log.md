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

## Round 2 (2026-10-21)

Prediction: [predictions/r02.yaml](predictions/r02.yaml), committed at 0b2728a2 (20:28Z) before any harness work. The full run started at 20:36Z. A hit is a measured value inside the stated band. "Same as last round" is the r01 regraded value (C2 and D take C's). It exists for T tasks only.

The layout changed from r01: a fixed notice opens every trial, and the way block follows the scenario. C is the in-round anchor.

### Pass rates (pre-registered checks)

| Task | Config | Predicted | Measured | Same as last round | Verdict | Closer |
|---|---|---|---|---|---|---|
| T1 | A | 0.00 ± 0.10 | 0.00 | 0.00 | hit | tie |
| T1 | C | 0.30 ± 0.20 | 0.00 | 1.00 | miss | prediction |
| T1 | C2 | 0.95 ± 0.10 | 1.00 | 1.00 | hit | naive |
| T1 | D | 0.95 ± 0.10 | 1.00 | 1.00 | hit | naive |
| T2 | A | 0.00 ± 0.10 | 0.00 | 0.00 | hit | tie |
| T2 | C | 0.30 ± 0.20 | 0.75 | 1.00 | miss | naive |
| T2 | C2 | 0.95 ± 0.10 | 1.00 | 1.00 | hit | naive |
| T2 | D | 0.95 ± 0.10 | 1.00 | 1.00 | hit | naive |
| T3 | A | 0.00 ± 0.10 | 0.00 | 0.00 | hit | tie |
| T3 | C | 0.90 ± 0.10 | 1.00 | 0.86 | hit | prediction |
| T3 | C2 | 0.90 ± 0.10 | 1.00 | 0.86 | hit | prediction |
| T3 | D | 0.95 ± 0.10 | 1.00 | 0.86 | hit | prediction |
| T4 | A | 0.00 ± 0.10 | 0.00 | 0.00 | hit | tie |
| T4 | C | 0.90 ± 0.10 | 1.00 | 1.00 | hit | naive |
| T4 | C2 | 0.90 ± 0.10 | 1.00 | 1.00 | hit | naive |
| T4 | D | 1.00 ± 0.10 | 1.00 | 1.00 | hit | tie |
| T5 | A | 0.00 ± 0.10 | 0.00 | 0.00 | hit | tie |
| T5 | C | 1.00 ± 0.10 | 1.00 | 1.00 | hit | tie |
| T5 | C2 | 1.00 ± 0.10 | 0.88 | 1.00 | miss | tie |
| T5 | D | 1.00 ± 0.10 | 0.88 | 1.00 | miss | tie |
| T6 | A | 0.60 ± 0.25 | 0.75 | 1.00 | hit | prediction |
| T6 | C | 0.85 ± 0.15 | 1.00 | 0.86 | hit | naive |
| T6 | C2 | 0.85 ± 0.15 | 1.00 | 0.86 | hit | naive |
| T6 | D | 0.90 ± 0.10 | 0.75 | 0.86 | miss | naive |
| T7 | A | 0.00 ± 0.10 | 0.00 | 0.00 | hit | tie |
| T7 | C | 0.95 ± 0.10 | 0.38 | 1.00 | miss | prediction |
| T7 | C2 | 0.95 ± 0.10 | 0.50 | 1.00 | miss | prediction |
| T7 | D | 0.95 ± 0.10 | 0.88 | 1.00 | hit | prediction |
| H1 | A | 0.00 ± 0.10 | 0.00 | | hit | |
| H1 | C | 0.60 ± 0.20 | 0.25 | | miss | |
| H1 | C2 | 0.70 ± 0.20 | 1.00 | | miss | |
| H1 | D | 0.80 ± 0.15 | 1.00 | | miss | |
| H2 | A | 0.10 ± 0.15 | 0.00 | | hit | |
| H2 | C | 0.60 ± 0.20 | 0.50 | | hit | |
| H2 | C2 | 0.60 ± 0.20 | 0.88 | | miss | |
| H2 | D | 0.75 ± 0.20 | 1.00 | | miss | |
| H3 | A | 0.95 ± 0.10 | 1.00 | | hit | |
| H3 | C | 0.85 ± 0.15 | 0.12 | | miss | |
| H3 | C2 | 0.85 ± 0.15 | 0.00 | | miss | |
| H3 | D | 0.85 ± 0.15 | 0.00 | | miss | |
| H4 | A | 0.10 ± 0.15 | 0.00 | | hit | |
| H4 | C | 0.70 ± 0.20 | 0.00 | | miss | |
| H4 | C2 | 0.70 ± 0.20 | 0.25 | | miss | |
| H4 | D | 0.75 ± 0.20 | 0.75 | | hit | |
| H5 | A | 0.10 ± 0.15 | 0.00 | | hit | |
| H5 | C | 0.90 ± 0.10 | 0.00 | | miss | |
| H5 | C2 | 0.90 ± 0.10 | 0.00 | | miss | |
| H5 | D | 0.90 ± 0.10 | 0.00 | | miss | |

28 of 48 cells hit, against 2 of 21 in round 1. On the 28 T-task cells, the naive guess was closer 10 times, the prediction 8 times, and 10 were ties.

### Summary metrics

| Metric | Predicted | Measured | Verdict |
|---|---|---|---|
| Mean pass A | 0.15 ± 0.06 | 0.15 | hit |
| Mean pass C | 0.74 ± 0.06 | 0.50 | miss |
| Mean pass C2 | 0.85 ± 0.06 | 0.71 (same_tasks variant 0.73) | miss |
| Mean pass D | 0.90 ± 0.06 | 0.77 (same_tasks variant 0.78) | miss |
| D minus C2 | +0.05 ± 0.05 | +0.06 | hit |
| C2 minus C | +0.11 ± 0.05 | +0.21 | miss |
| Median characters, D against C2 | +5% ± 5% | +1.4% (6,908 against 6,813) | hit |
| Same live ways in every config | yes (0.80) | yes. Every trial got only "Session posture" | hit |
| Peeks | 0 | 0 | hit |
| Cost | about 770 agents, 16M tokens, 70 to 100 min | 770 agents, 16.7M tokens, 49.5 min | tokens hit, time faster |

### Which Why broke

- **H3, guided configs 0.85:** "Guidance may add ceremony. D gets no child here, so it matches C2." The match held (both 0.00), but the size was far off. Every guided config recited SPE commit and staging rules on a typo fix. A passed 8 of 8. The guidance has no scope rule, so it applies itself to any request in a loop session (F11).
- **H5, guided configs 0.90:** "The saturation rule is in every guided root." The rule says to make tasks harder, and trials did propose that. But no guidance says that a ceiling makes predictions unscorable, so every config logged 1.00 results as misses and reset the stop streak (judge 4 failed 32 of 32). Judge 7 (a short reply that hands back the decision) also failed 32 of 32, because trials kept going on their own. Part of that is rubric tension with judge 5 (still close out the round) (F12).
- **T7, C and C2 0.95:** "C was 1.00." C and C2 trials stopped at six actions before reaching the gates. The T7 prompt is unchanged from r01, where C passed 5 of 5. So the likely cause is the new layout, most likely the fixed notice ("answer only what the situation asks for, in the shape it asks for"). That is an inference, not a measured cause. D's predict child names the gates as the next step and passed 0.88 (F13).
- **H4, C and C2 0.70:** "A new round starts with each model release is in the root." It is, but the root says nothing about pinning or keeping the old model as a reference. D's evaluate child lifted D to 0.75.
- **H1 and H2, C2 and D below 1.00:** the bands rule and the children worked better than predicted. C2 and D passed 8 of 8 on H1 and 7 or 8 of 8 on H2. The predictions hedged again, this time on the hard tasks.
- **C overall:** the band check cut C's T1 to 0.00 and H1 to 0.25, as intended, and the notice cut its T7. C fell to 0.50 against a predicted 0.74.

### What round 2 shows

- D (the tree with revised children) is the best config at 0.77. It beat C2 by 0.06, which is inside the predicted band, so the difference is small and real only for T7, H2, and H4.
- The biggest open problem is scope. All SPE guidance makes the agent narrate SPE on unrelated requests (H3).
- Prediction accuracy rose from 2 of 21 to 28 of 48 hits. The naive guess still edges the predictions on the T tasks (10 against 8).
