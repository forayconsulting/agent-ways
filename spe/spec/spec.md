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

## Round 2 requirements

| ID | Requirement | Source | Test |
|---|---|---|---|
| R10 | Each predicted number carries a band | r01 F2, P3 | `band` code check on T1, T2, H1 |
| R11 | Right after approval, the agent saves and commits the prediction and then names the gates (selftest, control regrade, dry run) before any trial | r01 F3, P2 | T7 |
| R12 | The agent spots the loop moment when the prompt does not name it | r01 F7, P6 | H1 |
| R13 | When the user pushes to skip the prediction, the agent still saves a short one before the run and says why in one line | P6 | H2 |
| R14 | An unrelated small request in the middle of a loop gets done with no SPE ceremony | r01 F7, P6 | H3 |
| R15 | A model release starts a new round, with the new model as a new configuration next to the pinned one | guide p13 | H4 |
| R16 | A saturated round leads to harder tasks or stricter graders, not to stopping | guide p12, r01 F5 | H5 |
| R17 | The live hooks inject the same unrelated ways into every config | r01 F4, P5 | `live_ways` summary from extract.py |

## Revision history

- 2026-10-21: round 1 requirements R1 to R9.
- 2026-10-21: round 2 requirements R10 to R17, from proposals P1 to P6 (see disagreements.md for the round 2 defaults).

## Proposed for round 2 (not yet agreed)

| ID | Proposed change | Why (round 1 evidence) |
|---|---|---|
| P1 | Replace the root body with the slim file's full checklist and keep the children as moment reminders. Test it as config D (C root plus children) against C | C 0.96 against B 0.83 (regraded) at fewer tokens. The children still matter for timing in long sessions, which round 1 could not measure (F9) |
| P2 | End the predict child with the gate order: selftest, control regrade, dry run | F3, B-T7 1 of 7 |
| P3 | Give every predicted number a band, in the predict way, the slim file, and this loop's own r02.yaml | F2 |
| P4 | State the last failure number in T4 and T6, and keep the fentry check strict | F1 |
| P5 | Put the way block after the scenario in every trial prompt | F4 |
| P6 | Raise the ceiling: unlabeled phases, pressure to skip the prediction, a non-SPE control task, two paraphrases per task, and n=10 per cell | F5, F6, F7 |
| P7 | Run T1 and T7 for real in a sandbox repo with tools, and check the disk and git order | F9 |
| P8 | Verify the tools: lane live for ExitPlanMode and EnterPlanMode once the engine build is installed | Unverified in -p |

## Proposed for round 3 (not yet agreed)

| ID | Proposed change | Why (round 2 evidence) |
|---|---|---|
| Q1 | Add a scope rule to the root: the SPE rules apply only to SPE steps, and other requests get done plainly. Move the commit-staging text into the evaluate and learn children | F11, H3 1 of 24 in guided configs |
| Q2 | Add a ceiling rule (predictions at a ceiling are "not scorable", the streak stays, check once for a leak) and a short-handback rule to the learn child and the root's stop rules | F12, H5 0 of 32 |
| Q3 | Add one line to the root: after the save and commit, the next step is the gate order | F13, C2-T7 0.50 |
| Q4 | Add pinning to the evaluate child and the root: a new model is a new config next to the pinned one | H4 C2 0.25 against D 0.75 |
| Q5 | Widen same_tasks. Give H2 and H4 judges the draft file. Review H5 judge checks 5 and 7 | F14, critic rubric tensions |
| Q6 | Carry over P7 (real tool trials) and P8 (live tools: lane) | Still deferred |
| Q7 | Paraphrase variants and a cross-family or human judge check on 20 samples | r01 and r02 critics |
