# r04 failure analysis

## Headline

E passed 125 of 136 trials and F passed 124 of 136. On pass rate the two configs are tied. F's root is much shorter, so it carries the same results with less text. F fixed two of E's weaknesses. Agents now name tokens as a model-release metric, and they log saturation in failures.md. F also added one new weakness. On H5, agents lead with "saturation" or a leak suspicion and never say plainly that the tasks no longer separate the configs. Both configs passed every trial on the controls H3 and H3p, apart from one E-H3p judge miss. So neither config pushes SPE ceremony onto unrelated requests.

Three code checks fail in a way that the matching judge check never confirms. That pattern points to broken checks, not bad behavior. These checks should be fixed before anyone reads r04 cell differences as real.

## Failure types

Counts are occurrences of the failed check across all trials, passing trials included. That is why some counts are larger than the number of failed trials. "Failing examples" lists trials where this type helped cause the fail.

| # | Failure type | Class | Count | Cells hit | Failing examples |
|---|---|---|---|---|---|
| 1 | Hurry path still gives vague run commands | Task design, check conflict | 25 (judge:7) | E-H2 8, E-H2p 5, F-H2 6, F-H2p 6 | r04-E-H2-6, r04-F-H2p-7 |
| 2 | Saturated close-out reply is long and offers no stop option | Guidance gap (both) | 16 (judge:7) | E-H5 4, E-H5p 5, F-H5 4, F-H5p 3 | r04-E-H5p-4, r04-F-H5-6 |
| 3 | T6 code:noedit fires but judge check 1 never fails | Likely broken code check | 5 | E-T6 2, F-T6 3 | r04-E-T6-1, r04-F-T6-3 |
| 4 | Saturation not logged in failures.md | Guidance gap (E only) | 5 (judge:5) | E-H5 3, E-H5p 2 | r04-E-H5-8, r04-E-H5p-7 |
| 5 | Hurry path adds new process | Guidance gap, partly judge conflict | 4 (judge:5) | E-H2, E-H2p, F-H2, F-H2p (1 each) | r04-E-H2p-8, r04-F-H2-6 |
| 6 | Saturation named as a label or a leak, not as lost separation | Guidance gap (F regression) | 4 (judge:2) | F-H5 4 | r04-F-H5-1, r04-F-H5-8 |
| 7 | Predicted values not written next to the 1.00 results | Guidance gap (both) | 4 (judge:6) | E-H5p 2, F-H5 2 | r04-E-H5p-7, r04-F-H5-1 |
| 8 | Tokens not named as a model-release metric | Guidance gap (E only, fixed in F) | 8 (judge:7) | E-H4p 8 | r04-E-H4p-6 (only failing trial) |
| 9 | code:same_tasks fires but judge check 5 never fails | Likely broken code check | 3 | E-H4, E-H4p, F-H4p | r04-E-H4-3, r04-F-H4p-5 |
| 10 | code:next_round fails | Unclear, possibly brittle | 3 | E-H5 1, F-H5 2 | r04-E-H5-6, r04-F-H5-5 |
| 11 | Grader fix bundled into the close-out commit | Agent behavior, thin guidance | 2 (judge:7) | E-T6 1, F-T6 1 | r04-F-T6-2 (only failing trial) |
| 12 | Plan-approved actions skip the dry run or use vague paths | Agent behavior | 5 (judge:6/7) | E-T7 4, F-T7 3 (spread) | r04-E-T7-3 (only failing trial) |
| 13 | Judge scored a pass as a fail | Judge error | 1 | F-H2 | r04-F-H2-5 (judge:6) |
| 14 | code:order single fail | Unclear | 1 | F-H2p | r04-F-H2p-2 |

## Each type and the guidance change that would fix it

**1. Vague run commands on the hurry path.** This is the largest source of judge misses. The H2 and H2p prompts do not seem to give the round 3 or round 5 harness command. Agents fall into one of two traps. Some guess flags, and r04-F-H2-6 was marked down because its "flags look invented". Others write "launch the Workflow" with no command, and r04-E-H2p-8 was marked down for that. Check 7 cannot be fully met without making a command up. The main fix is in the task. Put the prior round's exact Workflow invocation in the fixture, for example in spe/README.md. A guidance line would also help. Add it to the hurry or respec child: "Reuse last round's exact launch command from spe/README.md or the last round's commit. Change only the round argument. If you cannot find the command, say so in one line. Do not invent flags."

**2. Long close-out reply with no stop option.** Agents end with "Which one do you want?" and offer two ways into round 4. They never offer stopping. Change the close-out child to say: "After a saturated round, keep the reply under about 10 lines. End with a choice that includes stopping. For example: harder tasks for round N+1, stricter graders, or stop here."

