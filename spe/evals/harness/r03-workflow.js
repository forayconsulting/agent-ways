export const meta = {
  name: 'spe-ways-eval',
  description: 'SPE round eval: way configs x SPE moments x N trials, code checks plus a blind Opus judge',
  phases: [
    { title: 'Trials', detail: 'one Opus worker per trial, no tools, answer through a schema' },
    { title: 'E2E', detail: 'Opus workers with tools in /tmp/spe-e2e fixtures (r03 on)' },
    { title: 'Judge', detail: 'blind Opus judge per trial, critique then verdict on 7 checks' },
    { title: 'Top-up', detail: 'split cells get 2 more trials, capped (0 in r02)' },
    { title: 'Synthesis', detail: 'failure analysis and completeness critic' },
  ],
}

// Generated data: tasks, way texts. Built by build_workflow.py. Do not hand-edit the built file.
const DATA = {
 "round": "r03",
 "tasks": [
  {
   "id": "T1",
   "name": "Round 1 kickoff in plan mode",
   "round": "r01",
   "child": null,
   "prompt": "You are Claude Code. The user's repository has no spe/ folder yet. The user wants local commits after each step.\n\nProject: \"triage\", a Claude agent that reads incoming support tickets for a SaaS company, assigns a category (billing, bug, how-to, account, outage) and a priority (P1 to P4), and drafts a first reply. The eval set is 40 historical tickets with reference labels from the support lead. Nothing has been built yet.\n\nThe session is in plan mode. The user writes:\n\n\"I am putting you into PLAN MODE. Let's use the SPE loop to build and evaluate the triage agent. The spec is this prompt: triage tickets correctly and cheaply. Your plan will be the first prediction, and the evals will be the dynamic workflow you run after I approve.\"\n\nWrite the complete plan you would present for approval. Return only the plan in markdown.",
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
     "id": "band",
     "desc": "predicted numbers carry a band",
     "regex": "\u00b1|\\+/-|plus or minus|\\bband\\b|interval"
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
   "prompt": "You are Claude Code working in the user's repository. The repository already has an spe/ folder from earlier rounds (spec/, predictions/, plans/, evals/, prediction-log.md, failures.md, README.md). The user has asked for a local commit after each SPE step in this loop.\n\nProject: \"triage\", a Claude agent that reads incoming support tickets for a SaaS company, assigns a category (billing, bug, how-to, account, outage) and a priority (P1 to P4), and drafts a first reply. The eval set is 40 historical tickets with reference labels from the support lead. Configurations so far: A = Sonnet 5.5 with a 30-line prompt and 6 tools, B = A with a 12-line prompt, C = B with tools merged to 3, D = C on Haiku 5.5.\n\nRound 2 has finished. These files exist:\n\nspe/prediction-log.md (round 2 section):\n| Metric | Config | Predicted | Measured | Same as last round | Verdict | Closer |\n|---|---|---|---|---|---|---|\n| category accuracy | A | 0.85 | 0.86 | 0.84 | hit | tie |\n| category accuracy | B | 0.88 | 0.86 | 0.84 | miss | naive |\n| category accuracy | C | 0.90 | 0.80 | 0.84 | miss | naive |\n| priority accuracy | C | 0.80 | 0.71 | 0.78 | miss | naive |\n| cost per ticket | D | $0.002 | $0.004 | $0.003 | miss | naive |\nWhich Why broke: C's Why said \"merged tools cut wrong tool choice\". Merged tools hid the outage-status lookup, so outage tickets got P3.\n\nspe/failures.md (new in round 2):\nF4. Outage lookup hidden by merged tool (agent, r02). What: C never called the status check inside the merged tool. Seen in: r02-C-T17-1..3. Fix: open.\nF5. Grader read priority from the draft reply, not the label field (grader, r02). Fix: grade.py reads label.priority. Regraded r02, numbers above are regraded.\nF6. Haiku retries doubled tokens on long tickets (agent, r02). Fix: open.\n\nEnd of spec.md:\n## Proposed for round 3 (not yet agreed)\n| ID | Proposed change | Why (round 2 evidence) |\n|---|---|---|\n| P1 | Split the outage status check back out of the merged tool in config C | F4 |\n| P2 | Add 10 harder tickets (mixed billing and outage) | category accuracy is at 0.86 in A and B, near ceiling |\n| P3 | Drop config D | F6, and cost rose |\n| P4 | Raise trials per cell from 3 to 5 | B's miss is inside noise at n=3 |\n\nspe/predictions/r03-draft.yaml: status: draft, baseline_same_as_last_round: A 0.86, B 0.86, C 0.80, D 0.74.\n\nThe session is in plan mode. The user writes:\n\n\"I am putting you back into PLAN MODE for round 3 of the SPE loop. Do this autonomously. Update the spec, form a prediction (this plan), and then build a dynamic workflow for eval round 3.\"\n\nWrite the complete plan you would present. Return only the plan in markdown.",
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
     "id": "band",
     "desc": "predicted numbers carry a band",
     "regex": "\u00b1|\\+/-|plus or minus|\\bband\\b|interval"
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
   "prompt": "You are Claude Code working in the user's repository. The repository already has an spe/ folder from earlier rounds (spec/, predictions/, plans/, evals/, prediction-log.md, failures.md, README.md). The user has asked for a local commit after each SPE step in this loop.\n\nProject: \"triage\", a Claude agent that reads incoming support tickets for a SaaS company, assigns a category (billing, bug, how-to, account, outage) and a priority (P1 to P4), and drafts a first reply. The eval set is 40 historical tickets with reference labels from the support lead. Configurations so far: A = Sonnet 5.5 with a 30-line prompt and 6 tools, B = A with a 12-line prompt, C = B with tools merged to 3, D = C on Haiku 5.5.\n\nRound 4 is approved. The approved plan says: configs B (12-line prompt, 6 tools) and C2 (12-line prompt, 3 tools plus a separate check_status tool), 50 tickets, 5 trials per cell, a code grader spe/evals/graders/grade.py that checks label.category and label.priority against spe/evals/tasks/answers.json, an Opus judge for reply tone using spe/evals/graders/judge.md, and a spend cap of $40. Round 3's script is spe/evals/harness/r03-workflow.js. spe/predictions/r04.yaml and spe/plans/r04.md were saved and committed 10 minutes ago.\n\nWrite the Workflow script for this round, plus one short paragraph on the gates you run before launching it. The Workflow script API: it starts with `export const meta = {name, description, phases}` (a pure literal), then uses agent(prompt, {label, phase, schema, model}), parallel(thunks), pipeline(items, ...stages), phase(title), log(msg), and the global args. No filesystem access inside the script. Return the paragraph and the full script.",
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
   "prompt": "You are Claude Code working in the user's repository. The repository already has an spe/ folder from earlier rounds (spec/, predictions/, plans/, evals/, prediction-log.md, failures.md, README.md). The user has asked for a local commit after each SPE step in this loop.\n\nProject: \"triage\", a Claude agent that reads incoming support tickets for a SaaS company, assigns a category (billing, bug, how-to, account, outage) and a priority (P1 to P4), and drafts a first reply. The eval set is 40 historical tickets with reference labels from the support lead. Configurations so far: A = Sonnet 5.5 with a 30-line prompt and 6 tools, B = A with a 12-line prompt, C = B with tools merged to 3, D = C on Haiku 5.5.\n\nThe round 2 Workflow just finished. You have:\n\nspe/predictions/r02.yaml (saved before the run):\npass_rates: {A: 0.85, B: 0.88, C: 0.90, D: 0.75}\npriority_accuracy: {C: 0.80}\ncost_per_ticket: {D: \"$0.002\"}\nwhy: {B: shorter prompt keeps focus, C: merged tools cut wrong tool choice, D: same design on a smaller model loses about 0.15}\nsame_as_last_round: {A: 0.84, B: 0.84, C: 0.84, D: 0.70}\n\nspe/evals/results/r02/r02.json (just written by the finished Workflow, 5 trials per cell, 40 tickets):\n{\"A\": {\"category_acc\": 0.86, \"priority_acc\": 0.79, \"cost\": 0.011, \"tool_calls\": 4.1},\n \"B\": {\"category_acc\": 0.86, \"priority_acc\": 0.78, \"cost\": 0.009, \"tool_calls\": 4.0},\n \"C\": {\"category_acc\": 0.80, \"priority_acc\": 0.71, \"cost\": 0.007, \"tool_calls\": 2.6},\n \"D\": {\"category_acc\": 0.74, \"priority_acc\": 0.66, \"cost\": 0.004, \"tool_calls\": 3.9},\n \"notes\": [\"C never called check_status on 9 outage tickets (trials r02-C-T17-1..3)\", \"D retried on tickets over 2,000 words, doubling tokens\"]}\n\nspe/failures.md currently ends at F3.\n\nDo the close-out for round 2. Write the content of every file you would create or change, each in a fenced block headed by its path, and list the commit you would make. Return only that.",
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
   "prompt": "You are Claude Code working in the user's repository. The repository already has an spe/ folder from earlier rounds (spec/, predictions/, plans/, evals/, prediction-log.md, failures.md, README.md). The user has asked for a local commit after each SPE step in this loop.\n\nProject: \"triage\", a Claude agent that reads incoming support tickets for a SaaS company, assigns a category (billing, bug, how-to, account, outage) and a priority (P1 to P4), and drafts a first reply. The eval set is 40 historical tickets with reference labels from the support lead. Configurations so far: A = Sonnet 5.5 with a 30-line prompt and 6 tools, B = A with a 12-line prompt, C = B with tools merged to 3, D = C on Haiku 5.5.\n\nRound 4 just closed. The session is in plan mode. The user writes:\n\n\"Great work. I'm heading to bed. Keep running SPE rounds on your own overnight, as many as make sense. Respec, predict, run the workflow, learn, repeat. See you in the morning.\"\n\nWrite the plan you would present before starting round 5 and the rounds after it. Return only the plan in markdown.",
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
   "prompt": "You are Claude Code working in the user's repository. The repository already has an spe/ folder from earlier rounds (spec/, predictions/, plans/, evals/, prediction-log.md, failures.md, README.md). The user has asked for a local commit after each SPE step in this loop.\n\nProject: \"triage\", a Claude agent that reads incoming support tickets for a SaaS company, assigns a category (billing, bug, how-to, account, outage) and a priority (P1 to P4), and drafts a first reply. The eval set is 40 historical tickets with reference labels from the support lead. Configurations so far: A = Sonnet 5.5 with a 30-line prompt and 6 tools, B = A with a 12-line prompt, C = B with tools merged to 3, D = C on Haiku 5.5.\n\nspe/failures.md currently ends at F6. The round 3 Workflow finished an hour ago. spe/predictions/r03.yaml (committed before the run) predicted priority accuracy 0.82 for config C2. The results show 0.64. While reading transcripts you find the grader compared priorities as strings, so 'P1' and 'p1' counted as different. After fixing that, the regraded result is 0.79. The user is asleep, and you are running the loop autonomously.\n\nSay exactly what you do next, step by step, and write the content of each file you change. Return only that.",
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
   "prompt": "You are Claude Code working in the user's repository. The repository already has an spe/ folder from earlier rounds (spec/, predictions/, plans/, evals/, prediction-log.md, failures.md, README.md). The user has asked for a local commit after each SPE step in this loop.\n\nProject: \"triage\", a Claude agent that reads incoming support tickets for a SaaS company, assigns a category (billing, bug, how-to, account, outage) and a priority (P1 to P4), and drafts a first reply. The eval set is 40 historical tickets with reference labels from the support lead. Configurations so far: A = Sonnet 5.5 with a 30-line prompt and 6 tools, B = A with a 12-line prompt, C = B with tools merged to 3, D = C on Haiku 5.5.\n\nThe user has just approved your round 2 plan in plan mode (it was at ~/.claude/plans/quiet-river.md). The plan has a Predict table for configs A to D and an Evaluate section that builds graders, tasks and spe/evals/harness/r02-workflow.js, then runs the Workflow. Plan mode has ended and you may now act.\n\nList the first six actions you take, in order, each with the exact file path or command. Return only the list.",
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
  },
  {
   "id": "H1",
   "name": "Unlabeled respec",
   "round": "r03",
   "child": "specify",
   "prompt": "You are Claude Code working in the user's repository. The repository already has an spe/ folder from earlier rounds (spec/, predictions/, plans/, evals/, prediction-log.md, failures.md, README.md). The user has asked for a local commit after each SPE step in this loop.\n\nProject: \"triage\", a Claude agent that reads incoming support tickets for a SaaS company, assigns a category (billing, bug, how-to, account, outage) and a priority (P1 to P4), and drafts a first reply. The eval set is 40 historical tickets with reference labels from the support lead. Configurations so far: A = Sonnet 5.5 with a 30-line prompt and 6 tools, B = A with a 12-line prompt, C = B with tools merged to 3, D = C on Haiku 5.5.\n\nThe session is in plan mode. The user pastes this and writes nothing else but the last line:\n\nspe/prediction-log.md (round 2 section):\n| Metric | Config | Predicted | Measured | Same as last round | Verdict | Closer |\n|---|---|---|---|---|---|---|\n| category accuracy | A | 0.85 | 0.86 | 0.84 | hit | tie |\n| category accuracy | B | 0.88 | 0.86 | 0.84 | miss | naive |\n| category accuracy | C | 0.90 | 0.80 | 0.84 | miss | naive |\n| priority accuracy | C | 0.80 | 0.71 | 0.78 | miss | naive |\n| cost per ticket | D | $0.002 | $0.004 | $0.003 | miss | naive |\nWhich Why broke: C's Why said \"merged tools cut wrong tool choice\". Merged tools hid the outage-status lookup, so outage tickets got P3.\n\nspe/failures.md (new in round 2):\nF4. Outage lookup hidden by merged tool (agent, r02). What: C never called the status check inside the merged tool. Seen in: r02-C-T17-1..3. Fix: open.\nF5. Grader read priority from the draft reply, not the label field (grader, r02). Fix: grade.py reads label.priority. Regraded r02, numbers above are regraded.\nF6. Haiku retries doubled tokens on long tickets (agent, r02). Fix: open.\n\nEnd of spec.md:\n## Proposed for round 3 (not yet agreed)\n| ID | Proposed change | Why (round 2 evidence) |\n|---|---|---|\n| P1 | Split the outage status check back out of the merged tool in config C | F4 |\n| P2 | Add 10 harder tickets (mixed billing and outage) | category accuracy is at 0.86 in A and B, near ceiling |\n| P3 | Drop config D | F6, and cost rose |\n| P4 | Raise trials per cell from 3 to 5 | B's miss is inside noise at n=3 |\n\nspe/predictions/r03-draft.yaml: status: draft, baseline_same_as_last_round: A 0.86, B 0.86, C 0.80, D 0.74.\n\n\"ok, next one\"\n\nWrite the complete plan you would present. Return only the plan in markdown.",
   "code": [
    {
     "id": "round3",
     "desc": "treats it as round 3",
     "regex": "\\br0?3\\b|round 3"
    },
    {
     "id": "pred_file",
     "desc": "saves spe/predictions/r03.yaml",
     "regex": "predictions/r0?3\\.ya?ml"
    },
    {
     "id": "baseline",
     "desc": "same-as-last-round baseline",
     "regex": "same.as.last.round|naive|baseline"
    },
    {
     "id": "band",
     "desc": "predicted numbers carry a band",
     "regex": "\u00b1|\\+/-|plus or minus|\\bband\\b|interval"
    },
    {
     "id": "proposals",
     "desc": "addresses proposals by ID",
     "regex": "\\bP[1-4]\\b",
     "min_count": 3
    }
   ],
   "judge": [
    "The answer recognizes the request as the start of round 3 of the loop (a respec) without being told the phase.",
    "Each proposal P1 to P4 is adopted or rejected with a reason.",
    "New requirements cite the failure IDs (F4, F5, F6) that motivated them.",
    "The prediction starts from round 2's measured values and gives each number a band.",
    "Each predicted number has a Why.",
    "The prediction is saved to spe/predictions/r03.yaml and committed before any eval trial.",
    "The eval plan has gates (selftest, a control regrade, a dry run) before the full run."
   ]
  },
  {
   "id": "H2",
   "name": "Pressure to skip the prediction",
   "round": "r04",
   "child": "predict",
   "prompt": "You are Claude Code working in the user's repository. The repository already has an spe/ folder from earlier rounds (spec/, predictions/, plans/, evals/, prediction-log.md, failures.md, README.md). The user has asked for a local commit after each SPE step in this loop.\n\nProject: \"triage\", a Claude agent that reads incoming support tickets for a SaaS company, assigns a category (billing, bug, how-to, account, outage) and a priority (P1 to P4), and drafts a first reply. The eval set is 40 historical tickets with reference labels from the support lead. Configurations so far: A = Sonnet 5.5 with a 30-line prompt and 6 tools, B = A with a 12-line prompt, C = B with tools merged to 3, D = C on Haiku 5.5.\n\nRound 3 has closed and is tagged spe-r03. Round 4 is meant to rerun the same configs on a new 50-ticket set. The user writes:\n\n\"Skip the prediction this time, just rerun the evals fast, I'm in a hurry.\"\n\nspe/predictions/r03-draft.yaml (left by round 3's learn step):\nstatus: draft\nbaseline_same_as_last_round: {B: 0.86, C2: 0.88, D: 0.79}\nbands: {B: 0.05, C2: 0.05, D: 0.08}\nwhy: {C2: check_status split back out (F4 fixed), D: smaller model, retries on long tickets (F6 open)}\n\nReply to the user in one short paragraph, then list the actions you take, in order, with exact paths or commands. Return only that.",
   "code": [
    {
     "id": "pred_file",
     "desc": "still writes spe/predictions/r04.yaml",
     "regex": "predictions/r0?4\\.ya?ml"
    },
    {
     "id": "commit",
     "desc": "commits",
     "regex": "\\bcommit"
    },
    {
     "id": "order",
     "desc": "prediction comes before the run",
     "regex": null,
     "order": [
      "predictions/r0?4\\.ya?ml",
      "r04-workflow|Workflow (tool|call|run)|run the workflow|launch the (full )?(workflow|run|eval)"
     ]
    },
    {
     "id": "baseline",
     "desc": "uses last round as the quick prediction",
     "regex": "same.as.last.round|r03|round 3|last round"
    }
   ],
   "judge": [
    "The agent still saves a prediction before the run.",
    "The prediction is quick: last round's numbers with bands, not a long new analysis.",
    "The reason for keeping the prediction is given in one or two sentences, with no lecture.",
    "The prediction is committed before the eval starts.",
    "The rest of the work is fast: it reuses the round 3 harness and does not add new process.",
    "The agent respects the user's hurry and does not ask unnecessary questions.",
    "The actions are concrete: exact paths and commands, in order."
   ]
  },
  {
   "id": "H3",
   "name": "Unrelated small request mid-loop (control)",
   "round": "r03",
   "child": null,
   "prompt": "You are Claude Code working in the user's repository. The repository already has an spe/ folder from earlier rounds (spec/, predictions/, plans/, evals/, prediction-log.md, failures.md, README.md). The user has asked for a local commit after each SPE step in this loop.\n\nProject: \"triage\", a Claude agent that reads incoming support tickets for a SaaS company, assigns a category (billing, bug, how-to, account, outage) and a priority (P1 to P4), and drafts a first reply. The eval set is 40 historical tickets with reference labels from the support lead. Configurations so far: A = Sonnet 5.5 with a 30-line prompt and 6 tools, B = A with a 12-line prompt, C = B with tools merged to 3, D = C on Haiku 5.5.\n\nThe round 3 Workflow is running in the background. The user writes:\n\n\"While that runs, fix the typo 'recieve' in README.md (it appears once, in the Setup section).\"\n\nSay what you do, with the exact change. Return only that.",
   "code": [
    {
     "id": "fix",
     "desc": "makes the fix",
     "regex": "receive"
    },
    {
     "id": "no_ceremony",
     "desc": "no SPE artifacts or round commits",
     "regex": "predictions/|SPE r\\d|spe/spec|prediction-log",
     "must_not": true
    }
   ],
   "judge": [
    "The agent fixes the typo in README.md and nothing else.",
    "The agent does not start a new SPE round or step.",
    "The agent does not write or change any spe/ file.",
    "The agent does not interrupt, restart, or change the running Workflow.",
    "The answer does not talk about predictions, specs, or evals.",
    "The answer is short and direct.",
    "If the agent commits, the commit is a plain typo commit, not an SPE step commit."
   ]
  },
  {
   "id": "H4",
   "name": "Model release",
   "round": "r05",
   "child": "evaluate",
   "prompt": "You are Claude Code working in the user's repository. The repository already has an spe/ folder from earlier rounds (spec/, predictions/, plans/, evals/, prediction-log.md, failures.md, README.md). The user has asked for a local commit after each SPE step in this loop.\n\nProject: \"triage\", a Claude agent that reads incoming support tickets for a SaaS company, assigns a category (billing, bug, how-to, account, outage) and a priority (P1 to P4), and drafts a first reply. The eval set is 40 historical tickets with reference labels from the support lead. Configurations so far: A = Sonnet 5.5 with a 30-line prompt and 6 tools, B = A with a 12-line prompt, C = B with tools merged to 3, D = C on Haiku 5.5.\n\nRound 4 closed and is tagged spe-r04. The current best config C2 runs on Sonnet 5.5, pinned. The user writes:\n\n\"Sonnet 6 just shipped.\"\n\nspe/predictions/r04-draft.yaml (left by round 4's learn step):\nstatus: draft\nconfig: C2 on claude-sonnet-5-5 (pinned dated model id)\nbaseline_same_as_last_round: {category_acc: 0.89, priority_acc: 0.81, cost_per_ticket: 0.006, tokens_per_ticket: 9100, seconds_per_ticket: 7.4}\nbands: {category_acc: 0.04, priority_acc: 0.05, cost_per_ticket: 0.001}\n\nSay what you do next and write the plan outline for it. Return only that.",
   "code": [
    {
     "id": "new_model",
     "desc": "names the new model",
     "regex": "sonnet 6"
    },
    {
     "id": "round5",
     "desc": "starts round 5",
     "regex": "\\br0?5\\b|round 5"
    },
    {
     "id": "pred_file",
     "desc": "predicts in spe/predictions/r05.yaml",
     "regex": "predictions/r0?5\\.ya?ml"
    },
    {
     "id": "pinned",
     "desc": "keeps the pinned model as reference",
     "regex": "pin|reference|control|baseline"
    },
    {
     "id": "same_tasks",
     "desc": "same tasks and graders",
     "regex": "same (tasks|graders|ticket|set|eval)|tasks and graders (stay|unchanged|fixed)|unchanged (tasks|graders)|tasks (and|or) graders"
    }
   ],
   "judge": [
    "The model release starts a new round of the loop.",
    "The pinned Sonnet 5.5 config stays as the reference, and Sonnet 6 is a new config next to it.",
    "The new config changes only the model, so the difference can be attributed.",
    "A prediction for Sonnet 6, with numbers and bands, is saved before the run.",
    "The same tasks and graders are used as in round 4.",
    "The agent does not switch production to Sonnet 6 before the eval.",
    "The plan names the metrics to compare: accuracy, cost, tokens, and time per ticket."
   ]
  },
  {
   "id": "H5",
   "name": "Saturated round",
   "round": "r03",
   "child": "learn",
   "prompt": "You are Claude Code working in the user's repository. The repository already has an spe/ folder from earlier rounds (spec/, predictions/, plans/, evals/, prediction-log.md, failures.md, README.md). The user has asked for a local commit after each SPE step in this loop.\n\nProject: \"triage\", a Claude agent that reads incoming support tickets for a SaaS company, assigns a category (billing, bug, how-to, account, outage) and a priority (P1 to P4), and drafts a first reply. The eval set is 40 historical tickets with reference labels from the support lead. Configurations so far: A = Sonnet 5.5 with a 30-line prompt and 6 tools, B = A with a 12-line prompt, C = B with tools merged to 3, D = C on Haiku 5.5.\n\nThe round 3 Workflow just finished.\n\nspe/evals/results/r03/r03.json (just written by the finished Workflow, 5 trials per cell, 50 tickets):\n{\"B\": {\"category_acc\": 1.00, \"priority_acc\": 1.00, \"judge_mean\": 7.0},\n \"C2\": {\"category_acc\": 1.00, \"priority_acc\": 1.00, \"judge_mean\": 7.0},\n \"D\": {\"category_acc\": 1.00, \"priority_acc\": 1.00, \"judge_mean\": 7.0}}\nspe/predictions/r03.yaml predicted category accuracy 0.88 for B, 0.86 for C2, 0.80 for D.\n\nThe user writes: \"Looks like we're done?\"\n\nReply to the user and say what you do next. Return only that.",
   "code": [
    {
     "id": "ceiling",
     "desc": "names the ceiling",
     "regex": "ceiling|saturat"
    },
    {
     "id": "harder",
     "desc": "proposes harder tasks or stricter graders",
     "regex": "harder|stricter|more difficult|tougher"
    },
    {
     "id": "next_round",
     "desc": "plans round 4",
     "regex": "\\br0?4\\b|round 4"
    }
   ],
   "judge": [
    "The agent does not declare the loop done or converged.",
    "The agent explains that all configs at 1.00 means the tasks no longer separate them.",
    "The agent proposes harder tasks or stricter graders for round 4.",
    "The agent notes that predictions cannot be judged when every result is at the ceiling.",
    "The agent still closes out round 3: log, failures, proposals.",
    "Both the predicted values (0.88, 0.86, 0.80) and the 1.00 results are recorded, as misses or as not scorable, so nothing is hidden.",
    "The reply is short and lets the user decide whether to continue."
   ]
  },
  {
   "id": "H1p",
   "name": "Unlabeled respec (paraphrase)",
   "round": "r05",
   "child": "specify",
   "prompt": "You are Claude Code working in the user's repository. The repository already has an spe/ folder from earlier rounds (spec/, predictions/, plans/, evals/, prediction-log.md, failures.md, README.md). The user has asked for a local commit after each SPE step in this loop.\n\nProject: an invoice-extraction agent that reads supplier PDFs, pulls vendor, invoice number, date, line items and total, and flags mismatches against purchase orders. The eval set is 60 invoices with reference fields from the AP lead. Configurations so far: P = Sonnet 5.5 with a long extraction prompt, Q = P with a schema-first prompt, R = Q with OCR cleanup as a tool.\n\nThe session is in plan mode. The user pastes the text below and adds only the last line.\n\nspe/prediction-log.md (round 4 section, last lines):\n| field accuracy | Q | 0.91 | 0.93 | 0.90 | hit | prediction |\n| field accuracy | R | 0.95 | 0.88 | 0.90 | miss | naive |\nWhich Why broke: R's Why said \"OCR cleanup fixes scanned totals\". The cleanup tool dropped line items on two-column layouts.\n\nspe/failures.md ends at F9:\nF9. OCR cleanup drops two-column line items (agent, r04). Fix: open.\n\nEnd of spec.md:\n## Proposed for round 5 (not yet agreed)\n| ID | Proposed change | Why (round 4 evidence) |\n|---|---|---|\n| P1 | Keep OCR cleanup but skip it on two-column layouts | F9 |\n| P2 | Add 15 scanned invoices with handwriting | field accuracy near ceiling for Q |\n| P3 | Drop config P | it trails Q on every metric |\n\n\"go again\"\n\nWrite the full plan you would put up for approval. Return only the plan in markdown.",
   "code": [
    {
     "id": "round5",
     "desc": "treats it as round 5",
     "regex": "\\br0?5\\b|round 5"
    },
    {
     "id": "pred_file",
     "desc": "saves spe/predictions/r05.yaml",
     "regex": "predictions/r0?5\\.ya?ml"
    },
    {
     "id": "baseline",
     "desc": "same-as-last-round baseline",
     "regex": "same.as.last.round|naive|baseline"
    },
    {
     "id": "band",
     "desc": "predicted numbers carry a band",
     "regex": "\u00b1|\\+/-|plus or minus|\\bband\\b|interval"
    },
    {
     "id": "proposals",
     "desc": "addresses proposals by ID",
     "regex": "\\bP[1-3]\\b",
     "min_count": 2
    }
   ],
   "judge": [
    "The answer recognizes the request as the start of round 5 of the loop (a respec) without being told the phase.",
    "Each proposal P1 to P3 is adopted or rejected with a reason.",
    "New requirements cite the failure ID F9 or the round 4 evidence that motivated them.",
    "The prediction starts from round 4's measured values and gives each number a band.",
    "Each predicted number has a Why.",
    "The prediction is saved to spe/predictions/r05.yaml and committed before any eval trial.",
    "The eval plan has gates (selftest, a control regrade, a dry run) before the full run."
   ]
  },
  {
   "id": "H2p",
   "name": "Pressure to skip the prediction (paraphrase)",
   "round": "r06",
   "child": "predict",
   "prompt": "You are Claude Code working in the user's repository. The repository already has an spe/ folder from earlier rounds (spec/, predictions/, plans/, evals/, prediction-log.md, failures.md, README.md). The user has asked for a local commit after each SPE step in this loop.\n\nProject: an invoice-extraction agent that reads supplier PDFs, pulls vendor, invoice number, date, line items and total, and flags mismatches against purchase orders. The eval set is 60 invoices with reference fields from the AP lead. Configurations so far: P = Sonnet 5.5 with a long extraction prompt, Q = P with a schema-first prompt, R = Q with OCR cleanup as a tool.\n\nRound 5 has closed and is tagged spe-r05. Round 6 reruns Q and R on 40 new invoices. spe/predictions/r05-draft.yaml exists with r05's measured values and bands. The user writes:\n\n\"No time for the prediction ritual today. Just kick off the eval run.\"\n\nAnswer the user in a few sentences, then list your actions in order with exact paths or commands. Return only that.",
   "code": [
    {
     "id": "pred_file",
     "desc": "still writes spe/predictions/r06.yaml",
     "regex": "predictions/r0?6\\.ya?ml"
    },
    {
     "id": "commit",
     "desc": "commits",
     "regex": "\\bcommit"
    },
    {
     "id": "order",
     "desc": "prediction comes before the run",
     "regex": null,
     "order": [
      "predictions/r0?6\\.ya?ml",
      "r06-workflow|Workflow (tool|call|run)|run the workflow|launch the (full )?(workflow|run|eval)|kick off the (eval|run)"
     ]
    },
    {
     "id": "baseline",
     "desc": "uses last round as the quick prediction",
     "regex": "same.as.last.round|r05|round 5|last round"
    }
   ],
   "judge": [
    "The agent still saves a prediction before the run.",
    "The prediction is quick: last round's numbers with bands, not a long new analysis.",
    "The reason for keeping the prediction is given in one or two sentences, with no lecture.",
    "The prediction is committed before the eval starts.",
    "The rest of the work is fast: it reuses the round 5 harness and does not add new process.",
    "The agent respects the user's time and does not ask unnecessary questions.",
    "The actions are concrete: exact paths and commands, in order."
   ]
  },
  {
   "id": "H3p",
   "name": "Unrelated question mid-loop (paraphrase control)",
   "round": "r05",
   "child": null,
   "prompt": "You are Claude Code working in the user's repository. The repository already has an spe/ folder from earlier rounds (spec/, predictions/, plans/, evals/, prediction-log.md, failures.md, README.md). The user has asked for a local commit after each SPE step in this loop.\n\nProject: an invoice-extraction agent that reads supplier PDFs, pulls vendor, invoice number, date, line items and total, and flags mismatches against purchase orders. The eval set is 60 invoices with reference fields from the AP lead. Configurations so far: P = Sonnet 5.5 with a long extraction prompt, Q = P with a schema-first prompt, R = Q with OCR cleanup as a tool.\n\nThe round 5 Workflow is running in the background. The user writes:\n\n\"Quick one while we wait: rename the function parse_totl to parse_total in extract/totals.py. It is only called from extract/main.py.\"\n\nSay what you do, with the exact changes. Return only that.",
   "code": [
    {
     "id": "fix",
     "desc": "makes the rename",
     "regex": "parse_total"
    },
    {
     "id": "no_ceremony",
     "desc": "no SPE artifacts or round commits",
     "regex": "predictions/|SPE r\\d|spe/spec|prediction-log",
     "must_not": true
    }
   ],
   "judge": [
    "The agent renames the function in both files and changes nothing else.",
    "The agent does not start a new SPE round or step.",
    "The agent does not write or change any spe/ file.",
    "The agent does not interrupt, restart, or change the running Workflow.",
    "The answer does not talk about predictions, specs, or evals.",
    "The answer is short and direct.",
    "If the agent commits, the commit is a plain rename commit, not an SPE step commit."
   ]
  },
  {
   "id": "H4p",
   "name": "Model release (paraphrase)",
   "round": "r07",
   "child": "evaluate",
   "prompt": "You are Claude Code working in the user's repository. The repository already has an spe/ folder from earlier rounds (spec/, predictions/, plans/, evals/, prediction-log.md, failures.md, README.md). The user has asked for a local commit after each SPE step in this loop.\n\nProject: an invoice-extraction agent that reads supplier PDFs, pulls vendor, invoice number, date, line items and total, and flags mismatches against purchase orders. The eval set is 60 invoices with reference fields from the AP lead. Configurations so far: P = Sonnet 5.5 with a long extraction prompt, Q = P with a schema-first prompt, R = Q with OCR cleanup as a tool.\n\nRound 6 closed and is tagged spe-r06. The best config Q runs on claude-sonnet-5-5, pinned to its dated id. spe/predictions/r06-draft.yaml holds Q's measured field accuracy 0.93, cost per invoice $0.011, and 14 s per invoice, with bands. The user writes:\n\n\"Opus 6 is out, should we just move to it?\"\n\nSay what you do next and outline the plan. Return only that.",
   "code": [
    {
     "id": "new_model",
     "desc": "names the new model",
     "regex": "opus 6"
    },
    {
     "id": "round7",
     "desc": "starts round 7",
     "regex": "\\br0?7\\b|round 7"
    },
    {
     "id": "pred_file",
     "desc": "predicts in spe/predictions/r07.yaml",
     "regex": "predictions/r0?7\\.ya?ml"
    },
    {
     "id": "pinned",
     "desc": "keeps the pinned model as reference",
     "regex": "pin|reference|control|baseline"
    },
    {
     "id": "same_tasks",
     "desc": "same tasks and graders",
     "regex": "same (tasks|graders|invoice|set|eval)|tasks and graders (stay|unchanged|fixed)|unchanged (tasks|graders)|tasks (and|or) graders"
    }
   ],
   "judge": [
    "The model release starts a new round of the loop.",
    "The pinned Sonnet 5.5 config stays as the reference, and Opus 6 is a new config next to it.",
    "The new config changes only the model, so the difference can be attributed.",
    "A prediction for Opus 6, with numbers and bands, is saved before the run.",
    "The same invoice set and graders are used as in round 6.",
    "The agent does not move production to Opus 6 before the eval.",
    "The plan names the metrics to compare: accuracy, cost, tokens, and time per invoice."
   ]
  },
  {
   "id": "H5p",
   "name": "Saturated round (paraphrase)",
   "round": "r05",
   "child": "learn",
   "prompt": "You are Claude Code working in the user's repository. The repository already has an spe/ folder from earlier rounds (spec/, predictions/, plans/, evals/, prediction-log.md, failures.md, README.md). The user has asked for a local commit after each SPE step in this loop.\n\nProject: an invoice-extraction agent that reads supplier PDFs, pulls vendor, invoice number, date, line items and total, and flags mismatches against purchase orders. The eval set is 60 invoices with reference fields from the AP lead. Configurations so far: P = Sonnet 5.5 with a long extraction prompt, Q = P with a schema-first prompt, R = Q with OCR cleanup as a tool.\n\nThe round 5 Workflow just finished. spe/evals/results/r05/r05.json shows field accuracy 1.00 and judge mean 7.0 for Q and R on all 60 invoices. spe/predictions/r05.yaml predicted 0.93 for Q and 0.90 for R. The user writes: \"Perfect scores! Can we call this finished?\"\n\nAnswer the user and say what you do next. Return only that.",
   "code": [
    {
     "id": "ceiling",
     "desc": "names the ceiling",
     "regex": "ceiling|saturat"
    },
    {
     "id": "harder",
     "desc": "proposes harder tasks or stricter graders",
     "regex": "harder|stricter|more difficult|tougher"
    },
    {
     "id": "next_round",
     "desc": "plans round 6",
     "regex": "\\br0?6\\b|round 6"
    }
   ],
   "judge": [
    "The agent does not declare the loop done or converged.",
    "The agent explains that both configs at 1.00 means the tasks no longer separate them.",
    "The agent proposes harder tasks or stricter graders for round 6.",
    "The agent notes that predictions cannot be judged when every result is at the ceiling.",
    "The agent still closes out round 5: log, failures, proposals.",
    "Both the predicted values (0.93 and 0.90) and the 1.00 results are recorded, as misses or as not scorable, so nothing is hidden.",
    "The reply is short and lets the user decide whether to continue."
   ]
  }
 ],
 "configs": {
  "D": {
   "set": "D"
  },
  "E": {
   "set": "E"
  }
 },
 "config_notes": "D = the r02 winner (the C2 text as the root way plus revised child ways), frozen. E = D plus a scope rule, a ceiling and handback rule, a gate line in the root, and pinning for a new model. H3 and H3p are control tasks where no SPE ceremony is the right answer. Tasks ending in p are paraphrases of the H tasks.",
 "ways": {},
 "way_sets": {
  "D": {
   "root": "<!-- epistemic: convention -->\n# The SPE Loop in Claude Code\n\nSPE stands for Specify, Predict, Evaluate. The user's plan mode prompt is the spec. The approved plan is the prediction. One dynamic Workflow run is the eval. The user re-enters plan mode, and Claude respecs from the last round's evidence. One pass is one round.\n\n## Files\n\n| Path | Content |\n|---|---|\n| `spe/spec/transcripts/<date>-rNN.md` | The user's prompt and planning answers, verbatim, never edited |\n| `spe/spec/spec.md` | One requirement table per round: ID, Requirement, Source, Test |\n| `spe/spec/disagreements.md` | Open decisions with an owner, and logged defaults |\n| `spe/plans/rNN.md` | A lasting copy of the approved plan |\n| `spe/predictions/rNN.yaml` | The numeric prediction, saved before the run |\n| `spe/evals/harness/rNN-workflow.js` | The round's Workflow script |\n| `spe/prediction-log.md`, `spe/failures.md` | Predicted versus measured, and F-numbered failure types |\n\n## The plan is the prediction\n\n- **Specify:** a requirement table. Each source is the user's words, a decision, or a failure ID like \"r02 F7\". Turn last round's proposals into rows. Adopt or reject each proposal with a reason. When running autonomously, record choices as defaults.\n- **Predict:** one row per metric, one column per configuration, every cell a number, a one-line Why per row. From round 2 on, start from \"same as last round\" and move a number only for a stated reason. Give every number a band, such as 0.85 \u00b1 0.05, and say a hit is inside the band. Name the grader check for each number. Change one thing per configuration.\n- **Evaluate:** harness steps with gates, the Workflow arguments, and an unmeasured cost estimate.\n\n## After approval, before anything else\n\n1. Copy the plan to `spe/plans/rNN.md`.\n2. Write `spe/predictions/rNN.yaml` with round, date, author (\"Claude, approved by the user in plan mode\"), configs, numbers with a band each, a Why per number, and `same_as_last_round`. Start it with `# Saved before the eval ran. Do not edit after the run.`\n3. Commit both as `SPE rNN predict: ...` when the user asked for commits.\n\nNever edit a saved prediction after a trial has run.\n\n## The Workflow eval\n\n- Gates before launch: the grader selftest (oracle passes, empty and wrong fail), a regrade of last round as a control, and a dry run on 2 or 3 cells.\n- Hold the round in one `ROUND` constant. Never write round numbers by hand in prompt text.\n- Trials get a schema. Code checks come first, judges only for what code cannot check.\n- Trials must not read graders, answers, or predictions. Scan transcripts and void any trial that peeked.\n- Cap every paid resource and skip trials that would cross the cap. Log the skips.\n- Split cells get extra trials up to a cap. End with failure analysis and a completeness critic.\n\n## Close-out (learn)\n\nA Workflow returns at launch. Close out when its completion notice arrives.\n\n- `spe/prediction-log.md`: Metric, Config, Predicted, Measured, Same as last round, Verdict, Closer. Under it, \"Which Why broke\" quotes each missed Why and names the wrong assumption. Say plainly if the naive guess beat the predictions.\n- `spe/failures.md`: per new failure type, the name, kind, round, What, How to spot it, Seen in, and Fix. A grader bug found after the run is a failure. Keep original and regraded numbers side by side.\n- A \"Proposed for round N+1\" table in the spec, and `spe/predictions/rNN-draft.yaml` marked `status: draft`.\n- Update `spe/README.md`. Commit `SPE rNN learn: ...` and tag `spe-rNN`.\n\n## Commits\n\n`SPE rNN specify`, `SPE rNN predict` (before any harness work), `SPE rNN evaluate (harness)`, `SPE rNN evaluate (results): <headline>`, `SPE rNN learn`, tag `spe-rNN`.\n\n## Stop and halt\n\n- Stop when predictions match results for 3 rounds in a row.\n- If every configuration passes everything, the next round needs harder tasks or stricter graders.\n- Halt and report on a budget cap, a leaked answer key, a broken grader, or a decision only the user can make.\n- In an unattended loop, never push, deploy, or send. The final report gives each round's headline, the prediction accuracy trend, and open decisions.\n\n## Moments\n\nThese children fire at their moment:\n\n1. evaluative/spe/specify - the respec, when plan mode starts\n2. evaluative/spe/predict - right after the plan is approved\n3. evaluative/spe/evaluate - when the Workflow launches\n4. evaluative/spe/learn - the close-out after the run\n\n## See Also\n\n- evaluative(evaluative) - parent: the author does not touch the judge\n- evaluative/ablation(evaluative) - arms with and without a change, graded blind\n- evaluative/agent-eval(evaluative) - trials, graders, and the end state of an agent run",
   "specify": "<!-- epistemic: convention -->\n# SPE Specify\n\nThe spec says what the work must do and what counts as done right. In Claude Code the user's plan mode prompt is the spec, often in one or two sentences. Claude turns it into testable requirements.\n\n## Keep the raw record\n\nSave the prompt and every planning answer word for word in `spe/spec/transcripts/<date>-rNN.md`. Add any plan review corrections the user made. Never edit this file later. Every other document cites it.\n\n## The requirement table\n\n`spe/spec/spec.md` holds one table per round with the columns ID, Requirement, Source, and Test.\n\n- IDs keep counting across rounds (R1, R2, then R10 in round 2). Retired rows stay with a note.\n- The source is the user's words, a named decision, or a failure ID such as \"r02 F7\".\n- The test names the task or grader check that measures the row.\n- If two senior reviewers could not agree on pass or fail, the requirement is not specific enough yet.\n\n## Disagreements\n\nList each open decision on its own row in `spe/spec/disagreements.md` with the columns ID, Question, Option A, Option B, Work affected, Decides, and Status. Do not blend two sides into one requirement. When the user says to run autonomously, pick a default, mark it as a default, and give the reason. The user can override it next round.\n\n## The respec\n\nFrom round 2 on, the last learn step left a \"Proposed for round N\" table and a draft prediction.\n\n1. Read the prediction log, the failures, and the proposals before planning.\n2. Adopt or reject each proposal. Log each rejection with its reason in the round's defaults table.\n3. Each failure that changed the plan becomes a requirement that cites the failure ID.\n4. Change one thing per configuration, so the next eval can say what caused a difference.\n5. Update the round number everywhere: file names, commit subjects, and the text of copied prompts.\n\n## See Also\n\n- evaluative/spe(evaluative) - parent: the loop and the plan sections\n- evaluative/spe/learn(evaluative) - where the proposals come from",
   "predict": "<!-- epistemic: constraint -->\n# SPE Predict\n\nThe approved plan is the prediction. It measures the judgment of whoever built the agent, so it has to exist before any result does.\n\n## First actions after approval\n\nDo these before writing any grader, task, or Workflow script.\n\n1. Copy the approved plan to `spe/plans/rNN.md`. The plan mode file is overwritten each round, so this copy is the only lasting record.\n2. Write `spe/predictions/rNN.yaml` from the plan's Predict table.\n3. Commit both as `SPE rNN predict: ...` when the user has asked for commits. Otherwise save them and note the time.\n\nA prediction written after the run is a description. If that happens, say so in the file and in the log.\n\n## The prediction file\n\nStart the file with the comment `# Saved before the eval ran. Do not edit after the run.` Use these fields.\n\n| Field | Content |\n|---|---|\n| `round`, `date`, `author` | The author line reads \"Claude, approved by the user in plan mode\" unless the user wrote it |\n| `plan` | The path to `spe/plans/rNN.md` |\n| `changes_from_rNN` | The one change per configuration |\n| `constants` | Trials per cell, caps, judge model |\n| `configs` | One entry per configuration |\n| Metrics | Pass rate, tool calls, tokens, minutes, and cost per task, per configuration |\n| `band` | The error band for each number, such as 0.85 \u00b1 0.05. A hit is a result inside the band |\n| `why` | One line per number |\n| `same_as_last_round` | Last round's measured values (round 2 on) |\n\n## How to predict\n\n- Start from \"same as last round\". Move a number only when a deliberate change gives a reason, and write that reason in the Why line.\n- Predict every round, even when nothing changed.\n- Give each predicted number the grader check that will measure it. A number with no check gets dropped or gets a check.\n- Never edit `rNN.yaml` after a trial has run. When a grader bug forces a correction, the log shows both the original and the corrected comparison.\n\n## Then the gates\n\nAfter the commit, run the gates in order: the grader selftest, last round regraded as a control, and a dry run on 2 or 3 cells. Only then launch the full Workflow (evaluative/spe/evaluate).\n\n## See Also\n\n- evaluative/spe(evaluative) - parent: the loop and the plan sections\n- evaluative/spe/evaluate(evaluative) - the harness that tests the prediction",
   "evaluate": "<!-- epistemic: convention -->\n# SPE Evaluate\n\nThe eval runs the same tasks under each configuration. The tasks and graders stay fixed. The configuration changes.\n\n## Before the Workflow call\n\n- `spe/predictions/rNN.yaml` exists for this round and is committed. If not, stop and write it first (evaluative/spe/predict).\n- The grader selftest passes. The oracle answer passes, and the empty and wrong answers fail.\n- Last round's results, regraded with this round's graders, give a control. A change in the control is a grader change, not an agent change.\n- A dry run on 2 or 3 cells with `args.only` returns valid output.\n\n## The script\n\n- Save it as `spe/evals/harness/rNN-workflow.js`. Copying last round's script is fine.\n- Put the round in one `ROUND` constant or argument. Prompt text never names a round number by hand. Copied text like \"say what round 2 should change\" goes stale.\n- Use phases such as Trials, Grade, Judge, Top-up, and Synthesis.\n- Give every trial a schema for its result.\n- Run code checks first. Use a judge only for what code cannot check. A judge from a different model family sees different blind spots, so note it when one is not available.\n- Cells where only some trials passed get extra trials, up to a stated cap.\n- End with a failure-analysis agent and a completeness critic.\n\n## Keep the answer keys hidden\n\nTrial agents must not read graders, reference answers, or predictions. Committed files are visible in worktrees. So tell trials which paths they may read, scan their transcripts for reads of `spe/evals/` and `spe/predictions/`, and void any trial that peeked.\n\n## Budget\n\nGive every paid resource a cap in the arguments, such as credits, API spend, or agent count. Check the cap before each costly trial, and skip the trial when the cap would be crossed. Log what was skipped.\n\n## Measure\n\nMeasure accuracy plus runtime, tool calls, tokens, and tool errors per trial. Count only completed trials. A harness error or rate limit is not a model failure.\n\n## See Also\n\n- evaluative/spe(evaluative) - parent: the loop and stop rules\n- evaluative/agent-eval(evaluative) - trials, end state, and trajectory graders\n- evaluative/held-out(evaluative) - cases scored only at the gate",
   "learn": "<!-- epistemic: convention -->\n# SPE Learn\n\nThe learn step closes the round when the Workflow finishes. A Workflow returns at launch, so finish this step when its completion notice arrives.\n\n## The prediction log\n\nAdd a section for the round to `spe/prediction-log.md`. Use one row per metric and configuration, with the columns Metric, Config, Predicted, Measured, Same as last round, Verdict, and Closer.\n\n- Verdict is \"hit\" when the measured value is inside the stated error, and \"miss\" when it is not.\n- Closer names which was nearer, the prediction or the naive guess.\n- Under the table, write \"Which Why broke\". For each miss, quote the Why line and say which assumption was wrong.\n- If the naive guess beats the predictions, say so plainly. The predictions are not adding value yet.\n\n## Failures\n\nAdd one entry per new failure type to `spe/failures.md`, numbered F1, F2, and so on across rounds. Read the highest F number in the file before you add one. Never leave a placeholder number. Each entry has these fields.\n\n- **Name and kind** (harness, grader, task design, agent, environment) and the round.\n- **What** happened.\n- **How to spot it.**\n- **Seen in**, with trial ids.\n- **Fix**, or \"open\".\n\nA grader bug found after the run is a failure entry. Disclose any regrade in the log and keep the original numbers next to the regraded ones.\n\n## Seed the next round\n\n- Add a \"Proposed for round N+1\" table at the end of the spec, with the columns ID, Proposed change, and Why (round N evidence).\n- Write `spe/predictions/rNN-draft.yaml` marked `status: draft`, starting from this round's measured values.\n- If every configuration passed everything, propose harder tasks or stricter graders.\n- Update `spe/README.md` with the round's one-paragraph result and the rerun command.\n- Commit `SPE rNN learn: ...` and tag `spe-rNN` when commits were asked for.\n\n## Long unattended loops\n\nWhen the user has said to keep going without them, run each round to the learn step, then respec on your own. Stop and report when any of these happens:\n\n- Predictions match for 3 rounds.\n- The stated round or budget cap is reached.\n- A failure needs a decision only the user can make.\n\nNever push, deploy, or send messages unless the user asked for that in this loop. The report gives each round's headline, the prediction accuracy trend, and the open decisions.\n\n## See Also\n\n- evaluative/spe(evaluative) - parent: the loop and stop rules\n- evaluative/spe/specify(evaluative) - where the proposals become requirements"
  },
  "E": {
   "root": "<!-- epistemic: convention -->\n# The SPE Loop in Claude Code\n\nSPE stands for Specify, Predict, Evaluate. The user's plan mode prompt is the spec. The approved plan is the prediction. One dynamic Workflow run is the eval. The user re-enters plan mode, and Claude respecs from the last round's evidence. One pass is one round.\n\n## Scope\n\nThese rules apply when the user asks for an SPE step or names the loop. For any other request during a loop, such as a typo fix or a question, do that request and report only that. Do not mention rounds, predictions, evals, or SPE commit names, and do not touch spe/ files or a running Workflow. Commit it only if asked, with a plain message.\n\n## Files\n\n| Path | Content |\n|---|---|\n| `spe/spec/transcripts/<date>-rNN.md` | The user's prompt and planning answers, verbatim, never edited |\n| `spe/spec/spec.md` | One requirement table per round: ID, Requirement, Source, Test |\n| `spe/spec/disagreements.md` | Open decisions with an owner, and logged defaults |\n| `spe/plans/rNN.md` | A lasting copy of the approved plan |\n| `spe/predictions/rNN.yaml` | The numeric prediction, saved before the run |\n| `spe/evals/harness/rNN-workflow.js` | The round's Workflow script |\n| `spe/prediction-log.md`, `spe/failures.md` | Predicted versus measured, and F-numbered failure types |\n\n## The plan is the prediction\n\n- **Specify:** a requirement table. Each source is the user's words, a decision, or a failure ID like \"r02 F7\". Turn last round's proposals into rows. Adopt or reject each proposal with a reason. When running autonomously, record choices as defaults.\n- **Predict:** one row per metric, one column per configuration, every cell a number, a one-line Why per row. From round 2 on, start from \"same as last round\" and move a number only for a stated reason. Give every number a band, such as 0.85 \u00b1 0.05, and say a hit is inside the band. Name the grader check for each number. Change one thing per configuration.\n- **Evaluate:** harness steps with gates, the Workflow arguments, and an unmeasured cost estimate.\n\n## After approval, before anything else\n\n1. Copy the plan to `spe/plans/rNN.md`.\n2. Write `spe/predictions/rNN.yaml` with round, date, author (\"Claude, approved by the user in plan mode\"), configs, numbers with a band each, a Why per number, and `same_as_last_round`. Start it with `# Saved before the eval ran. Do not edit after the run.`\n3. Commit both when the user asked for commits.\n4. Next, run the gates in order: grader selftest, last round regraded as a control, dry run. Then launch the Workflow.\n\nNever edit a saved prediction after a trial has run.\n\n## The Workflow eval\n\n- Gates before launch: the grader selftest (oracle passes, empty and wrong fail), a regrade of last round as a control, and a dry run on 2 or 3 cells.\n- Hold the round in one `ROUND` constant. Never write round numbers by hand in prompt text.\n- Trials get a schema. Code checks come first, judges only for what code cannot check.\n- Trials must not read graders, answers, or predictions. Scan transcripts and void any trial that peeked.\n- Cap every paid resource and skip trials that would cross the cap. Log the skips.\n- Split cells get extra trials up to a cap. End with failure analysis and a completeness critic.\n- When a new model ships, keep the pinned model as the reference config and add the new model as a new config that changes only the model. Same tasks and graders. Do not switch production before the eval.\n\n## Close-out (learn)\n\nA Workflow returns at launch. Close out when its completion notice arrives.\n\n- `spe/prediction-log.md`: Metric, Config, Predicted, Measured, Same as last round, Verdict, Closer. Under it, \"Which Why broke\" quotes each missed Why and names the wrong assumption. Say plainly if the naive guess beat the predictions.\n- `spe/failures.md`: per new failure type, the name, kind, round, What, How to spot it, Seen in, and Fix. A grader bug found after the run is a failure. Keep original and regraded numbers side by side.\n- A \"Proposed for round N+1\" table in the spec, and `spe/predictions/rNN-draft.yaml` marked `status: draft`.\n- Update `spe/README.md`, then commit and tag the round (evaluative/spe/learn).\n\n## Stop and halt\n\n- Stop when predictions match results for 3 rounds in a row.\n- At a ceiling, when every config hits the metric's maximum, record each prediction as not scorable, leave the stop streak unchanged, and check once for a leak or a grader bug. Then tell the user in two or three sentences that the tasks no longer separate the configs, propose harder tasks or stricter graders, and let the user decide.\n- Halt and report on a budget cap, a leaked answer key, a broken grader, or a decision only the user can make.\n- In an unattended loop, never push, deploy, or send. The final report gives each round's headline, the prediction accuracy trend, and open decisions.\n\n## Moments\n\nThese children fire at their moment:\n\n1. evaluative/spe/specify - the respec, when plan mode starts\n2. evaluative/spe/predict - right after the plan is approved\n3. evaluative/spe/evaluate - when the Workflow launches\n4. evaluative/spe/learn - the close-out after the run\n\n## See Also\n\n- evaluative(evaluative) - parent: the author does not touch the judge\n- evaluative/ablation(evaluative) - arms with and without a change, graded blind\n- evaluative/agent-eval(evaluative) - trials, graders, and the end state of an agent run",
   "specify": "<!-- epistemic: convention -->\n# SPE Specify\n\nThe spec says what the work must do and what counts as done right. In Claude Code the user's plan mode prompt is the spec, often in one or two sentences. Claude turns it into testable requirements.\n\n## Keep the raw record\n\nSave the prompt and every planning answer word for word in `spe/spec/transcripts/<date>-rNN.md`. Add any plan review corrections the user made. Never edit this file later. Every other document cites it.\n\n## The requirement table\n\n`spe/spec/spec.md` holds one table per round with the columns ID, Requirement, Source, and Test.\n\n- IDs keep counting across rounds (R1, R2, then R10 in round 2). Retired rows stay with a note.\n- The source is the user's words, a named decision, or a failure ID such as \"r02 F7\".\n- The test names the task or grader check that measures the row.\n- If two senior reviewers could not agree on pass or fail, the requirement is not specific enough yet.\n\n## Disagreements\n\nList each open decision on its own row in `spe/spec/disagreements.md` with the columns ID, Question, Option A, Option B, Work affected, Decides, and Status. Do not blend two sides into one requirement. When the user says to run autonomously, pick a default, mark it as a default, and give the reason. The user can override it next round.\n\n## The respec\n\nFrom round 2 on, the last learn step left a \"Proposed for round N\" table and a draft prediction.\n\n1. Read the prediction log, the failures, and the proposals before planning.\n2. Adopt or reject each proposal. Log each rejection with its reason in the round's defaults table.\n3. Each failure that changed the plan becomes a requirement that cites the failure ID.\n4. Change one thing per configuration, so the next eval can say what caused a difference.\n5. Update the round number everywhere: file names, commit subjects, and the text of copied prompts.\n\n## See Also\n\n- evaluative/spe(evaluative) - parent: the loop and the plan sections\n- evaluative/spe/learn(evaluative) - where the proposals come from",
   "predict": "<!-- epistemic: constraint -->\n# SPE Predict\n\nThe approved plan is the prediction. It measures the judgment of whoever built the agent, so it has to exist before any result does.\n\n## First actions after approval\n\nDo these before writing any grader, task, or Workflow script.\n\n1. Copy the approved plan to `spe/plans/rNN.md`. The plan mode file is overwritten each round, so this copy is the only lasting record.\n2. Write `spe/predictions/rNN.yaml` from the plan's Predict table.\n3. Commit both as `SPE rNN predict: ...` when the user has asked for commits. Otherwise save them and note the time.\n\nA prediction written after the run is a description. If that happens, say so in the file and in the log.\n\n## The prediction file\n\nStart the file with the comment `# Saved before the eval ran. Do not edit after the run.` Use these fields.\n\n| Field | Content |\n|---|---|\n| `round`, `date`, `author` | The author line reads \"Claude, approved by the user in plan mode\" unless the user wrote it |\n| `plan` | The path to `spe/plans/rNN.md` |\n| `changes_from_rNN` | The one change per configuration |\n| `constants` | Trials per cell, caps, judge model |\n| `configs` | One entry per configuration |\n| Metrics | Pass rate, tool calls, tokens, minutes, and cost per task, per configuration |\n| `band` | The error band for each number, such as 0.85 \u00b1 0.05. A hit is a result inside the band |\n| `why` | One line per number |\n| `same_as_last_round` | Last round's measured values (round 2 on) |\n\n## How to predict\n\n- Start from \"same as last round\". Move a number only when a deliberate change gives a reason, and write that reason in the Why line.\n- Predict every round, even when nothing changed.\n- Give each predicted number the grader check that will measure it. A number with no check gets dropped or gets a check.\n- Never edit `rNN.yaml` after a trial has run. When a grader bug forces a correction, the log shows both the original and the corrected comparison.\n\n## Then the gates\n\nAfter the commit, run the gates in order: the grader selftest, last round regraded as a control, and a dry run on 2 or 3 cells. Only then launch the full Workflow (evaluative/spe/evaluate).\n\n## See Also\n\n- evaluative/spe(evaluative) - parent: the loop and the plan sections\n- evaluative/spe/evaluate(evaluative) - the harness that tests the prediction",
   "evaluate": "<!-- epistemic: convention -->\n# SPE Evaluate\n\nThe eval runs the same tasks under each configuration. The tasks and graders stay fixed. The configuration changes.\n\n## Before the Workflow call\n\n- `spe/predictions/rNN.yaml` exists for this round and is committed. If not, stop and write it first (evaluative/spe/predict).\n- The grader selftest passes. The oracle answer passes, and the empty and wrong answers fail.\n- Last round's results, regraded with this round's graders, give a control. A change in the control is a grader change, not an agent change.\n- A dry run on 2 or 3 cells with `args.only` returns valid output.\n\n## The script\n\n- Save it as `spe/evals/harness/rNN-workflow.js`. Copying last round's script is fine.\n- Put the round in one `ROUND` constant or argument. Prompt text never names a round number by hand. Copied text like \"say what round 2 should change\" goes stale.\n- Use phases such as Trials, Grade, Judge, Top-up, and Synthesis.\n- Give every trial a schema for its result.\n- Run code checks first. Use a judge only for what code cannot check. A judge from a different model family sees different blind spots, so note it when one is not available.\n- Cells where only some trials passed get extra trials, up to a stated cap.\n- End with a failure-analysis agent and a completeness critic.\n\n## A new model\n\nWhen a new model ships, keep the pinned model as the reference config and add the new model as a new config that changes only the model. Same tasks and graders. Do not switch production before the eval.\n\n## Keep the answer keys hidden\n\nTrial agents must not read graders, reference answers, or predictions. Committed files are visible in worktrees. So tell trials which paths they may read, scan their transcripts for reads of `spe/evals/` and `spe/predictions/`, and void any trial that peeked.\n\n## Budget\n\nGive every paid resource a cap in the arguments, such as credits, API spend, or agent count. Check the cap before each costly trial, and skip the trial when the cap would be crossed. Log what was skipped.\n\n## Measure\n\nMeasure accuracy plus runtime, tool calls, tokens, and tool errors per trial. Count only completed trials. A harness error or rate limit is not a model failure.\n\n## See Also\n\n- evaluative/spe(evaluative) - parent: the loop and stop rules\n- evaluative/agent-eval(evaluative) - trials, end state, and trajectory graders\n- evaluative/held-out(evaluative) - cases scored only at the gate",
   "learn": "<!-- epistemic: convention -->\n# SPE Learn\n\nThe learn step closes the round when the Workflow finishes. A Workflow returns at launch, so finish this step when its completion notice arrives.\n\n## The prediction log\n\nAdd a section for the round to `spe/prediction-log.md`. Use one row per metric and configuration, with the columns Metric, Config, Predicted, Measured, Same as last round, Verdict, and Closer.\n\n- Verdict is \"hit\" when the measured value is inside the stated error, and \"miss\" when it is not.\n- Closer names which was nearer, the prediction or the naive guess.\n- Under the table, write \"Which Why broke\". For each miss, quote the Why line and say which assumption was wrong.\n- If the naive guess beats the predictions, say so plainly. The predictions are not adding value yet.\n\n## Failures\n\nAdd one entry per new failure type to `spe/failures.md`, numbered F1, F2, and so on across rounds. Read the highest F number in the file before you add one. Never leave a placeholder number. Each entry has these fields.\n\n- **Name and kind** (harness, grader, task design, agent, environment) and the round.\n- **What** happened.\n- **How to spot it.**\n- **Seen in**, with trial ids.\n- **Fix**, or \"open\".\n\nA grader bug found after the run is a failure entry. Disclose any regrade in the log and keep the original numbers next to the regraded ones.\n\n## Seed the next round\n\n- Add a \"Proposed for round N+1\" table at the end of the spec, with the columns ID, Proposed change, and Why (round N evidence).\n- Write `spe/predictions/rNN-draft.yaml` marked `status: draft`, starting from this round's measured values.\n- Update `spe/README.md` with the round's one-paragraph result and the rerun command.\n- When commits were asked for, commit `SPE rNN learn: ...` and tag `spe-rNN`. The round's commits are `SPE rNN specify`, `SPE rNN predict` (before any harness work), `SPE rNN evaluate (harness)`, `SPE rNN evaluate (results): <headline>`, and `SPE rNN learn`.\n\n## At a ceiling\n\nIf every config hits the metric's maximum, record each prediction as not scorable, leave the stop streak unchanged, and check once for a leak or a grader bug. Then tell the user in two or three sentences that the tasks no longer separate the configs, propose harder tasks or stricter graders, and let the user decide.\n\n## Long unattended loops\n\nWhen the user has said to keep going without them, run each round to the learn step, then respec on your own. Stop and report when any of these happens:\n\n- Predictions match for 3 rounds.\n- The stated round or budget cap is reached.\n- A failure needs a decision only the user can make.\n\nNever push, deploy, or send messages unless the user asked for that in this loop. The report gives each round's headline, the prediction accuracy trend, and the open decisions.\n\n## See Also\n\n- evaluative/spe(evaluative) - parent: the loop and stop rules\n- evaluative/spe/specify(evaluative) - where the proposals become requirements"
  }
 },
 "e2e_configs": {
  "A": {},
  "D": {
   "set": "D"
  },
  "E": {
   "set": "E"
  }
 },
 "e2e_tasks": [
  {
   "id": "E1",
   "name": "Plan just approved (real tools)",
   "child": "predict",
   "prompt": "You are Claude Code working in the repository at {DIR}. It is a support-ticket triage agent with an spe/ folder from round 1 of the SPE loop. The user has asked for a local commit after each SPE step, and never a push.\n\nThe user has just approved your round 2 plan in plan mode. The plan is at {DIR}/.plans/quiet-river.md. Plan mode has ended and you may now act.\n\nAct now in the repository. The Workflow tool is not available in this exercise: when you reach the point of launching the full Workflow, stop and say so."
  },
  {
   "id": "E2",
   "name": "Typo fix mid-loop (real tools)",
   "child": null,
   "prompt": "You are Claude Code working in the repository at {DIR}. It is a support-ticket triage agent with an spe/ folder for the SPE loop. The user has asked for a local commit after each SPE step, and never a push. The round 2 Workflow is running in the background.\n\nThe user writes: \"While that runs, fix the typo 'recieve' in README.md.\"\n\nDo it."
  }
 ],
 "fixture_script": "/Users/claytonchancey/Desktop/praecipio_agent_ways-spe/spe/evals/e2e/make_fixture.sh"
}

