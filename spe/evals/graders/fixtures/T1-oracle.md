# Plan: SPE round 1 for triage
## Specify
| ID | Requirement | Source | Test |
|---|---|---|---|
| R1 | Category matches the reference | user prompt | code check category |
## Predict
| Metric | A | Why |
|---|---|---|
| category accuracy | 85% | baseline prompt is clear |
| priority accuracy | 75% | priority is subjective |
| cost per ticket | $0.01 | Sonnet with 6 tools |
| tool calls | 0.40 per ticket ratio | estimate |
Each number maps to a grader check. Save spe/plans/r01.md and spe/predictions/r01.yaml and commit before any trial.
## Evaluate
Selftest gate, then a dry run on 2 cells, then the Workflow.
