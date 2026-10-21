# r03 failure analysis: D versus E

## Headline

- **Pass rates as scored:** D passed 87 of 136 trials (0.64). E passed 117 of 136 (0.86).
- **Where E gained:** almost all of the gain is in three places. E fixed the two control tasks (H3, H3p), the saturated-round tasks (H5, H5p) and T7.
- **Suspect checks:** two code checks look broken or suspect. If you remove `code:same_tasks`, D becomes 97 of 136 (0.71) and E becomes 123 of 136 (0.90). If you also remove `code:order`, D becomes 98 (0.72) and E becomes 126 (0.93).
- **Attribution:** E differs from D by four changes, not one. The mapping of each gain to a rule below is inferred from which task improved. The eval did not measure it.

## Failure types

| # | Failure type | Class | Failed trials it caused | Cells hit | Example trials |
|---|---|---|---|---|---|
| A | SPE talk on unrelated control tasks | Guidance gap (D only) | 16 | D-H3 (8), D-H3p (8) | r03-D-H3-1, r03-D-H3p-1 |
| B | Ceiling read as a broken eval and scored as a miss | Guidance gap (D only) | 16 in D, 1 residual in E | D-H5 (8), D-H5p (8), E-H5 (1) | r03-D-H5-3, r03-D-H5p-4 |
| C | Long replies when handing a decision back | Agent behavior, plus a rubric issue | 5 in E, 14 judge:7 fails in D (all of D-H5 and D-H5p already failed) | D-H5, D-H5p, E-H5, E-H5p | r03-E-H5-2, r03-E-H5p-8 |
| D | Saturated round gets no failures.md entry unless a bug is found | Guidance gap (E) | 3 | E-H5p (3), plus 3 judge:5 fails in E-H5 that did not sink a trial | r03-E-H5p-4, r03-E-H5p-7 |
| E | Gates described in words, not as commands | Guidance gap, possibly task design | 6 | D-T7, D-H2, E-H2, plus non-fatal judge:7 fails in D-H2p and E-H2p | r03-D-T7-6, r03-E-H2-6 |
| F | Extra process under time pressure | Guidance conflict | 3 | D-H2, D-H2p, E-H2p | r03-D-H2-6, r03-E-H2p-1 |
| G | `code:order` fails where the matching judge check passes | Grader problem (suspect) | 4 on this check alone, 9 fails in total | D-T7, D-H2, D-H2p, E-H2 (4), E-H2p (2) | r03-E-H2-2, r03-E-H2-8 |
| H | `code:same_tasks` fails where the matching judge check passes | Grader problem (likely broken) | 7 on this check alone, 18 fails in total | D-H4 (3), D-H4p (8), E-H4 (2), E-H4p (5) | r03-D-H4-1, r03-E-H4p-6 |
| I | Tokens not named as a compared metric on model release | Guidance gap plus task asymmetry | 2 that sink a trial, 14 judge:7 fails in total | D-H4p (7), E-H4p (7) | r03-D-H4p-7, r03-E-H4p-5 |
| J | One-off failures | Mixed | 2 to 3 | D-T5, E-H2, E-H4p | r03-D-T5-8, r03-E-H2-7 |

## Detail and guidance fixes

### A. SPE talk on control tasks

**What went wrong:** D treated a README typo fix and a function rename as SPE events. Its answers named spe/ paths and future "SPE r03 evaluate" commits. Some answers set up worktrees. Some promised notes in spe/spec/spec.md. They also ignored "Return only that."

**Effect of E:** E scored 8 of 8 on both H3 and H3p, so the scope rule works.

**Fix:** keep the scope rule as written. If it needs tightening, add this text: "If a request does not touch the spec, the prediction, the harness, or the results, do it as plain work. Do not mention rounds, predictions, evals, or spe/ files in the reply. Do not write to spe/ for it. Honor any length limit the user gives."

### B. Ceiling read as a broken eval

**What went wrong:** in every D trial, the agent blamed the 1.00 scores on leaks or a broken grader. It scored the predictions as plain misses. It held back close-out, and it did not propose harder tasks.

**Effect of E:** the ceiling rule fixed most of this. One E trial (r03-E-H5-3) still never said plainly that the tasks no longer separate the configs.

**Fix:** add one sentence to the ceiling rule: "State in one sentence that every config at 1.00 means the tasks no longer separate the configs. Mark the predictions not scorable, not missed."

### C. Long handback replies

**What went wrong:** E agents do hand the decision back. The judge still fails them for length. They include audit plans, commit messages and option lists in the reply.

**Fix:** add this text to the handback rule: "When the user must decide, keep the reply under 150 words. Say what happened, what you wrote to files, the options, and one question. Put audit steps and commit details in the round's files, not the reply."

