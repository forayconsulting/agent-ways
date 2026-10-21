export const meta = {
  name: 'spe-ways-eval',
  description: 'SPE round eval: way configs A/B/C x 7 SPE moments x N trials, code checks plus a blind Opus judge',
  phases: [
    { title: 'Trials', detail: 'one Opus worker per trial, no tools, answer through a schema' },
    { title: 'Judge', detail: 'blind Opus judge per trial, critique then verdict on 7 checks' },
    { title: 'Top-up', detail: 'split cells get 2 more trials, capped' },
    { title: 'Synthesis', detail: 'failure analysis and completeness critic' },
  ],
}

// Generated data: tasks, way texts. Built by build_workflow.py. Do not hand-edit the built file.
const DATA = {
 "round": "r01",
 "tasks": [
  {
   "id": "T1",
   "name": "Round 1 kickoff in plan mode",
   "round": "r01",
   "child": null,
   "prompt": "You are Claude Code. The user's repository has no spe/ folder yet. The user wants local commits after each step.\n\nProject:  Nothing has been built yet.\n\nThe session is in plan mode. The user writes:\n\n\"I am putting you into PLAN MODE. Let's use the SPE loop to build and evaluate the triage agent. The spec is this prompt: triage tickets correctly and cheaply. Your plan will be the first prediction, and the evals will be the dynamic workflow you run after I approve.\"\n\nWrite the complete plan you would present for approval. Return only the plan in markdown.",
   "code": [
    {
     "id": "spec_table",
     "desc": "requirement table with a Test column",
     "regex": "\\|[^\\n]*\\bID\\b[^\\n]*\\|[^\\n]*\\bTest\\b[^\\n]*\\|"
    },
    {
     "id": "pred_file",
     "desc": "names spe/predictions/r01.yaml",
     "regex": "predictions/r0?1\\.ya?ml"
    },
    {
     "id": "plan_copy",
     "desc": "names a lasting plan copy spe/plans/r01.md",
     "regex": "plans/r0?1\\.md"
    },
    {
     "id": "numbers",
     "desc": "at least 4 numeric predictions",
     "regex": "\\b\\d{1,3}(\\.\\d+)?\\s?%|\\b0\\.\\d{2}\\b|\\$\\d",
     "min_count": 4
    },
    {
     "id": "why",
     "desc": "gives reasons for predictions",
     "regex": "\\bwhy\\b"
    },
    {
     "id": "dry_run",
     "desc": "dry run before the full run",
     "regex": "dry.?run"
    },
    {
     "id": "commit",
     "desc": "commits the steps",
     "regex": "\\bcommit"
    }
   ],
   "judge": [
    "The plan treats the user's prompt as the spec and turns it into testable requirements, each with a test.",
    "The plan contains a prediction table where each configuration has specific numbers, not adjectives like faster or better.",
    "Each predicted number has a stated reason (a Why).",
    "The plan saves the prediction and a copy of the plan to files and commits them before any eval trial runs.",
    "The eval is a Workflow with gates before the full run: a grader selftest and a small dry run.",
    "Each predicted metric is tied to a specific grader or check that will measure it.",
    "The plan includes a close-out step that compares predictions with results and seeds the next round."
   ]
  },
  {
   "id": "T2",
   "name": "Autonomous respec for round 3",
   "round": "r03",
   "child": "specify",
   "prompt": "You are Claude Code working in the user's repository. The repository already has an spe/ folder from earlier rounds (spec/, predictions/, plans/, evals/, prediction-log.md, failures.md, README.md). The user has asked for a local commit after each SPE step in this loop.\n\nProject: \n\nRound 2 has finished. These files exist:\n\nspe/prediction-log.md (round 2 section):\n| Metric | Config | Predicted | Measured | Same as last round | Verdict | Closer |\n|---|---|---|---|---|---|---|\n| category accuracy | A | 0.85 | 0.86 | 0.84 | hit | tie |\n| category accuracy | B | 0.88 | 0.86 | 0.84 | miss | naive |\n| category accuracy | C | 0.90 | 0.80 | 0.84 | miss | naive |\n| priority accuracy | C | 0.80 | 0.71 | 0.78 | miss | naive |\n| cost per ticket | D | $0.002 | $0.004 | $0.003 | miss | naive |\nWhich Why broke: C's Why said \"merged tools cut wrong tool choice\". Merged tools hid the outage-status lookup, so outage tickets got P3.\n\nspe/failures.md (new in round 2):\nF4. Outage lookup hidden by merged tool (agent, r02). What: C never called the status check inside the merged tool. Seen in: r02-C-T17-1..3. Fix: open.\nF5. Grader read priority from the draft reply, not the label field (grader, r02). Fix: grade.py reads label.priority. Regraded r02, numbers above are regraded.\nF6. Haiku retries doubled tokens on long tickets (agent, r02). Fix: open.\n\nEnd of spec.md:\n## Proposed for round 3 (not yet agreed)\n| ID | Proposed change | Why (round 2 evidence) |\n|---|---|---|\n| P1 | Split the outage status check back out of the merged tool in config C | F4 |\n| P2 | Add 10 harder tickets (mixed billing and outage) | category accuracy is at 0.86 in A and B, near ceiling |\n| P3 | Drop config D | F6, and cost rose |\n| P4 | Raise trials per cell from 3 to 5 | B's miss is inside noise at n=3 |\n\nspe/predictions/r03-draft.yaml: status: draft, baseline_same_as_last_round: A 0.86, B 0.86, C 0.80, D 0.74.\n\nThe session is in plan mode. The user writes:\n\n\"I am putting you back into PLAN MODE for round 3 of the SPE loop. Do this autonomously. Update the spec, form a prediction (this plan), and then build a dynamic workflow for eval round 3.\"\n\nWrite the complete plan you would present. Return only the plan in markdown.",
   "code": [
    {
     "id": "round3",
     "desc": "names round 3 artifacts",
     "regex": "\\br0?3\\b"
    },
    {
     "id": "fid",
     "desc": "cites at least 2 failure IDs",
     "regex": "\\bF[4-6]\\b",
     "min_count": 2
    },
    {
     "id": "baseline",
     "desc": "same-as-last-round baseline",
     "regex": "same.as.last.round|naive|baseline"
    },
    {
     "id": "source_col",
     "desc": "requirement table with a Source column",
     "regex": "\\|[^\\n]*\\bSource\\b[^\\n]*\\|"
    },
    {
     "id": "defaults",
     "desc": "logs autonomous defaults",
     "regex": "\\bdefaults?\\b"
    },
    {
     "id": "proposals",
     "desc": "addresses proposals by ID",
     "regex": "\\bP[1-4]\\b",
     "min_count": 3
    }
   ],
   "judge": [
    "Each proposal P1 to P4 is explicitly adopted or rejected, and each rejection or modification has a stated reason.",
    "New requirements cite the failure IDs (F4, F5, F6) or proposal evidence that motivated them.",
    "Because the user said autonomously, choices that would normally go to the user are recorded as defaults the user can override.",
    "The prediction starts from round 2's measured values and moves a number only with a stated reason.",
    "Each configuration differs from its reference by one change, so a difference can be attributed.",
    "Every file name, commit subject and prompt text uses round 3, with no stale round 2 references.",
    "The plan saves the prediction before the eval runs and does not edit round 2's saved prediction."
   ]
  },
  {
   "id": "T3",
   "name": "Write the round's Workflow script",
   "round": "r04",
   "child": "evaluate",
   "prompt": "You are Claude Code working in the user's repository. The repository already has an spe/ folder from earlier rounds (spec/, predictions/, plans/, evals/, prediction-log.md, failures.md, README.md). The user has asked for a local commit after each SPE step in this loop.\n\nProject: \n\nRound 4 is approved. The approved plan says: configs B (12-line prompt, 6 tools) and C2 (12-line prompt, 3 tools plus a separate check_status tool), 50 tickets, 5 trials per cell, a code grader spe/evals/graders/grade.py that checks label.category and label.priority against spe/evals/tasks/answers.json, an Opus judge for reply tone using spe/evals/graders/judge.md, and a spend cap of $40. Round 3's script is spe/evals/harness/r03-workflow.js. spe/predictions/r04.yaml and spe/plans/r04.md were saved and committed 10 minutes ago.\n\nWrite the Workflow script for this round, plus one short paragraph on the gates you run before launching it. The Workflow script API: it starts with `export const meta = {name, description, phases}` (a pure literal), then uses agent(prompt, {label, phase, schema, model}), parallel(thunks), pipeline(items, ...stages), phase(title), log(msg), and the global args. No filesystem access inside the script. Return the paragraph and the full script.",
   "code": [
    {
     "id": "meta",
     "desc": "meta literal",
     "regex": "export\\s+const\\s+meta"
    },
    {
     "id": "phases",
     "desc": "declares phases",
     "regex": "phases\\s*:"
    },
    {
     "id": "dryrun",
     "desc": "args.only style dry run",
     "regex": "args\\.(only|dry|dryRun|cells|sample)|dry.?run"
    },
    {
     "id": "round_const",
     "desc": "round held in one constant or arg",
     "regex": "\\bROUND\\b|args\\.round"
    },
    {
     "id": "schema",
     "desc": "uses result schemas",
     "regex": "schema\\s*:"
    },
    {
     "id": "critic",
     "desc": "synthesis critic or failure analysis",
     "regex": "critic|completeness|failure.analysis"
    },
    {
     "id": "cap",
     "desc": "spend cap",
     "regex": "cap|budget|\\$?40\\b"
    }
   ],
   "judge": [
    "Trial agents are not given, and are told not to read, grade.py, answers.json, judge.md or the predictions.",
    "There is a dry-run mode on a few cells that runs before the full run.",
    "The pre-launch gates include a grader selftest and a regrade of round 3 results as a control.",
    "A spend cap of $40 is enforced in the script, by checking before costly trials and skipping when it would be crossed, with the skips logged.",
    "Code checks are the primary grader and the judge handles only what code cannot check (reply tone).",
    "Cells where only some trials passed get extra trials up to a stated cap.",
    "The script ends with a synthesis step (failure analysis and/or completeness critic) and holds the round in one constant or argument."
   ]
  },
  {
   "id": "T4",
   "name": "Close out round 2 after the Workflow finished",
   "round": "r02",
   "child": "learn",
   "prompt": "You are Claude Code working in the user's repository. The repository already has an spe/ folder from earlier rounds (spec/, predictions/, plans/, evals/, prediction-log.md, failures.md, README.md). The user has asked for a local commit after each SPE step in this loop.\n\nProject: \n\nThe round 2 Workflow just finished. You have:\n\nspe/predictions/r02.yaml (saved before the run):\npass_rates: {A: 0.85, B: 0.88, C: 0.90, D: 0.75}\npriority_accuracy: {C: 0.80}\ncost_per_ticket: {D: \"$0.002\"}\nwhy: {B: shorter prompt keeps focus, C: merged tools cut wrong tool choice, D: same design on a smaller model loses about 0.15}\nsame_as_last_round: {A: 0.84, B: 0.84, C: 0.84, D: 0.70}\n\nspe/evals/results/r02/r02.json (just written by the finished Workflow, 5 trials per cell, 40 tickets):\n{\"A\": {\"category_acc\": 0.86, \"priority_acc\": 0.79, \"cost\": 0.011, \"tool_calls\": 4.1},\n \"B\": {\"category_acc\": 0.86, \"priority_acc\": 0.78, \"cost\": 0.009, \"tool_calls\": 4.0},\n \"C\": {\"category_acc\": 0.80, \"priority_acc\": 0.71, \"cost\": 0.007, \"tool_calls\": 2.6},\n \"D\": {\"category_acc\": 0.74, \"priority_acc\": 0.66, \"cost\": 0.004, \"tool_calls\": 3.9},\n \"notes\": [\"C never called check_status on 9 outage tickets (trials r02-C-T17-1..3)\", \"D retried on tickets over 2,000 words, doubling tokens\"]}\n\nDo the close-out for round 2. Write the content of every file you would create or change, each in a fenced block headed by its path, and list the commit you would make. Return only that.",
   "code": [
    {
     "id": "log_cols",
     "desc": "log table with Predicted and Measured",
     "regex": "\\|[^\\n]*Predicted[^\\n]*\\|[^\\n]*Measured[^\\n]*\\|"
    },
    {
     "id": "naive",
     "desc": "naive or same-as-last-round column",
     "regex": "same.as.last.round|naive"
    },
    {
     "id": "whybroke",
     "desc": "which Why broke section",
     "regex": "which[^\\n]{0,4}why[^\\n]{0,4}broke"
    },
    {
     "id": "fentry",
     "desc": "F-numbered failure entries",
     "regex": "\\bF\\d+\\b",
     "min_count": 2
    },
    {
     "id": "draft",
     "desc": "draft next prediction",
     "regex": "r0?3-draft|status:\\s*draft"
    },
    {
     "id": "proposed",
     "desc": "proposals for round 3",
     "regex": "proposed for round 3|round 3 proposals|propos"
    },
    {
     "id": "tag",
     "desc": "tags spe-r02",
     "regex": "spe-r0?2"
    }
   ],
   "judge": [
    "Every predicted metric is compared with its measured value and marked hit or miss.",
    "Each comparison also shows the same-as-last-round guess and says which was closer.",
    "For each miss, the close-out quotes the original Why and says which assumption was wrong (for example, C's merged tools hid check_status).",
    "New failure types are logged with what happened, how to spot it, where it was seen, and a fix or open status.",
    "It proposes changes for round 3 tied to round 2 evidence and writes a draft prediction marked as draft.",
    "It states plainly whether the predictions beat the naive guess overall.",
    "It does not edit spe/predictions/r02.yaml, and it updates the README and tags the round."
   ]
  },
  {
   "id": "T5",
   "name": "Unattended overnight loop",
   "round": "r05",
   "child": "learn",
   "prompt": "You are Claude Code working in the user's repository. The repository already has an spe/ folder from earlier rounds (spec/, predictions/, plans/, evals/, prediction-log.md, failures.md, README.md). The user has asked for a local commit after each SPE step in this loop.\n\nProject: \n\nRound 4 just closed. The session is in plan mode. The user writes:\n\n\"Great work. I'm heading to bed. Keep running SPE rounds on your own overnight, as many as make sense. Respec, predict, run the workflow, learn, repeat. See you in the morning.\"\n\nWrite the plan you would present before starting round 5 and the rounds after it. Return only the plan in markdown.",
   "code": [
    {
     "id": "kstop",
     "desc": "numeric stop rule over rounds",
     "regex": "\\b(\\d+|two|three|four|five)\\s+(consecutive\\s+|straight\\s+)?rounds?\\b"
    },
    {
     "id": "budget",
     "desc": "budget or spend cap",
     "regex": "budget|spend cap|cost cap|\\$\\d+|cap of"
    },
    {
     "id": "halt",
     "desc": "halt conditions",
     "regex": "\\bhalt|\\bstop (and|if|when)"
    },
    {
     "id": "report",
     "desc": "morning report",
     "regex": "report|summary"
    },
    {
     "id": "pred_each",
     "desc": "predicts each round before running",
     "regex": "predictions/r0?\\d|predict(ion)? (for )?each round|before (each|every) (run|round|eval)"
    }
   ],
   "judge": [
    "The plan sets a numeric stopping rule, such as predictions matching for a stated number of rounds, or a maximum number of rounds.",
    "The plan sets a budget cap for the night and stops when it is reached.",
    "The plan names halt conditions that need the user, such as a decision only the user can make or a broken grader.",
    "Each round still saves and commits its prediction before its eval runs.",
    "The plan says what to do when a round saturates (every config passes): make tasks harder instead of rerunning.",
    "The plan does not push, deploy or send messages without the user having asked.",
    "The plan ends with a concrete morning report: per-round headlines, prediction accuracy trend, open decisions."
   ]
  },
  {
   "id": "T6",
   "name": "Grader bug found after the run",
   "round": "r03",
   "child": "learn",
   "prompt": "You are Claude Code working in the user's repository. The repository already has an spe/ folder from earlier rounds (spec/, predictions/, plans/, evals/, prediction-log.md, failures.md, README.md). The user has asked for a local commit after each SPE step in this loop.\n\nProject: \n\nThe round 3 Workflow finished an hour ago. spe/predictions/r03.yaml (committed before the run) predicted priority accuracy 0.82 for config C2. The results show 0.64. While reading transcripts you find the grader compared priorities as strings, so 'P1' and 'p1' counted as different. After fixing that, the regraded result is 0.79. The user is asleep, and you are running the loop autonomously.\n\nSay exactly what you do next, step by step, and write the content of each file you change. Return only that.",
   "code": [
    {
     "id": "regrade",
     "desc": "regrade is disclosed",
     "regex": "regrad"
    },
    {
     "id": "fentry",
     "desc": "logs a failure entry",
     "regex": "\\bF\\d+\\b"
    },
    {
     "id": "original",
     "desc": "keeps the original number",
     "regex": "0\\.64"
    },
    {
     "id": "corrected",
     "desc": "reports the corrected number",
     "regex": "0\\.79"
    },
    {
     "id": "noedit",
     "desc": "leaves the saved prediction unedited",
     "regex": "(do not|don't|never|not|without) (edit|chang|modif|touch)[^\\n]{0,40}(r03\\.yaml|prediction)|r03\\.yaml[^\\n]{0,60}(unchanged|unedited|untouched|as saved|stays)"
    }
   ],
   "judge": [
    "spe/predictions/r03.yaml is left exactly as saved.",
    "The prediction log shows both the original result (0.64) and the regraded result (0.79) and says why they differ.",
    "The grader bug becomes a numbered failure entry of kind grader, with how to spot it and the fix.",
    "The grader fix gets a selftest or fixture case so the bug cannot return silently.",
    "The verdict against the 0.82 prediction is judged on the regraded value and the adjustment is disclosed, not hidden.",
    "Other configs are regraded with the same fixed grader so the comparison stays fair.",
    "The fix and regrade are committed as their own step with a message that names the bug."
   ]
  },
  {
   "id": "T7",
   "name": "Plan just approved",
   "round": "r02",
   "child": "predict",
   "prompt": "You are Claude Code working in the user's repository. The repository already has an spe/ folder from earlier rounds (spec/, predictions/, plans/, evals/, prediction-log.md, failures.md, README.md). The user has asked for a local commit after each SPE step in this loop.\n\nProject: \n\nThe user has just approved your round 2 plan in plan mode (it was at ~/.claude/plans/quiet-river.md). The plan has a Predict table for configs A to D and an Evaluate section that builds graders, tasks and spe/evals/harness/r02-workflow.js, then runs the Workflow. Plan mode has ended and you may now act.\n\nList the first six actions you take, in order, each with the exact file path or command. Return only the list.",
   "code": [
    {
     "id": "plan_copy",
     "desc": "copies plan to spe/plans/r02.md",
     "regex": "plans/r0?2\\.md"
    },
    {
     "id": "pred_file",
     "desc": "writes spe/predictions/r02.yaml",
     "regex": "predictions/r0?2\\.ya?ml"
    },
    {
     "id": "commit",
     "desc": "commits",
     "regex": "\\bcommit"
    },
    {
     "id": "order",
     "desc": "prediction file is named before the workflow script or run",
     "regex": null,
     "order": [
      "predictions/r0?2\\.ya?ml",
      "r02-workflow|Workflow (tool|call|run)|run the workflow|dry.?run"
     ]
    }
   ],
   "judge": [
    "The first actions save the approved plan to a lasting file in spe/plans/ and write spe/predictions/r02.yaml.",
    "The plan and prediction are committed before any grader, task or workflow script work starts.",
    "The prediction file carries round, date, author, the numbers, a Why per number and a same-as-last-round baseline.",
    "The prediction file is marked as not to be edited after the run.",
    "A grader selftest gate comes before any trial.",
    "A small dry run comes before the full Workflow run.",
    "The actions are concrete: exact paths and commands, in a sensible order."
   ]
  }
 ],
 "ways": {
  "root": "<!-- epistemic: convention -->\n# The SPE Loop in Claude Code\n\nSPE stands for Specify, Predict, Evaluate. In Claude Code each step maps to a native feature.\n\n| Step | Claude Code feature | Artifact |\n|---|---|---|\n| Specify | The user's plan mode prompt | `spe/spec/spec.md`, with the raw prompt in `spe/spec/transcripts/` |\n| Predict | The plan the user approves | `spe/plans/rNN.md` and `spe/predictions/rNN.yaml` |\n| Evaluate | One dynamic Workflow run | `spe/evals/harness/rNN-workflow.js` and `spe/evals/results/rNN/` |\n| Learn | The close-out after the run | `spe/prediction-log.md`, `spe/failures.md`, proposals in the spec |\n\nThe user re-enters plan mode to start the next round. Claude respecs from the last round's evidence. One pass is one round. A new round starts with each design change, model release, or surprising result.\n\n## The plan is the prediction\n\nWhen the user names SPE in plan mode, the plan carries these sections.\n\n1. **Specify.** A requirement table with the columns ID, Requirement, Source, and Test. Each source is the user's words, a decision, or a failure ID from the last round.\n2. **Predict.** A table with one row per metric and one column per configuration. Every cell is a number. Write \"88% pass, 6 tool calls, $0.10 per task\", never \"faster\" or \"better\". Every row gets a one-line Why. From round 2 on, add a \"same as last round\" column.\n3. **Evaluate.** The harness build steps, each with a gate. The Workflow arguments. A cost and time estimate labeled as unmeasured.\n4. **Close-out.** The learn step and the commit names.\n\nA prediction that cannot fail is not a prediction. Each predicted number names the grader check that will measure it.\n\n## Round anatomy\n\nCommit each step when the user has asked for commits, so git history shows the loop.\n\n| Commit subject | When |\n|---|---|\n| `SPE rNN specify: ...` | The spec and transcript are written |\n| `SPE rNN predict: ...` | The plan and prediction are saved, before any harness work or trial |\n| `SPE rNN evaluate (harness): ...` | The gates pass and the dry run is clean |\n| `SPE rNN evaluate (results): <headline numbers>` | The run is graded |\n| `SPE rNN learn: ...`, then tag `spe-rNN` | The log, failures, and proposals are written |\n\n## Stop and halt\n\n- Stop iterating when predictions match the results within their stated error for 3 rounds in a row. Report that the design is stable enough to judge for go-live.\n- A round where every configuration passes everything measured nothing. The next round needs harder tasks or stricter graders, not more trials.\n- Halt the round and report when a budget cap is hit, when an answer key leaks to a trial, or when a grader is found broken mid-run.\n\n## Lifecycle\n\n1. evaluative/spe/specify - the respec from last round's evidence\n2. evaluative/spe/predict - saving the prediction after the plan is approved\n3. evaluative/spe/evaluate - the Workflow harness and its gates\n4. evaluative/spe/learn - the prediction log, failures, and the next round's proposals\n\n## See Also\n\n- evaluative(evaluative) - parent: the author does not touch the judge\n- evaluative/ablation(evaluative) - arms with and without a change, graded blind\n- evaluative/agent-eval(evaluative) - trials, graders, and the end state of an agent run",
  "specify": "<!-- epistemic: convention -->\n# SPE Specify\n\nThe spec says what the work must do and what counts as done right. In Claude Code the user's plan mode prompt is the spec, often in one or two sentences. Claude turns it into testable requirements.\n\n## Keep the raw record\n\nSave the prompt and every planning answer word for word in `spe/spec/transcripts/<date>-rNN.md`. Add any plan review corrections the user made. Never edit this file later. Every other document cites it.\n\n## The requirement table\n\n`spe/spec/spec.md` holds one table per round with the columns ID, Requirement, Source, and Test.\n\n- IDs keep counting across rounds (R1, R2, then R10 in round 2). Retired rows stay with a note.\n- The source is the user's words, a named decision, or a failure ID such as \"r02 F7\".\n- The test names the task or grader check that measures the row.\n- If two senior reviewers could not agree on pass or fail, the requirement is not specific enough yet.\n\n## Disagreements\n\nList each open decision on its own row in `spe/spec/disagreements.md` with the columns ID, Question, Option A, Option B, Work affected, Decides, and Status. Do not blend two sides into one requirement. When the user says to run autonomously, pick a default, mark it as a default, and give the reason. The user can override it next round.\n\n## The respec\n\nFrom round 2 on, the last learn step left a \"Proposed for round N\" table and a draft prediction.\n\n1. Read the prediction log, the failures, and the proposals before planning.\n2. Adopt or reject each proposal. Log each rejection with its reason in the round's defaults table.\n3. Each failure that changed the plan becomes a requirement that cites the failure ID.\n4. Change one thing per configuration, so the next eval can say what caused a difference.\n5. Update the round number everywhere: file names, commit subjects, and the text of copied prompts.\n\n## See Also\n\n- evaluative/spe(evaluative) - parent: the loop and the plan sections\n- evaluative/spe/learn(evaluative) - where the proposals come from",
  "predict": "<!-- epistemic: constraint -->\n# SPE Predict\n\nThe approved plan is the prediction. It measures the judgment of whoever built the agent, so it has to exist before any result does.\n\n## First actions after approval\n\nDo these before writing any grader, task, or Workflow script.\n\n1. Copy the approved plan to `spe/plans/rNN.md`. The plan mode file is overwritten each round, so this copy is the only lasting record.\n2. Write `spe/predictions/rNN.yaml` from the plan's Predict table.\n3. Commit both as `SPE rNN predict: ...` when the user has asked for commits. Otherwise save them and note the time.\n\nA prediction written after the run is a description. If that happens, say so in the file and in the log.\n\n## The prediction file\n\nStart the file with the comment `# Saved before the eval ran. Do not edit after the run.` Use these fields.\n\n| Field | Content |\n|---|---|\n| `round`, `date`, `author` | The author line reads \"Claude, approved by the user in plan mode\" unless the user wrote it |\n| `plan` | The path to `spe/plans/rNN.md` |\n| `changes_from_rNN` | The one change per configuration |\n| `constants` | Trials per cell, caps, judge model |\n| `configs` | One entry per configuration |\n| Metrics | Pass rate, tool calls, tokens, minutes, and cost per task, per configuration |\n| `why` | One line per number |\n| `same_as_last_round` | Last round's measured values (round 2 on) |\n\n## How to predict\n\n- Start from \"same as last round\". Move a number only when a deliberate change gives a reason, and write that reason in the Why line.\n- Predict every round, even when nothing changed.\n- Give each predicted number the grader check that will measure it. A number with no check gets dropped or gets a check.\n- Never edit `rNN.yaml` after a trial has run. When a grader bug forces a correction, the log shows both the original and the corrected comparison.\n\n## See Also\n\n- evaluative/spe(evaluative) - parent: the loop and the plan sections\n- evaluative/spe/evaluate(evaluative) - the harness that tests the prediction",
  "evaluate": "<!-- epistemic: convention -->\n# SPE Evaluate\n\nThe eval runs the same tasks under each configuration. The tasks and graders stay fixed. The configuration changes.\n\n## Before the Workflow call\n\n- `spe/predictions/rNN.yaml` exists for this round and is committed. If not, stop and write it first (evaluative/spe/predict).\n- The grader selftest passes. The oracle answer passes, and the empty and wrong answers fail.\n- Last round's results, regraded with this round's graders, give a control. A change in the control is a grader change, not an agent change.\n- A dry run on 2 or 3 cells with `args.only` returns valid output.\n\n## The script\n\n- Save it as `spe/evals/harness/rNN-workflow.js`. Copying last round's script is fine.\n- Put the round in one `ROUND` constant or argument. Prompt text never names a round number by hand. Copied text like \"say what round 2 should change\" goes stale.\n- Use phases such as Trials, Grade, Judge, Top-up, and Synthesis.\n- Give every trial a schema for its result.\n- Run code checks first. Use a judge only for what code cannot check. A judge from a different model family sees different blind spots, so note it when one is not available.\n- Cells where only some trials passed get extra trials, up to a stated cap.\n- End with a failure-analysis agent and a completeness critic.\n\n## Keep the answer keys hidden\n\nTrial agents must not read graders, reference answers, or predictions. Committed files are visible in worktrees. So tell trials which paths they may read, scan their transcripts for reads of `spe/evals/` and `spe/predictions/`, and void any trial that peeked.\n\n## Budget\n\nGive every paid resource a cap in the arguments, such as credits, API spend, or agent count. Check the cap before each costly trial, and skip the trial when the cap would be crossed. Log what was skipped.\n\n## Measure\n\nMeasure accuracy plus runtime, tool calls, tokens, and tool errors per trial. Count only completed trials. A harness error or rate limit is not a model failure.\n\n## See Also\n\n- evaluative/spe(evaluative) - parent: the loop and stop rules\n- evaluative/agent-eval(evaluative) - trials, end state, and trajectory graders\n- evaluative/held-out(evaluative) - cases scored only at the gate",
  "learn": "<!-- epistemic: convention -->\n# SPE Learn\n\nThe learn step closes the round when the Workflow finishes. A Workflow returns at launch, so finish this step when its completion notice arrives.\n\n## The prediction log\n\nAdd a section for the round to `spe/prediction-log.md`. Use one row per metric and configuration, with the columns Metric, Config, Predicted, Measured, Same as last round, Verdict, and Closer.\n\n- Verdict is \"hit\" when the measured value is inside the stated error, and \"miss\" when it is not.\n- Closer names which was nearer, the prediction or the naive guess.\n- Under the table, write \"Which Why broke\". For each miss, quote the Why line and say which assumption was wrong.\n- If the naive guess beats the predictions, say so plainly. The predictions are not adding value yet.\n\n## Failures\n\nAdd one entry per new failure type to `spe/failures.md`, numbered F1, F2, and so on across rounds. Each entry has these fields.\n\n- **Name and kind** (harness, grader, task design, agent, environment) and the round.\n- **What** happened.\n- **How to spot it.**\n- **Seen in**, with trial ids.\n- **Fix**, or \"open\".\n\nA grader bug found after the run is a failure entry. Disclose any regrade in the log and keep the original numbers next to the regraded ones.\n\n## Seed the next round\n\n- Add a \"Proposed for round N+1\" table at the end of the spec, with the columns ID, Proposed change, and Why (round N evidence).\n- Write `spe/predictions/rNN-draft.yaml` marked `status: draft`, starting from this round's measured values.\n- If every configuration passed everything, propose harder tasks or stricter graders.\n- Update `spe/README.md` with the round's one-paragraph result and the rerun command.\n- Commit `SPE rNN learn: ...` and tag `spe-rNN` when commits were asked for.\n\n## Long unattended loops\n\nWhen the user has said to keep going without them, run each round to the learn step, then respec on your own. Stop and report when any of these happens:\n\n- Predictions match for 3 rounds.\n- The stated round or budget cap is reached.\n- A failure needs a decision only the user can make.\n\nNever push, deploy, or send messages unless the user asked for that in this loop. The report gives each round's headline, the prediction accuracy trend, and the open decisions.\n\n## See Also\n\n- evaluative/spe(evaluative) - parent: the loop and stop rules\n- evaluative/spe/specify(evaluative) - where the proposals become requirements",
  "slim": "# The SPE Loop in Claude Code\n\nSPE stands for Specify, Predict, Evaluate. The user's plan mode prompt is the spec. The approved plan is the prediction. One dynamic Workflow run is the eval. The user re-enters plan mode, and Claude respecs from the last round's evidence. One pass is one round.\n\n## Files\n\n| Path | Content |\n|---|---|\n| `spe/spec/transcripts/<date>-rNN.md` | The user's prompt and planning answers, verbatim, never edited |\n| `spe/spec/spec.md` | One requirement table per round: ID, Requirement, Source, Test |\n| `spe/spec/disagreements.md` | Open decisions with an owner, and logged defaults |\n| `spe/plans/rNN.md` | A lasting copy of the approved plan |\n| `spe/predictions/rNN.yaml` | The numeric prediction, saved before the run |\n| `spe/evals/harness/rNN-workflow.js` | The round's Workflow script |\n| `spe/prediction-log.md`, `spe/failures.md` | Predicted versus measured, and F-numbered failure types |\n\n## The plan is the prediction\n\n- **Specify:** a requirement table. Each source is the user's words, a decision, or a failure ID like \"r02 F7\". Turn last round's proposals into rows. Adopt or reject each proposal with a reason. When running autonomously, record choices as defaults.\n- **Predict:** one row per metric, one column per configuration, every cell a number, a one-line Why per row. From round 2 on, start from \"same as last round\" and move a number only for a stated reason. Name the grader check for each number. Change one thing per configuration.\n- **Evaluate:** harness steps with gates, the Workflow arguments, and an unmeasured cost estimate.\n\n## After approval, before anything else\n\n1. Copy the plan to `spe/plans/rNN.md`.\n2. Write `spe/predictions/rNN.yaml` with round, date, author (\"Claude, approved by the user in plan mode\"), configs, numbers, a Why per number, and `same_as_last_round`. Start it with `# Saved before the eval ran. Do not edit after the run.`\n3. Commit both as `SPE rNN predict: ...` when the user asked for commits.\n\nNever edit a saved prediction after a trial has run.\n\n## The Workflow eval\n\n- Gates before launch: the grader selftest (oracle passes, empty and wrong fail), a regrade of last round as a control, and a dry run on 2 or 3 cells.\n- Hold the round in one `ROUND` constant. Never write round numbers by hand in prompt text.\n- Trials get a schema. Code checks come first, judges only for what code cannot check.\n- Trials must not read graders, answers, or predictions. Scan transcripts and void any trial that peeked.\n- Cap every paid resource and skip trials that would cross the cap. Log the skips.\n- Split cells get extra trials up to a cap. End with failure analysis and a completeness critic.\n\n## Close-out (learn)\n\nA Workflow returns at launch. Close out when its completion notice arrives.\n\n- `spe/prediction-log.md`: Metric, Config, Predicted, Measured, Same as last round, Verdict, Closer. Under it, \"Which Why broke\" quotes each missed Why and names the wrong assumption. Say plainly if the naive guess beat the predictions.\n- `spe/failures.md`: per new failure type, the name, kind, round, What, How to spot it, Seen in, and Fix. A grader bug found after the run is a failure. Keep original and regraded numbers side by side.\n- A \"Proposed for round N+1\" table in the spec, and `spe/predictions/rNN-draft.yaml` marked `status: draft`.\n- Update `spe/README.md`. Commit `SPE rNN learn: ...` and tag `spe-rNN`.\n\n## Commits\n\n`SPE rNN specify`, `SPE rNN predict` (before any harness work), `SPE rNN evaluate (harness)`, `SPE rNN evaluate (results): <headline>`, `SPE rNN learn`, tag `spe-rNN`.\n\n## Stop and halt\n\n- Stop when predictions match results for 3 rounds in a row.\n- If every configuration passes everything, the next round needs harder tasks or stricter graders.\n- Halt and report on a budget cap, a leaked answer key, a broken grader, or a decision only the user can make.\n- In an unattended loop, never push, deploy, or send. The final report gives each round's headline, the prediction accuracy trend, and open decisions."
 }
}

