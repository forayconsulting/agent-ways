# Harness ledger

| Run | Round | What | Agents | Subagent tokens | Duration | Result |
|---|---|---|---|---|---|---|
| wf_43d38c3b-855 | r01 dry run | A-T1, B-T7, C-T3, 1 trial each | 6 | 131,675 | 6.6 min | 3 valid trials, 0 peeks. A-T1 fail (judge 1/7), B-T7 pass (6/7), C-T3 pass (7/7) |

Dry run note: the live hooks inject unrelated ways into trial agents through the brief scan. Seen in the dry run: "Email Triage" (A, from the word triage), "Evals Over Intuition" (A, C), "Evaluative Loops" (B), "Transcripts and Engagement Records" (C), and "Session posture" (all). extract.py records these per trial so the confound can be measured.
