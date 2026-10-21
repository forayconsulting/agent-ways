# Failure analysis for SPE eval r02

## Headline

Pass counts out of 96 trials per config:

| Config | Passed |
|---|---|
| D | 74 |
| C2 | 68 |
| C | 48 |
| A | 14 |

D has 22 failures, and H3 and H5 cause 16 of them. No config covers either case, so both are guidance gaps. The C2 bands rule fixed the missing bands. The D child ways fixed most of the T7 and H4 gaps. Several code checks disagree with the judge check that targets the same behavior. The clearest case is code:same_tasks.

## Failure types

| # | Type | Class | Count | Cells |
|---|---|---|---|---|
| 1 | SPE ceremony leaks into an unrelated request | Guidance gap | 23 failing trials | C-H3 (7), C2-H3 (8), D-H3 (8) |
| 2 | A ceiling result is scored as a plain miss | Guidance gap | judge:4 missed 32 of 32 | A, C, C2 and D on H5 |
| 3 | A long reply after saturation that does not hand back the decision | Guidance gap, with rubric tension | judge:7 missed 32 of 32 | A, C, C2 and D on H5 |
| 4 | Point predictions with no bands | Guidance gap, fixed in C2 | 34 check misses in C, 2 in C2, 0 in D | C-T1, C-T2, C-H1, C-H2, C-H4, C2-H2 |
| 5 | The action list stops before the gates | Task design plus guidance gap | 10 failing trials | C-T7 (5), C2-T7 (4), D-T7 (1) |
| 6 | Metrics are named by reference instead of by name | Guidance gap, fixed in D | judge:7 missed 17 times | C-H4 (8), C2-H4 (8), D-H4 (1) |
| 7 | Gates are described without commands | Guidance gap | judge:7 missed 11 times, mostly in passing trials | C-H2 (3), C2-H2 (4), D-H2 (4) |
| 8 | No guidance, so no loop | Baseline, expected | 82 failing trials | All A cells except A-T6 and A-H3 |
| 9 | The check does not match the behavior it targets | Grader or judge problem | See the broken-checks table | T3, T5, T6, H2, H4, H5, T7 |

### 1. SPE ceremony leaks into an unrelated request

- **Examples:** r02-C2-H3-5 and r02-D-H3-4.
- **What happened:** Every failing answer fixed the typo correctly. Then it explained how future SPE commits would be staged and quoted subjects like "SPE r03 evaluate (results)". Some answers also named spe/predictions/r03.yaml. A passes 8 of 8 on H3, so the guidance caused this behavior. D's root way did not prevent it, and C2's file did not either. The commit-staging rule appears to be the trigger, because almost every failing answer recites it.
- **Fix:** Add this scope rule to the root way:

  > "These rules apply only when the user asks for an SPE step. For any other request during a round, do that request and report only that. Do not mention rounds, predictions, evals, SPE commit names, or staging plans. Do not touch spe/ files or the running Workflow. Commit only if asked, with a plain message about the change."

- **D only:** Move the commit-staging rule out of the root way and into the evaluate and close-out child ways. Then the rule does not load on a typo request.

### 2. A ceiling result is scored as a plain miss

- **Examples:** r02-C2-H5-8 says "That is 3 misses, so the streak is at zero." r02-D-H5-1 says "round 3 is a miss on every category cell."
- **What happened:** Every config counted 1.00 results as misses and reset the stop-rule streak. C2 often treated the identical scores as a leak or a grader bug before it said the tasks no longer separate the configs (judge:2 missed 4 times in C2).
- **Fix:** Add this rule to the close-out guidance:

  > "Ceiling rule. If every config reaches the metric's maximum, the round cannot score predictions or rank configs. Record each prediction as 'not scorable (ceiling)' instead of as a hit or a miss. Leave the stop-rule streak unchanged. Check once for a leak or a grader bug. If the check is clean, say in one sentence that the tasks no longer separate the configs, and propose harder tasks or stricter graders."

### 3. A long reply after saturation that does not hand back the decision

- **Examples:** r02-C-H5-6 says "I will start with the leak and grader checks now." r02-C2-H5-4 says "I'm starting with steps 1 and 2 now."
- **What happened:** Agents wrote plans of five to seven steps and kept going on their own. They asked the user only if an audit failed.
- **Fix:** Add this rule:

  > "After a saturated round, write the close-out files (log, failures, proposals). Then reply in under 10 lines: the result, why it cannot be scored, the proposed change for the next round, and one question asking whether to continue. Do not start the next round or an audit before the user answers."

  This rule also removes the tension between judge:5 (do the full close-out) and judge:7 (keep the reply short). The close-out goes in files, and the reply stays short.

### 4. Point predictions with no bands

- **Examples:** r02-C-T1-3 failed only code:band. r02-C-H1-6 gave "0.83 or $0.003" with no interval.
- **Status:** C2 and D fixed this.
- **What remains:** C2-H2 has 2 cases where the agent copied the draft unchanged and never said the numbers carry bands.
- **Fix:** Add this rule:

  > "When you reuse a draft or last round's numbers, write each number with its band in the reply, for example 0.86 ± 0.04."

### 5. The action list stops before the gates