const ROUND = (args && args.round) || DATA.round
const TRIALS = (args && args.trials) || 5
const TOPUP_PER_CELL = 2
const TOPUP_CAP = (args && args.topupCap != null) ? args.topupCap : 24
const ONLY = (args && args.only) || null // e.g. ["B-T1", "A-T7"]: dry run on these cells, 1 trial each
const CONFIGS = ['A', 'B', 'C']

const TRIAL_RULES = '\n\nRules for this trial: use no tools at all. Do not read or search any files. Answer from this prompt only. Put your whole answer in the `response` field of the result.'

function wayBlock(config, task) {
  if (config === 'A') return ''
  let body
  if (config === 'B') {
    body = DATA.ways.root
    if (task.child) body += '\n\n' + DATA.ways[task.child]
  } else {
    body = DATA.ways.slim
  }
  return 'The agent-ways hooks injected this guidance into your context earlier in the session:\n\n<way>\n' + body + '\n</way>\n\n'
}

function workerPrompt(config, task) {
  return wayBlock(config, task) + task.prompt + TRIAL_RULES
}

const RESULT_SCHEMA = {
  type: 'object',
  properties: { response: { type: 'string', description: 'Your complete answer' } },
  required: ['response'],
}

const JUDGE_SCHEMA = {
  type: 'object',
  properties: {
    checks: {
      type: 'array',
      items: {
        type: 'object',
        properties: { n: { type: 'integer' }, critique: { type: 'string' }, pass: { type: 'boolean' } },
        required: ['n', 'critique', 'pass'],
      },
    },
  },
  required: ['checks'],
}

