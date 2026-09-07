#!/usr/bin/env bash
# =============================================================================
# Cross-Domain Build Runner
# =============================================================================
# Runs `[B]uild` (via orchestrate.sh) against every demo in rulebook-examples/,
# captures per-domain logs, then regenerates a structured summary JSON + a
# human/agent-readable Markdown report.
#
# Outputs land in orchestration/build-status/:
#   logs/<domain>.log     # raw build output (gitignored)
#   summary.json          # {domain, status, root_cause, first_error, log_path}
#   REPORT.md             # rendered triage table
#
# Each demo build is invoked with ERB_DOMAIN=<slug> in its environment, so
# nothing in the parent process or filesystem needs to track which one is
# "active."
#
# Usage:
#   build-all-domains.sh                  # rebuild every demo
#   build-all-domains.sh --missing        # only demos without a log yet
#   build-all-domains.sh --failing        # only demos last marked FAIL/OTHER
#   build-all-domains.sh --domain NAME    # only this one
#   build-all-domains.sh --report-only    # don't build; just refresh JSON/MD
#   build-all-domains.sh -h | --help
#
# This is the THIN orchestration layer. The actual build pipeline still lives
# in orchestrate.sh; we just drive it non-interactively via `printf "B\nQ\n"`
# and grep the captured log for failure markers.
# =============================================================================

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
REPO_ROOT="$PROJECT_ROOT"
RULEBOOK_EXAMPLES_DIR="$REPO_ROOT/rulebook-examples"
TOY_RULEBOOKS_DIR="$REPO_ROOT/toy-rulebooks"
STATUS_DIR="$SCRIPT_DIR/build-status"
LOGS_DIR="$STATUS_DIR/logs"
SUMMARY_JSON="$STATUS_DIR/summary.json"
REPORT_MD="$STATUS_DIR/REPORT.md"
REPORT_PY="$SCRIPT_DIR/build-status-report.py"

mkdir -p "$LOGS_DIR"

usage() {
    sed -n '2,28p' "$0" | sed 's/^# \{0,1\}//'
    exit 0
}

MODE="all"
SINGLE_DOMAIN=""
while [ $# -gt 0 ]; do
    case "$1" in
        --missing) MODE="missing"; shift ;;
        --failing) MODE="failing"; shift ;;
        --domain)  MODE="single"; SINGLE_DOMAIN="$2"; shift 2 ;;
        --report-only) MODE="report-only"; shift ;;
        -h|--help) usage ;;
        *) echo "Unknown flag: $1" >&2; usage ;;
    esac
done

# --- list of demos to attempt ------------------------------------------------
ALL_DOMAINS=()
for d in "$RULEBOOK_EXAMPLES_DIR"/*/ "$TOY_RULEBOOKS_DIR"/*/; do
    [ -d "$d" ] || continue
    ALL_DOMAINS+=("$(basename "$d")")
done

find_domain_dir_build() {
    local domain="$1"
    if [ -d "$RULEBOOK_EXAMPLES_DIR/$domain" ]; then
        echo "$RULEBOOK_EXAMPLES_DIR/$domain"
    elif [ -d "$TOY_RULEBOOKS_DIR/$domain" ]; then
        echo "$TOY_RULEBOOKS_DIR/$domain"
    else
        echo "" ; return 1
    fi
}

TARGETS=()
case "$MODE" in
    all)
        TARGETS=("${ALL_DOMAINS[@]}")
        ;;
    single)
        # Validate the demo actually exists.
        if ! find_domain_dir_build "$SINGLE_DOMAIN" > /dev/null 2>&1; then
            echo "No such demo: $SINGLE_DOMAIN" >&2
            echo "Existing demos:" >&2
            printf '  - %s\n' "${ALL_DOMAINS[@]}" >&2
            exit 2
        fi
        TARGETS=("$SINGLE_DOMAIN")
        ;;
    missing)
        for d in "${ALL_DOMAINS[@]}"; do
            [ -f "$LOGS_DIR/$d.log" ] || TARGETS+=("$d")
        done
        ;;
    failing)
        # Read summary.json (if present); rebuild anything not PASS.
        if [ ! -f "$SUMMARY_JSON" ]; then
            echo "No summary.json yet — run without --failing once first." >&2
            exit 2
        fi
        while IFS= read -r d; do
            TARGETS+=("$d")
        done < <(python3 -c "
import json, sys
with open('$SUMMARY_JSON') as f:
    s = json.load(f)
for row in s.get('domains', []):
    if row.get('status') != 'PASS':
        print(row['domain'])
")
        ;;
    report-only)
        TARGETS=()
        ;;
esac

# --- build loop --------------------------------------------------------------
if [ "$MODE" != "report-only" ] && [ ${#TARGETS[@]} -eq 0 ]; then
    echo "Nothing to build for mode=$MODE."
    exit 0
fi

N=${#TARGETS[@]}
i=0
# set -u + empty array would crash here, so iterate only when non-empty.
for d in ${TARGETS[@]+"${TARGETS[@]}"}; do
    i=$((i + 1))
    printf "[%2d/%d] %-42s " "$i" "$N" "$d"
    log="$LOGS_DIR/$d.log"
    printf "B\nQ\n" | ERB_DOMAIN="$d" bash "$SCRIPT_DIR/orchestrate.sh" > "$log" 2>&1
    # orchestrate.sh keeps its menu loop alive even after a python child crash,
    # so $? is unreliable — fall back to grepping the captured log.
    if grep -qE "Traceback|FATAL|RuntimeError|✗.*FAILED|raise " "$log" 2>/dev/null; then
        echo "FAIL"
    elif grep -qE "Error:" "$log" 2>/dev/null; then
        echo "FAIL"
    else
        echo "PASS"
    fi
done

# --- regenerate summary.json + REPORT.md ------------------------------------
echo ""
echo "Regenerating $SUMMARY_JSON and $REPORT_MD..."
python3 "$REPORT_PY"
echo "Done."
