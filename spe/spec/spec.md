# Spec: SPE Loop ways for Claude Code

## Goal

> "When in plan mode and mentioning the spe Loop, the user's prompt becomes a lightweight spec. The plan that Claude produces from this is a prediction. And running evals via dynamic workflow is a natural way to execute the SPE Loop." ... "This is the exact sort of methodology that agent weighs should be leveraged to sustain and steer, since this Loop may carry on for a very long time without supervision."

Source: the user's round 1 prompt, [transcripts/2026-10-21-r01.md](transcripts/2026-10-21-r01.md).

## Round 1 requirements

| ID | Requirement | Source | Test |
|---|---|---|---|
| R1 | With SPE in plan mode, the prompt is the spec, and the plan is a prediction with numbers and a Why per number | user prompt | T1, T2 |
| R2 | The prediction is saved to `spe/predictions/rNN.yaml` and the plan to `spe/plans/rNN.md`, and both are committed before any eval trial | user prompt, quantum drift 1 and 2 | T1, T6, T7 |
| R3 | The eval is a Workflow with gates (grader selftest, `args.only` dry run), one change per config, budget caps, and answer keys out of worker reach | user prompt, guide p8 | T3 |
| R4 | The close-out writes the prediction log with a verdict and a naive column, failures in F-format, proposals, and a draft next prediction | guide p7 and p12, quantum | T4 |
| R5 | The respec turns the last proposals into requirements that cite failure IDs, and logs autonomous defaults | quantum r02 and r03 | T2 |
| R6 | An unattended loop declares numeric stop and halt rules and a budget cap, and never edits a saved prediction | user prompt, quantum drift 3 and 4 | T5, T6 |
| R7 | The ways fire on SPE prompts, on `spe/` writes, and at the tool moments, and stay silent otherwise | ways design, user correction 1 | trigger and hook cases |
| R8 | The engine gains a `tools:` lane that fires ways on named tool calls. It is upstream quality: tests, ADR, docs, schema, and lint | user correction 2 | engine gates |
| R9 | The ways pass lint, register, and Jaccard checks, and each has a golden sidecar | repo rules (ADR-701, ADR-178) | verification |

"Quantum drift" refers to the eight problems found in `~/Desktop/quantum/spe` rounds r01 to r03. They are listed in [../plans/r01.md](../plans/r01.md).

## Revision history

- 2026-10-21: round 1 requirements R1 to R9.
