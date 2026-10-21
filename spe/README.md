# SPE: building the SPE Loop ways with the SPE Loop

This folder applies the SPE loop (Specify, Predict, Evaluate) from "SPE for Practitioners" (2026-10-17) to one question: what agent ways best sustain and steer a long SPE loop run through Claude Code plan mode and dynamic Workflows?

This folder stays out of any upstream PR.

## The loop here

| Step | File | Status |
|---|---|---|
| Specify | [spec/spec.md](spec/spec.md), [spec/disagreements.md](spec/disagreements.md), raw record in [spec/transcripts/](spec/transcripts/) | r01 written 2026-10-21 |
| Predict | [predictions/](predictions/), approved plans in [plans/](plans/) | r01 to r03 saved before their runs. r04 draft |
| Evaluate | [evals/](evals/), results in [evals/results/](evals/results/) | r01: 117 trials. Mean pass C 0.92, B 0.65, A 0.02 (regraded C 0.96, B 0.83, A 0.14). r02: 384 trials. Mean pass D 0.77, C2 0.71, C 0.50, A 0.15. r03: 308 trials. Text E 0.86, D 0.64. Real tools E 6/6 and 6/6 |
| Learn | [prediction-log.md](prediction-log.md), [failures.md](failures.md) | r01 to r03 written. Proposals for r04 at the end of spec.md |

## How a round runs in Claude Code

1. The user enters plan mode and names the SPE round. The prompt is the spec.
2. Claude writes the plan. The plan is the prediction. The user approves it.
3. Claude saves the plan to `plans/rNN.md` and the prediction to `predictions/rNN.yaml`, then commits both.
4. Claude builds the harness, passes its gates, and runs the eval as one Workflow call.
5. Claude writes the results, the prediction log, the failures, and the proposals for the next round.
6. The user re-enters plan mode for the next round.

## Git history is the loop

Each round is a run of commits named after its SPE step (`SPE rNN specify`, `predict`, `evaluate (harness)`, `evaluate (results)`, `learn`). Each round ends with a tag `spe-rNN`.

## How to rerun round 1

```bash
python3 -I spe/evals/graders/grade.py --selftest
python3 -I spe/evals/harness/build_workflow.py r01
bash spe/evals/triggers/run_triggers.sh "$(readlink -f ~/.claude/bin/ways)"
```

Then run the Workflow tool with `scriptPath: spe/evals/harness/r01-workflow.js` and `args: {"round": "r01", "trials": 5, "topupCap": 24}`. A dry run adds `"only": ["A-T1", "B-T7", "C-T3"]`. After the run:

```bash
python3 -I spe/evals/graders/extract.py <transcriptDir> spe/evals/results/r01
python3 -I spe/evals/graders/grade.py spe/evals/results/r01
python3 -I spe/evals/graders/grade.py spe/evals/results/r01 --variant fentry
```

## Round 1 in one paragraph

Three configs ran 7 SPE moments with 5 trials each, plus 12 top-ups: A had no SPE guidance, B had the evaluative/spe tree, and C had one slim file. Any guidance lifted the mean pass rate from 0.02 to 0.65 or more. The slim file beat the tree, at 0.96 against 0.83 after a disclosed regrade, and it used fewer tokens. The tree lost mainly on the moment right after plan approval, because the predict child names no eval gates (F3). A code check failed honest placeholder failure numbers (F1), and the live brief scan injected different unrelated ways per config (F4). Claude's predictions hedged toward 0.8 and missed most cells. The naive guess "B equals C" was closer than the predicted "B beats C". The engine gained a `tools:` lane (ADR-704) so the children can fire when plan mode is entered, when a plan is approved, and when a Workflow launches.

## How to rerun round 2

```bash
python3 -I spe/evals/tasks/make_tasks.py   # from spe/evals/tasks
python3 -I spe/evals/graders/grade.py --selftest
python3 -I spe/evals/harness/build_workflow.py r02
```

Then run the Workflow tool with `scriptPath: spe/evals/harness/r02-workflow.js` and `args: {"round": "r02", "trials": 8, "topupCap": 0}`. Extract and grade as for round 1, with `--variant same_tasks` for the disclosed regrade.

## Round 2 in one paragraph

Four configs ran 12 tasks with 8 trials each: A had no guidance, C was the round 1 slim file, C2 added a bands rule, and D was the C2 text as a root way plus revised children. Every trial opened with a fixed notice, which stopped the harness from leaking the session's own message into trials (F10) and gave every config the same live ways. D led at 0.77, then C2 at 0.71, C at 0.50, and A at 0.15. The bands rule and the revised children worked. Every guided config failed the control task by reciting SPE rules on a typo fix (F11), and no config handled a saturated round well (F12). Predictions hit 28 of 48 cells, up from 2 of 21, but the naive guess still edged them on the round 1 tasks.

## How to rerun round 3

```bash
python3 -I spe/evals/graders/grade.py --selftest
python3 -I spe/evals/graders/grade_e2e.py --selftest
python3 -I spe/evals/harness/build_workflow.py r03
```

Then run the Workflow tool with `scriptPath: spe/evals/harness/r03-workflow.js` and `args: {"round": "r03", "trials": 8, "e2eTrials": 6, "topupCap": 0}`. Move the personal `evaluative/spe` ways aside during the run, so the live root does not fire into the E2E trials. After the run, run `extract.py`, then `grade.py` (add `--variant order_list` for the disclosed regrade), then `grade_e2e.py`.

## Round 3 in one paragraph

Config E added four rules to D: a scope rule, a ceiling and handback rule, a gate line in the root, and pinning for new models. Round 3 ran 17 text tasks (including 5 paraphrases) with 8 trials each, plus real tool trials in sandbox git repos. The semantic lane was turned on before the run, after the session found that shadow stubs had starved its calibration (F16). Building the round also uncovered that the task prompts had left out the project text since round 1 (F15). E led D at 0.86 against 0.64. It fixed the control tasks, the saturated round, and the after-approval step. In real tool trials, both configs saved and committed the prediction first, and only E kept SPE talk out of a typo fix. Predictions hit 27 of 40 cells and beat the naive guess for the first time. E is installed as the personal SPE tree.

## Rules for this folder

- Write the prediction before the round runs, with author and date.
- Never edit a saved prediction. Corrections go in the log beside the original numbers.
- Trial workers use no tools. extract.py voids any trial that called a tool.
