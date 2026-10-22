"""Build rNN-workflow.js from workflow.template.js, the task files, and the way texts.

r01 is kept in ROUNDS for the record. Its built script is committed. Rebuilding
it now would pick up later way edits, so do not rebuild r01.

Run from the repo root: python3 -I spe/evals/harness/build_workflow.py r04
Way bodies are read with the frontmatter stripped, as the hooks deliver them.
"""
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parents[3]
HARNESS = ROOT / "spe/evals/harness"
WAYS = ROOT / "hooks/ways/evaluative/spe"


def body(path):
    text = path.read_text()
    if text.startswith("---\n"):
        text = text.split("\n---\n", 1)[1]
    return text.strip()


ROUNDS = {
    "r01": {
        "tasks": [f"T{i}" for i in range(1, 8)],
        "configs": {"A": {}, "B": {"base": "root_r01", "children": True}, "C": {"base": "slim"}},
        "notes": "A = no SPE guidance, B = a tree of ways (root plus one child per moment), C = one slim file.",
    },
    "r04": {
        "tasks": [f"T{i}" for i in range(1, 8)] + [f"H{i}" for i in range(1, 6)] + [f"H{i}p" for i in range(1, 6)],
        "configs": {"E": {"set": "E"}, "F": {"set": "F"}},
        "e2e_configs": {"E": {"set": "E"}, "F": {"set": "F"}},
        "e2e_tasks": ["E1", "E2", "E3"],
        "way_sets": {"E": "spe/evals/configs/E-r03", "F": "tree"},
        "order_list": True,
        "notes": "E = the r03 winner (scope, ceiling, gate, and pinning rules), frozen. F = E with a much shorter root (detail moved to the children), a saturation failure entry in the close-out child, and named metrics for a model release. H3 and H3p are control tasks where no SPE ceremony is the right answer. Tasks ending in p are paraphrases of the H tasks.",
    },
    "r03": {
        "tasks": [f"T{i}" for i in range(1, 8)] + [f"H{i}" for i in range(1, 6)] + [f"H{i}p" for i in range(1, 6)],
        "configs": {"D": {"set": "D"}, "E": {"set": "E"}},
        "e2e_configs": {"A": {}, "D": {"set": "D"}, "E": {"set": "E"}},
        "notes": "D = the r02 winner (the C2 text as the root way plus revised child ways), frozen. E = D plus a scope rule, a ceiling and handback rule, a gate line in the root, and pinning for a new model. H3 and H3p are control tasks where no SPE ceremony is the right answer. Tasks ending in p are paraphrases of the H tasks.",
    },
    "r02": {
        "tasks": [f"T{i}" for i in range(1, 8)] + [f"H{i}" for i in range(1, 6)],
        "configs": {"A": {}, "C": {"base": "slim"}, "C2": {"base": "slim2"}, "D": {"base": "root", "children": True}},
        "notes": "A = no SPE guidance, C = the r01 slim file, C2 = C plus a bands rule, D = the C2 text as the root way plus one child way per moment (revised children). H3 is a control task where no SPE ceremony is the right answer.",
    },
}


def main(round_id):
    spec = ROUNDS[round_id]
    tasks = [json.loads((ROOT / f"spe/evals/tasks/{t}.json").read_text()) for t in spec["tasks"]]
    data = {
        "round": round_id,
        "tasks": tasks,
        "configs": spec["configs"],
        "config_notes": spec["notes"],
        "ways": {
            "root": body(WAYS / "spe.md"),
            "specify": body(WAYS / "specify/specify.md"),
            "predict": body(WAYS / "predict/predict.md"),
            "evaluate": body(WAYS / "evaluate/evaluate.md"),
            "learn": body(WAYS / "learn/learn.md"),
            "slim": body(ROOT / "spe/evals/configs/C-slim.md"),
            "slim2": body(ROOT / "spe/evals/configs/C2-slim.md"),
        },
    }
    if round_id == "r04":
        def way_set(d):
            if d == "tree":
                return {"root": body(WAYS / "spe.md"), **{c: body(WAYS / f"{c}/{c}.md") for c in ("specify", "predict", "evaluate", "learn")}}
            d = ROOT / d
            return {"root": body(d / "spe.md"), **{c: body(d / f"{c}.md") for c in ("specify", "predict", "evaluate", "learn")}}
        data["way_sets"] = {k: way_set(v) for k, v in spec["way_sets"].items()}
        data["e2e_configs"] = spec["e2e_configs"]
        data["e2e_tasks"] = [json.loads((ROOT / f"spe/evals/e2e/{t}.json").read_text()) for t in spec["e2e_tasks"]]
        data["fixture_script"] = str(ROOT / "spe/evals/e2e/make_fixture.sh")
        data["order_list"] = spec["order_list"]
        data["ways"] = {}
    if round_id == "r03":
        def way_set(d):
            return {"root": body(d / "spe.md"), **{c: body(d / f"{c}.md") for c in ("specify", "predict", "evaluate", "learn")}}
        tree = {"root": body(WAYS / "spe.md"), **{c: body(WAYS / f"{c}/{c}.md") for c in ("specify", "predict", "evaluate", "learn")}}
        data["way_sets"] = {"D": way_set(ROOT / "spe/evals/configs/D-r02"), "E": tree}
        data["e2e_configs"] = spec["e2e_configs"]
        data["e2e_tasks"] = [json.loads((ROOT / f"spe/evals/e2e/{t}.json").read_text()) for t in ("E1", "E2")]
        data["fixture_script"] = str(ROOT / "spe/evals/e2e/make_fixture.sh")
        data["ways"] = {}
    template = (HARNESS / "workflow.template.js").read_text()
    out = HARNESS / f"{round_id}-workflow.js"
    out.write_text(template.replace("__DATA__", json.dumps(data, indent=1)))
    sizes = {k: len(v) for k, v in data["ways"].items()} if data["ways"] else {s: sum(map(len, v.values())) for s, v in data["way_sets"].items()}
    print(f"wrote {out.relative_to(ROOT)} ({out.stat().st_size} bytes); way chars {sizes}")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "r01")