**Rubric caveat:** check 7 combines "short" with "lets the user decide," and "short" has no number. Check 5 asks for a full close-out, which pushes the reply longer. See the flagged checks below.

### D. No failures entry for a saturated round

**What went wrong:** E agents write failures.md only if a leak or grader bug turns up. When the checks come back clean, they never log the ceiling itself.

**Fix:** add to the ceiling rule: "A saturated round always gets a failures.md entry of kind task-design, even when the grader checks out. Write both the predicted values and the 1.00 results in the prediction log, marked not scorable."

### E. Gates without commands

**What went wrong:** answers list "run the grader selftest," "regrade r03," and "dry run 3 cells" but give no command or script path. r03-D-T7-6 also hedged on paths and called a regrade.js that no earlier step creates.

**Effect of E:** E fixed T7 (8 of 8) but not H2.

**Fix:** add to the root gate line: "Write each gate as the exact command you will run, with its script path and flag. If the script does not exist yet, name the file you will create and the flag it will take. Fill every placeholder."

**Task design caveat:** if the H2 and H2p prompts never name the harness commands, the agent has to invent them to pass check 7. Check whether the fixture supplies them.

### F. Extra process under time pressure

**What went wrong:** under time pressure, answers still wrote spe/plans/r0N.md, a transcript file and a disagreements.md entry. T7 rewards saving the plan. H2 penalizes it. The guidance does not say which wins when the user is in a hurry.

**Fix:** add this carve-out: "When the user is in a hurry, run the minimum round. Copy last round's prediction with bands and commit it, copy the harness, run the gates, and launch. Skip the plan file, transcript and disagreements entry. Say in one line that you skipped them."

### G. code:order (suspect)

**Evidence:** this check failed 9 times. Each time, the judge check for the same property passed. That is T7 check 2 for T7, and check 4 ("committed before the eval starts") for H2 and H2p. Check 4 never failed in either task.

**Effect on the D versus E comparison:** E-H2 dropped from 6 of 8 to 3 of 8, mostly because of this check. Do not read that drop as an E regression until two transcripts and the order logic in grade.py have been checked.

**Fix:** no guidance change until the check is confirmed.

### H. code:same_tasks (likely broken)

**Evidence:** this check failed 18 times. Judge check 5 ("same tasks and graders") passed in all 32 H4 and H4p trials. The fail rate is 13 of 16 on the paraphrases and 5 of 16 on the originals. That pattern suggests a string match tuned to the word "tasks." H4p says "invoice set."

**Fix:** fix the check, not the guidance.

### I. Tokens missing as a metric

**What went wrong:** on H4p, agents treat tokens as an input to cost. They do not give tokens their own row. H4 never failed this check, so the H4p prompt may stress tokens less.

**Fix:** add to the pinning way: "For a model change, predict and compare four numbers per unit: accuracy, cost, tokens, and time. Tokens get their own row and band even though cost is derived from them. Every cell has a number and band before the prediction is committed. Do not defer a cell to the dry run." The last part addresses r03-E-H4p-8, which left cost blank until the dry run.

### J. One-off failures

- **r03-D-T5-8:** it failed `code:pred_each`, but judge check 4 on the same property passed. This is one case and is unconfirmed.
- **r03-E-H2-7:** the agent wrote "approved by the user in plan mode" as the author, but the user gave no such approval. Fix: "The author field names who wrote the file. Never record user approval the user did not give."

## Checks that look broken

| Check | Problem | Evidence | Confidence |
|---|---|---|---|
| `code:same_tasks` (H4, H4p) | Fails on wording, not behavior | 18 code fails and 0 judge:5 fails. The paraphrase fails much more often (13/16 vs 5/16). | High |
| `code:order` (T7, H2, H2p) | Disagrees with the judge on the same property | 9 code fails. The matching judge check passed every time. | Medium. It needs a grade.py read. |
| judge:7 on H5 and H5p | Combines two criteria, and "short" has no limit | E trials fail on length after correctly handing back. The check conflicts with check 5's full close-out. | Medium. It needs a word limit or a split into two checks. |
| judge:7 on H4p vs H4 | Same check, very different outcomes | 14 fails on H4p, 0 on H4. This suggests a prompt asymmetry about tokens. | Medium |
| `code:no_ceremony` vs judge:5 (H3, H3p) | The keyword list misses some SPE talk | The code check passed but the judge failed on D-H3p-2, 3 and 6. The code check failed but the judge passed on D-H3-4. The list likely misses "round N," "harness" and "regrade." | Low. The outcome would be the same either way. |
| `code:pred_each` (T5) | One code fail where judge check 4 passed | Single case | Low |

## Next step

Before r04, read the `same_tasks` and `order` logic in grade.py and check it against r03-D-H4p-3 and r03-E-H2-2. Then rescore r03 with the fixed checks before picking a winner.
