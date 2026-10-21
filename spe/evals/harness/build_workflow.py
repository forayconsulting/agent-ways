"""Build rNN-workflow.js from workflow.template.js, the task files, and the way texts.

r01 is kept in ROUNDS for the record. Its built script is committed. Rebuilding
it now would pick up later way edits, so do not rebuild r01.

Run from the repo root: python3 -I spe/evals/harness/build_workflow.py r02
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
    template = (HARNESS / "workflow.template.js").read_text()
    out = HARNESS / f"{round_id}-workflow.js"
    out.write_text(template.replace("__DATA__", json.dumps(data, indent=1)))
    sizes = {k: len(v) for k, v in data["ways"].items()}
    print(f"wrote {out.relative_to(ROOT)} ({out.stat().st_size} bytes); way chars {sizes}")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "r01")
