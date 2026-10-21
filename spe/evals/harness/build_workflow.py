"""Build rNN-workflow.js from workflow.template.js, the task files, and the way texts.

Run from the repo root: python3 -I spe/evals/harness/build_workflow.py r01
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


def main(round_id):
    tasks = [json.loads((ROOT / f"spe/evals/tasks/T{i}.json").read_text()) for i in range(1, 8)]
    data = {
        "round": round_id,
        "tasks": tasks,
        "ways": {
            "root": body(WAYS / "spe.md"),
            "specify": body(WAYS / "specify/specify.md"),
            "predict": body(WAYS / "predict/predict.md"),
            "evaluate": body(WAYS / "evaluate/evaluate.md"),
            "learn": body(WAYS / "learn/learn.md"),
            "slim": body(ROOT / "spe/evals/configs/C-slim.md"),
        },
    }
    template = (HARNESS / "workflow.template.js").read_text()
    out = HARNESS / f"{round_id}-workflow.js"
    out.write_text(template.replace("__DATA__", json.dumps(data, indent=1)))
    sizes = {k: len(v) for k, v in data["ways"].items()}
    print(f"wrote {out.relative_to(ROOT)} ({out.stat().st_size} bytes); way chars {sizes}")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "r01")
