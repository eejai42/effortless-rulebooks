#!/usr/bin/env bash
# Build step: json-hbars-transform always writes ./output.txt (it ignores -o).
# Publish that rendered artifact to the canonical, well-named location at project root.
# Part of `effortless build`; runs right after the platform-features JsonHbarsTransform step.
#
# Unlike the Effortless plan, every Features row is published (no [DONE] pruning) — this is a
# full catalog of what the platform has / allows for, with challenge provenance on each row.
#
# The json-hbars engine HTML-escapes interpolated {{field}} values, so a Title/Description with
# "->", "<->", or "&" lands in output.txt as "-&gt;", "&lt;-&gt;", "&amp;". GitHub decodes those
# when rendering, but the raw Markdown source is meant to be read directly, so we unescape the
# common entities here (post-render, exactly like plan/publish-plan.sh post-processes its output).
# The template's own literal text (the <!-- --> header) is passed through un-escaped by the engine,
# so this pass only ever touches escaped interpolated content. "&amp;" is unescaped LAST so an
# escaped "&amp;gt;" would collapse to "&gt;" rather than ">".
set -euo pipefail
cd "$(dirname "$0")"

SRC="output.txt"
DEST="../PLATFORM_FEATURES.md"

if [[ ! -f "$SRC" ]]; then
  echo "[publish-platform-features] ERROR: $SRC not found — did the JsonHbarsTransform run first?" >&2
  exit 1
fi

perl -pe 's/&lt;/</g; s/&gt;/>/g; s/&quot;/"/g; s/&#0?39;/'\''/g; s/&#x27;/'\''/g; s/&amp;/\&/g' "$SRC" > "$DEST"

echo "[publish-platform-features] derived catalog -> PLATFORM_FEATURES.md ($(wc -l < "$DEST" | tr -d ' ') lines, HTML entities unescaped)"
