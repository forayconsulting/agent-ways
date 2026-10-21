# r01 failure analysis: SPE ways eval

## Headline

| Config | Passed | Pass rate | If the suspect checks are fixed |
|---|---|---|---|
| A (no guidance) | 1 of 39 | 3% | about 2 of 39 |
| B (tree) | 26 of 41 | 63% | up to 34 of 41 |
| C (slim file) | 35 of 39 | 90% | up to 39 of 39 |

B looks weaker than it is. Most of B's failures come from one code check, `code:fentry`, which the judge disagrees with. That check alone fails B-T6 in all 5 trials and fails B-T4 in 3 of 7. After you remove the suspect checks, B's only real weak spot is T7. In T7, the step-by-step actions after the plan is approved are too vague. C has a milder form of the same T7 problem. C still passes because of the 6-of-7 judge threshold.

## Failure types

Counts are trials. One trial can belong to more than one type.

### Grader or judge problems

| # | Type | Trials | Cells | Examples | Fix |
|---|---|---|---|---|---|
| G1 | `code:fentry` fails failure entries that the judge accepts | 11 (fentry is the trial's only failure) | A-T6, B-T4, B-T6, C-T6 | r01-B-T6-1, r01-B-T4-3 | Fix the check first. Run its regex on the entries from B-T6-1 to B-T6-4. Then add the literal template from fix 2 below to the guidance, and make the check match fields, not exact wording. |
| G2 | Other code checks disagree with the judge (path or keyword match) | 11 | A-T2 (`source_col` in 5 trials, `defaults` in A-T2-2), A-T5-2 (`halt`), A-T5-3 (`budget`), B-T1-3 (`pred_file` and `plan_copy`, while judge check 4 passed), B-T6-5 and C-T6-7 (`noedit`, while judge check 1 passed), C-T3-4 (`dryrun`, while judge check 2 passed) | r01-B-T1-3, r01-C-T6-7 | Read each transcript and compare it with the check's pattern. Widen the pattern to accept the same meaning in other words. Check `noedit` first, because it may count a read or a new sibling file as an edit. |

### Guidance gaps in B and C (the guidance under test)

| # | Type | Trials | Cells | Examples | Fix |
|---|---|---|---|---|---|
| W1 | After plan approval, the actions name no gates and hedge their paths | 6 fail in B. In C, 4 trials miss judge check 7 but still pass. | B-T7, C-T7 | r01-B-T7-2, r01-B-T7-6 | Fix 1 below |
| W2 | The grader selftest copies the function under test instead of importing it | 1 | B-T6 | r01-B-T6-5 | Fix 3 below |
| W3 | The top-up rule is too narrow. It adds trials only when the pass rate is between 0.3 and 0.7, so 1/5 and 4/5 cells get none. | 1 | C-T3 | r01-C-T3-4 | Fix 4 below |

### Guidance gaps in A (expected for a control)

B and C already contain the text that fixes each of these. Each A type confirms that a piece of the guidance does work.

| # | Type | Trials | Cells | Examples | Guidance text that covers it |
|---|---|---|---|---|---|
| A1 | No saved prediction with numbers and a Why for each number. The plan is not copied to a file. | 15 | A-T1, A-T7, A-T5 (`pred_each`) | r01-A-T1-2, r01-A-T7-3 | The Predict step: a table by config, with a number, a Why and a same-as-last-round value. It is saved to `spe/predictions/rNN.yaml` and committed with `spe/plans/rNN.md` before any trial. |
| A2 | No gates before the full run (grader selftest, small dry run, regrade of last round as a control) | 15 | A-T1, A-T3, A-T7 | r01-A-T1-4, r01-A-T3-1 | The gate list: selftest, then the previous round regraded as a control, then a dry run on a few cells, then the full run. |
| A3 | The Workflow script has no top-up, no synthesis step, the round number in many places, and incomplete isolation | 5 | A-T3 | r01-A-T3-2, r01-A-T3-5 | The script checklist: one ROUND constant, a deny list of four files for trial agents, a dollar cap that logs every skip, top-up of mixed cells, and a failure analysis and critic at the end. |
| A4 | The close-out has no hit or miss labels and no how-to-spot field. There is no draft for the next round and no tag. | 5 | A-T4 | r01-A-T4-1, r01-A-T4-4 | The Close step: label each metric hit or miss, name the closer guess, quote the Why for each miss, mark the next-round file as a draft, and update the README and tag the round. |
| A5 | Choices made autonomously are stated as decisions, not as defaults the user can override. One trial also changed two things in a single config. | 5 | A-T2 | r01-A-T2-3, r01-A-T2-1 | The autonomy rule: record each choice as a default the user can override. Make one change per config. |
| A6 | All configs passing is read as convergence. There is no budget for the night. | 5 | A-T5 | r01-A-T5-1, r01-A-T5-5 | The overnight rule: when every config passes, make the tasks harder instead of stopping. Set a dollar cap and a round cap. |
| A7 | The failure entry has no kind field and no how-to-spot field | 10 (5 in A-T4, 5 in A-T6) | A-T4, A-T6 | r01-A-T6-2, r01-A-T6-7 | The failure entry template (fix 2) |

### Task design

| # | Type | Trials affected | Cells | Examples | Fix |
|---|---|---|---|---|---|
| T1 | Some checks score a house convention rather than method. These are the file name `r02.yaml` (T7 check 1 and `code:pred_file`), the `kind` field (T6 check 3), the git tag (T4) and the Source column (T2). | Most A failures in T2, T4, T6 and T7 | A-T2, A-T4, A-T6, A-T7 | r01-A-T7-1, r01-A-T6-3 | Tag each check as either convention or behavior, and report the two scores apart. If the prompts do not state these conventions, the A-to-B gap overstates the method gain. |
| T2 | The 6-of-7 judge threshold hides a repeated weakness | 4 | C-T7 (check 7 failed in 4 of 5 trials) | r01-C-T7 trials | Report the failure rate of each check next to the pass rate |

## Specific guidance text changes

**Fix 1 (W1).** Replace "run that step's gate" in the plan-approved moment (the B child and the C section) with this text:

> After approval, do these in order. Name every file. Do not write "for example".
> 1. `cp ~/.claude/plans/<file>.md spe/plans/rNN.md`
> 2. Write `spe/predictions/rNN.yaml` with `round`, `date`, `author`, `do_not_edit_after_run: true`, and for each number a `why` and a `same_as_last_round` value.
> 3. `git add` both files and `git commit -m "spe rNN: plan and prediction"`.
> 4. Write the graders. Run the grader selftest by its command, for instance `python spe/evals/graders/grade.py --selftest`. No trial runs until it passes.
> 5. Write `spe/evals/harness/rNN-workflow.js`. Run a small dry run on 2 to 3 cells with `--dry-run`, and read the output.
> 6. Launch the full Workflow run.

**Fix 2 (G1, A7).** Add a literal failure entry template to the close-out and grader-bug moments:

> ```
> ### F<n>: <title>
> - kind: grader | agent | task | judge
> - what happened:
> - how to spot it:
> - seen in: <trial ids>
> - fix: <change>   (or: status: open)
> ```

**Fix 3 (W2).** Add this to the grader-bug moment: "The selftest must import the fixed function from the grader file. A copy of the function proves nothing if the grader reverts."

**Fix 4 (W3).** Add this to the Workflow script moment: "Top up every cell where 0 < passes < trials. State the cap on extra trials per cell."

## Checks that look broken

| Check | Why it looks broken |
|---|---|
| `code:fentry` | It fails B-T6 in 5 of 5 trials and B-T4 in 3 of 7, while the judge passes the matching check in every one of those trials. It is the only failure in 11 trials. It looks like a format-match bug. Fix it before you compare B with C. |
| `code:noedit` | It failed in 2 trials (B-T6-5, C-T6-7). In both, judge check 1 says r03.yaml was left as saved. |
| `code:source_col` | It fails A-T2 in 5 of 5 trials, while judge check 2 (requirements cite failure IDs) passes in all 5. It tests for a column name, not for whether the citation is there. |
| `code:pred_file` / `code:plan_copy` (B-T1-3 only) | Both fail while judge check 4 passes. A path-naming mismatch is likely. |
| `code:dryrun` (C-T3-4) | It fails while judge check 2 says a dry-run mode exists. The flag name is likely different. |
| `code:budget`, `code:halt` (A-T5) | Each disagrees with its judge check in at least 1 trial, in both directions. These look like keyword matches. Low impact, because A fails those trials anyway. |

I wrote no files. This analysis comes only from the summary and the critiques in the brief. Nothing is verified against transcripts or check source code. The best next step is to run the `code:fentry` regex on the failure entries from r01-B-T6-1 to r01-B-T6-4 and confirm or rule out the bug.
