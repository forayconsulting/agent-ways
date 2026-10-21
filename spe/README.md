# SPE: building the SPE Loop ways with the SPE Loop

This folder applies the SPE loop (Specify, Predict, Evaluate) from "SPE for Practitioners" (2026-10-17) to one question: what agent ways best sustain and steer a long SPE loop run through Claude Code plan mode and dynamic Workflows?

This folder stays out of any upstream PR.

## The loop here

| Step | File | Status |
|---|---|---|
| Specify | [spec/spec.md](spec/spec.md), [spec/disagreements.md](spec/disagreements.md), raw record in [spec/transcripts/](spec/transcripts/) | r01 written 2026-10-21 |
| Predict | [predictions/](predictions/), approved plans in [plans/](plans/) | r01 pending |
| Evaluate | [evals/](evals/) | r01 pending |
| Learn | `prediction-log.md`, `failures.md` | r01 pending |

## How a round runs in Claude Code

1. The user enters plan mode and names the SPE round. The prompt is the spec.
2. Claude writes the plan. The plan is the prediction. The user approves it.
3. Claude saves the plan to `plans/rNN.md` and the prediction to `predictions/rNN.yaml`, then commits both.
4. Claude builds the harness, passes its gates, and runs the eval as one Workflow call.
5. Claude writes the results, the prediction log, the failures, and the proposals for the next round.
6. The user re-enters plan mode for the next round.

## Git history is the loop

Each round is a run of commits named after its SPE step (`SPE rNN specify`, `predict`, `evaluate (harness)`, `evaluate (results)`, `learn`). Each round ends with a tag `spe-rNN`.