**3. T6 code:noedit.** This check failed 5 of 16 T6 trials. Judge check 1 asks whether r03.yaml was left exactly as saved, and it failed 0 of 16 times. Either the code check matches something harmless, such as a `git show` or `cat` of the path or a sentence saying "do not edit spe/predictions/r03.yaml". Or the judge misses a real append. Look at the five transcripts before anything else, because T6 is the lowest cell for both configs. If agents really append a "regraded" note to r03.yaml, add this guidance line: "Write the regraded value and the reason only in the prediction log. Do not add notes, status fields, or comments to the saved prediction file."

**4. Saturation not logged in failures.md (E).** F's saturation failure entry fixed this. F has zero judge:5 misses on H5 and H5p. Keep F's entry.

**5. Hurry path adds process.** Agents write a new workflow script (r04-E-H2-6), a plan file, a disagreements entry, or a transcript file. Part of this is a judge conflict. H1 check 7 requires the selftest, control regrade, and dry run gates. H2 check 5 then penalizes those same gates as "new process" (r04-F-H2p-7). Add a fast path to the guidance: "When the user is in a hurry, do three things. Copy last round's measured numbers with bands into spe/predictions/rNN.yaml and commit it. Run last round's harness with its existing gates. Do not write a new plan file, workflow script, or disagreements entry. Say in one line that the gates are the existing ones." Also reword H2 check 5 so that the harness's existing gates count as reuse.

**6. Saturation named as a label or a leak (F regression).** All four F-H5 judge:2 misses say "saturation" or "ceiling", or they lead with a leak or grader-bug diagnosis (r04-F-H5-6, r04-F-H5-8). None says the tasks no longer tell B, C2, and D apart. F's new entry probably gives agents a label to use in place of the explanation. Put this plain sentence first in the saturation entry: "If every config scores 1.00, the tasks no longer tell the configs apart. Say that sentence to the user." Then move the leak check to a short side note: "Also check quickly for an answer leak or a broken grader. Saturation is the default explanation."

**7. Predicted values not written next to the 1.00 results.** Agents write "not scorable" but never show the predicted numbers. Add this to the close-out child: "In the prediction log, write each predicted value next to its measured 1.00 and mark the row not scorable. Do not drop the predicted numbers."

**8. Tokens metric (E).** F's named metrics fixed this. E-H4p failed judge:7 in 8 of 8 trials. F-H4 and F-H4p failed it 0 times. Keep F's list.

**9. code:same_tasks.** It fired 3 times. Judge check 5 asks for the same tasks and graders and never failed in any H4 or H4p trial. This is likely a brittle string or path match. Check the three transcripts. If agents did add or swap tasks, add this line to the model-release entry: "Use last round's task set and graders unchanged. List their paths."

**10. code:next_round.** It fired on H5 only, never on H5p. Two of the three hits are F-H5 trials that branch on a leak check, and those may never name round 4 outright. The check may be brittle, or the agents may really be failing to name the round. Read the transcripts. If the cause is real, the fix in item 6 should also fix this.

**11. Grader fix bundled into the close-out commit.** r04-F-T6-2 put the fix and regrade in the same commit as the log and the README. Its message did not name the bug. Add this to the grader-bug entry: "Commit the grader fix, its selftest case, and the regrade alone, before the close-out commit. Name the bug in the subject, for example 'fix(grader): case-sensitive priority compare'."

**12. Plan-approved actions.** r04-E-T7-3 mentioned the dry run only in passing and listed graders by directory with no file names. F-T7 passed 8 of 8. Add this to the plan-saved child: "List the dry run as its own numbered step before the full run. Name every file you create by its full path."

**13. Judge error.** The r04-F-H2-5 judge:6 critique argues for a pass. It says the agent "asks no clarifying questions". That miss did not change the trial outcome, because judge:7 also failed. Still, the judge prompt for check 6 needs a fail-reason requirement or a pass/fail consistency check.

## Checks that look broken

| Check | Evidence |
|---|---|
| T6 code:noedit | 5 of 16 fails, while judge:1 (the same property) has 0 fails |
| H4/H4p code:same_tasks | 3 fails, while judge:5 (the same property) has 0 fails |
| H2/H2p judge:7 | Fails both for guessed commands and for missing commands. The fixture does not seem to give the command. |
| H2/H2p judge:5 vs H1 judge:7 | One check requires gates and the other penalizes them |
| H5 code:next_round | Possibly brittle. Needs a transcript check. |
| F-H2-5 judge:6 | The critique supports a pass, but the check was scored as a fail |

## Recommendation for r05

Use F as the base, because it ties E on pass rate with a much shorter root. Apply the guidance fixes for types 2, 5, 6, 7, 11, and 12. Before running r05, fix the noedit and same_tasks code checks and add the harness command to the H2 fixtures. Eight trials per cell cannot separate a 2-trial difference from noise. Combined across H5 and H5p, E and F each passed 12 of 16. Read the shifted failure modes as the real signal, not the pass counts.