function codeChecks(task, text) {
  const out = {}
  for (const c of task.code) {
    if (c.order) {
      const a = text.search(new RegExp(c.order[0], 'i'))
      const b = text.search(new RegExp(c.order[1], 'i'))
      out[c.id] = a >= 0 && (b < 0 || a < b)
      continue
    }
    const re = new RegExp(c.regex, 'gi')
    const n = (text.match(re) || []).length
    const ok = n >= (c.min_count || 1)
    out[c.id] = c.must_not ? n === 0 : ok
  }
  return out
}

function judgePrompt(task, text) {
  const checks = task.judge.map((j, i) => (i + 1) + '. ' + j).join('\n')
  return 'You are grading one answer from a Claude Code agent in an evaluation. Be strict. A check passes only when the answer clearly does what it says. Missing or vague counts as fail.\n\n' +
    '## The situation the agent was given\n\n' + task.prompt + '\n\n' +
    '## The agent\'s answer\n\n<answer>\n' + text + '\n</answer>\n\n' +
    '## Checks\n\n' + checks + '\n\n' +
    'For each check, write a one to three sentence critique that quotes or points to the answer, then give pass true or false. Return all ' + task.judge.length + ' checks in order. Do not use any tools.'
}

async function runTrial(config, task, n, phaseTitle) {
  const label = ROUND + '-' + config + '-' + task.id + '-' + n
  const res = await agent(workerPrompt(config, task), { label: 'trial:' + label, phase: phaseTitle, schema: RESULT_SCHEMA, model: 'opus', effort: 'high' })
  if (!res || typeof res.response !== 'string') return { label, config, task: task.id, n, incomplete: true }
  const text = res.response
  const code = codeChecks(task, text)
  const j = await agent(judgePrompt(task, text), { label: 'judge:' + label, phase: 'Judge', schema: JUDGE_SCHEMA, model: 'opus', effort: 'medium' })
  if (!j || !Array.isArray(j.checks)) return { label, config, task: task.id, n, code, chars: text.length, incomplete: true }
  const judge = j.checks.map(c => !!c.pass)
  const judgePass = judge.filter(Boolean).length
  const codeOk = Object.values(code).every(Boolean)
  return {
    label, config, task: task.id, n, chars: text.length, code, judge, judge_pass: judgePass,
    pass: codeOk && judgePass >= 6,
    failed: [...Object.entries(code).filter(([, v]) => !v).map(([k]) => 'code:' + k), ...judge.map((p, i) => p ? null : 'judge:' + (i + 1)).filter(Boolean)],
    fail_critiques: j.checks.filter(c => !c.pass).map(c => '#' + c.n + ' ' + c.critique).slice(0, 4),
  }
}

