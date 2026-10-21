# SPE: building the SPE Loop ways with the SPE Loop

This folder applies the SPE loop (Specify, Predict, Evaluate) from "SPE for Practitioners" (2026-10-17) to one question: what agent ways best sustain and steer a long SPE loop run through Claude Code plan mode and dynamic Workflows?

This folder stays out of any upstream PR.

## The loop here

| Step | File | Status |
|---|---|---|
| Specify | [spec/spec.md](spec/spec.md), [spec/disagreements.md](spec/disagreements.md), raw record in [spec/transcripts/](spec/transcripts/) | r01 written 2026-10-21 |
| Predict | [predictions/](predictions/), approved plans in [plans/](plans/) | r01 saved before the run. r02 draft |
| Evaluate | [evals/](evals/), results in [evals/results/r01/](evals/results/r01/) | r01: 117 trials. Mean pass C 0.92, B 0.65, A 0.02 (regraded C 0.96, B 0.83, A 0.14) |
| Learn | [prediction-log.md](prediction-log.md), [failures.md](failures.md) | r01 written. Proposals for r02 at the end of spec.md |

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

## Rules for this folder

- Write the prediction before the round runs, with author and date.
- Never edit a saved prediction. Corrections go in the log beside the original numbers.
- Trial workers use no tools. extract.py voids any trial that called a tool.
