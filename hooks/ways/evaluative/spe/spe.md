---
description: the SPE loop (Specify, Predict, Evaluate) run through Claude Code plan mode, where the user's plan-mode prompt is a lightweight spec, the approved plan is a numeric prediction, a dynamic Workflow runs the eval, and re-entering plan mode respecs the next round; keeps a long unattended loop honest round after round
vocabulary: spe specify predict evaluate respec round prediction spec plan-mode approved plan dynamic workflow eval rounds prediction log failures proposals draft baseline same-as-last-round naive variance converge pre-registered rnn tag
pattern: \bSPE\b( loop| round)?|specify,? predict,? (and )?evaluate|\bre-?spec(ing)?\b
scope: agent
refire: normal
---
<!-- epistemic: convention -->
# The SPE Loop in Claude Code

SPE stands for Specify, Predict, Evaluate. In Claude Code each step maps to a native feature.

| Step | Claude Code feature | Artifact |
|---|---|---|
| Specify | The user's plan mode prompt | `spe/spec/spec.md`, with the raw prompt in `spe/spec/transcripts/` |
| Predict | The plan the user approves | `spe/plans/rNN.md` and `spe/predictions/rNN.yaml` |
| Evaluate | One dynamic Workflow run | `spe/evals/harness/rNN-workflow.js` and `spe/evals/results/rNN/` |
| Learn | The close-out after the run | `spe/prediction-log.md`, `spe/failures.md`, proposals in the spec |

The user re-enters plan mode to start the next round. Claude respecs from the last round's evidence. One pass is one round. A new round starts with each design change, model release, or surprising result.

## The plan is the prediction

When the user names SPE in plan mode, the plan carries these sections.

1. **Specify.** A requirement table with the columns ID, Requirement, Source, and Test. Each source is the user's words, a decision, or a failure ID from the last round.
2. **Predict.** A table with one row per metric and one column per configuration. Every cell is a number. Write "88% pass, 6 tool calls, $0.10 per task", never "faster" or "better". Every row gets a one-line Why. From round 2 on, add a "same as last round" column.
3. **Evaluate.** The harness build steps, each with a gate. The Workflow arguments. A cost and time estimate labeled as unmeasured.
4. **Close-out.** The learn step and the commit names.

A prediction that cannot fail is not a prediction. Each predicted number names the grader check that will measure it.

## Round anatomy

Commit each step when the user has asked for commits, so git history shows the loop.

| Commit subject | When |
|---|---|
| `SPE rNN specify: ...` | The spec and transcript are written |
| `SPE rNN predict: ...` | The plan and prediction are saved, before any harness work or trial |
| `SPE rNN evaluate (harness): ...` | The gates pass and the dry run is clean |
| `SPE rNN evaluate (results): <headline numbers>` | The run is graded |
| `SPE rNN learn: ...`, then tag `spe-rNN` | The log, failures, and proposals are written |

## Stop and halt

- Stop iterating when predictions match the results within their stated error for 3 rounds in a row. Report that the design is stable enough to judge for go-live.
- A round where every configuration passes everything measured nothing. The next round needs harder tasks or stricter graders, not more trials.
- Halt the round and report when a budget cap is hit, when an answer key leaks to a trial, or when a grader is found broken mid-run.

## Lifecycle

1. evaluative/spe/specify - the respec from last round's evidence
2. evaluative/spe/predict - saving the prediction after the plan is approved
3. evaluative/spe/evaluate - the Workflow harness and its gates
4. evaluative/spe/learn - the prediction log, failures, and the next round's proposals

## See Also

- evaluative(evaluative) - parent: the author does not touch the judge
- evaluative/ablation(evaluative) - arms with and without a change, graded blind
- evaluative/agent-eval(evaluative) - trials, graders, and the end state of an agent run
