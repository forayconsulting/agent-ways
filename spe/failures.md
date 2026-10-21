# Failure types

One entry per new failure type, numbered across rounds.

## F1. The fentry check fails honest placeholder numbers (grader, r01)

- **What:** T4 and T6 never show the last failure number in failures.md. Careful trials wrote a placeholder instead of inventing one ("F-next", "F<next number>", "Fn", "F-r02-1"). The check `\bF\d+\b` failed them.
- **How to spot it:** a trial fails `code:fentry` while its judge score on the failure-entry check passes.
- **Seen in:** all 5 of r01-B-T6, 3 of 7 of r01-B-T4, and 6 of 7 of r01-A-T6.
- **Effect:** B-T6 went from 0.80 to 0.00. The pre-registered B mean went from 0.83 to 0.65.
- **Fix:** a disclosed regrade variant in `grade.py --variant fentry`. Round 2 tasks should state the last F number, and the check should accept a numbered entry.

## F2. The prediction gave no error band (prediction, r01)

- **What:** `r01.yaml` gave point values with no stated error. Hit or miss needed a rule written after the run (within 0.15).
- **How to spot it:** a prediction file with numbers and no `band` or interval field.
- **Seen in:** spe/predictions/r01.yaml.
- **Fix:** each predicted number carries a band. Add this to the predict way and the slim file in round 2.

## F3. The predict child names no eval gates (guidance, r01)

- **What:** at the moment the plan is approved, config B gets the root plus the predict child. That child stops at "save and commit". Trials then went straight to building and running, with no selftest or dry run in their first actions.
- **How to spot it:** T7 judge checks 5 (selftest) and 6 (dry run) fail while check 2 (commit first) passes.
- **Seen in:** r01-B-T7, 1 of 7 passed. Judge 5 failed in 4 trials, judge 6 in 4, judge 7 in 6.
- **Fix:** the predict child ends with the gate order (selftest, control regrade, dry run), or the root carries the full checklist as in C.

## F4. Live hooks inject different unrelated ways into each config (harness, r01)

- **What:** the user-local brief scan reads the first 2,000 characters of each trial's task. Those characters differ by config (the way block comes first in B and C). So B trials got "Evaluative Loops", C trials got "Evals Over Intuition" and "Transcripts and Engagement Records", and A trials got several others.
- **How to spot it:** the `live_ways` field in each trial file, summarized by extract.py.
- **Seen in:** all 41 B trials, all 39 C trials, and 37 of 39 A trials (for Evals Over Intuition).
- **Effect:** unknown. Evals Over Intuition carries selftest and control rules that may have helped C on T3 and T7.
- **Fix:** put the way block after the scenario, so the scanned text is the same for every config.

## F5. Ceiling on T2, T3, and T5 (task design, r01)

- **What:** B and C both passed every trial with a judge mean of 7.0. The eval cannot rank them there.
- **How to spot it:** a cell at 1.00 with judge mean 7.0 in two or more configs.
- **Seen in:** B-T2, C-T2, B-T5, C-T5, B-T3, C-T1, C-T4.
- **Fix:** harder scenarios. Leave the phase unnamed, add user pressure to skip the prediction, and add multi-turn rounds.

## F6. House-format checks inflate the gap between A and the guided configs (task design, r01)

- **What:** checks such as `pred_file`, `plan_copy`, `source_col`, and `tag` test SPE folder conventions that A was never shown. A's judge means were high on T2 and T6.
- **How to spot it:** an A trial fails code checks named after a path or a column while passing most judge checks.
- **Seen in:** A-T2 (judge mean 6.0, 0 passes) and A-T6.
- **Fix:** tag each check as convention or behavior, and report both scores. Add config D, a plain method description with no house names.

## F7. Scenarios name their phase, and no task is outside SPE (task design, r01)

- **What:** each task tells the agent which moment it is in. No task checks that the guidance stays quiet on work outside SPE.
- **Seen in:** all 7 tasks.
- **Fix:** add unlabeled scenarios and a non-SPE control task.

## F8. The 12 hook-case script was not built (harness, r01)

- **What:** the plan listed `run_hook_cases.sh` with 12 payloads. The session_sim tool scenario and 5 hooks-test checks cover the same behavior, but the separate script was not written.
- **Fix:** none needed for the engine. Write it if round 2 tests the live hooks.

## F9. Trials describe actions instead of taking them (harness, r01)

- **What:** workers had no tools. The eval checked that a plan names the prediction file, not that the file exists before the run.
- **Seen in:** every trial.
- **Fix:** run T1 and T7 for real in a sandbox repo with tools, and check the disk and the git log order.

## F10. The Workflow harness relays the session's user message to every trial (harness, r02)

- **What:** each trial agent receives the latest message of the session that launched the Workflow, labeled as a user request. Trials read it as their own situation. In the r02 first dry run, the message "PLAN MODE to run round 2" made C-T1 number its files r02 and made A-H3 refuse to edit.
- **How to spot it:** a trial answer mentions a round number, mode, or request that is not in its scenario.
- **Seen in:** r02 dry run 1 (wf_5b10e529-364). Round 1 trials also received the long original prompt about the SPE loop, so round 1 A trials saw some SPE context.
- **Fix:** a fixed notice at the start of every trial says to ignore that message. Dry run 2 showed no leak.

## F11. SPE guidance leaks into unrelated requests (guidance, r02)

- **What:** on a typo fix during a running round, every guided config added SPE commit names, staging plans, or prediction paths.
- **How to spot it:** H3 `code:no_ceremony` fails, or judge check 5 fails.
- **Seen in:** C-H3 (7 of 8 failed), C2-H3 (8 of 8), D-H3 (8 of 8). A-H3 passed 8 of 8.
- **Fix:** open. Add a scope rule to the root way, and move commit staging into the evaluate and learn children.

## F12. No guidance says a ceiling makes predictions unscorable (guidance, r02)

- **What:** when every config scored 1.00, trials logged the predictions as misses and reset the stop streak. They also continued on their own instead of handing the decision back.
- **How to spot it:** H5 judge checks 4 and 7 fail.
- **Seen in:** all 32 H5 trials.
- **Fix:** open. Add a ceiling rule (record "not scorable", leave the streak alone, check once for a leak) and a short-handback rule. Review the tension between H5 judge checks 5 and 7.

## F13. The fixed notice shortens action lists before the gates (harness and task design, r02)

- **What:** on T7 (six actions), C and C2 stopped after the save and commit and never reached the gates. The prompt is unchanged from r01, where C passed 5 of 5. The likely cause is the fixed notice, which asks for "the shape the situation asks for". That cause is inferred, not measured.
- **How to spot it:** T7 judge checks 5 and 6 fail while checks 1 and 2 pass.
- **Seen in:** C-T7 (5 of 8 failed), C2-T7 (4 of 8). D-T7 failed 1 of 8, because the predict child puts the gates in the next step.
- **Fix:** keep the notice. Add a line to the root: right after the save and commit, the next step is the gate order.

## F14. The same_tasks check misses equivalent wording (grader, r02)

- **What:** H4 trials that kept the tasks fixed by deferring "proposals that change tasks or graders" failed `code:same_tasks` while judge check 5 passed.
- **How to spot it:** `code:same_tasks` fails and judge check 5 passes.
- **Seen in:** r02-C2-H4-2, r02-C2-H4-3, D-H4 (2 trials).
- **Fix:** a disclosed variant in `grade.py --variant same_tasks`. Round 3 should widen the check.
