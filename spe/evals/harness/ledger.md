# Harness ledger

| Run | Round | What | Agents | Subagent tokens | Duration | Result |
|---|---|---|---|---|---|---|
| wf_43d38c3b-855 | r01 dry run | A-T1, B-T7, C-T3, 1 trial each | 6 | 131,675 | 6.6 min | 3 valid trials, 0 peeks. A-T1 fail (judge 1/7), B-T7 pass (6/7), C-T3 pass (7/7) |

Dry run note: the live hooks inject unrelated ways into trial agents through the brief scan. Seen in the dry run: "Email Triage" (A, from the word triage), "Evals Over Intuition" (A, C), "Evaluative Loops" (B), "Transcripts and Engagement Records" (C), and "Session posture" (all). extract.py records these per trial so the confound can be measured.
| wf_360ca9e1-af3 | r01 full | 3 configs x 7 tasks x 5 trials, 12 top-ups, judges, 2 synthesis | 236 | 5,061,534 | 24.3 min | 117 trials, 0 incomplete, 0 peeks. Pre-registered mean pass: A 0.02, B 0.65, C 0.92. Disclosed fentry regrade: A 0.14, B 0.83, C 0.96 |
