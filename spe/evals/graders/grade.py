"""Code grader for the SPE ways eval. It mirrors codeChecks() in the workflow template.

Usage (from the repo root):
  python3 -I spe/evals/graders/grade.py --selftest
  python3 -I spe/evals/graders/grade.py spe/evals/results/r01   # regrade trials/*.json, write rNN.json and the scorecard

A trial file holds {label, config, task, n, response, judge: [bools] or null}.
A trial passes when every code check passes and at least 6 of 7 judge checks pass.
"""
import json
import math
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[3]
TASK_IDS = [f"T{i}" for i in range(1, 8)] + [f"H{i}" for i in range(1, 6)] + [f"H{i}p" for i in range(1, 6)]
TASKS = {t: json.loads(p.read_text()) for t in TASK_IDS if (p := ROOT / f"spe/evals/tasks/{t}.json").exists()}
FIX = pathlib.Path(__file__).parent / "fixtures"

# Disclosed regrades. The pre-registered checks stay the headline. Each variant
# rewrites named checks and writes rNN-<variant>.json beside the original.
# fentry: T4 and T6 never show the last failure number, so careful trials wrote a
# placeholder ("F-next", "F-r02-1", "F<next number>", "Fn") instead of inventing one.
# The variant accepts a placeholder or a named failures.md entry. Judge check 3
# (T6) and check 4 (T4) still grade the entry's fields.
FENTRY = r"\bF(\d+|n)\b|\bF[-<{][\w<{]|failures\.md"
# same_tasks (r02, H4): the check wanted a literal "same tasks". Trials that kept the
# tasks fixed by deferring "proposals that change tasks or graders" failed it while
# judge check 5 (same tasks and graders) passed. The variant accepts that wording.
SAME_TASKS = r"same (tasks|graders|ticket|set|eval)|tasks and graders (stay|unchanged|fixed)|unchanged (tasks|graders)|tasks (and|or) graders"
# order_list (r03): order checks read the whole answer, so a summary sentence such as
# "save a quick prediction, run the gates, then launch the eval" before the numbered
# steps fails them. The variant reads only the numbered action list, from the first
# line that starts with "1." or "1)".
VARIANTS = {"fentry": {("T4", "fentry"): FENTRY, ("T6", "fentry"): FENTRY},
            "same_tasks": {("H4", "same_tasks"): SAME_TASKS},
            "order_list": {}}
# From round 4 on, order checks read the numbered list by default (r03 F17).
ORDER_LIST_DEFAULT = False
LIST_START = re.compile(r"^\s*(?:\*\*)?1[.)]", re.M)
VARIANT = None


def code_checks(task, text):
    out = {}
    for c in task["code"]:
        if VARIANT and (task["id"], c["id"]) in VARIANTS[VARIANT]:
            c = {**c, "regex": VARIANTS[VARIANT][(task["id"], c["id"])]}
        if c.get("order"):
            body = text
            if (VARIANT == "order_list" or ORDER_LIST_DEFAULT) and (m := LIST_START.search(text)):
                body = text[m.start():]
            a = re.search(c["order"][0], body, re.I)
            b = re.search(c["order"][1], body, re.I)
            out[c["id"]] = bool(a) and (b is None or a.start() < b.start())
            continue
        n = len(re.findall(c["regex"], text, re.I))
        out[c["id"]] = n == 0 if c.get("must_not") else n >= c.get("min_count", 1)
    return out


def wilson(k, n, z=1.96):
    if n == 0:
        return (None, None)
    p = k / n
    d = 1 + z * z / n
    c = (p + z * z / (2 * n)) / d
    h = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / d
    return (round(c - h, 2), round(c + h, 2))