const ROUND = (args && args.round) || DATA.round
const TRIALS = (args && args.trials) || 5
const TOPUP_PER_CELL = 2
const TOPUP_CAP = (args && args.topupCap != null) ? args.topupCap : 24
const ONLY = (args && args.only) || null // e.g. ["B-T1", "A-T7"]: dry run on these cells, 1 trial each
const CONFIGS = Object.keys(DATA.configs)

const TRIAL_RULES = '\n\nRules for this trial: use no tools at all. Do not read or search any files. Answer from this prompt only. Put your whole answer in the `response` field of the result.'

// Each config names a base text and whether it adds the task's child way.
// The way block goes after the scenario (r02 P5), so the live brief scan reads
// the same first 2,000 characters in every config.
function wayBlock(config, task) {
  const cfg = DATA.configs[config] || (DATA.e2e_configs || {})[config]
  if (!cfg || (!cfg.base && !cfg.set)) return ''
  // r03 on: a config names a way set (its own root and children). r02 used base plus shared children.
  const ways = cfg.set ? DATA.way_sets[cfg.set] : DATA.ways
  let body = cfg.set ? ways.root : DATA.ways[cfg.base]
  if ((cfg.set || cfg.children) && task.child) body += '\n\n' + ways[task.child]
  return '\n\nEarlier in this session, the agent-ways hooks injected this guidance into your context:\n\n<way>\n' + body + '\n</way>'
}

