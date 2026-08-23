#!/usr/bin/env bash
# Build-time patcher for licensed EF dataclass sources.
#
# The transpiler emits bool formula getters as:
#     public bool X { get => nav != null ? nav.Y : null; set { } }
# which doesn't compile (null is not a bool). String formulas in the
# same shape compile fine because strings are nullable. We can't edit
# the licensed sources, so we patch a copy here before compile.
#
# Idempotent. Operates on every *.cs found under the source dir; writes
# patched copies (preserving directory structure) under the dest dir.
#
# Usage: patch-sources.sh <src-root> <dst-root>

set -euo pipefail

SRC="$1"
DST="$2"

mkdir -p "$DST"
rm -rf "$DST"/*

while IFS= read -r -d '' file; do
    rel="${file#"$SRC"/}"
    # Skip the generated EF DbContext — it pulls in
    # Microsoft.EntityFrameworkCore which the runner doesn't reference.
    # Compat.cs supplies an in-memory SoAEFContext stub instead.
    case "$rel" in
        SoAEFContext.cs) continue ;;
    esac
    out="$DST/$rel"
    mkdir -p "$(dirname "$out")"
    # Perl in slurp mode: two transforms.
    #  1) Bool formula getters emitted as `... : null; set { }` are illegal
    #     (null is not a bool); rewrite the literal to `false`.
    #  2) The dataclass base classes call top-level helper names like
    #     SUBSTITUTE / IF / CONCAT from DataExtensions, but the generated
    #     `using` block doesn't import them statically. Inject the missing
    #     `using static SqlOnAir.DotNet.Lib.DataExtensions;` right after
    #     the last `using ...;` so every patched file compiles.
    perl -0pe '
        s{
            (public\s+bool\s+\w+\s*\{\s*get\s*=>[^;]*?)
            \s*:\s*null
            (\s*;\s*set\s*\{\s*\}\s*\})
        }{$1 : false$2}gsx;
        unless (/using\s+static\s+SqlOnAir\.DotNet\.Lib\.DataExtensions/) {
            s{((?:^using[^;]+;\s*)+)}{$1using static SqlOnAir.DotNet.Lib.DataExtensions;\n}m;
        }
    ' "$file" > "$out"
done < <(find "$SRC" -type f -name '*.cs' -print0)
