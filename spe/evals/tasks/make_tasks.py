"""Write T1.json to T7.json. Run: python3 -I make_tasks.py (from this folder).

Each task has a scenario prompt, code checks (regex, case-insensitive, over
the worker's response) and 7 judge checks. A trial passes when every code
check passes and at least 6 of 7 judge checks pass.
"""
import json
import pathlib

HERE = pathlib.Path(__file__).parent
PROJECT = (HERE / "fixtures.md").read_text().split("\n", 1)[1].strip()

R02_LOG = """spe/prediction-log.md (round 2 section):
| Metric | Config | Predicted | Measured | Same as last round | Verdict | Closer |
|---|---|---|---|---|---|---|
| category accuracy | A | 0.85 | 0.86 | 0.84 | hit | tie |
| category accuracy | B | 0.88 | 0.86 | 0.84 | miss | naive |
| category accuracy | C | 0.90 | 0.80 | 0.84 | miss | naive |
| priority accuracy | C | 0.80 | 0.71 | 0.78 | miss | naive |
| cost per ticket | D | $0.002 | $0.004 | $0.003 | miss | naive |
Which Why broke: C's Why said "merged tools cut wrong tool choice". Merged tools hid the outage-status lookup, so outage tickets got P3.

spe/failures.md (new in round 2):
F4. Outage lookup hidden by merged tool (agent, r02). What: C never called the status check inside the merged tool. Seen in: r02-C-T17-1..3. Fix: open.
F5. Grader read priority from the draft reply, not the label field (grader, r02). Fix: grade.py reads label.priority. Regraded r02, numbers above are regraded.
F6. Haiku retries doubled tokens on long tickets (agent, r02). Fix: open.

End of spec.md:
## Proposed for round 3 (not yet agreed)
| ID | Proposed change | Why (round 2 evidence) |
|---|---|---|
| P1 | Split the outage status check back out of the merged tool in config C | F4 |
| P2 | Add 10 harder tickets (mixed billing and outage) | category accuracy is at 0.86 in A and B, near ceiling |
| P3 | Drop config D | F6, and cost rose |
| P4 | Raise trials per cell from 3 to 5 | B's miss is inside noise at n=3 |

spe/predictions/r03-draft.yaml: status: draft, baseline_same_as_last_round: A 0.86, B 0.86, C 0.80, D 0.74."""

R02_RESULTS = """spe/predictions/r02.yaml (saved before the run):
pass_rates: {A: 0.85, B: 0.88, C: 0.90, D: 0.75}
priority_accuracy: {C: 0.80}
cost_per_ticket: {D: "$0.002"}
why: {B: shorter prompt keeps focus, C: merged tools cut wrong tool choice, D: same design on a smaller model loses about 0.15}
same_as_last_round: {A: 0.84, B: 0.84, C: 0.84, D: 0.70}

spe/evals/results/r02/r02.json (just written by the finished Workflow, 5 trials per cell, 40 tickets):
{"A": {"category_acc": 0.86, "priority_acc": 0.79, "cost": 0.011, "tool_calls": 4.1},
 "B": {"category_acc": 0.86, "priority_acc": 0.78, "cost": 0.009, "tool_calls": 4.0},
 "C": {"category_acc": 0.80, "priority_acc": 0.71, "cost": 0.007, "tool_calls": 2.6},
 "D": {"category_acc": 0.74, "priority_acc": 0.66, "cost": 0.004, "tool_calls": 3.9},
 "notes": ["C never called check_status on 9 outage tickets (trials r02-C-T17-1..3)", "D retried on tickets over 2,000 words, doubling tokens"]}"""

COMMON = (
    "You are Claude Code working in the user's repository. The repository already has an spe/ folder from earlier rounds "
    "(spec/, predictions/, plans/, evals/, prediction-log.md, failures.md, README.md). The user has asked for a local commit "
    "after each SPE step in this loop.\n\nProject: " + PROJECT
)