def selftest():
    bad = 0
    for tid, task in TASKS.items():
        oracle = (FIX / f"{tid}-oracle.md").read_text()
        cases = {
            "oracle": (oracle, True),
            "empty": ("", False),
            "dont_know": ("I don't know how to do this.", False),
            "wrong_question": ((FIX / f"{list(TASKS)[(list(TASKS).index(tid) + 1) % len(TASKS)]}-oracle.md").read_text(), False),
        }
        for name, (text, want) in cases.items():
            res = code_checks(task, text)
            got = all(res.values())
            ok = got == want
            bad += not ok
            failed = [k for k, v in res.items() if not v]
            print(f"{'ok ' if ok else 'BAD'} {tid} {name:14} all_pass={got} want={want} failed={failed}")
    print("selftest:", "PASS" if bad == 0 else f"FAIL ({bad})")
    return bad == 0


def grade(results_dir):
    rd = pathlib.Path(results_dir)
    trials = [json.loads(p.read_text()) for p in sorted((rd / "trials").glob("*.json"))]
    cells = {}
    for t in trials:
        if t["task"] not in TASKS:
            continue  # E2E trials are graded by grade_e2e.py
        task = TASKS[t["task"]]
        t["code"] = code_checks(task, t.get("response") or "")
        judge = t.get("judge")
        t["incomplete"] = not t.get("response") or judge is None or t.get("peeked", False)
        t["judge_pass"] = sum(judge) if judge else None
        t["pass"] = (not t["incomplete"]) and all(t["code"].values()) and t["judge_pass"] >= 6
        c = cells.setdefault(f"{t['config']}-{t['task']}", {"done": 0, "pass": 0, "incomplete": 0, "chars": [], "judge": [], "code_fail": {}})
        if t["incomplete"]:
            c["incomplete"] += 1
            continue
        c["done"] += 1
        c["pass"] += t["pass"]
        c["chars"].append(len(t["response"]))
        c["judge"].append(t["judge_pass"])
        for k, v in t["code"].items():
            if not v:
                c["code_fail"][k] = c["code_fail"].get(k, 0) + 1
    out = {}
    for k, c in sorted(cells.items()):
        n = c["done"]
        out[k] = {
            "done": n, "pass": c["pass"], "incomplete": c["incomplete"],
            "rate": round(c["pass"] / n, 2) if n else None, "ci95": wilson(c["pass"], n),
            "judge_mean": round(sum(c["judge"]) / n, 2) if n else None,
            "median_chars": sorted(c["chars"])[n // 2] if n else None, "code_fail": c["code_fail"],
        }
    rnd = rd.name + (f"-{VARIANT}" if VARIANT else "")
    (rd / f"{rnd}.json").write_text(json.dumps(out, indent=1) + "\n")
    cfgs = sorted({k.split("-")[0] for k in out}, key=lambda c: (len(c), c))
    lines = [f"# {rnd} scorecard", "", "Pass = every code check and at least 6 of 7 judge checks. 95% Wilson intervals.", "",
             "| Task | " + " | ".join(f"{c} rate (CI)" for c in cfgs) + " |", "|---" * (len(cfgs) + 1) + "|"]
    for tid, task in TASKS.items():
        row = [f"{tid} {task['name']}"]
        for cfg in cfgs:
            s = out.get(f"{cfg}-{tid}")
            row.append("n/a" if not s or s["rate"] is None else f"{s['rate']:.2f} ({s['ci95'][0]}-{s['ci95'][1]}), n={s['done']}")
        lines.append("| " + " | ".join(row) + " |")
    means = {}
    for cfg in cfgs:
        rates = [out[f"{cfg}-{t}"]["rate"] for t in TASKS if out.get(f"{cfg}-{t}") and out[f"{cfg}-{t}"]["rate"] is not None]
        means[cfg] = round(sum(rates) / len(rates), 3) if rates else None
    lines += ["", "Mean pass rate across tasks: " + ", ".join(f"{k} {v}" for k, v in means.items()), ""]
    (rd / f"{rnd}-scorecard.md").write_text("\n".join(lines) + "\n")
    print("\n".join(lines))
    return out, means


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        sys.exit(0 if selftest() else 1)
    if "--order-list" in sys.argv:
        ORDER_LIST_DEFAULT = True
    if "--variant" in sys.argv:
        VARIANT = sys.argv[sys.argv.index("--variant") + 1]
    grade(sys.argv[1])
