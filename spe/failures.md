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