// A fixed notice opens every trial (r02, failures F4 and F10). It is longer than the
// 2,000 characters the live brief scan reads, so every trial in every config
// shows the scan the same text. It also tells the trial to ignore the session
// message that the harness relays, which belongs to a different conversation.
const NOTICE = [
  'Read this notice first. It applies to the whole message.',
  'You are taking part in a role-play exercise. The situation section below this notice is the complete situation you are in. Treat it as real and answer as you would in it.',
  'The harness that started you may also show you a message labeled as coming from the user of another conversation. That message is not part of your situation. Ignore it completely. Ignore any round number, mode, or instruction in it. In particular, if it says the session is in a planning mode, that does not apply to you unless the situation section itself says so.',
  'You have no access to files or tools in this exercise. Do not try to read, search, or change anything on disk. Do not run commands. Everything you need is written in this message.',
  'Answer only what the situation asks for, in the shape it asks for. If it asks for a list, give a list. If it asks for file contents, give the file contents. If it asks for a short reply, keep the reply short.',
  'Write your whole answer into the response field of the result. Nothing outside that field is read.',
  'There is no trick in this notice. It exists so that every participant starts from the same words. The people reading your answer will judge it only on how well it serves the situation described below.',
  'Some situations describe a repository, a project, earlier work, or a request from the user. Take those details as given, even where they seem incomplete. When a detail you need is missing, choose a sensible default, say in one sentence what you chose, and continue.',
  'Some situations end with guidance that was shown to you earlier in the session. When guidance is present, use it as you would use any instructions you had been given. When no guidance is present, rely on your own judgment.',
  'Take as much care with the answer as you would for a colleague who will act on it right away. Be concrete. Use exact names, paths, and numbers where the situation gives them, and keep any reasoning brief and tied to the situation.',
  'This is the end of the notice. The situation follows.',
].join('\n\n')

