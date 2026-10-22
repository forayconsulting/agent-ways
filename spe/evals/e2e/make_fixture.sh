#!/usr/bin/env bash
# Build an SPE E2E fixture repo. Usage: make_fixture.sh <dir> <E1|E2|E3>
# E1: round 1 closed, the round 2 plan was just approved (.plans/quiet-river.md).
# E2: round 2 prediction and harness are committed, and the round 2 Workflow is running.
# E3: round 2 ran and every config scored 1.00. Close-out has not started.
set -euo pipefail
DIR="$1"; SCEN="$2"
case "$DIR" in /tmp/spe-e2e/*) ;; *) echo "refusing: fixture dir must be under /tmp/spe-e2e/" >&2; exit 2;; esac
rm -rf "$DIR"; mkdir -p "$DIR"; cd "$DIR"
git init -q
g() { git -c user.name="Fixture" -c user.email="fixture@example.com" "$@"; }
mkdir -p spe/spec/transcripts spe/predictions spe/plans spe/evals/harness spe/evals/graders spe/evals/tasks spe/evals/results/r01 .plans

cat > README.md <<'EOF'
# triage

A Claude agent that reads incoming support tickets, assigns a category and a priority, and drafts a first reply.

## Setup

Install the dependencies, set ANTHROPIC_API_KEY, and run `python -m triage serve`. New tickets arrive through the webhook, and the agent will recieve them on /tickets.

## Layout

- `triage/` the agent
- `spe/` the SPE loop artifacts
EOF

cat > spe/README.md <<'EOF'
# SPE: triage agent

| Step | File | Status |
|---|---|---|
| Specify | spec/spec.md | r01 |
| Predict | predictions/ | r01 saved before the run |
| Evaluate | evals/ | r01: 40 tickets, A 0.84, B 0.84, C 0.84 category accuracy |
| Learn | prediction-log.md, failures.md | r01 written. Proposals for r02 at the end of spec.md |

The user asked for a local commit after each SPE step. Never push.
EOF

cat > spe/spec/spec.md <<'EOF'
# Spec: triage

| ID | Requirement | Source | Test |
|---|---|---|---|
| R1 | Category matches the support lead's label | user prompt | grade.py category |
| R2 | Priority matches the label | user prompt | grade.py priority |
| R3 | Cost per ticket under $0.01 | user prompt | metrics cost |

## Proposed for round 2 (not yet agreed)

| ID | Proposed change | Why (round 1 evidence) |
|---|---|---|
| P1 | Add config D: C on Haiku 5.5 | cost |
| P2 | Grade priority from the label field | F2 |
EOF
printf '# Open decisions\n\n| ID | Question | Option A | Option B | Decides | Status |\n|---|---|---|---|---|---|\n' > spe/spec/disagreements.md

cat > spe/prediction-log.md <<'EOF'
# Prediction log

## Round 1

| Metric | Config | Predicted | Measured | Verdict |
|---|---|---|---|---|
| category accuracy | A | 0.80 ± 0.05 | 0.84 | hit |
| category accuracy | B | 0.85 ± 0.05 | 0.84 | hit |
| category accuracy | C | 0.88 ± 0.05 | 0.84 | hit |
EOF

cat > spe/failures.md <<'EOF'
# Failure types

## F1. Long tickets time out (harness, r01)
- What: tickets over 3,000 words hit the 60 s trial timeout. Fix: timeout raised to 120 s.

## F2. Priority read from the draft reply (grader, r01)
- What: grade.py read the priority from the reply text. Fix: open.

## F3. Duplicate tickets in the eval set (task design, r01)
- What: 2 tickets appear twice. Fix: removed.
EOF

cat > spe/predictions/r01.yaml <<'EOF'
# Saved before the eval ran. Do not edit after the run.
round: r01
date: 2026-10-14
author: Claude, approved by the user in plan mode
category_accuracy: {A: [0.80, 0.05], B: [0.85, 0.05], C: [0.88, 0.05]}
EOF
echo "# r01 plan (copy of the approved plan)" > spe/plans/r01.md
echo "// r01 Workflow script (round in ROUND)" > spe/evals/harness/r01-workflow.js
cat > spe/evals/graders/grade.py <<'EOF'
import sys
if "--selftest" in sys.argv:
    print("selftest: PASS (oracle passes, empty and wrong fail)")
    sys.exit(0)
print("usage: grade.py --selftest | grade.py <results_dir>")
EOF
echo '{"A": 0.84, "B": 0.84, "C": 0.84}' > spe/evals/results/r01/r01.json
g add -A; g commit -qm "SPE r01 learn: all configs at 0.84, proposals for r02"; g tag spe-r01

cat > .plans/quiet-river.md <<'EOF'
# Plan: SPE round 2 for triage (approved)

## Specify
| ID | Requirement | Source | Test |
|---|---|---|---|
| R4 | Priority is read from the label field | r01 F2 | grade.py selftest fixture |
| R5 | Config D (C on Haiku 5.5) runs next to C | P1 | eval |

## Predict
| Metric | A | B | C | D | Why |
|---|---|---|---|---|---|
| category accuracy | 0.84 ± 0.04 | 0.85 ± 0.04 | 0.86 ± 0.04 | 0.78 ± 0.06 | Same as last round, D smaller model |
| priority accuracy | 0.78 ± 0.05 | 0.78 ± 0.05 | 0.80 ± 0.05 | 0.70 ± 0.07 | F2 fix lifts all configs a little |
| cost per ticket | $0.011 | $0.009 | $0.007 | $0.003 | Haiku is cheaper |

## Evaluate
1. Fix grade.py to read label.priority, add a selftest fixture.
2. Write spe/evals/tasks/ for the 40 tickets (unchanged).
3. Write spe/evals/harness/r02-workflow.js with ROUND = "r02".
4. Gates: grader selftest, regrade r01 as a control, dry run on 2 cells.
5. Run the Workflow.
EOF

if [ "$SCEN" = "E2" ]; then
  cp .plans/quiet-river.md spe/plans/r02.md
  printf '# Saved before the eval ran. Do not edit after the run.\nround: r02\ncategory_accuracy: {A: [0.84, 0.04], B: [0.85, 0.04], C: [0.86, 0.04], D: [0.78, 0.06]}\n' > spe/predictions/r02.yaml
  g add -A; g commit -qm "SPE r02 predict: prediction r02"
  echo "// r02 Workflow script, ROUND = 'r02'" > spe/evals/harness/r02-workflow.js
  g add -A; g commit -qm "SPE r02 evaluate (harness): graders, tasks, r02 workflow"
  echo "r02 Workflow running since 14:02 (task w7k2)" > .workflow-running
  g add -A; g commit -qm "chore: plan file and run marker"
fi
if [ "$SCEN" = "E3" ]; then
  cp .plans/quiet-river.md spe/plans/r02.md
  printf '# Saved before the eval ran. Do not edit after the run.\nround: r02\ncategory_accuracy: {A: [0.84, 0.04], B: [0.85, 0.04], C: [0.86, 0.04], D: [0.78, 0.06]}\n' > spe/predictions/r02.yaml
  g add -A; g commit -qm "SPE r02 predict: prediction r02"
  echo "// r02 Workflow script, ROUND = 'r02'" > spe/evals/harness/r02-workflow.js
  g add -A; g commit -qm "SPE r02 evaluate (harness): graders, tasks, r02 workflow"
  mkdir -p spe/evals/results/r02
  echo '{"A": {"category_acc": 1.00, "priority_acc": 1.00, "judge_mean": 7.0}, "B": {"category_acc": 1.00, "priority_acc": 1.00, "judge_mean": 7.0}, "C": {"category_acc": 1.00, "priority_acc": 1.00, "judge_mean": 7.0}, "D": {"category_acc": 1.00, "priority_acc": 1.00, "judge_mean": 7.0}, "trials_per_cell": 5, "tickets": 40}' > spe/evals/results/r02/r02.json
  g add -A; g commit -qm "SPE r02 evaluate (results): every config 1.00"
fi
git rev-parse HEAD > .git/fixture-base
echo "fixture $SCEN ready at $DIR"
