# The SPE Loop in Claude Code

SPE stands for Specify, Predict, Evaluate. The user's plan mode prompt is the spec. The approved plan is the prediction. One dynamic Workflow run is the eval. The user re-enters plan mode, and Claude respecs from the last round's evidence. One pass is one round.

## Files

| Path | Content |
|---|---|
| `spe/spec/transcripts/<date>-rNN.md` | The user's prompt and planning answers, verbatim, never edited |
| `spe/spec/spec.md` | One requirement table per round: ID, Requirement, Source, Test |
| `spe/spec/disagreements.md` | Open decisions with an owner, and logged defaults |
| `spe/plans/rNN.md` | A lasting copy of the approved plan |
| `spe/predictions/rNN.yaml` | The numeric prediction, saved before the run |
| `spe/evals/harness/rNN-workflow.js` | The round's Workflow script |
| `spe/prediction-log.md`, `spe/failures.md` | Predicted versus measured, and F-numbered failure types |

## The plan is the prediction

- **Specify:** a requirement table. Each source is the user's words, a decision, or a failure ID like "r02 F7". Turn last round's proposals into rows. Adopt or reject each proposal with a reason. When running autonomously, record choices as defaults.
- **Predict:** one row per metric, one column per configuration, every cell a number, a one-line Why per row. From round 2 on, start from "same as last round" and move a number only for a stated reason. Name the grader check for each number. Change one thing per configuration.
- **Evaluate:** harness steps with gates, the Workflow arguments, and an unmeasured cost estimate.

## After approval, before anything else

1. Copy the plan to `spe/plans/rNN.md`.
2. Write `spe/predictions/rNN.yaml` with round, date, author ("Claude, approved by the user in plan mode"), configs, numbers, a Why per number, and `same_as_last_round`. Start it with `# Saved before the eval ran. Do not edit after the run.`
3. Commit both as `SPE rNN predict: ...` when the user asked for commits.

Never edit a saved prediction after a trial has run.

## The Workflow eval

- Gates before launch: the grader selftest (oracle passes, empty and wrong fail), a regrade of last round as a control, and a dry run on 2 or 3 cells.
- Hold the round in one `ROUND` constant. Never write round numbers by hand in prompt text.
- Trials get a schema. Code checks come first, judges only for what code cannot check.
- Trials must not read graders, answers, or predictions. Scan transcripts and void any trial that peeked.
- Cap every paid resource and skip trials that would cross the cap. Log the skips.
- Split cells get extra trials up to a cap. End with failure analysis and a completeness critic.

## Close-out (learn)

A Workflow returns at launch. Close out when its completion notice arrives.

- `spe/prediction-log.md`: Metric, Config, Predicted, Measured, Same as last round, Verdict, Closer. Under it, "Which Why broke" quotes each missed Why and names the wrong assumption. Say plainly if the naive guess beat the predictions.
- `spe/failures.md`: per new failure type, the name, kind, round, What, How to spot it, Seen in, and Fix. A grader bug found after the run is a failure. Keep original and regraded numbers side by side.
- A "Proposed for round N+1" table in the spec, and `spe/predictions/rNN-draft.yaml` marked `status: draft`.
- Update `spe/README.md`. Commit `SPE rNN learn: ...` and tag `spe-rNN`.

## Commits

`SPE rNN specify`, `SPE rNN predict` (before any harness work), `SPE rNN evaluate (harness)`, `SPE rNN evaluate (results): <headline>`, `SPE rNN learn`, tag `spe-rNN`.

## Stop and halt

- Stop when predictions match results for 3 rounds in a row.
- If every configuration passes everything, the next round needs harder tasks or stricter graders.
- Halt and report on a budget cap, a leaked answer key, a broken grader, or a decision only the user can make.
- In an unattended loop, never push, deploy, or send. The final report gives each round's headline, the prediction accuracy trend, and open decisions.
