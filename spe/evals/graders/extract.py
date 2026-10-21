"""Extract trial results from a Workflow run's transcript dir and scan for peeks.

Usage: python3 -I spe/evals/graders/extract.py <transcriptDir> <results_dir>
Writes <results_dir>/trials/<label>.json with {label, config, task, n, response,
judge, critiques, peeked, tools_used, live_ways}. Then run grade.py on <results_dir>.

Peek rule: a trial agent that called any tool other than StructuredOutput broke the
no-tools rule. Its trial is marked peeked and grade.py counts it as incomplete.
live_ways lists the way titles that the live hooks injected into the trial agent,
so a confound between configs can be checked.
"""
import json
import pathlib
import re
import sys

ALLOWED = {"StructuredOutput"}


def journal(d):
    started, done = {}, {}
    for line in (d / "journal.jsonl").read_text().splitlines():
        if not line.strip():
            continue
        e = json.loads(line)
        if e.get("agentId") and e.get("label"):
            started[e["agentId"]] = e["label"]
        if e.get("agentId") and e.get("type") not in ("started", "launched"):
            for key in ("result", "value", "output", "returnValue"):
                if key in e:
                    done[e["agentId"]] = e[key]
    return started, done


def scan_agent(path):
    tools, ways = [], []
    for line in path.read_text().splitlines():
        try:
            d = json.loads(line)
        except json.JSONDecodeError:
            continue
        msg = d.get("message") or {}
        content = msg.get("content")
        if d.get("type") == "assistant" and isinstance(content, list):
            tools += [b["name"] for b in content if b.get("type") == "tool_use" and b["name"] not in ALLOWED]
        blob = json.dumps(d.get("attachment", "")) if d.get("type") == "attachment" else ""
        if d.get("type") == "api-request-blob":
            blob = json.dumps(d)
        ways += re.findall(r"epistemic: [a-z-]+ -->\\n# ([^\\]+)", blob)
    return tools, sorted(set(ways))


PATH_RE = re.compile(r"(/(?:Users|private|tmp|var|etc|opt|home)/[^\s'\"`;|&)]*)")


def scan_escape(path, fixture, script):
    """E2E trials may use tools, but only inside their fixture (plus running the setup script).
    Returns the list of outside paths found in tool inputs."""
    outside = []
    for line in path.read_text().splitlines():
        try:
            d = json.loads(line)
        except json.JSONDecodeError:
            continue
        content = (d.get("message") or {}).get("content")
        if d.get("type") != "assistant" or not isinstance(content, list):
            continue
        for b in content:
            if b.get("type") != "tool_use" or b["name"] in ALLOWED:
                continue
            for p in PATH_RE.findall(json.dumps(b.get("input", {})).replace("\\/", "/")):
                p = p.rstrip(".,:")
                if p.startswith(fixture) or p == script or p.startswith("/tmp/spe-e2e/" ) and fixture.startswith(p):
                    continue
                if p in ("/dev/null", "/tmp", "/usr/bin/env"):
                    continue
                outside.append(p)
    return sorted(set(outside))


def main(tdir, rdir):
    d, out = pathlib.Path(tdir), pathlib.Path(rdir) / "trials"
    out.mkdir(parents=True, exist_ok=True)
    started, done = journal(d)
    trials, judges = {}, {}
    for aid, label in started.items():
        kind, _, name = label.partition(":")
        if kind == "trial":
            res = done.get(aid)
            tools, ways = scan_agent(d / f"agent-{aid}.jsonl")
            rec = {"response": (res or {}).get("response") if isinstance(res, dict) else None,
                   "peeked": bool(tools), "tools_used": tools, "live_ways": ways, "agent": aid}
            task = name.split("-")[2]
            if task.startswith("E") and task[1:].isdigit():
                fixture = f"/tmp/spe-e2e/{name.split('-')[0]}/{name}"
                script = str(pathlib.Path(__file__).resolve().parents[1] / "e2e/make_fixture.sh")
                outside = scan_escape(d / f"agent-{aid}.jsonl", fixture, script)
                rec.update({"peeked": bool(outside), "escapes": outside, "tool_count": len(tools)})
            trials[name] = rec
        elif kind == "judge":
            judges[name] = done.get(aid)
    n_written = 0
    for name, t in trials.items():
        rnd, cfg, task, n = name.split("-")
        j = judges.get(name)
        checks = j.get("checks") if isinstance(j, dict) else None
        rec = {"label": name, "round": rnd, "config": cfg, "task": task, "n": int(n), **t,
               "judge": [bool(c.get("pass")) for c in checks] if checks else None,
               "critiques": [c.get("critique") for c in checks] if checks else None}
        (out / f"{name}.json").write_text(json.dumps(rec, indent=1) + "\n")
        n_written += 1
    peeks = [k for k, t in trials.items() if t["peeked"]]
    print(f"trials {n_written}, judged {sum(1 for k in trials if judges.get(k))}, peeks {len(peeks)} {peeks}")
    ways = {}
    for k, t in trials.items():
        cfg = k.split("-")[1]
        for w in t["live_ways"]:
            ways.setdefault(w, {}).setdefault(cfg, 0)
            ways[w][cfg] += 1
    print("live ways injected into trials, by config:", json.dumps(ways))


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
