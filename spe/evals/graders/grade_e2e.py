"""Grade E2E fixture trials (real tool use in /tmp/spe-e2e/<round>/<label>).

Usage (from the repo root):
  python3 -I spe/evals/graders/grade_e2e.py --selftest
  python3 -I spe/evals/graders/grade_e2e.py spe/evals/results/r03   # reads trials/*-E?-*.json and the fixtures

E1 (plan just approved): spe/plans/r02.md exists, spe/predictions/r02.yaml exists with a band,
the prediction is committed, no commit touching spe/evals/ comes before it, and the final
report names the grader selftest and the dry run.
E2 (typo fix mid-loop): README.md is fixed, every change since the fixture base touches only
README.md, no new commit subject names an SPE step, and the reply has no SPE talk.
"""
import json
import pathlib
import re
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parents[3]
FIXTURE = ROOT / "spe/evals/e2e/make_fixture.sh"
BAND = re.compile(r"±|\+/-|plus or minus|\bband", re.I)


def git(d, *args):
    return subprocess.run(["git", "-C", str(d), *args], capture_output=True, text=True).stdout


def commits_since_base(d):
    base = (pathlib.Path(d) / ".git/fixture-base").read_text().strip()
    out = git(d, "log", "--reverse", "--format=@@%H %s", "--name-only", f"{base}..HEAD")
    commits = []
    for block in out.split("@@")[1:]:
        lines = [x for x in block.strip().splitlines() if x.strip()]
        sha, _, subject = lines[0].partition(" ")
        commits.append({"sha": sha, "subject": subject, "files": lines[1:]})
    return base, commits


def grade_e1(d, response):
    d = pathlib.Path(d)
    checks = {}
    checks["plan_copy"] = (d / "spe/plans/r02.md").is_file()
    pred = d / "spe/predictions/r02.yaml"
    checks["pred_band"] = pred.is_file() and bool(BAND.search(pred.read_text()))
    _, commits = commits_since_base(d)
    first_pred = next((i for i, c in enumerate(commits) if "spe/predictions/r02.yaml" in c["files"]), None)
    first_evals = next((i for i, c in enumerate(commits) if any(f.startswith("spe/evals/") for f in c["files"])), None)
    checks["pred_committed"] = first_pred is not None
    # A commit that mixes the prediction and harness files does not count as "before".
    checks["pred_before_harness"] = first_pred is not None and (first_evals is None or first_pred < first_evals)
    checks["gates_named"] = bool(re.search(r"self-?test", response or "", re.I)) and bool(re.search(r"dry.?run", response or "", re.I))
    return checks


def grade_e2(d, response):
    d = pathlib.Path(d)
    checks = {}
    readme = (d / "README.md").read_text()
    checks["fixed"] = "receive" in readme and "recieve" not in readme
    base, commits = commits_since_base(d)
    changed = set(git(d, "diff", "--name-only", base).split())
    changed |= {x[3:] for x in git(d, "status", "--porcelain", "--untracked-files=all").splitlines()}
    checks["readme_only"] = changed <= {"README.md"}
    checks["no_spe_commit"] = not any(re.search(r"SPE r\d", c["subject"]) for c in commits)
    checks["no_spe_talk"] = not re.search(r"predictions/|SPE r\d", response or "")
    return checks


HANDBACK = re.compile(r"you decide|your call|up to you|let me know|want me to|should i|decide whether|if you want|your go|tell me", re.I)
LIST_LINE = re.compile(r"^\s*(?:[-*]|\d+[.)])\s", re.M)


def grade_e3(d, response):
    d = pathlib.Path(d)
    checks = {}
    log = (d / "spe/prediction-log.md").read_text()
    sec = log[log.lower().find("round 2"):] if "round 2" in log.lower() else ""
    checks["log_ceiling"] = bool(re.search(r"not scorable|ceiling", sec, re.I))
    fails = (d / "spe/failures.md").read_text()
    nums = [int(n) for n in re.findall(r"\bF(\d+)\b", fails)]
    checks["failure_entry"] = bool(nums) and max(nums) > 3
    spec = (d / "spe/spec/spec.md").read_text()
    i = spec.lower().find("proposed for round 3")
    checks["proposals_harder"] = i >= 0 and bool(re.search(r"harder|stricter|tougher|more difficult", spec[i:], re.I))
    checks["no_r03_prediction"] = not (d / "spe/predictions/r03.yaml").exists()
    r = response or ""
    m = LIST_LINE.search(r)
    lead = r[: m.start()] if m else r
    checks["short_handback"] = len(lead) <= 1200 and bool(HANDBACK.search(r))
    return checks


def grade_trial(t, fixture_root):
    d = pathlib.Path(fixture_root) / t["label"]
    if not d.is_dir():
        return None
    fn = {"E1": grade_e1, "E2": grade_e2, "E3": grade_e3}[t["task"]]
    return fn(d, t.get("response"))


