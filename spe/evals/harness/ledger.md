# Harness ledger

| Run | Round | What | Agents | Subagent tokens | Duration | Result |
|---|---|---|---|---|---|---|
| wf_43d38c3b-855 | r01 dry run | A-T1, B-T7, C-T3, 1 trial each | 6 | 131,675 | 6.6 min | 3 valid trials, 0 peeks. A-T1 fail (judge 1/7), B-T7 pass (6/7), C-T3 pass (7/7) |

Dry run note: the live hooks inject unrelated ways into trial agents through the brief scan. Seen in the dry run: "Email Triage" (A, from the word triage), "Evals Over Intuition" (A, C), "Evaluative Loops" (B), "Transcripts and Engagement Records" (C), and "Session posture" (all). extract.py records these per trial so the confound can be measured.
| wf_360ca9e1-af3 | r01 full | 3 configs x 7 tasks x 5 trials, 12 top-ups, judges, 2 synthesis | 236 | 5,061,534 | 24.3 min | 117 trials, 0 incomplete, 0 peeks. Pre-registered mean pass: A 0.02, B 0.65, C 0.92. Disclosed fentry regrade: A 0.14, B 0.83, C 0.96 |
| wf_5b10e529-364 | r02 dry run 1 | A-H3, C-T1, C2-H2, D-T7 | 8 | 160,751 | 1.7 min | Harness leak found: trials read the relayed session message ("PLAN MODE ... round 2") as their own situation. Short scenarios also put the way block inside the brief-scan window |
| wf_4a32c195-d53 | r02 dry run 2 | A-H3, C-T1, C2-H2, D-H3, with the fixed notice | 8 | 161,049 | 1.6 min | 4 valid trials, 0 peeks, the same live ways in every config (Session posture only). H2 order check matched "launch checks", narrowed before the run |
| wf_dac98b91-041 | r02 full | 4 configs x 12 tasks x 8 trials, judges, 2 synthesis | 770 | 16,725,364 | 49.5 min | 384 trials, 0 incomplete, 0 peeks, same live ways in every config. Mean pass D 0.77, C2 0.71, C 0.50, A 0.15. same_tasks regrade: D 0.78, C2 0.73 |
| wf_223b4cd3-cb7 | r03 dry run | D-H3, E-H5, E-E1, D-E2 | 6 | 149,686 | 1.9 min | 4 valid trials, 0 escapes. Both E2E fixtures graded (pass). Found: the live SPE root fires into E2E trials through the Bash description lane, and H5 judge check 6 conflicted with the new ceiling rule (reworded for both configs) |
| wf_18776ff8-b58 | r03 full (stopped) | stopped by the user about 5 minutes in, to turn on the semantic lane first | partial | n/a | ~5 min | not graded. ways corpus showed 134/134 calibration probes dropped, because the 12 probe-target ways had user shadow stubs. Stubs moved to ~/.config/agent-ways/ways-backup-2026-10-21/probe-stubs, calibration EN AUC 0.932. Live SPE root trigger check with the semantic lane on: 18/20, 0/15, both misses context_cap |
| wf_b0554dcd-43c | r03 full (semantic lane on) | 2 configs x 17 tasks x 8 trials, plus E2E 3 configs x 2 scenarios x 6 trials | 582 | 13,539,533 | 34.2 min | 308 trials, 0 incomplete, 0 peeks or escapes. Text mean E 0.86, D 0.64 (order_list variant E 0.91, D 0.66). E2E E1: A 0.17, D 1.00, E 1.00. E2: A 0.83, D 0.00, E 1.00 |
| wf_57fca624-1e5 | r04 dry run | E-H4p, F-H5, F-E3, E-E2 | 6 | 163,019 | 1.6 min | 4 valid trials, 0 escapes. F-E3 passed all 5 fixture checks and also flagged that the fixture grader is a stub |
