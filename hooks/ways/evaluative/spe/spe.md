---
description: the SPE loop (Specify, Predict, Evaluate) run through Claude Code plan mode, where the user's plan-mode prompt is a lightweight spec, the approved plan is a numeric prediction, a dynamic Workflow runs the eval, and re-entering plan mode respecs the next round; keeps a long unattended loop honest round after round
vocabulary: spe specify predict evaluate respec round prediction spec plan-mode approved plan dynamic workflow eval rounds prediction log failures proposals draft baseline same-as-last-round naive variance converge pre-registered rnn tag
pattern: \bSPE\b( loop| round)?|specify,? predict,? (and )?evaluate|\bre-?spec(ing)?\b
scope: agent
refire: normal
---
<!-- epistemic: convention -->
# The SPE Loop in Claude Code

SPE stands for Specify, Predict, Evaluate. The user's plan mode prompt is the spec. The approved plan is the prediction. One dynamic Workflow run is the eval. The user re-enters plan mode, and Claude respecs from the last round's evidence. One pass is one round.

## Scope

These rules apply when the user asks for an SPE step or names the loop. For any other request during a loop, such as a typo fix or a question, do that request and report only that. Do not mention rounds, predictions, evals, or SPE commit names, and do not touch spe/ files or a running Workflow. Commit it only if asked, with a plain message.

## The plan is the prediction

- **Specify:** a requirement table (ID, Requirement, Source, Test). Each source is the user's words, a decision, or a failure ID like "r02 F7". Adopt or reject each of last round's proposals with a reason. When running autonomously, record choices as defaults.
- **Predict:** one row per metric, one column per configuration, every cell a number with a band, such as 0.85 ± 0.05, and a one-line Why per row. From round 2 on, start from "same as last round" and move a number only for a stated reason. Name the grader check for each number. Change one thing per configuration.
- **Evaluate:** harness steps with gates, the Workflow arguments, and an unmeasured cost estimate.

## After approval, before anything else

1. Copy the plan to `spe/plans/rNN.md`.
2. Write `spe/predictions/rNN.yaml` from the Predict table. Never edit it after a trial has run.
3. Commit both when the user asked for commits.
4. Run the gates in order: grader selftest, last round regraded as a control, dry run. Then launch the Workflow.

## Stop and halt

- Stop when predictions match results for 3 rounds in a row.
- At a ceiling, when every config hits the maximum, record the predictions as not scorable, log the saturation as a failure, propose harder tasks, and let the user decide.
- Halt and report on a budget cap, a leaked answer key, a broken grader, or a decision only the user can make.
- In an unattended loop, never push, deploy, or send.

Moments: evaluative/spe/specify (respec), evaluative/spe/predict (plan approved), evaluative/spe/evaluate (Workflow launch), evaluative/spe/learn (close-out).

## See Also

- evaluative(evaluative) - parent: the author does not touch the judge
- evaluative/agent-eval(evaluative) - trials, graders, and the end state of an agent run