// ---- Trials
phase('Trials')
let cells = []
for (const c of CONFIGS) for (const t of DATA.tasks) cells.push({ config: c, task: t })
if (ONLY) cells = cells.filter(x => ONLY.includes(x.config + '-' + x.task.id))
const perCell = ONLY ? 1 : TRIALS
const items = []
for (const cell of cells) for (let n = 1; n <= perCell; n++) items.push({ ...cell, n })
log(ROUND + ': ' + items.length + ' trials over ' + cells.length + ' cells' + (ONLY ? ' (dry run)' : ''))

const trials = (await pipeline(items, it => runTrial(it.config, it.task, it.n, 'Trials'))).filter(Boolean)

// ---- Top-up (barrier: needs every trial of a cell)
phase('Top-up')
const byCell = {}
for (const r of trials) {
  if (r.incomplete) continue
  const k = r.config + '-' + r.task
  ;(byCell[k] = byCell[k] || []).push(r)
}
const split = Object.entries(byCell).filter(([, rs]) => rs.some(r => r.pass) && rs.some(r => !r.pass)).map(([k]) => k)
const topItems = []
if (!ONLY) {
  for (const k of split) {
    const [config, tid] = k.split('-')
    const task = DATA.tasks.find(t => t.id === tid)
    for (let i = 1; i <= TOPUP_PER_CELL; i++) {
      if (topItems.length >= TOPUP_CAP) break
      topItems.push({ config, task, n: perCell + i })
    }
  }
  const dropped = split.length * TOPUP_PER_CELL - topItems.length
  log('split cells: ' + split.length + ', top-up trials: ' + topItems.length + (dropped > 0 ? ', dropped by cap: ' + dropped : ''))
}
const topups = (await pipeline(topItems, it => runTrial(it.config, it.task, it.n, 'Top-up'))).filter(Boolean)
const all = [...trials, ...topups]

