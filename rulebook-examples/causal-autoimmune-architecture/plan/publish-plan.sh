#!/usr/bin/env bash
# Build step: the json-hbars-transform always writes plan/output.txt (it ignores -o).
# Publish that rendered artifact to the canonical, well-named location at project root.
# Part of `effortless build`; runs right after the JsonHbarsTransform step.
#
# The hbars engine has no conditional/eq helper, so it renders every EffortlessLoops row.
# We drop the [DONE] loop blocks here, post-render: completed loops live in git history and
# the code, so the published plan shows only the current/roadmap work (matches the rulebook's
# derived `IsInCurrentPlan = IF(Status="done", FALSE, TRUE)`). A "### [DONE] " heading and
# everything up to the next "### " heading (or the closing "---") is one done-loop block.
set -euo pipefail
cd "$(dirname "$0")"

SRC="output.txt"
DEST="../EFFORTLESS_LOOPS.md"

if [[ ! -f "$SRC" ]]; then
  echo "[publish-plan] ERROR: $SRC not found — did JsonHbarsTransform run first?" >&2
  exit 1
fi

# Strip [DONE] blocks: skip from a "### [DONE] " heading until the next "### " or "---" line.
awk '
  /^### \[DONE\] / { skip=1; next }
  /^### / || /^---$/ { skip=0 }
  !skip { print }
' "$SRC" > "$DEST"

echo "[publish-plan] derived plan -> EFFORTLESS_LOOPS.md ($(wc -l < "$DEST" | tr -d ' ') lines, [DONE] loops pruned)"
