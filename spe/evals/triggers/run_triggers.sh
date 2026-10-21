#!/usr/bin/env bash
# Prompt-lane and file-lane trigger cases for evaluative/spe.
# Usage: bash spe/evals/triggers/run_triggers.sh [ways-binary]  (from the repo root)
# The prompt lane runs the real `ways scan prompt`, including the live relevance judge
# (about $0.001 per prompt). Each prompt gets a fresh session, so refire does not interfere.
set -uo pipefail
WAYS="${1:-ways}"
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
SB="$(mktemp -d)"; trap 'rm -rf "$SB"' EXIT
mkdir -p "$SB/.claude/ways/evaluative"
cp -R "$ROOT/hooks/ways/evaluative/spe" "$SB/.claude/ways/evaluative/spe"
WAYS="$(command -v "$WAYS" || echo "$WAYS")"
tp=0; fn=0; fp=0; tn=0
while IFS= read -r line; do
  want=$(jq -r .want <<<"$line"); prompt=$(jq -r .prompt <<<"$line")
  q=$(tr '[:upper:]' '[:lower:]' <<<"$prompt")
  out=$(cd "$SB" && env -u CLAUDE_PROJECT_DIR XDG_RUNTIME_DIR="$SB/run" "$WAYS" scan prompt --query "$q" --session "trig$RANDOM$RANDOM" --project "$SB" 2>/dev/null)
  fired=$(grep -c '# The SPE Loop in Claude Code' <<<"$out")
  if [[ "$want" == true && "$fired" -gt 0 ]]; then tp=$((tp+1))
  elif [[ "$want" == true ]]; then fn=$((fn+1)); echo "MISS  $prompt"
  elif [[ "$fired" -gt 0 ]]; then fp=$((fp+1)); echo "FALSE $prompt"
  else tn=$((tn+1)); fi
done < "$ROOT/spe/evals/triggers/prompts.jsonl"
echo "prompt lane: recall $tp/$((tp+fn)), false positives $fp/$((fp+tn))"
# File lane: compile each child's files: regex the way the engine does (case-insensitive) and test sample paths.
ok=0; bad=0
while IFS=$'\t' read -r path want; do
  hit=none
  for child in specify predict evaluate learn; do
    re=$(sed -n 's/^files: //p' "$ROOT/hooks/ways/evaluative/spe/$child/$child.md")
    if python3 -I -c 'import re,sys; sys.exit(0 if re.search(sys.argv[1], sys.argv[2], re.I) else 1)' "$re" "$path"; then hit="evaluative/spe/$child"; break; fi
  done
  if [[ "$hit" == "$want" ]]; then ok=$((ok+1)); else bad=$((bad+1)); echo "FILE  $path -> $hit (want $want)"; fi
done < "$ROOT/spe/evals/triggers/files.tsv"
echo "file lane: $ok/$((ok+bad)) correct"