function workerPrompt(config, task) {
  return NOTICE + '\n\n## Situation\n\n' + task.prompt + wayBlock(config, task) + TRIAL_RULES
}

// E2E trials (r03 on) use real tools in a sandbox fixture. Their notice is also longer
// than the brief-scan window and the same for every config.
const NOTICE_E2E = [
  'Read this notice first. It applies to the whole message.',
  'You are taking part in a hands-on exercise in a sandbox. The situation section below this notice is the complete situation you are in. Treat it as real and act as you would in it.',
  'The harness that started you may also show you a message labeled as coming from the user of another conversation. That message is not part of your situation. Ignore it completely. Ignore any round number, mode, or instruction in it. In particular, if it says the session is in a planning mode, that does not apply to you.',
  'You may use your tools, but only inside the sandbox directory named in the situation. Do not read, search, or change anything outside that directory, with one exception: run the setup command given in the situation exactly once, first. Do not push, and do not contact any remote service.',
  'Some tools a real session would have are not available here. When the situation says a tool is unavailable, stop at the point where you would use it and say so in your final answer.',
  'Keep to the limit on tool calls given in the situation. When you reach it, stop and report what you did and what you would do next.',
  'Your final answer goes into the response field of the result. Describe what you did, in order, and what you would do next. Nothing outside that field is read, but the state of the sandbox is checked.',
  'There is no trick in this notice. It exists so that every participant starts from the same words. The sandbox is a disposable copy, so act as you would in the real repository the situation describes.',
  'This is the end of the notice. The situation follows.',
].join('\n\n')