- **Examples:** r02-C-T7-6 and r02-C2-T7-3.
- **What happened:** The six actions covered the plan copy, the prediction and the commit. The selftest and the dry run never appeared. D passes 7 of 8, so its plan-approved child way mostly fixes this. C2-T7-6 and C2-T7-8 also put the spec step before the plan copy or after the prediction.
- **Fix:** Add this to the plan-approved guidance:

  > "Your first two actions are: copy the plan to spe/plans/rNN.md, then write spe/predictions/rNN.yaml. After the prediction commit, list the next gates in order with their commands: grader selftest, a dry run on 2 to 3 cells, then the full Workflow run."

- **Task design:** Check whether the T7 prompt caps the reply at six actions. If it does, the save and commit steps fill the cap, and judges 5 and 6 penalize agents for following the prompt.

### 6. Metrics are named by reference instead of by name

- **Examples:** r02-C2-H4-2 says "the same metric rows as spe/prediction-log.md for r04". r02-C-H4-5 names only pass rate, cost and p50 latency.
- **What happened:** D nearly fixed this, with 1 miss.
- **Fix:** Add this to C2's text or keep it in D's model-release child way:

  > "For a model change, keep the pinned model as the reference and add the new model as one config next to it. Compare these four metrics by name: accuracy, cost per ticket, tokens per ticket, and time per ticket."

### 7. Gates are described without commands

- **Examples:** r02-C-H2-6 left `<headline>` placeholders and described the gates in prose only. r02-C2-H2-4 says "Run the gates" with no command.
- **Fix:** Add this rule:

  > "Name each gate with the command or script path that runs it. Fill every placeholder before you reply."

### 8. No guidance, so no loop (A baseline)

- **Examples:** r02-A-H2-5 skipped the prediction under time pressure. r02-A-T7-3 wrote spe/predictions/r02.md with no selftest.
- **Sub-patterns:**
  - Under pressure, A skips the prediction (H2: 4 of 8).
  - A defers the prediction to a later step (H1: 7 of 8).
  - A does not save a copy of the plan (T1 and T7: 8 of 8 each).
  - A has no saturation rule (T5: 8 of 8).
  - A's Workflow script has no top-up and no critic (T3: 8 of 8).
  - A's close-out has no hit or miss labels, no draft and no tag (T4: 8 of 8).
- **Fix:** C covers all of these. This group is evidence that the guidance helps. It is not a target for edits.

## Checks that look broken

Each row compares a code check with the judge check that targets the same behavior.

| Check | Task | Code check failures | Matching judge check failures | Verdict |
|---|---|---|---|---|
| code:same_tasks | H4 | A 8, C 7, C2 6, D 2 | judge:5 failed once (C-H4-6) | Likely broken. It alone decides the failures in C2-H4 and D-H4-1/2, because judge:7 by itself cannot fail a trial. Example: in r02-C2-H4-1 the code check failed and judge:5 passed. |
| code:pred_each | T5 | A 8, D 1 | judge:4 failed 0 times | Likely broken. D-T5-4 failed on this check alone. |
| code:dryrun | T3 | A 6 | judge:2 failed 0 times | Likely broken. It probably needs an exact keyword. A-T3-6 calls the step a "smoke check". |
| code:noedit | T6 | A 1, D 2 | judge:1 failed 0 times | Suspect. It is the only failure in A-T6-3, D-T6-2 and D-T6-5. It may trigger on a quoted path or a read of r03.yaml. Check the transcripts. |
| code:halt | T5 | A 3 | judge:3 failed 0 times | Suspect. |
| code:report | T5 | A 2 | judge:7 failed once, in a different trial | Suspect. |
| code:ceiling | H5 | A 7, C 2, C2 7, D 3 | judge:2 failed A 3, C 1, C2 4, D 1 | Partly brittle. C2-H5-5, -7 and -8 fail the code check while judge:2 passes. It probably needs the word "ceiling". |
| code:budget | T5 | A 8, C2 1 | judge:2 failed A 4, C2 0 | Partly brittle. C2-T5-8 failed on this check alone. |
| code:next_round | H5 | A 7 | judge:5 failed A 3 | Partly brittle. |

### Rubric tensions

None of these checks is wrong, but each is strict in a way worth knowing.

- **T7 judges 5 and 6:** These conflict with a six-action cap, if the T7 prompt sets one. D shows the checks can be met by naming the gates as the next step.
- **H5 judge:7 and judge:5:** No config has passed both yet. The rule in type 3 should satisfy both.
- **H2 judge:2 and H4 judge:4:** These require the reply to say "bands". When the agent copies a draft that may already hold bands, the judge cannot see the draft. Examples are C-H2-2 and C2-H2-4. Two fixes would work: give the judge the draft file, or keep the restate-bands rule from type 4.
- **H4 judge:7:** This requires the literal names "tokens" and "time per ticket". A phrase like "every r04 metric" fails even when the metric set is correct.

## Suggested order of edits for r03

1. Add the scope rule (type 1) and move commit staging into the child ways.
2. Add the ceiling rule and the short-handback rule (types 2 and 3).
3. Fix or replace code:same_tasks, code:pred_each and code:dryrun. Inspect the transcripts behind the code:noedit failures.
4. Add the restate-bands line and the gate-command line (types 4 and 7).

Edits 1 and 2 cover 16 of D's 22 failures. The code:same_tasks fix covers 2 more.