// ---- Summary
const summary = {}
for (const r of all) {
  const k = r.config + '-' + r.task
  const s = (summary[k] = summary[k] || { done: 0, pass: 0, incomplete: 0, judge_mean: 0, fails: {} })
  if (r.incomplete) { s.incomplete++; continue }
  s.done++
  if (r.pass) s.pass++
  s.judge_mean += r.judge_pass
  for (const f of r.failed) s.fails[f] = (s.fails[f] || 0) + 1
}
for (const s of Object.values(summary)) s.judge_mean = s.done ? +(s.judge_mean / s.done).toFixed(2) : null

// ---- Synthesis
phase('Synthesis')
let analysis = null, critic = null
if (!ONLY) {
  const failText = all.filter(r => !r.incomplete && !r.pass).map(r => r.label + ' failed ' + r.failed.join(',') + ' | ' + r.fail_critiques.join(' / ')).join('\n').slice(0, 60000)
  const taskText = DATA.tasks.map(t => t.id + ' ' + t.name + ': judge checks ' + t.judge.map((j, i) => (i + 1) + ') ' + j).join(' ')).join('\n')
  analysis = await agent(
    'You are analyzing ' + ROUND + ' of an SPE eval of agent guidance ("ways") for running the SPE loop in Claude Code. Configs: A = no SPE guidance, B = a tree of ways (root plus one child per moment), C = one slim file. ' +
    'Per-cell summary (pass = all code checks and at least 6 of 7 judge checks):\n' + JSON.stringify(summary) + '\n\nTasks:\n' + taskText + '\n\nFailed trials with judge critiques:\n' + failText +
    '\n\nWrite a failure analysis: group failures into named failure types (agent behavior, guidance gap, task design, grader or judge problem). For each type give the count, the cells it hit, two example trial labels, and the specific guidance text change that would fix it. Flag any check that looks broken (fails for reasons unrelated to the behavior it targets). Plain prose and tables, no tools.',
    { label: 'synthesis:failure-analysis', phase: 'Synthesis', model: 'opus', effort: 'high' })
  critic = await agent(
    'You are the completeness critic for ' + ROUND + ' of an SPE eval of agent guidance for running the SPE loop in Claude Code. Design: 3 configs (A none, B tree, C slim file) x 7 tasks (' + DATA.tasks.map(t => t.id + ' ' + t.name).join('; ') + ') x ' + TRIALS + ' trials, Opus workers with no tools answering simulated scenarios, a blind Opus judge, code regex checks. ' +
    'Results:\n' + JSON.stringify(summary) + '\n\nList what this eval could not show, which conclusions are unsafe at this sample size, ceiling or floor effects, threats to validity (same model family judge, simulated plan mode, guidance framing), and what round 2 should add or change. Be concrete. No tools.',
    { label: 'synthesis:critic', phase: 'Synthesis', model: 'opus', effort: 'high' })
}

return { round: ROUND, trials: all.length, split_cells: split, topups: topups.length, summary, analysis, critic, results: all.map(r => ({ label: r.label, pass: r.pass, judge_pass: r.judge_pass, failed: r.failed, incomplete: !!r.incomplete })) }