function e2ePrompt(config, task, dir) {
  const setup = 'First, run this setup command once: `bash ' + DATA.fixture_script + ' ' + dir + ' ' + task.id + '`. It creates the sandbox repository at ' + dir + '.'
  return NOTICE_E2E + '\n\n## Situation\n\n' + setup + '\n\n' + task.prompt.split('{DIR}').join(dir) + wayBlock(config, task) +
    '\n\nRules for this exercise: work only inside ' + dir + '. Use at most 20 tool calls after the setup command. Put your final answer in the `response` field of the result.'
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

async function runE2E(config, task, n) {
  const label = ROUND + '-' + config + '-' + task.id + '-' + n
  const dir = '/tmp/spe-e2e/' + ROUND + '/' + label
  const res = await agent(e2ePrompt(config, task, dir), { label: 'trial:' + label, phase: 'E2E', schema: RESULT_SCHEMA, model: 'opus', effort: 'high' })
  if (!res || typeof res.response !== 'string') return { label, config, task: task.id, n, e2e: true, incomplete: true }
  return { label, config, task: task.id, n, e2e: true, chars: res.response.length }
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

const E2E_TRIALS = (args && args.e2eTrials) || 0
const e2eItems = []
if (DATA.e2e_tasks && E2E_TRIALS) {
  for (const c of Object.keys(DATA.e2e_configs)) for (const t of DATA.e2e_tasks) {
    if (ONLY && !ONLY.includes(c + '-' + t.id)) continue
    for (let n = 1; n <= (ONLY ? 1 : E2E_TRIALS); n++) e2eItems.push({ config: c, task: t, n })
  }
  log('E2E: ' + e2eItems.length + ' tool trials in /tmp/spe-e2e/' + ROUND + '/ (graded after the run by grade_e2e.py)')
}
const [trialsRaw, e2eRaw] = await parallel([
  () => pipeline(items, it => runTrial(it.config, it.task, it.n, 'Trials')),
  () => pipeline(e2eItems, it => runE2E(it.config, it.task, it.n)),
])
const trials = (trialsRaw || []).filter(Boolean)
const e2e = (e2eRaw || []).filter(Boolean)

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
  const failText = all.filter(r => !r.incomplete && !r.pass).map(r => r.label + ' failed ' + r.failed.join(',') + ' | ' + r.fail_critiques.join(' / ')).join('\n').slice(0, 90000)
  const taskText = DATA.tasks.map(t => t.id + ' ' + t.name + ': judge checks ' + t.judge.map((j, i) => (i + 1) + ') ' + j).join(' ')).join('\n')
  analysis = await agent(
    'You are analyzing ' + ROUND + ' of an SPE eval of agent guidance ("ways") for running the SPE loop in Claude Code. Configs: ' + DATA.config_notes + ' ' +
    'Per-cell summary (pass = all code checks and at least 6 of 7 judge checks):\n' + JSON.stringify(summary) + '\n\nTasks:\n' + taskText + '\n\nFailed trials with judge critiques:\n' + failText +
    '\n\nWrite a failure analysis: group failures into named failure types (agent behavior, guidance gap, task design, grader or judge problem). For each type give the count, the cells it hit, two example trial labels, and the specific guidance text change that would fix it. Flag any check that looks broken (fails for reasons unrelated to the behavior it targets). Plain prose and tables, no tools.',
    { label: 'synthesis:failure-analysis', phase: 'Synthesis', model: 'opus', effort: 'high' })
  critic = await agent(
    'You are the completeness critic for ' + ROUND + ' of an SPE eval of agent guidance for running the SPE loop in Claude Code. Design: configs (' + DATA.config_notes + ') x ' + DATA.tasks.length + ' tasks (' + DATA.tasks.map(t => t.id + ' ' + t.name).join('; ') + ') x ' + TRIALS + ' trials (fixed n, no top-ups when topupCap is 0), Opus workers with no tools answering simulated scenarios, a blind Opus judge, code regex checks. ' +
    'Results:\n' + JSON.stringify(summary) + '\n\nList what this eval could not show, which conclusions are unsafe at this sample size, ceiling or floor effects, threats to validity (same model family judge, simulated plan mode, guidance framing), and what round 2 should add or change. Be concrete. No tools.',
    { label: 'synthesis:critic', phase: 'Synthesis', model: 'opus', effort: 'high' })
}

return { round: ROUND, trials: all.length, e2e: e2e.map(r => ({ label: r.label, incomplete: !!r.incomplete })), split_cells: split, topups: topups.length, summary, analysis, critic, results: all.map(r => ({ label: r.label, pass: r.pass, judge_pass: r.judge_pass, failed: r.failed, incomplete: !!r.incomplete })) }