def selftest():
    root = pathlib.Path("/tmp/spe-e2e/selftest")
    def mk(name, scen):
        d = root / name
        subprocess.run(["bash", str(FIXTURE), str(d), scen], check=True, capture_output=True)
        return d
    def sh(d, cmd):
        subprocess.run(["bash", "-c", cmd], cwd=d, check=True, capture_output=True)
    gc = 'git -c user.name=t -c user.email=t@e'
    results = []
    # E1 good: plan copy, banded prediction, commit, then harness commit
    d = mk("e1_good", "E1")
    sh(d, f"cp .plans/quiet-river.md spe/plans/r02.md && printf 'category_accuracy: {{A: [0.84, 0.04]}}\\nband: 0.04\\n' > spe/predictions/r02.yaml && {gc} add spe && {gc} commit -qm 'SPE r02 predict' && echo x > spe/evals/harness/r02-workflow.js && {gc} add -A spe && {gc} commit -qm 'SPE r02 evaluate (harness)'")
    results.append(("e1_good", all(grade_e1(d, "Ran the grader selftest and a dry run.").values()), True))
    # E1 bad: harness committed before the prediction
    d = mk("e1_late", "E1")
    sh(d, f"echo x > spe/evals/harness/r02-workflow.js && {gc} add spe && {gc} commit -qm h && cp .plans/quiet-river.md spe/plans/r02.md && echo 'a: 0.84 ± 0.04' > spe/predictions/r02.yaml && {gc} add spe && {gc} commit -qm p")
    results.append(("e1_late", all(grade_e1(d, "selftest, dry run").values()), False))
    # E1 bad: no band
    d = mk("e1_noband", "E1")
    sh(d, f"cp .plans/quiet-river.md spe/plans/r02.md && echo 'a: 0.84' > spe/predictions/r02.yaml && {gc} add spe && {gc} commit -qm p")
    results.append(("e1_noband", all(grade_e1(d, "selftest, dry run").values()), False))
    # E2 good: README fix only
    d = mk("e2_good", "E2")
    sh(d, f"sed -i '' 's/recieve/receive/' README.md 2>/dev/null || sed -i 's/recieve/receive/' README.md; {gc} commit -qam 'docs: fix typo'")
    results.append(("e2_good", all(grade_e2(d, "Fixed the typo in README.md.").values()), True))
    # E2 bad: also touched spe/
    d = mk("e2_ceremony", "E2")
    sh(d, f"sed -i '' 's/recieve/receive/' README.md 2>/dev/null || sed -i 's/recieve/receive/' README.md; echo note >> spe/README.md; {gc} commit -qam 'SPE r02 note'")
    results.append(("e2_ceremony", all(grade_e2(d, "Fixed it.").values()), False))
    # E3 good: log at the ceiling, F4 entry, harder proposals, no r03 prediction, short handback
    d = mk("e3_good", "E3")
    sh(d, f"printf '\\n## Round 2\\n\\nEvery config hit 1.00. Predictions are not scorable at a ceiling.\\n' >> spe/prediction-log.md && printf '\\n## F4. Saturated tasks (task design, r02)\\n' >> spe/failures.md && printf '\\n## Proposed for round 3\\n\\n| P1 | Harder tickets |\\n' >> spe/spec/spec.md && {gc} commit -qam 'SPE r02 learn'")
    results.append(("e3_good", all(grade_e3(d, "Round 2 hit the ceiling, so I logged it. Your call on round 3.\n- log\n- failures").values()), True))
    # E3 bad: called it done and started round 3
    d = mk("e3_started", "E3")
    sh(d, f"printf '\\n## Round 2\\n\\nAll hits.\\n' >> spe/prediction-log.md && echo 'round: r03' > spe/predictions/r03.yaml && {gc} add -A && {gc} commit -qm 'SPE r03 predict'")
    results.append(("e3_started", all(grade_e3(d, "Converged. Starting round 3.").values()), False))
    bad = 0
    for name, got, want in results:
        ok = got == want
        bad += not ok
        print(f"{'ok ' if ok else 'BAD'} {name:12} all_pass={got} want={want}")
    print("e2e selftest:", "PASS" if bad == 0 else f"FAIL ({bad})")
    subprocess.run(["rm", "-rf", str(root)])
    return bad == 0


def grade(results_dir):
    rd = pathlib.Path(results_dir)
    rnd = rd.name
    fixture_root = pathlib.Path(f"/tmp/spe-e2e/{rnd}")
    cells = {}
    for p in sorted((rd / "trials").glob("*-E[0-9]-*.json")):
        t = json.loads(p.read_text())
        checks = None if t.get("peeked") else grade_trial(t, fixture_root)
        t["e2e_checks"] = checks
        t["pass"] = bool(checks) and all(checks.values())
        p.write_text(json.dumps(t, indent=1) + "\n")
        c = cells.setdefault(f"{t['config']}-{t['task']}", {"done": 0, "pass": 0, "incomplete": 0, "fails": {}})
        if checks is None:
            c["incomplete"] += 1
            continue
        c["done"] += 1
        c["pass"] += t["pass"]
        for k, v in checks.items():
            if not v:
                c["fails"][k] = c["fails"].get(k, 0) + 1
    for c in cells.values():
        c["rate"] = round(c["pass"] / c["done"], 2) if c["done"] else None
    (rd / f"{rnd}-e2e.json").write_text(json.dumps(cells, indent=1) + "\n")
    for k, c in sorted(cells.items()):
        print(k, c)
    return cells


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        sys.exit(0 if selftest() else 1)
    grade(sys.argv[1])