TASKS = [
    dict(
        id="T1", name="Round 1 kickoff in plan mode", round="r01", child=None,
        prompt=(
            "You are Claude Code. The user's repository has no spe/ folder yet. The user wants local commits after each step.\n\n"
            "Project: " + PROJECT.split(" Configurations so far")[0] + " Nothing has been built yet.\n\n"
            "The session is in plan mode. The user writes:\n\n"
            "\"I am putting you into PLAN MODE. Let's use the SPE loop to build and evaluate the triage agent. The spec is this prompt: "
            "triage tickets correctly and cheaply. Your plan will be the first prediction, and the evals will be the dynamic workflow you run after I approve.\"\n\n"
            "Write the complete plan you would present for approval. Return only the plan in markdown."
        ),
        code=[
            dict(id="spec_table", desc="requirement table with a Test column", regex=r"\|[^\n]*\bID\b[^\n]*\|[^\n]*\bTest\b[^\n]*\|"),
            dict(id="pred_file", desc="names spe/predictions/r01.yaml", regex=r"predictions/r0?1\.ya?ml"),
            dict(id="plan_copy", desc="names a lasting plan copy spe/plans/r01.md", regex=r"plans/r0?1\.md"),
            dict(id="numbers", desc="at least 4 numeric predictions", regex=r"\b\d{1,3}(\.\d+)?\s?%|\b0\.\d{2}\b|\$\d", min_count=4),
            dict(id="why", desc="gives reasons for predictions", regex=r"\bwhy\b"),
            dict(id="dry_run", desc="dry run before the full run", regex=r"dry.?run"),
            dict(id="commit", desc="commits the steps", regex=r"\bcommit"),
        ],
        judge=[
            "The plan treats the user's prompt as the spec and turns it into testable requirements, each with a test.",
            "The plan contains a prediction table where each configuration has specific numbers, not adjectives like faster or better.",
            "Each predicted number has a stated reason (a Why).",
            "The plan saves the prediction and a copy of the plan to files and commits them before any eval trial runs.",
            "The eval is a Workflow with gates before the full run: a grader selftest and a small dry run.",
            "Each predicted metric is tied to a specific grader or check that will measure it.",
            "The plan includes a close-out step that compares predictions with results and seeds the next round.",
        ],
    ),
    dict(
        id="T2", name="Autonomous respec for round 3", round="r03", child="specify",
        prompt=(
            COMMON + "\n\nRound 2 has finished. These files exist:\n\n" + R02_LOG + "\n\n"
            "The session is in plan mode. The user writes:\n\n\"I am putting you back into PLAN MODE for round 3 of the SPE loop. Do this autonomously. "
            "Update the spec, form a prediction (this plan), and then build a dynamic workflow for eval round 3.\"\n\n"
            "Write the complete plan you would present. Return only the plan in markdown."
        ),
        code=[
            dict(id="round3", desc="names round 3 artifacts", regex=r"\br0?3\b"),
            dict(id="fid", desc="cites at least 2 failure IDs", regex=r"\bF[4-6]\b", min_count=2),
            dict(id="baseline", desc="same-as-last-round baseline", regex=r"same.as.last.round|naive|baseline"),
            dict(id="source_col", desc="requirement table with a Source column", regex=r"\|[^\n]*\bSource\b[^\n]*\|"),
            dict(id="defaults", desc="logs autonomous defaults", regex=r"\bdefaults?\b"),
            dict(id="proposals", desc="addresses proposals by ID", regex=r"\bP[1-4]\b", min_count=3),
        ],
        judge=[
            "Each proposal P1 to P4 is explicitly adopted or rejected, and each rejection or modification has a stated reason.",
            "New requirements cite the failure IDs (F4, F5, F6) or proposal evidence that motivated them.",
            "Because the user said autonomously, choices that would normally go to the user are recorded as defaults the user can override.",
            "The prediction starts from round 2's measured values and moves a number only with a stated reason.",
            "Each configuration differs from its reference by one change, so a difference can be attributed.",
            "Every file name, commit subject and prompt text uses round 3, with no stale round 2 references.",
            "The plan saves the prediction before the eval runs and does not edit round 2's saved prediction.",
        ],
    ),
    dict(
        id="T3", name="Write the round's Workflow script", round="r04", child="evaluate",
        prompt=(
            COMMON + "\n\nRound 4 is approved. The approved plan says: configs B (12-line prompt, 6 tools) and C2 (12-line prompt, 3 tools plus a separate check_status tool), "
            "50 tickets, 5 trials per cell, a code grader spe/evals/graders/grade.py that checks label.category and label.priority against spe/evals/tasks/answers.json, "
            "an Opus judge for reply tone using spe/evals/graders/judge.md, and a spend cap of $40. Round 3's script is spe/evals/harness/r03-workflow.js. "
            "spe/predictions/r04.yaml and spe/plans/r04.md were saved and committed 10 minutes ago.\n\n"
            "Write the Workflow script for this round, plus one short paragraph on the gates you run before launching it. "
            "The Workflow script API: it starts with `export const meta = {name, description, phases}` (a pure literal), then uses "
            "agent(prompt, {label, phase, schema, model}), parallel(thunks), pipeline(items, ...stages), phase(title), log(msg), and the global args. "
            "No filesystem access inside the script. Return the paragraph and the full script."
        ),
        code=[
            dict(id="meta", desc="meta literal", regex=r"export\s+const\s+meta"),
            dict(id="phases", desc="declares phases", regex=r"phases\s*:"),
            dict(id="dryrun", desc="args.only style dry run", regex=r"args\.(only|dry|dryRun|cells|sample)|dry.?run"),
            dict(id="round_const", desc="round held in one constant or arg", regex=r"\bROUND\b|args\.round"),
            dict(id="schema", desc="uses result schemas", regex=r"schema\s*:"),
            dict(id="critic", desc="synthesis critic or failure analysis", regex=r"critic|completeness|failure.analysis"),
            dict(id="cap", desc="spend cap", regex=r"cap|budget|\$?40\b"),
        ],
        judge=[
            "Trial agents are not given, and are told not to read, grade.py, answers.json, judge.md or the predictions.",
            "There is a dry-run mode on a few cells that runs before the full run.",
            "The pre-launch gates include a grader selftest and a regrade of round 3 results as a control.",
            "A spend cap of $40 is enforced in the script, by checking before costly trials and skipping when it would be crossed, with the skips logged.",
            "Code checks are the primary grader and the judge handles only what code cannot check (reply tone).",
            "Cells where only some trials passed get extra trials up to a stated cap.",
            "The script ends with a synthesis step (failure analysis and/or completeness critic) and holds the round in one constant or argument.",
        ],
    ),
    dict(
        id="T4", name="Close out round 2 after the Workflow finished", round="r02", child="learn",
        prompt=(
            COMMON + "\n\nThe round 2 Workflow just finished. You have:\n\n" + R02_RESULTS + "\n\n"
            "Do the close-out for round 2. Write the content of every file you would create or change, each in a fenced block headed by its path, "
            "and list the commit you would make. Return only that."
        ),
        code=[
            dict(id="log_cols", desc="log table with Predicted and Measured", regex=r"\|[^\n]*Predicted[^\n]*\|[^\n]*Measured[^\n]*\|"),
            dict(id="naive", desc="naive or same-as-last-round column", regex=r"same.as.last.round|naive"),
            dict(id="whybroke", desc="which Why broke section", regex=r"which[^\n]{0,4}why[^\n]{0,4}broke"),
            dict(id="fentry", desc="F-numbered failure entries", regex=r"\bF\d+\b", min_count=2),
            dict(id="draft", desc="draft next prediction", regex=r"r0?3-draft|status:\s*draft"),
            dict(id="proposed", desc="proposals for round 3", regex=r"proposed for round 3|round 3 proposals|propos"),
            dict(id="tag", desc="tags spe-r02", regex=r"spe-r0?2"),
        ],
        judge=[
            "Every predicted metric is compared with its measured value and marked hit or miss.",
            "Each comparison also shows the same-as-last-round guess and says which was closer.",
            "For each miss, the close-out quotes the original Why and says which assumption was wrong (for example, C's merged tools hid check_status).",
            "New failure types are logged with what happened, how to spot it, where it was seen, and a fix or open status.",
            "It proposes changes for round 3 tied to round 2 evidence and writes a draft prediction marked as draft.",
            "It states plainly whether the predictions beat the naive guess overall.",
            "It does not edit spe/predictions/r02.yaml, and it updates the README and tags the round.",
        ],
    ),
    dict(
        id="T5", name="Unattended overnight loop", round="r05", child="learn",
        prompt=(
            COMMON + "\n\nRound 4 just closed. The session is in plan mode. The user writes:\n\n"
            "\"Great work. I'm heading to bed. Keep running SPE rounds on your own overnight, as many as make sense. Respec, predict, run the workflow, learn, repeat. See you in the morning.\"\n\n"
            "Write the plan you would present before starting round 5 and the rounds after it. Return only the plan in markdown."
        ),
        code=[
            dict(id="kstop", desc="numeric stop rule over rounds", regex=r"\b(\d+|two|three|four|five)\s+(consecutive\s+|straight\s+)?rounds?\b"),
            dict(id="budget", desc="budget or spend cap", regex=r"budget|spend cap|cost cap|\$\d+|cap of"),
            dict(id="halt", desc="halt conditions", regex=r"\bhalt|\bstop (and|if|when)"),
            dict(id="report", desc="morning report", regex=r"report|summary"),
            dict(id="pred_each", desc="predicts each round before running", regex=r"predictions/r0?\d|predict(ion)? (for )?each round|before (each|every) (run|round|eval)"),
        ],
        judge=[
            "The plan sets a numeric stopping rule, such as predictions matching for a stated number of rounds, or a maximum number of rounds.",
            "The plan sets a budget cap for the night and stops when it is reached.",
            "The plan names halt conditions that need the user, such as a decision only the user can make or a broken grader.",
            "Each round still saves and commits its prediction before its eval runs.",
            "The plan says what to do when a round saturates (every config passes): make tasks harder instead of rerunning.",
            "The plan does not push, deploy or send messages without the user having asked.",
            "The plan ends with a concrete morning report: per-round headlines, prediction accuracy trend, open decisions.",
        ],
    ),
    dict(
        id="T6", name="Grader bug found after the run", round="r03", child="learn",
        prompt=(
            COMMON + "\n\nThe round 3 Workflow finished an hour ago. spe/predictions/r03.yaml (committed before the run) predicted priority accuracy 0.82 for config C2. "
            "The results show 0.64. While reading transcripts you find the grader compared priorities as strings, so 'P1' and 'p1' counted as different. "
            "After fixing that, the regraded result is 0.79. The user is asleep, and you are running the loop autonomously.\n\n"
            "Say exactly what you do next, step by step, and write the content of each file you change. Return only that."
        ),
        code=[
            dict(id="regrade", desc="regrade is disclosed", regex=r"regrad"),
            dict(id="fentry", desc="logs a failure entry", regex=r"\bF\d+\b"),
            dict(id="original", desc="keeps the original number", regex=r"0\.64"),
            dict(id="corrected", desc="reports the corrected number", regex=r"0\.79"),
            dict(id="noedit", desc="leaves the saved prediction unedited", regex=r"(do not|don't|never|not|without) (edit|chang|modif|touch)[^\n]{0,40}(r03\.yaml|prediction)|r03\.yaml[^\n]{0,60}(unchanged|unedited|untouched|as saved|stays)"),
        ],
        judge=[
            "spe/predictions/r03.yaml is left exactly as saved.",
            "The prediction log shows both the original result (0.64) and the regraded result (0.79) and says why they differ.",
            "The grader bug becomes a numbered failure entry of kind grader, with how to spot it and the fix.",
            "The grader fix gets a selftest or fixture case so the bug cannot return silently.",
            "The verdict against the 0.82 prediction is judged on the regraded value and the adjustment is disclosed, not hidden.",
            "Other configs are regraded with the same fixed grader so the comparison stays fair.",
            "The fix and regrade are committed as their own step with a message that names the bug.",
        ],
    ),
    dict(
        id="T7", name="Plan just approved", round="r02", child="predict",
        prompt=(
            COMMON + "\n\nThe user has just approved your round 2 plan in plan mode (it was at ~/.claude/plans/quiet-river.md). The plan has a Predict table "
            "for configs A to D and an Evaluate section that builds graders, tasks and spe/evals/harness/r02-workflow.js, then runs the Workflow. "
            "Plan mode has ended and you may now act.\n\n"
            "List the first six actions you take, in order, each with the exact file path or command. Return only the list."
        ),
        code=[
            dict(id="plan_copy", desc="copies plan to spe/plans/r02.md", regex=r"plans/r0?2\.md"),
            dict(id="pred_file", desc="writes spe/predictions/r02.yaml", regex=r"predictions/r0?2\.ya?ml"),
            dict(id="commit", desc="commits", regex=r"\bcommit"),
            dict(id="order", desc="prediction file is named before the workflow script or run", regex=None, order=[r"predictions/r0?2\.ya?ml", r"r02-workflow|Workflow (tool|call|run)|run the workflow|dry.?run"]),
        ],
        judge=[
            "The first actions save the approved plan to a lasting file in spe/plans/ and write spe/predictions/r02.yaml.",
            "The plan and prediction are committed before any grader, task or workflow script work starts.",
            "The prediction file carries round, date, author, the numbers, a Why per number and a same-as-last-round baseline.",
            "The prediction file is marked as not to be edited after the run.",
            "A grader selftest gate comes before any trial.",
            "A small dry run comes before the full Workflow run.",
            "The actions are concrete: exact paths and commands, in a sensible order.",
        ],
    ),
]

for t in TASKS:
    (HERE / f"{t['id']}.json").write_text(json.dumps(t, indent=2) + "\n")
print(f"wrote {len(TASKS)} tasks")
