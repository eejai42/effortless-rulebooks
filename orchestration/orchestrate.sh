#!/bin/bash
# =============================================================================
# ORCHESTRATE.SH
# =============================================================================
# Central orchestration for ERB execution substrates.
# Handles: Airtable sync, running tests, viewing results, cleaning.
# =============================================================================

set -e
set -o pipefail  # CRITICAL: Catch failures in piped commands (e.g., bash script | tee)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SUBSTRATES_DIR="$PROJECT_ROOT/execution-substrates"
REPO_ROOT="$PROJECT_ROOT"
RULEBOOK_EXAMPLES_DIR="$REPO_ROOT/rulebook-examples"
TOY_RULEBOOKS_DIR="$REPO_ROOT/toy-rulebooks"

# Active domain for this orchestrate.sh session. Per CLAUDE.md doctrine
# (`active-domain.txt` is the CLI + conversation scratchpad), the SSoT for
# the CLI is `orchestration/active-domain.txt`. Resolution order:
#   1. ERB_DOMAIN env var (explicit per-invocation override)
#   2. orchestration/active-domain.txt (the persistent CLI scratchpad)
#   3. empty -> get_active_domain fatals at the first call site, prompting
#      the user to pick from the menu.
# Every child invocation is dispatched with ERB_DOMAIN=$ACTIVE_DOMAIN, and
# set_active_domain persists back to the file so the choice survives the
# next CLI session.
ACTIVE_DOMAIN_FILE="$PROJECT_ROOT/orchestration/active-domain.txt"
if [ -n "${ERB_DOMAIN:-}" ]; then
    ACTIVE_DOMAIN="$ERB_DOMAIN"
elif [ -f "$ACTIVE_DOMAIN_FILE" ]; then
    ACTIVE_DOMAIN="$(tr -d '[:space:]' < "$ACTIVE_DOMAIN_FILE")"
else
    ACTIVE_DOMAIN=""
fi
export ERB_DOMAIN="$ACTIVE_DOMAIN"

# =============================================================================
# COLORS
# =============================================================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m' # No Color

# Substrate colors (cycle through for visual distinction)
SUBSTRATE_COLORS=(
    '\033[38;5;214m'  # Orange
    '\033[38;5;118m'  # Bright green
    '\033[38;5;147m'  # Light purple
    '\033[38;5;81m'   # Sky blue
    '\033[38;5;219m'  # Pink
    '\033[38;5;228m'  # Light yellow
    '\033[38;5;123m'  # Aqua
    '\033[38;5;183m'  # Lavender
    '\033[38;5;203m'  # Coral
    '\033[38;5;157m'  # Mint
    '\033[38;5;208m'  # Dark orange
    '\033[38;5;120m'  # Light green
)

# =============================================================================
# PARSE ARGUMENTS
# =============================================================================
CI_MODE=false
DOCKER_MODE=false
while [[ $# -gt 0 ]]; do
    case $1 in
        --ci)
            CI_MODE=true
            shift
            ;;
        --docker)
            DOCKER_MODE=true
            CI_MODE=true  # Docker mode implies CI mode (non-interactive)
            shift
            ;;
        *)
            shift
            ;;
    esac
done

# Also check environment variable for Docker mode
if [ "${ERB_DOCKER_MODE:-}" = "true" ]; then
    DOCKER_MODE=true
    CI_MODE=true
fi

# =============================================================================
# TOOL DETECTION
# =============================================================================
if [ -z "$SSOTME_AVAILABLE" ]; then
    if command -v effortless &> /dev/null; then
        SSOTME_AVAILABLE=true
    else
        SSOTME_AVAILABLE=false
    fi
fi

if command -v psql &> /dev/null; then
    POSTGRES_AVAILABLE=true
else
    POSTGRES_AVAILABLE=false
fi

# =============================================================================
# HELPER FUNCTIONS
# =============================================================================
get_active_domain() {
    if [ -z "$ACTIVE_DOMAIN" ]; then
        echo "FATAL: no active domain — set ERB_DOMAIN in the environment or pick one from the menu first." >&2
        exit 1
    fi
    echo "$ACTIVE_DOMAIN"
}

set_active_domain() {
    ACTIVE_DOMAIN="$1"
    export ERB_DOMAIN="$ACTIVE_DOMAIN"
    # Persist to the CLI scratchpad so the next ./start.sh (or any other
    # CLI tool that reads the file) picks up the same domain.
    printf '%s\n' "$ACTIVE_DOMAIN" > "$ACTIVE_DOMAIN_FILE"
    # Bump the domain folder's mtime so "recently opened" sort reflects this.
    local _dir
    _dir=$(find_domain_dir "$ACTIVE_DOMAIN" 2>/dev/null) && touch -- "$_dir"
}

get_mtime() {
    # Portable mtime-in-epoch-seconds (macOS first, Linux fallback).
    stat -f "%m" "$1" 2>/dev/null || stat -c "%Y" "$1" 2>/dev/null
}

format_time_since() {
    local epoch="$1"
    [ -z "$epoch" ] && { echo "never"; return; }
    local now diff
    now=$(date +%s)
    diff=$((now - epoch))
    [ "$diff" -lt 0 ] && diff=0
    if   [ "$diff" -lt 60 ];       then echo "${diff}s ago"
    elif [ "$diff" -lt 3600 ];     then echo "$((diff/60))m ago"
    elif [ "$diff" -lt 86400 ];    then echo "$((diff/3600))h ago"
    elif [ "$diff" -lt 604800 ];   then echo "$((diff/86400))d ago"
    elif [ "$diff" -lt 2592000 ];  then echo "$((diff/604800))w ago"
    elif [ "$diff" -lt 31536000 ]; then echo "$((diff/2592000))mo ago"
    else                                echo "$((diff/31536000))y ago"
    fi
}

find_domain_dir() {
    # Search rulebook-examples/ first, then toy-rulebooks/. Fails loudly if not found.
    local domain="${1:-$(get_active_domain)}"
    if [ -d "$RULEBOOK_EXAMPLES_DIR/$domain" ]; then
        echo "$RULEBOOK_EXAMPLES_DIR/$domain"
    elif [ -d "$TOY_RULEBOOKS_DIR/$domain" ]; then
        echo "$TOY_RULEBOOKS_DIR/$domain"
    else
        echo "FATAL: domain '$domain' not found under rulebook-examples/ or toy-rulebooks/" >&2
        return 1
    fi
}

get_domain_rulebook_path() {
    local domain="${1:-$(get_active_domain)}"
    local domain_dir
    domain_dir=$(find_domain_dir "$domain") || return 1
    echo "$domain_dir/effortless-rulebook/${domain}-rulebook.json"
}

get_project_name() {
    local domain
    domain=$(get_active_domain)
    local domain_dir
    domain_dir=$(find_domain_dir "$domain") || { echo "$domain"; return; }
    local effortless_json="$domain_dir/effortless.json"
    if [ -f "$effortless_json" ]; then
        python3 -c "
import json
with open('$effortless_json', 'r') as f:
    config = json.load(f)
print(config.get('Name', '$domain'))
"
    else
        echo "$domain"
    fi
}

list_domains() {
    for d in "$RULEBOOK_EXAMPLES_DIR"/*/ "$TOY_RULEBOOKS_DIR"/*/; do
        [ -d "$d" ] || continue
        basename "$d"
    done
}

# Canonical substrate ordering — computation substrates grouped roughly from
# "most feature-complete" to "spreadsheet/binary/exotic". Any substrate not
# listed here falls through to the end in alphabetical order.
SUBSTRATE_ORDER=(
    english
    python
    golang
    owl
    uml
    xlsx
    binary
    cobol
    csv
    yaml
    explain-dag
    # Effortless-licensed substrates render LAST.
    effortless-postgres
    effortless-xlsx
    effortless-entity-framework
)

get_valid_substrates() {
    # Returns the substrates this project actually exercises, in display order.
    #
    # The substrate list is the intersection of:
    #   (substrates declared by the active project's effortless.json ProjectTranspilers)
    #   AND (substrate directories that exist on disk with a runnable script)
    # If the active project has no effortless.json, we self-heal by running
    # `effortless -init` in the domain dir before re-reading.
    local -a discovered=()
    for dir in "$SUBSTRATES_DIR"/*/; do
        [ -d "$dir" ] || continue
        local name
        name=$(basename "$dir")
        [[ "$name" == .* ]] && continue
        if [ -f "$dir/inject-substrate.sh" ] || \
           [ -f "$dir/inject-into-${name}.py" ] || \
           [ -f "$dir/take-test.py" ] || \
           [ -f "$dir/take-test.sh" ]; then
            discovered+=("$name")
        fi
    done

    # Make sure the active domain has an effortless.json. If not, initialize.
    local _domain _domain_dir
    _domain=$(get_active_domain)
    _domain_dir=$(find_domain_dir "$_domain")
    if [ ! -f "$_domain_dir/effortless.json" ]; then
        echo "  ${YELLOW}effortless.json missing in $_domain_dir — running 'effortless -init'...${NC}" >&2
        ( cd "$_domain_dir" && effortless -init ) >&2 || {
            echo "  ${RED}FATAL: effortless -init failed in $_domain_dir${NC}" >&2
            exit 1
        }
    fi

    # Substrates declared by the active project's effortless.json. This call
    # raises FileNotFoundError if effortless.json is still missing (which
    # would mean -init didn't actually create it — a real bug).
    local declared
    declared=$(python3 -c "
import sys
sys.path.insert(0, '$SCRIPT_DIR')
from shared import get_active_project_substrates
print(' '.join(get_active_project_substrates()))
") || {
        echo "  ${RED}FATAL: could not read substrates from effortless.json after -init${NC}" >&2
        exit 1
    }

    local -a allowed=()
    if [ -z "$declared" ]; then
        echo "  ${RED}FATAL: effortless.json in $_domain_dir contains no enabled ProjectTranspilers${NC}" >&2
        exit 1
    fi
    # Intersect declared with discovered.
    local d
    for d in $declared; do
        for present in "${discovered[@]}"; do
            if [ "$d" = "$present" ]; then
                allowed+=("$d")
                break
            fi
        done
    done

    local -a ordered=()
    # 1. Append names from SUBSTRATE_ORDER that are in the allowed set
    local wanted present
    for wanted in "${SUBSTRATE_ORDER[@]}"; do
        for present in "${allowed[@]}"; do
            if [ "$wanted" = "$present" ]; then
                ordered+=("$wanted")
                break
            fi
        done
    done
    # 2. Append any allowed substrates not in SUBSTRATE_ORDER (alphabetical)
    local name known=0
    for name in $(printf '%s\n' "${allowed[@]}" | sort); do
        known=0
        for wanted in "${SUBSTRATE_ORDER[@]}"; do
            if [ "$wanted" = "$name" ]; then known=1; break; fi
        done
        [ $known -eq 0 ] && ordered+=("$name")
    done

    echo "${ordered[@]}"
}

# =============================================================================
# PROJECT-SCOPED TRANSPILER HELPERS (ssotme-proxy)
# =============================================================================

# Returns the effortless.json path for the active domain (empty if none)
get_active_effortless_json() {
    local domain
    domain=$(get_active_domain)
    local domain_dir
    domain_dir=$(find_domain_dir "$domain" 2>/dev/null) || { echo ""; return; }
    local path="$domain_dir/effortless.json"
    [ -f "$path" ] && echo "$path" || echo ""
}

# Returns tab-separated (internal_name TAB display_name TAB IsDisabled) for ALL
# ProjectTranspilers in the active domain's effortless.json. IsDisabled is the
# literal value from the JSON ("true" or "false"). Callers decide what to do
# with disabled entries — the menu dims them; BUILD skips them.
get_project_transpilers() {
    local ej
    ej=$(get_active_effortless_json)
    [ -z "$ej" ] && return
    python3 - "$ej" <<'PYEOF'
import json, sys, re
with open(sys.argv[1]) as f:
    cfg = json.load(f)
for t in cfg.get("ProjectTranspilers", []):
    cmd = t.get("CommandLine", "")
    # For proxy transpilers, show the URL path; otherwise use Name
    m = re.search(r'http://localhost:\d+(/\S*)', cmd)
    display = m.group(1).lstrip("/") if m else t["Name"]
    is_disabled = "true" if t.get("IsDisabled") else "false"
    print(f"{t['Name']}\t{display}\t{is_disabled}")
PYEOF
}

# Returns true if active project has any proxy transpilers
project_has_proxy_transpilers() {
    local result
    result=$(get_project_transpilers)
    [ -n "$result" ]
}

# Run a single proxy transpiler by name.
# Usage: run_proxy_transpiler <name>
run_proxy_transpiler() {
    local name="$1"
    local ej
    ej=$(get_active_effortless_json)
    if [ -z "$ej" ]; then
        echo -e "${RED}No effortless.json for active domain${NC}"
        return 1
    fi

    local domain_dir
    domain_dir="$(dirname "$ej")"

    python3 - "$ej" "$name" "$domain_dir" <<'PYEOF'
import json, sys, urllib.request, os, re, subprocess

ej_path, name, domain_dir = sys.argv[1], sys.argv[2], sys.argv[3]
with open(ej_path) as f:
    cfg = json.load(f)

transpiler = next((t for t in cfg.get("ProjectTranspilers", []) if t["Name"] == name), None)
if not transpiler:
    print(f"Transpiler '{name}' not found in ProjectTranspilers")
    sys.exit(1)

cmd = transpiler.get("CommandLine", "")
rel_path = transpiler.get("RelativePath", "").lstrip("/")
run_dir = os.path.join(domain_dir, rel_path) if rel_path else domain_dir

# Proxy transpiler: POST to localhost
if "localhost:" in cmd:
    match = re.search(r'(http://localhost:\d+\S*)', cmd)
    proxy_url = match.group(1) if match else None
    if not proxy_url:
        print(f"Could not parse proxy URL from: {cmd}")
        sys.exit(1)
    input_match = re.search(r'-i\s+(\S+)', cmd)
    if not input_match:
        print(f"ERROR: transpiler '{name}' is missing '-i <rulebook>' in CommandLine: {cmd!r}", file=sys.stderr)
        print(f"Every proxy transpiler MUST pass -i pointing at the domain's <domain>-rulebook.json. Fix the CommandLine instead of guessing one.", file=sys.stderr)
        sys.exit(1)
    input_file = os.path.abspath(os.path.join(run_dir, input_match.group(1)))
    if not os.path.exists(input_file):
        print(f"ERROR: rulebook not found at {input_file} (resolved from -i {input_match.group(1)} in run_dir={run_dir}).", file=sys.stderr)
        sys.exit(1)
    if os.path.isdir(input_file):
        print(f"ERROR: -i resolved to a directory, not a file: {input_file}.", file=sys.stderr)
        sys.exit(1)
    output_dir = os.path.abspath(run_dir)
    payload = json.dumps({"inputFile": input_file, "outputDir": output_dir, "clean": False}).encode()
    req = urllib.request.Request(proxy_url, data=payload,
        headers={"Content-Type": "application/json", "X-Working-Dir": run_dir}, method="POST")
    # The proxy ignores the body and the X-Working-Dir header — it reads the
    # socket-owning process's actual cwd via lsof/ps and demands it be
    # rulebook-examples/<domain>/<substrate>/. So we must chdir into run_dir
    # before opening the connection, otherwise the guard fires with
    # "CLI cwd is not under .../rulebook-examples".
    os.makedirs(run_dir, exist_ok=True)
    os.chdir(run_dir)
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            result = json.loads(resp.read())
    except Exception as e:
        print(f"ERROR calling proxy: {e}")
        sys.exit(1)
    output = result.get("output", "") or result.get("error", "")
    if output:
        print(output)
    sys.exit(0 if result.get("success") else 1)

# Standard transpiler: run via effortless build -id from RelativePath dir
else:
    os.makedirs(run_dir, exist_ok=True)
    result = subprocess.run(["effortless", "build", "-id"], cwd=run_dir, text=True)
    sys.exit(result.returncode)
PYEOF
}

# Run all NON-DISABLED proxy transpilers for the active project. Transpilers
# with IsDisabled=true in effortless.json are skipped here (printed as [SKIP]).
# To run a disabled transpiler, pick it by number from the menu — that path
# will prompt for confirmation.
run_project_transpilers() {
    local transpilers
    transpilers=$(get_project_transpilers)
    if [ -z "$transpilers" ]; then
        echo -e "${YELLOW}No proxy transpilers configured for this project.${NC}"
        return 0
    fi

    local domain
    domain=$(get_active_domain)
    echo ""
    echo -e "${BOLD}${CYAN}Running transpilers for: ${WHITE}${domain}${NC}"
    echo ""

    local failed=0
    while IFS=$'\t' read -r internal display is_disabled; do
        if [ "$is_disabled" = "true" ]; then
            echo -e "${DIM}⊘ ${display} [SKIP — IsDisabled=true]${NC}"
            echo ""
            continue
        fi
        echo -e "${CYAN}▶ ${BOLD}${display}${NC}"
        if run_proxy_transpiler "$internal"; then
            echo -e "  ${GREEN}✓ ${display} OK${NC}"
        else
            echo -e "  ${RED}✗ ${display} FAILED${NC}"
            failed=$((failed + 1))
        fi
        echo ""
    done <<< "$transpilers"

    if [ $failed -gt 0 ]; then
        echo -e "${RED}${BOLD}$failed transpiler(s) failed.${NC}"
        return 1
    fi
    echo -e "${GREEN}${BOLD}All transpilers complete.${NC}"
    return 0
}

# Given a transpiler name from effortless.json, return the substrate folder
# name (= last path segment of RelativePath, with leading slash stripped).
# Empty string if not a substrate-y transpiler (e.g. airtable-to-rulebook).
transpiler_to_substrate() {
    local transpiler_name="$1"
    local ej
    ej=$(get_active_effortless_json)
    [ -z "$ej" ] && return 0
    python3 - "$ej" "$transpiler_name" <<'PYEOF'
import json, sys, os
ej_path, name = sys.argv[1], sys.argv[2]
with open(ej_path) as f:
    cfg = json.load(f)
t = next((x for x in cfg.get("ProjectTranspilers", []) if x["Name"] == name), None)
if not t:
    sys.exit(0)
rel = t.get("RelativePath", "").strip("/")
# A substrate-y transpiler writes into a folder that exists under
# execution-substrates/ in the repo root. RelativePath is the substrate folder.
repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) if False else None
# We can't easily know REPO_ROOT here; emit the candidate and let bash check.
if rel and "/" not in rel and not rel.startswith("effortless-rulebook"):
    print(rel)
PYEOF
}

# Check if ssotme-proxy is running on localhost:4242
proxy_is_running() {
    python3 -c "
import urllib.request
try:
    urllib.request.urlopen('http://localhost:4242/ping', timeout=2)
    print('true')
except:
    print('false')
" 2>/dev/null | grep -q true
}

# =============================================================================
# MENU DISPLAY
# =============================================================================
show_menu() {
    PROJECT_NAME=$(get_project_name)
    ACTIVE_DOMAIN=$(get_active_domain)

    echo ""
    echo -e "${BOLD}${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BOLD}${CYAN}║${NC}          ${BOLD}${WHITE}EXECUTION SUBSTRATE ORCHESTRATOR${NC}                  ${BOLD}${CYAN}║${NC}"
    echo -e "${BOLD}${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    local DOMAIN_PATH
    DOMAIN_PATH=$(find_domain_dir "$ACTIVE_DOMAIN" 2>/dev/null) || DOMAIN_PATH="$RULEBOOK_EXAMPLES_DIR/$ACTIVE_DOMAIN"
    echo -e "  Project:  ${WHITE}$PROJECT_NAME${NC}"
    printf "  Domain:   \033]8;;file://%s\033\\\\%b%s%b\033]8;;\033\\\\  \033[2m%s\033[0m\n" \
        "$DOMAIN_PATH" "$CYAN" "${ACTIVE_DOMAIN}" "$NC" "$DOMAIN_PATH"

    # Check proxy status and collect project transpilers
    PROJECT_TRANSPILERS=$(get_project_transpilers)
    PROXY_RUNNING=false
    if [ -n "$PROJECT_TRANSPILERS" ]; then
        proxy_is_running && PROXY_RUNNING=true
        if $PROXY_RUNNING; then
            echo -e "  Proxy:    ${DIM}localhost:4242${NC} ${GREEN}● live${NC}"
        else
            echo -e "  Proxy:    ${DIM}localhost:4242${NC} ${RED}● offline${NC}"
        fi
    fi

    echo ""
    echo -e "${BOLD}${WHITE}Select an option:${NC}"
    echo ""

    # --- BUILD (primary action when proxy transpilers exist) ---
    # Disabled transpilers (IsDisabled=true in effortless.json) get a
    # " (disabled)" suffix on the display name and render in DIM instead of
    # CYAN. They are still numbered so the user can pick them by number —
    # that path prompts for confirmation. BUILD ([B]) skips them.
    if [ -n "$PROJECT_TRANSPILERS" ]; then
        T_INDEX=1
        LEFT_NUM=""
        LEFT_DISPLAY=""
        LEFT_COLOR=""
        while IFS=$'\t' read -r internal display is_disabled; do
            if [ "$is_disabled" = "true" ]; then
                row_display="${display} (disabled)"
                row_color="$DIM"
            else
                row_display="$display"
                row_color="$CYAN"
            fi
            if [ -z "$LEFT_NUM" ]; then
                LEFT_NUM="$T_INDEX"
                LEFT_DISPLAY="$row_display"
                LEFT_COLOR="$row_color"
            else
                printf "    ${DIM}%2s.${NC} ${LEFT_COLOR}%-32s${NC}    ${DIM}%2s.${NC} ${row_color}%s${NC}\n" \
                    "$LEFT_NUM" "$LEFT_DISPLAY" "$T_INDEX" "$row_display"
                LEFT_NUM=""
                LEFT_DISPLAY=""
                LEFT_COLOR=""
            fi
            T_INDEX=$((T_INDEX + 1))
        done <<< "$PROJECT_TRANSPILERS"
        # Flush any trailing odd item in the left column
        if [ -n "$LEFT_NUM" ]; then
            printf "    ${DIM}%2s.${NC} ${LEFT_COLOR}%s${NC}\n" "$LEFT_NUM" "$LEFT_DISPLAY"
        fi
        echo ""
        if $PROXY_RUNNING; then
            echo -e "  ${GREEN}[B]${NC} ${BOLD}BUILD${NC} — regenerate AND test all ${WHITE}${PROJECT_NAME}${NC} substrates ${DIM}(default; opens report)${NC}"
        else
            echo -e "  ${RED}[B]${NC} ${BOLD}BUILD${NC} — ${RED}proxy offline${NC} — start it first:"
            echo -e "      ${DIM}ssotme-proxy/start.sh${NC}"
        fi
    fi

    echo -e "  ${MAGENTA}[V]${NC} ${BOLD}VIEW${NC} — open last HTML report for ${WHITE}${ACTIVE_DOMAIN}${NC}"
    echo -e "  ${CYAN}[W]${NC} ${BOLD}WEB${NC} — launch the React explorer ${DIM}(localhost:42440)${NC}"
    echo -e "  ${DIM}────────────────────────────────────────────────────────────${NC}"
    echo -e "  ${YELLOW}[P]${NC} ${BOLD}PICK${NC} — switch to a different rulebook ${DIM}(ontology)${NC}"
    echo -e "  ${YELLOW}[N]${NC} ${BOLD}NEW${NC} — create a new blank rulebook ${DIM}(ontology)${NC}"
    echo -e "  ${BLUE}[I]${NC} ${BOLD}IMPORT${NC} — pull a new rulebook from Airtable"
    echo -e "  ${RED}[C]${NC} ${BOLD}CLEAN${NC} — delete all generated files"
    echo -e "  ${YELLOW}[D]${NC} ${BOLD}DEV-OPS${NC} — database & tooling setup"
    echo -e "  ${YELLOW}[A]${NC} ${BOLD}ALL-DOMAINS${NC} — cross-domain build matrix ${DIM}(separate screen)${NC}"
    echo -e "  [${RED}Q${NC}] Quit"
    echo ""
}

# =============================================================================
# ACTION FUNCTIONS
# =============================================================================
: "${DOMAIN_SORT_MODE:=mtime-desc}"

_sort_mode_label() {
    case "$1" in
        mtime-desc) echo "recently opened" ;;
        mtime-asc)  echo "least recently opened" ;;
        name-asc)   echo "alphabetical" ;;
        name-desc)  echo "alphabetical reversed" ;;
        *)          echo "$1" ;;
    esac
}

_next_sort_mode() {
    case "$1" in
        mtime-desc) echo "name-asc" ;;
        name-asc)   echo "mtime-asc" ;;
        mtime-asc)  echo "name-desc" ;;
        name-desc)  echo "mtime-desc" ;;
        *)          echo "mtime-desc" ;;
    esac
}

action_select_domain() {
    CURRENT_DOMAIN=$(get_active_domain)

    while true; do
        echo ""
        echo -e "${BOLD}${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${BOLD}${CYAN}║${NC}              ${BOLD}${WHITE}SELECT ONTOLOGY${NC}                               ${BOLD}${CYAN}║${NC}"
        echo -e "${BOLD}${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
        echo ""
        echo -e "  Active: ${GREEN}${CURRENT_DOMAIN}${NC}"
        echo -e "  Sort:   ${DIM}$(_sort_mode_label "$DOMAIN_SORT_MODE")${NC}"
        echo ""

        # Build (domain<TAB>mtime) rows, then sort per mode.
        local _rows=()
        local _d _mt
        while IFS= read -r _d; do
            local _ddir
            _ddir=$(find_domain_dir "$_d" 2>/dev/null) || _ddir="$RULEBOOK_EXAMPLES_DIR/$_d"
            _mt=$(get_mtime "$_ddir")
            _rows+=("${_d}	${_mt:-0}")
        done < <(list_domains)

        local _sorted
        case "$DOMAIN_SORT_MODE" in
            mtime-desc) _sorted=$(printf '%s\n' "${_rows[@]}" | sort -t '	' -k2,2nr -k1,1) ;;
            mtime-asc)  _sorted=$(printf '%s\n' "${_rows[@]}" | sort -t '	' -k2,2n  -k1,1) ;;
            name-asc)   _sorted=$(printf '%s\n' "${_rows[@]}" | sort -t '	' -k1,1) ;;
            name-desc)  _sorted=$(printf '%s\n' "${_rows[@]}" | sort -t '	' -k1,1r) ;;
            *)          _sorted=$(printf '%s\n' "${_rows[@]}" | sort -t '	' -k2,2nr -k1,1) ;;
        esac

        DOMAINS_ARRAY=()
        local INDEX=1
        local domain mtime since
        while IFS=$'\t' read -r domain mtime; do
            [ -z "$domain" ] && continue
            DOMAINS_ARRAY+=("$domain")
            since=$(format_time_since "$mtime")
            if [ "$domain" = "$CURRENT_DOMAIN" ]; then
                echo -e "  ${GREEN}[$INDEX]${NC} ${GREEN}${domain}${NC} ${DIM}(active, ${since})${NC}"
            else
                echo -e "  ${CYAN}[$INDEX]${NC} ${domain} ${DIM}(${since})${NC}"
            fi
            INDEX=$((INDEX + 1))
        done <<< "$_sorted"

        DOMAINS_COUNT=${#DOMAINS_ARRAY[@]}

        echo ""
        echo -e "  ${YELLOW}[S]${NC} Change sort"
        echo -e "  ${RED}[Q]${NC} Cancel"
        echo ""

        read -p "  Select domain [1-$DOMAINS_COUNT, S, Q]: " DOMAIN_CHOICE

        case $DOMAIN_CHOICE in
            [Ss])
                DOMAIN_SORT_MODE=$(_next_sort_mode "$DOMAIN_SORT_MODE")
                continue
                ;;
            [Qq]|"")
                echo -e "  ${DIM}Cancelled - no changes made${NC}"
                echo ""
                return
                ;;
            [0-9]|[0-9][0-9])
                if [ "$DOMAIN_CHOICE" -ge 1 ] && [ "$DOMAIN_CHOICE" -le "$DOMAINS_COUNT" ]; then
                    NEW_DOMAIN="${DOMAINS_ARRAY[$((DOMAIN_CHOICE - 1))]}"
                    if [ "$NEW_DOMAIN" = "$CURRENT_DOMAIN" ]; then
                        # Re-opening the active domain still counts as opening it.
                        set_active_domain "$NEW_DOMAIN"
                        echo -e "  ${DIM}Already using this domain (bumped recently-opened time)${NC}"
                        echo ""
                        read -p "Press Enter to continue..."
                        return
                    fi
                    RULEBOOK="$(get_domain_rulebook_path "$NEW_DOMAIN")"
                    if [ ! -f "$RULEBOOK" ]; then
                        echo -e "${RED}No rulebook found at $RULEBOOK${NC}"
                        read -p "Press Enter to continue..."
                        return
                    fi
                    set_active_domain "$NEW_DOMAIN"
                    echo ""
                    echo -e "${BOLD}${GREEN}Switched to: ${WHITE}${NEW_DOMAIN}${NC}"
                    echo ""
                    read -p "  Run conformance tests now for ${NEW_DOMAIN}? [Y/n] " RUN_NOW
                    if [[ ! "$RUN_NOW" =~ ^[Nn]$ ]]; then
                        run_substrates ""
                        return
                    fi
                else
                    echo -e "${RED}Invalid selection: $DOMAIN_CHOICE${NC}"
                fi
                ;;
            *)
                echo -e "${RED}Invalid option: $DOMAIN_CHOICE${NC}"
                ;;
        esac
        echo ""
        read -p "Press Enter to continue..."
        return
    done
}

action_import_from_airtable() {
    if [ "$SSOTME_AVAILABLE" != true ]; then
        echo ""
        echo -e "${RED}Effortless CLI is not installed.${NC}"
        echo -e "Importing from Airtable requires the Effortless CLI."
        echo -e "Visit ${CYAN}https://www.effortlessapi.com${NC} for installation instructions."
        echo ""
        read -p "Press Enter to continue..."
        return
    fi

    echo ""
    echo -e "${BOLD}${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BOLD}${CYAN}║${NC}              ${BOLD}${WHITE}IMPORT FROM AIRTABLE${NC}                          ${BOLD}${CYAN}║${NC}"
    echo -e "${BOLD}${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "  This pulls a base from Airtable and creates a new local rulebook-example."
    echo -e "  After import the base becomes a standalone local ontology."
    echo ""

    read -p "  Enter Airtable base ID (e.g., appXXXXX) or [Q] to cancel: " BASE_ID

    case $BASE_ID in
        [Qq]|"")
            echo -e "  ${DIM}Cancelled${NC}"
            echo ""
            return
            ;;
    esac

    if [[ ! "$BASE_ID" =~ ^app[A-Za-z0-9]+ ]]; then
        echo -e "${RED}Invalid Base ID format. Airtable Base IDs start with 'app'.${NC}"
        read -p "Press Enter to continue..."
        return
    fi

    # Fetch the base name from Airtable via base-manager
    echo ""
    echo -e "${YELLOW}Fetching base name from Airtable...${NC}"
    BASE_NAME=$(python3 "$SCRIPT_DIR/base-manager.py" get-name "$BASE_ID" 2>/dev/null || echo "")

    if [ -z "$BASE_NAME" ]; then
        echo -e "${RED}Could not fetch base name from Airtable. Check your API key and base ID.${NC}"
        read -p "Press Enter to continue..."
        return
    fi

    # Derive a safe folder name from the base name
    DOMAIN_NAME=$(echo "$BASE_NAME" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//;s/-$//')

    DOMAIN_DIR="$RULEBOOK_EXAMPLES_DIR/$DOMAIN_NAME"
    RULEBOOK_DIR_NEW="$DOMAIN_DIR/effortless-rulebook"

    if [ -d "$DOMAIN_DIR" ]; then
        echo -e "${YELLOW}Domain folder already exists: ${WHITE}$DOMAIN_NAME${NC}"
        read -p "  Overwrite rulebook? [Y/n]: " OVERWRITE
        if [[ "$OVERWRITE" =~ ^[Nn]$ ]]; then
            echo -e "  ${DIM}Cancelled${NC}"
            read -p "Press Enter to continue..."
            return
        fi
    fi

    mkdir -p "$RULEBOOK_DIR_NEW"

    # Pull the rulebook from Airtable into the new domain folder
    RULEBOOK_FILENAME="${DOMAIN_NAME}-rulebook.json"
    echo ""
    echo -e "${YELLOW}Pulling rulebook from Airtable into ${WHITE}rulebook-examples/$DOMAIN_NAME/${NC}..."
    cd "$RULEBOOK_DIR_NEW"
    if ! effortless airtabletorulebook -o "$RULEBOOK_FILENAME" -account airtable -p "view=Grid view"; then
        echo -e "${RED}Failed to pull rulebook from Airtable.${NC}"
        read -p "Press Enter to continue..."
        return
    fi

    # Write effortless.json for this domain (Airtable pull disabled by default —
    # the rulebook JSON is authoritative; re-enable only with explicit consent).
    python3 -c "
import json
config = {
    'Name': '$BASE_NAME',
    'Description': 'Imported from Airtable base $BASE_ID',
    'Version': '1.0',
    'ProjectSettings': [
        {'Name': 'baseId', 'Value': '$BASE_ID', 'Description': 'Airtable base ID (used for re-import only)'}
    ],
    'ProjectTranspilers': [
        {
            'Name': 'airtabletorulebook',
            'RelativePath': '/effortless-rulebook',
            'CommandLine': 'airtable-to-rulebook -o $RULEBOOK_FILENAME -account airtable -p \"view=Grid view\"',
            'Enabled': False,
            'IsDisabled': True,
            'Description': 'Pull rulebook from Airtable [DISABLED: rulebook JSON is authoritative; re-enable only with explicit user consent]'
        },
        {
            'Name': 'rulebooktoairtable',
            'RelativePath': '/effortless-rulebook/push-to-airtable',
            'CommandLine': 'rulebook-to-airtable -i ../$RULEBOOK_FILENAME -account airtable -w 300000',
            'Enabled': False,
            'Description': 'Reverse-sync: push rulebook changes back to Airtable'
        },
        {
            'IsSSoTTranspiler': False,
            'Name': 'rulebooktopostgres',
            'RelativePath': '/effortless-postgres',
            'CommandLine': 'rulebook-to-postgres -i ../effortless-rulebook/$RULEBOOK_FILENAME',
            'IsDisabled': False,
            'Description': 'Generate Postgres schema + seed data from the rulebook'
        }
    ]
}
with open('$DOMAIN_DIR/effortless.json', 'w') as f:
    json.dump(config, f, indent=2)
print('Written effortless.json')
"

    # Switch active domain to the new import
    set_active_domain "$DOMAIN_NAME"

    echo ""
    echo -e "${BOLD}${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BOLD}${GREEN}║${NC}              ${BOLD}${WHITE}IMPORT COMPLETE${NC}                               ${BOLD}${GREEN}║${NC}"
    echo -e "${BOLD}${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "  Domain:   ${WHITE}$DOMAIN_NAME${NC}"
    echo -e "  Location: ${WHITE}rulebook-examples/$DOMAIN_NAME/${NC}"
    echo ""
    echo -e "  ${DIM}This is now a standalone local rulebook. Re-import is optional.${NC}"
    echo -e "  ${DIM}Run [A] to build and test substrates against the new rulebook.${NC}"
    echo ""
    read -p "Press Enter to continue..."
}

action_view_results() {
    echo ""
    echo -e "${BOLD}${MAGENTA}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BOLD}${MAGENTA}║${NC}              ${BOLD}${WHITE}GENERATING HTML REPORT${NC}                       ${BOLD}${MAGENTA}║${NC}"
    echo -e "${BOLD}${MAGENTA}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    # Note: We don't regenerate individual substrate reports here because:
    # 1. They were already generated during the test run
    # 2. Regenerating would overwrite meaningful logs with stale data (e.g., for skipped tests)
    # The orchestration report reads from the existing substrate-report.html files

    # Generate main orchestration report
    local domain
    domain=$(get_active_domain)
    local rulebook
    rulebook=$(get_domain_rulebook_path "$domain")
    python3 "$SCRIPT_DIR/generate-report.py" --rulebook "$rulebook"
    echo ""
    echo -e "${BOLD}${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BOLD}${GREEN}║${NC}              ${BOLD}${WHITE}REPORT GENERATED${NC}                              ${BOLD}${GREEN}║${NC}"
    echo -e "${BOLD}${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${CYAN}Opening HTML report in browser...${NC}"
    local _domain_dir
    _domain_dir=$(find_domain_dir "$domain" 2>/dev/null) || _domain_dir="$RULEBOOK_EXAMPLES_DIR/$domain"
    open "$_domain_dir/orchestration-report.html" 2>/dev/null || \
        xdg-open "$_domain_dir/orchestration-report.html" 2>/dev/null || \
        echo -e "  ${DIM}Report: $_domain_dir/orchestration-report.html${NC}"
    echo ""
    read -p "Press Enter to continue..."
}

action_clean() {
    SUBSTRATES=$(ls -d "$SUBSTRATES_DIR"/*/ 2>/dev/null | xargs -n1 basename)

    echo ""
    echo -e "${BOLD}${RED}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BOLD}${RED}║${NC}              ${BOLD}${WHITE}CLEANING ALL SUBSTRATES${NC}                       ${BOLD}${RED}║${NC}"
    echo -e "${BOLD}${RED}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    for substrate in $SUBSTRATES; do
        substrate_dir="$SUBSTRATES_DIR/$substrate"
        echo -e "${YELLOW}Cleaning ${substrate}...${NC}"

        # Try different clean methods in order of preference
        if [ -f "$substrate_dir/inject-into-${substrate}.py" ]; then
            # Most substrates have inject-into-*.py with --clean
            (cd "$substrate_dir" && python3 "inject-into-${substrate}.py" --clean 2>/dev/null) || true
        elif [ -f "$substrate_dir/clean.py" ]; then
            # YAML has a separate clean.py
            (cd "$substrate_dir" && python3 clean.py --clean 2>/dev/null) || true
        else
            echo -e "  ${DIM}No clean script found${NC}"
        fi
    done

    echo ""
    echo -e "${BOLD}${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BOLD}${GREEN}║${NC}              ${BOLD}${WHITE}CLEAN COMPLETE${NC}                                ${BOLD}${GREEN}║${NC}"
    echo -e "${BOLD}${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    read -p "Press Enter to continue..."
}

# =============================================================================
# WEB EXPLORER (React root explorer + generated rulebook editor)
# =============================================================================
action_run_web_portal() {
    local start_script="$PROJECT_ROOT/start.sh"
    if [ ! -f "$start_script" ]; then
        echo ""
        echo -e "${RED}start.sh not found at: $start_script${NC}"
        read -p "Press Enter to continue..."
        return
    fi
    echo ""
    echo -e "${CYAN}▶ ${BOLD}Launching the React explorer${NC} ${DIM}(Ctrl-C to return to menu)${NC}"
    echo ""
    bash "$start_script" --portal || true
    echo ""
    read -p "Press Enter to continue..."
}

# =============================================================================
# MORE OPTIONS MENU
# =============================================================================
action_new_rulebook() {
    echo ""
    echo -e "${BOLD}${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BOLD}${CYAN}║${NC}              ${BOLD}${WHITE}NEW RULEBOOK (ONTOLOGY)${NC}                       ${BOLD}${CYAN}║${NC}"
    echo -e "${BOLD}${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "  Creates a blank, self-contained ontology under ${WHITE}rulebook-examples/${NC}."
    echo -e "  Name will be slugified (lowercase, dashes). e.g. ${DIM}\"My Demo\" → my-demo${NC}"
    echo ""

    read -p "  Name for the new rulebook (or [Q] to cancel): " RAW_NAME
    case $RAW_NAME in
        [Qq]|"")
            echo -e "  ${DIM}Cancelled${NC}"
            echo ""
            return
            ;;
    esac

    DOMAIN_NAME=$(echo "$RAW_NAME" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//;s/-$//')
    if [ -z "$DOMAIN_NAME" ]; then
        echo -e "${RED}Could not derive a valid slug from '$RAW_NAME'.${NC}"
        read -p "Press Enter to continue..."
        return
    fi

    DOMAIN_DIR="$RULEBOOK_EXAMPLES_DIR/$DOMAIN_NAME"
    if [ -d "$DOMAIN_DIR" ]; then
        echo -e "${RED}A rulebook already exists at: ${WHITE}rulebook-examples/$DOMAIN_NAME/${NC}"
        echo -e "${DIM}Pick a different name, or use [P] to switch to it.${NC}"
        read -p "Press Enter to continue..."
        return
    fi

    RULEBOOK_FILENAME="${DOMAIN_NAME}-rulebook.json"
    RULEBOOK_DIR_NEW="$DOMAIN_DIR/effortless-rulebook"
    mkdir -p "$RULEBOOK_DIR_NEW"

    # Write a starter rulebook with one Hello-World table so build is non-empty.
    python3 - "$RULEBOOK_DIR_NEW/$RULEBOOK_FILENAME" "$RAW_NAME" <<'PYEOF'
import json, sys
out_path, display_name = sys.argv[1], sys.argv[2]
rb = {
    "$schema": "../../../effortless-rulebook/effortless-rulebook.json",
    "Name": display_name,
    "Description": f"Blank starter rulebook for {display_name}. Add your tables and fields here.",
    "Tables": [
        {
            "Name": "HelloWorld",
            "Description": "Starter table — replace with your own.",
            "schema": [
                {"Name": "id",      "type": "id",   "description": "Primary key"},
                {"Name": "name",    "type": "text", "description": "Display name"},
                {"Name": "created", "type": "date", "description": "Creation timestamp"}
            ],
            "data": []
        }
    ]
}
with open(out_path, "w") as f:
    json.dump(rb, f, indent=2)
print(f"Wrote {out_path}")
PYEOF

    # Write the project-level effortless.json (Airtable spokes disabled — JSON is authoritative).
    python3 - "$DOMAIN_DIR/effortless.json" "$RAW_NAME" "$RULEBOOK_FILENAME" <<'PYEOF'
import json, sys
out_path, display_name, rb_filename = sys.argv[1], sys.argv[2], sys.argv[3]
cfg = {
    "Name": display_name,
    "Description": f"Standalone rulebook for {display_name}.",
    "Version": "1.0",
    "ProjectSettings": [],
    "ProjectTranspilers": [
        {
            "Name": "airtabletorulebook",
            "RelativePath": "/effortless-rulebook",
            "CommandLine": f"airtable-to-rulebook -o {rb_filename} -account airtable -p \"view=Grid view\"",
            "Enabled": False,
            "IsDisabled": True,
            "Description": "Pull rulebook from Airtable [DISABLED: rulebook JSON is authoritative; re-enable only with explicit user consent]"
        },
        {
            "Name": "rulebooktoairtable",
            "RelativePath": "/effortless-rulebook/push-to-airtable",
            "CommandLine": f"rulebook-to-airtable -i ../{rb_filename} -account airtable -w 300000",
            "Enabled": False,
            "Description": "Reverse-sync: push rulebook changes back to Airtable"
        },
        {
            "IsSSoTTranspiler": False,
            "Name": "rulebooktopostgres",
            "RelativePath": "/effortless-postgres",
            "CommandLine": f"rulebook-to-postgres -i ../effortless-rulebook/{rb_filename}",
            "IsDisabled": False,
            "Description": "Generate Postgres schema + seed data from the rulebook"
        }
    ]
}
with open(out_path, "w") as f:
    json.dump(cfg, f, indent=2)
print(f"Wrote {out_path}")
PYEOF

    # Switch to the new rulebook so it's the active domain.
    set_active_domain "$DOMAIN_NAME"

    echo ""
    echo -e "${BOLD}${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BOLD}${GREEN}║${NC}              ${BOLD}${WHITE}NEW RULEBOOK CREATED${NC}                          ${BOLD}${GREEN}║${NC}"
    echo -e "${BOLD}${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "  Domain:   ${WHITE}$DOMAIN_NAME${NC} ${GREEN}(now active)${NC}"
    echo -e "  Location: ${WHITE}rulebook-examples/$DOMAIN_NAME/${NC}"
    echo -e "  Rulebook: ${WHITE}effortless-rulebook/$RULEBOOK_FILENAME${NC}"
    echo ""
    echo -e "  ${DIM}Edit the rulebook JSON to define your tables and formulas,${NC}"
    echo -e "  ${DIM}then return here and press [B] to build, [T] to test.${NC}"
    echo ""
    read -p "Press Enter to continue..."
}

# =============================================================================
# DEV-OPS ACTIONS
# =============================================================================
action_devops_menu() {
    while true; do
        echo ""
        echo -e "${BOLD}${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${BOLD}${CYAN}║${NC}                    ${BOLD}${WHITE}DEV-OPS MENU${NC}                           ${BOLD}${CYAN}║${NC}"
        echo -e "${BOLD}${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
        echo ""

        # PostgreSQL
        if $POSTGRES_AVAILABLE; then
            echo -e "  [${CYAN}I${NC}] Initialize PostgreSQL Database"
        else
            echo -e "  ${DIM}[I] Initialize PostgreSQL (not installed)${NC}"
        fi

        # Effortless CLI setup
        if [ "$SSOTME_AVAILABLE" = true ]; then
            echo -e "  ${DIM}[S] Effortless Setup (already installed)${NC}"
        else
            echo -e "  [${CYAN}S${NC}] Effortless Setup Instructions"
        fi

        echo ""
        echo -e "  ${DIM}────────────────────────────────────────${NC}"
        echo -e "  ${BOLD}Tool Status:${NC}"
        if [ "$SSOTME_AVAILABLE" = true ]; then
            echo -e "    Effortless: ${GREEN}Available${NC}"
        else
            echo -e "    Effortless: ${YELLOW}Not installed${NC} ${DIM}(Airtable sync disabled)${NC}"
        fi

        if $POSTGRES_AVAILABLE; then
            echo -e "    PostgreSQL: ${GREEN}Available${NC}"
        else
            echo -e "    PostgreSQL: ${YELLOW}Not installed${NC} ${DIM}(DB init disabled)${NC}"
        fi
        echo ""

        echo -e "  [${RED}Q${NC}] Back to main menu"
        echo ""

        read -p "Enter choice [I/S/Q]: " devops_choice

        case $devops_choice in
            [Ii])
                if $POSTGRES_AVAILABLE; then
                    action_init_postgres
                else
                    echo ""
                    echo -e "${RED}PostgreSQL is not installed.${NC}"
                    read -p "Press Enter to continue..."
                fi
                ;;
            [Ss])
                action_setup_effortless
                ;;
            [Qq]|"")
                return
                ;;
            *)
                echo ""
                echo -e "${RED}Invalid option: $devops_choice${NC}"
                sleep 1
                ;;
        esac
    done
}

action_all_domains_menu() {
    # Cross-domain build matrix. Lives in its own screen so the per-domain
    # menu stays focused on the active demo (see CLAUDE.md: app ≠ document).
    local driver="$SCRIPT_DIR/build-all-domains.sh"
    local status_dir="$SCRIPT_DIR/build-status"
    local report_md="$status_dir/REPORT.md"
    local summary_json="$status_dir/summary.json"

    while true; do
        echo ""
        echo -e "${BOLD}${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${BOLD}${CYAN}║${NC}                ${BOLD}${WHITE}ALL DOMAINS — BUILD MATRIX${NC}                  ${BOLD}${CYAN}║${NC}"
        echo -e "${BOLD}${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
        echo ""

        # Show current totals from summary.json if present.
        if [ -f "$summary_json" ]; then
            python3 - "$summary_json" <<'PYEOF'
import json, sys
with open(sys.argv[1]) as f:
    s = json.load(f)
t = s.get("totals", {})
gen = s.get("generated_at", "?")
print(f"  Last run: {gen}")
print(f"  Totals:   {t.get('PASS',0)} PASS · {t.get('PARSER',0)} PARSER · "
      f"{t.get('CONFIG',0)} CONFIG · {t.get('OTHER',0)} OTHER · "
      f"{t.get('NO_LOG',0)} NO_LOG")
PYEOF
        else
            echo -e "  ${DIM}No summary.json yet — run [B] to populate.${NC}"
        fi
        echo ""

        echo -e "  [${CYAN}B${NC}] ${BOLD}BUILD ALL${NC} — rebuild every demo ${DIM}(~25 min wall time)${NC}"
        echo -e "  [${CYAN}M${NC}] ${BOLD}BUILD MISSING${NC} — only demos without a log"
        echo -e "  [${CYAN}F${NC}] ${BOLD}BUILD FAILING${NC} — only demos last marked non-PASS"
        echo -e "  [${CYAN}R${NC}] ${BOLD}RE-RENDER REPORT${NC} — refresh REPORT.md from existing logs"
        echo -e "  [${MAGENTA}V${NC}] ${BOLD}VIEW REPORT${NC} — open ${WHITE}build-status/REPORT.md${NC}"
        echo -e "  [${RED}Q${NC}] Back to main menu"
        echo ""

        read -p "Enter choice [B/M/F/R/V/Q]: " ad_choice
        echo ""

        case $ad_choice in
            [Bb])
                bash "$driver"
                read -p "Press Enter to continue..."
                ;;
            [Mm])
                bash "$driver" --missing
                read -p "Press Enter to continue..."
                ;;
            [Ff])
                bash "$driver" --failing
                read -p "Press Enter to continue..."
                ;;
            [Rr])
                bash "$driver" --report-only
                read -p "Press Enter to continue..."
                ;;
            [Vv])
                if [ -f "$report_md" ]; then
                    if command -v open >/dev/null 2>&1; then
                        open "$report_md"
                    elif command -v xdg-open >/dev/null 2>&1; then
                        xdg-open "$report_md"
                    else
                        echo -e "${YELLOW}No 'open' or 'xdg-open' found. Report path:${NC}"
                        echo "  $report_md"
                        read -p "Press Enter to continue..."
                    fi
                else
                    echo -e "${YELLOW}No REPORT.md yet — run [B] / [M] / [R] first.${NC}"
                    sleep 1
                fi
                ;;
            [Qq]|"")
                return
                ;;
            *)
                echo -e "${RED}Invalid option: $ad_choice${NC}"
                sleep 1
                ;;
        esac
    done
}

action_setup_effortless() {
    echo ""
    echo -e "${BOLD}${CYAN}Effortless CLI Installation Instructions${NC}"
    echo ""
    echo -e "The Effortless CLI is required for:"
    echo -e "  ${DIM}-${NC} Pulling data from Airtable"
    echo -e "  ${DIM}-${NC} Regenerating code from rulebook changes"
    echo ""
    echo -e "${YELLOW}To install Effortless:${NC}"
    echo ""
    echo -e "  1. Visit: ${CYAN}https://www.effortlessapi.com${NC}"
    echo -e "  2. Follow the installation instructions for your platform"
    echo -e "  3. Run ${WHITE}effortless --version${NC} to verify installation"
    echo ""
    echo -e "${DIM}Note: You can still run substrate tests without Effortless using existing files.${NC}"
    echo ""
    read -p "Press Enter to continue..."
}

action_init_postgres() {
    if ! $POSTGRES_AVAILABLE; then
        echo ""
        echo -e "${RED}PostgreSQL (psql) is not installed or not in PATH.${NC}"
        echo ""
        echo -e "${YELLOW}To install PostgreSQL:${NC}"
        echo -e "  macOS:  ${WHITE}brew install postgresql${NC}"
        echo -e "  Ubuntu: ${WHITE}sudo apt install postgresql${NC}"
        echo ""
        read -p "Press Enter to continue..."
        return
    fi

    local _domain
    _domain=$(get_active_domain)
    local _db_name="erb_${_domain//-/_}"
    local _db_url="postgresql://postgres@localhost:5432/${_db_name}"
    local _domain_dir
    _domain_dir=$(find_domain_dir "$_domain" 2>/dev/null) || _domain_dir="$RULEBOOK_EXAMPLES_DIR/$_domain"
    local init_script="$_domain_dir/postgres-bootstrap/reset-rulebook-db.sh"

    echo ""
    echo -e "${BOLD}${CYAN}Initialize PostgreSQL Database for ${WHITE}${_domain}${NC}"
    echo ""
    echo -e "  Target DB: ${WHITE}${_db_name}${NC}"
    echo -e "  Script:    ${WHITE}${init_script}${NC}"
    echo ""

    if [ ! -f "$init_script" ]; then
        echo -e "${RED}Error: reset-rulebook-db.sh not found at $init_script${NC}"
        echo -e "${YELLOW}Run [B] BUILD first so rulebooktopostgres generates it.${NC}"
        read -p "Press Enter to continue..."
        return
    fi

    echo -e "${YELLOW}This will:${NC}"
    echo -e "  1. Create database ${_db_name} if missing"
    echo -e "  2. Drop and recreate tables, functions, views"
    echo -e "  3. Insert seed data from the rulebook"
    echo ""

    read -p "Proceed? [Y/n]: " confirm
    if [[ "$confirm" =~ ^[Nn]$ ]]; then
        echo "Cancelled."
        return
    fi

    echo ""
    createdb "$_db_name" 2>/dev/null || true
    bash "$init_script" "$_db_url"

    echo ""
    read -p "Press Enter to continue..."
}

# =============================================================================
# =============================================================================
# RUN SUBSTRATES — generate + test + regen report + open
# =============================================================================
# Always called as part of BUILD. There is no standalone "test" action — build
# IS test. See CLAUDE.md line 1.
run_substrates() {
    local RUN_SINGLE="$1"

    # Set domain-scoped paths and export them so all inject/take-test scripts
    # know where to read blank-tests, write test-answers, and find domain-scoped
    # generated artifacts (postgres SQL, xlsx workbook, entity-framework dir).
    local _domain
    _domain=$(get_active_domain)
    export ERB_DOMAIN_DIR
    ERB_DOMAIN_DIR=$(find_domain_dir "$_domain" 2>/dev/null) || ERB_DOMAIN_DIR="$RULEBOOK_EXAMPLES_DIR/$_domain"
    export ERB_TESTING_DIR="$ERB_DOMAIN_DIR/testing"
    export ERB_RULEBOOK_PATH="$(get_domain_rulebook_path "$_domain")"
    mkdir -p "$ERB_TESTING_DIR"

    # Per-domain Postgres DB: erb_<domain> (hyphens → underscores per PG ID
    # rules). This matches the category split in CLAUDE.md — the admin portal
    # lives in erb_admin_portal; each domain ("document") lives in its own
    # erb_<domain>. test-orchestrator.py refuses to run without DATABASE_URL.
    local _db_name="erb_${_domain//-/_}"
    export DATABASE_URL="postgresql://postgres@localhost:5432/${_db_name}"

    # Ensure the per-domain DB exists with current schema before tests query it.
    # Every domain has rulebooktopostgres registered now, so this script must
    # exist after a build — fail loudly if it doesn't.
    local _init_script="$ERB_DOMAIN_DIR/postgres-bootstrap/reset-rulebook-db.sh"
    if [ ! -f "$_init_script" ]; then
        echo -e "${RED}FAIL: per-domain reset-rulebook-db.sh missing for '${_domain}'.${NC}"
        echo -e "${RED}Expected: ${_init_script}${NC}"
        echo -e "${RED}Run BUILD first so rulebooktopostgres generates it.${NC}"
        return 1
    fi
    # createdb is a no-op when the DB already exists (we discard stderr only
    # for that specific case; psql errors below will still surface).
    createdb "$_db_name" 2>/dev/null || true
    echo -e "${DIM}[db] applying schema to ${_db_name} via $(basename "$(dirname "$_init_script")")/reset-rulebook-db.sh${NC}"
    if ! bash "$_init_script" "$DATABASE_URL" > /dev/null; then
        echo -e "${RED}FAIL: reset-rulebook-db.sh failed against ${DATABASE_URL}${NC}"
        return 1
    fi

    # Get list of valid substrates (those with inject or test scripts)
    SUBSTRATES=$(get_valid_substrates)
    SUBSTRATES_ARRAY=($SUBSTRATES)
    TOTAL_SUBSTRATES=${#SUBSTRATES_ARRAY[@]}

    # -----------------------------------------------------------------------------
    # Step 1: Generate answer key and blank test from database
    # -----------------------------------------------------------------------------
echo -e "${BOLD}${BLUE}┌──────────────────────────────────────────────────────────────┐${NC}"
echo -e "${BOLD}${BLUE}│${NC} ${BOLD}${WHITE}STEP 1:${NC} ${YELLOW}Generating answer key and blank test...${NC}              ${BOLD}${BLUE}│${NC}"
echo -e "${BOLD}${BLUE}└──────────────────────────────────────────────────────────────┘${NC}"
python3 -c "
import sys
sys.path.insert(0, '$SCRIPT_DIR')
from importlib.util import spec_from_loader, module_from_spec
from importlib.machinery import SourceFileLoader

# Load test-orchestrator module
spec = spec_from_loader('test_orchestrator', SourceFileLoader('test_orchestrator', '$SCRIPT_DIR/test-orchestrator.py'))
test_orch = module_from_spec(spec)
spec.loader.exec_module(test_orch)

# Load rulebook (no database connection needed - answer keys come from rulebook seed data)
rulebook = test_orch.load_rulebook()

# Run steps 1 and 2 (new generic functions)
all_answer_keys = test_orch.generate_all_answer_keys(rulebook)
test_orch.generate_all_blank_tests(all_answer_keys, rulebook)
"
echo ""

# -----------------------------------------------------------------------------
# Step 2: Run inject-substrate.sh for each substrate
# -----------------------------------------------------------------------------
echo -e "${BOLD}${BLUE}┌──────────────────────────────────────────────────────────────┐${NC}"
echo -e "${BOLD}${BLUE}│${NC} ${BOLD}${WHITE}STEP 2:${NC} ${YELLOW}Running inject + test for each substrate...${NC}         ${BOLD}${BLUE}│${NC}"
echo -e "${BOLD}${BLUE}└──────────────────────────────────────────────────────────────┘${NC}"
echo ""

# Determine which substrates to process.
if [ -n "$RUN_SINGLE" ]; then
    SUBSTRATES_TO_RUN="$RUN_SINGLE"
    TOTAL_TO_RUN=1
else
    SUBSTRATES_TO_RUN="$SUBSTRATES"
    TOTAL_TO_RUN=$TOTAL_SUBSTRATES
fi

# -----------------------------------------------------------------------------
# CONSOLIDATED ENGLISH PROMPT: Ask ONCE before running ALL substrates
# When running a single substrate, don't ask - user explicitly chose it
# -----------------------------------------------------------------------------
export ENGLISH_SKIP_LLM="false"

# Show English warning when: running ALL substrates OR explicitly running english
# Skip warning in CI mode or non-interactive shells.
# Only ask if the active project actually exercises the english substrate —
# i.e. "english" appears in SUBSTRATES_TO_RUN (which was already filtered by
# the project's effortless.json ProjectTranspilers in get_valid_substrates).
if ! $CI_MODE && [[ -t 0 ]] && [[ " $SUBSTRATES_TO_RUN " == *" english "* ]]; then
    ENGLISH_DIR="$SUBSTRATES_DIR/english"
    if [ -d "$ENGLISH_DIR" ]; then
        # Calculate time estimate based on rulebook size
        ESTIMATE=$(python3 -c "
import sys
sys.path.insert(0, '$SCRIPT_DIR')
from shared import load_rulebook, estimate_llm_time
import os
os.chdir('$PROJECT_ROOT/execution-substrates/english')
rb = load_rulebook()
print(estimate_llm_time(rb))
" 2>/dev/null || echo "?:??")

        echo ""
        echo -e "${BOLD}${MAGENTA}┌──────────────────────────────────────────────────────────────┐${NC}"
        echo -e "${BOLD}${MAGENTA}│${NC} ${BOLD}English Substrate Warning${NC}                                    ${BOLD}${MAGENTA}│${NC}"
        echo -e "${BOLD}${MAGENTA}└──────────────────────────────────────────────────────────────┘${NC}"
        echo -e "  The English substrate uses LLM calls."
        echo -e "  Estimated time: ${YELLOW}${ESTIMATE}${NC} (based on rulebook size)"
        echo ""
        read -p "  Run English substrate? [Y/n] " english_response
        if [[ "$english_response" =~ ^[Nn]$ ]]; then
            export ENGLISH_SKIP_LLM="true"
            echo -e "  ${DIM}English will use cached results${NC}"
        else
            echo -e "  ${GREEN}English will run (may take a while)${NC}"
        fi
        echo ""
    fi
fi

INJECT_RESULTS=""
COLOR_INDEX=0
CURRENT=0

# Array to store failed substrates (outputs stored in temp files)
FAILED_SUBSTRATES=""
FAILED_OUTPUTS_DIR=$(mktemp -d)
trap "rm -rf $FAILED_OUTPUTS_DIR" EXIT

# When iterating multiple substrates, suppress per-substrate browser pop-ups —
# the aggregate orchestration-report.html is opened at the end of the loop.
export ERB_NO_OPEN=1

for substrate in $SUBSTRATES_TO_RUN; do
    substrate_dir="$SUBSTRATES_DIR/$substrate"
    inject_script="$substrate_dir/inject-substrate.sh"
    CURRENT=$((CURRENT + 1))

    # Get color for this substrate
    COLOR="${SUBSTRATE_COLORS[$COLOR_INDEX]}"
    COLOR_INDEX=$(( (COLOR_INDEX + 1) % ${#SUBSTRATE_COLORS[@]} ))

    if [ -f "$inject_script" ]; then
        substrate_upper=$(echo "$substrate" | tr '[:lower:]' '[:upper:]')
        echo -e "${COLOR}╔══════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${COLOR}║${NC} ${BOLD}[$CURRENT/$TOTAL_TO_RUN]${NC} ${COLOR}▶ ${BOLD}${substrate_upper}${NC}"
        echo -e "${COLOR}╚══════════════════════════════════════════════════════════════╝${NC}"

        # Backup/restore mechanism to preserve successful results on failure
        # test-answers live under the domain testing folder, not the substrate tool dir
        test_answers_dir="$ERB_TESTING_DIR/$substrate/test-answers"
        test_answers_backup="$ERB_TESTING_DIR/$substrate/test-answers.bak"
        mkdir -p "$ERB_TESTING_DIR/$substrate"

        # Backup existing test-answers before clearing (if they exist and have files)
        if [ -d "$test_answers_dir" ] && [ "$(ls -A "$test_answers_dir" 2>/dev/null)" ]; then
            echo -e "  ${DIM}Backing up previous test-answers...${NC}"
            rm -rf "$test_answers_backup"
            cp -r "$test_answers_dir" "$test_answers_backup"
        fi

        # Clear test-answers for fresh run
        if [ -d "$test_answers_dir" ]; then
            rm -rf "$test_answers_dir"
        fi
        mkdir -p "$test_answers_dir"

        # Run script with real-time output AND capture for error reporting
        # Use tee to show output live while also saving to temp file
        # CRITICAL: Use || true to prevent set -e from exiting, then capture PIPESTATUS
        INJECT_TEMP_FILE=$(mktemp)
        START_TIME=$(python3 -c "import time; print(time.time())")
        # Run the script; with pipefail set, pipeline returns first non-zero exit code
        # The '|| true' prevents set -e from exiting, while PIPESTATUS still captures the real exit code
        bash "$inject_script" 2>&1 | tee "$INJECT_TEMP_FILE" || true
        INJECT_EXIT_CODE=${PIPESTATUS[0]}  # Capture IMMEDIATELY - must be first command after pipeline
        END_TIME=$(python3 -c "import time; print(time.time())")
        ELAPSED_TIME=$(python3 -c "print($END_TIME - $START_TIME)")
        INJECT_OUTPUT=$(cat "$INJECT_TEMP_FILE")
        rm -f "$INJECT_TEMP_FILE"

        # Check for SUBSTRATE_SKIPPED_BUT_GRADE signal (preserve timing from last run)
        PRESERVE_TIMING=false
        if echo "$INJECT_OUTPUT" | grep -q "SUBSTRATE_SKIPPED_BUT_GRADE"; then
            PRESERVE_TIMING=true
            echo -e "  ${YELLOW}○${NC} ${substrate}: ${YELLOW}Using previous answers (timing preserved)${NC}"
        fi

        if [ $INJECT_EXIT_CODE -eq 0 ]; then
            if ! $PRESERVE_TIMING; then
                INJECT_RESULTS="$INJECT_RESULTS$substrate:OK\n"
                echo -e "  ${GREEN}✓${NC} ${substrate}: ${GREEN}${BOLD}OK${NC}"
            fi
            # Success: delete backup (new results are good)
            rm -rf "$test_answers_backup"
        else
            INJECT_RESULTS="$INJECT_RESULTS$substrate:FAILED\n"
            echo -e "  ${RED}✗${NC} ${substrate}: ${RED}${BOLD}FAILED TO EXECUTE${NC}"
            # Store failure information
            FAILED_SUBSTRATES="$FAILED_SUBSTRATES $substrate"
            echo "$INJECT_OUTPUT" > "$FAILED_OUTPUTS_DIR/$substrate.txt"
            # Failure: restore backup to preserve previous successful results
            if [ -d "$test_answers_backup" ]; then
                echo -e "  ${YELLOW}↩${NC} Restoring previous test-answers from backup..."
                rm -rf "$test_answers_dir"
                mv "$test_answers_backup" "$test_answers_dir"
            fi

            # ═══════════════════════════════════════════════════════════════
            # FAIL LOUDLY: Pause and ask user if they want to continue
            # ═══════════════════════════════════════════════════════════════
            if ! $CI_MODE; then
                echo ""
                echo -e "${RED}╔════════════════════════════════════════════════════════════════╗${NC}"
                echo -e "${RED}║${NC}     ${BOLD}${RED}⚠️  SUBSTRATE FAILED: ${substrate_upper}${NC}                          ${RED}║${NC}"
                echo -e "${RED}╠════════════════════════════════════════════════════════════════╣${NC}"
                echo -e "${RED}║${NC} ${DIM}Last 10 lines of output:${NC}                                       ${RED}║${NC}"
                echo -e "${RED}╟────────────────────────────────────────────────────────────────╢${NC}"
                tail -10 "$FAILED_OUTPUTS_DIR/$substrate.txt" | while IFS= read -r line; do
                    # Truncate long lines and format
                    truncated="${line:0:60}"
                    printf "${RED}║${NC} %-60s ${RED}║${NC}\n" "$truncated"
                done
                echo -e "${RED}╠════════════════════════════════════════════════════════════════╣${NC}"
                echo -e "${RED}║${NC}  ${YELLOW}[C]${NC} Continue with remaining substrates                        ${RED}║${NC}"
                echo -e "${RED}║${NC}  ${RED}[S]${NC} Stop orchestration now                                    ${RED}║${NC}"
                echo -e "${RED}╚════════════════════════════════════════════════════════════════╝${NC}"
                echo ""
                read -p "  Choice [C/S]: " FAILURE_CHOICE
                case $FAILURE_CHOICE in
                    [Ss])
                        echo ""
                        echo -e "${RED}${BOLD}Orchestration stopped by user after failure.${NC}"
                        echo -e "Run ${WHITE}./orchestrate.sh${NC} to retry."
                        echo ""
                        # Still grade and save what we have before exiting
                        return 1
                        ;;
                    *)
                        echo ""
                        echo -e "${YELLOW}Continuing with remaining substrates...${NC}"
                        echo ""
                        ;;
                esac
            fi
        fi

        # Grade this substrate immediately
        python3 -c "
import sys
import json
import os
import glob
sys.path.insert(0, '$SCRIPT_DIR')
from importlib.util import spec_from_loader, module_from_spec
from importlib.machinery import SourceFileLoader

spec = spec_from_loader('test_orchestrator', SourceFileLoader('test_orchestrator', '$SCRIPT_DIR/test-orchestrator.py'))
test_orch = module_from_spec(spec)
spec.loader.exec_module(test_orch)

# Load all answer keys
all_answer_keys = {}
for entity_file in glob.glob(os.path.join(test_orch.ANSWER_KEYS_DIR, '*.json')):
    entity = os.path.basename(entity_file).replace('.json', '')
    with open(entity_file, 'r') as f:
        all_answer_keys[entity] = json.load(f)

# Load rulebook for grading
rulebook = test_orch.load_rulebook()

substrate = '$substrate'
inject_exit_code = $INJECT_EXIT_CODE
elapsed_seconds = $ELAPSED_TIME
preserve_timing = True if '$PRESERVE_TIMING' == 'true' else False

# Grade substrate (new generic function)
if inject_exit_code != 0:
    grades = test_orch.grade_substrate(substrate, all_answer_keys, rulebook)
    grades['error'] = 'FAILED TO EXECUTE (inject-substrate.sh returned non-zero)'
    grades['execution_failed'] = True
    error_msg = 'inject-substrate.sh returned non-zero exit code'
else:
    grades = test_orch.grade_substrate(substrate, all_answer_keys, rulebook)
    error_msg = None

# Add timing information (use previous timing if preserve_timing is True)
if preserve_timing:
    # Load previous timing from metadata
    metadata = test_orch.load_run_metadata(substrate)
    prev_run = metadata.get('last_successful_run') or metadata.get('last_run')
    if prev_run and 'duration_seconds' in prev_run:
        grades['elapsed_seconds'] = prev_run['duration_seconds']
        grades['timing_preserved'] = True
    else:
        grades['elapsed_seconds'] = elapsed_seconds
else:
    grades['elapsed_seconds'] = elapsed_seconds

# Update run metadata (tracks success/failure history)
success = inject_exit_code == 0
test_orch.update_run_metadata(substrate, grades, success, error_msg, preserve_timing=preserve_timing)

test_orch.generate_substrate_report(substrate, grades, rulebook)
test_orch.print_substrate_test_summary(substrate, grades, rulebook)

# Generate per-substrate HTML report using the substrate's custom script
# SKIP if preserve_timing=True (test was skipped) - keeps previous meaningful log intact
import subprocess
substrate_dir = os.path.join(test_orch.SUBSTRATES_DIR, substrate)
custom_script = os.path.join(substrate_dir, 'create-substrate-report.sh')
if os.path.exists(custom_script) and not preserve_timing:
    subprocess.run(['bash', 'create-substrate-report.sh'], cwd=substrate_dir, capture_output=True)

# Save grades to temp file for final summary
import pickle
grades_file = os.path.join(test_orch.TESTING_DIR, substrate, '.grades.pkl')
with open(grades_file, 'wb') as f:
    pickle.dump(grades, f)

# Also write score to a simple file for bash to check
score_file = os.path.join(test_orch.TESTING_DIR, substrate, '.score')
score = grades.get('score', -1)
with open(score_file, 'w') as f:
    f.write(str(score))
"
        # Check for 0% score and pause if so (similar to execution failure)
        score_file="$ERB_TESTING_DIR/$substrate/.score"
        if [ -f "$score_file" ]; then
            SCORE=$(cat "$score_file")
            rm -f "$score_file"  # Clean up

            # Check if score is 0 (using bc for float comparison)
            if echo "$SCORE == 0" | bc -l | grep -q 1; then
                # Only pause if execution itself succeeded (0% test score is the issue)
                if [ $INJECT_EXIT_CODE -eq 0 ] && ! $CI_MODE; then
                    echo ""
                    echo -e "${YELLOW}╔════════════════════════════════════════════════════════════════╗${NC}"
                    echo -e "${YELLOW}║${NC}     ${BOLD}${YELLOW}⚠️  TEST SCORE 0%: ${substrate_upper}${NC}                             ${YELLOW}║${NC}"
                    echo -e "${YELLOW}╠════════════════════════════════════════════════════════════════╣${NC}"
                    echo -e "${YELLOW}║${NC} ${DIM}Execution succeeded but all tests failed.${NC}                      ${YELLOW}║${NC}"
                    echo -e "${YELLOW}║${NC} ${DIM}This usually means test-answers are missing or stale.${NC}          ${YELLOW}║${NC}"
                    echo -e "${YELLOW}╠════════════════════════════════════════════════════════════════╣${NC}"
                    echo -e "${YELLOW}║${NC}  ${GREEN}[C]${NC} Continue with remaining substrates                        ${YELLOW}║${NC}"
                    echo -e "${YELLOW}║${NC}  ${RED}[S]${NC} Stop orchestration now                                    ${YELLOW}║${NC}"
                    echo -e "${YELLOW}╚════════════════════════════════════════════════════════════════╝${NC}"
                    echo ""
                    read -p "  Choice [C/S]: " SCORE_CHOICE
                    case $SCORE_CHOICE in
                        [Ss])
                            echo ""
                            echo -e "${YELLOW}${BOLD}Orchestration stopped by user after 0% score.${NC}"
                            echo -e "Run ${WHITE}./orchestrate.sh${NC} to retry."
                            echo ""
                            return 1
                            ;;
                        *)
                            echo ""
                            echo -e "${YELLOW}Continuing with remaining substrates...${NC}"
                            echo ""
                            ;;
                    esac
                fi
            fi
        fi

        # Add vertical spacing after each substrate for visual isolation
        printf '\n%.0s' {1..10}
    elif [ -f "$substrate_dir/take-test.sh" ] || [ -f "$substrate_dir/take-test.py" ]; then
        # Test-only substrate (no inject script, but has take-test)
        substrate_upper=$(echo "$substrate" | tr '[:lower:]' '[:upper:]')
        echo -e "${COLOR}╔══════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${COLOR}║${NC} ${BOLD}[$CURRENT/$TOTAL_TO_RUN]${NC} ${COLOR}▶ ${BOLD}${substrate_upper}${NC} ${DIM}(test-only)${NC}"
        echo -e "${COLOR}╚══════════════════════════════════════════════════════════════╝${NC}"

        # Setup test-answers directory (domain-scoped)
        test_answers_dir="$ERB_TESTING_DIR/$substrate/test-answers"
        test_answers_backup="$ERB_TESTING_DIR/$substrate/test-answers.bak"
        mkdir -p "$ERB_TESTING_DIR/$substrate"
        if [ -d "$test_answers_dir" ] && [ "$(ls -A "$test_answers_dir" 2>/dev/null)" ]; then
            rm -rf "$test_answers_backup"
            cp -r "$test_answers_dir" "$test_answers_backup"
        fi
        rm -rf "$test_answers_dir"
        mkdir -p "$test_answers_dir"

        # Run take-test script
        INJECT_TEMP_FILE=$(mktemp)
        START_TIME=$(python3 -c "import time; print(time.time())")
        if [ -f "$substrate_dir/take-test.sh" ]; then
            bash "$substrate_dir/take-test.sh" 2>&1 | tee "$INJECT_TEMP_FILE" || true
        else
            (cd "$substrate_dir" && python3 take-test.py) 2>&1 | tee "$INJECT_TEMP_FILE" || true
        fi
        INJECT_EXIT_CODE=${PIPESTATUS[0]}
        END_TIME=$(python3 -c "import time; print(time.time())")
        ELAPSED_TIME=$(python3 -c "print($END_TIME - $START_TIME)")
        INJECT_OUTPUT=$(cat "$INJECT_TEMP_FILE")
        rm -f "$INJECT_TEMP_FILE"

        PRESERVE_TIMING=false
        if [ $INJECT_EXIT_CODE -eq 0 ]; then
            INJECT_RESULTS="$INJECT_RESULTS$substrate:OK\n"
            echo -e "  ${GREEN}✓${NC} ${substrate}: ${GREEN}${BOLD}OK${NC}"
            rm -rf "$test_answers_backup"
        else
            INJECT_RESULTS="$INJECT_RESULTS$substrate:FAILED\n"
            echo -e "  ${RED}✗${NC} ${substrate}: ${RED}${BOLD}FAILED${NC}"
            FAILED_SUBSTRATES="$FAILED_SUBSTRATES $substrate"
            echo "$INJECT_OUTPUT" > "$FAILED_OUTPUTS_DIR/$substrate.txt"
            if [ -d "$test_answers_backup" ]; then
                rm -rf "$test_answers_dir"
                mv "$test_answers_backup" "$test_answers_dir"
            fi
        fi

        # Grade this substrate
        python3 -c "
import sys
import json
import os
import glob
sys.path.insert(0, '$SCRIPT_DIR')
from importlib.util import spec_from_loader, module_from_spec
from importlib.machinery import SourceFileLoader

spec = spec_from_loader('test_orchestrator', SourceFileLoader('test_orchestrator', '$SCRIPT_DIR/test-orchestrator.py'))
test_orch = module_from_spec(spec)
spec.loader.exec_module(test_orch)

all_answer_keys = {}
for entity_file in glob.glob(os.path.join(test_orch.ANSWER_KEYS_DIR, '*.json')):
    entity = os.path.basename(entity_file).replace('.json', '')
    with open(entity_file, 'r') as f:
        all_answer_keys[entity] = json.load(f)

rulebook = test_orch.load_rulebook()
substrate = '$substrate'
inject_exit_code = $INJECT_EXIT_CODE
elapsed_seconds = $ELAPSED_TIME

if inject_exit_code != 0:
    grades = test_orch.grade_substrate(substrate, all_answer_keys, rulebook)
    grades['error'] = 'FAILED TO EXECUTE'
    grades['execution_failed'] = True
else:
    grades = test_orch.grade_substrate(substrate, all_answer_keys, rulebook)

grades['elapsed_seconds'] = elapsed_seconds
test_orch.update_run_metadata(substrate, grades, inject_exit_code == 0, None, preserve_timing=False)
test_orch.generate_substrate_report(substrate, grades, rulebook)
test_orch.print_substrate_test_summary(substrate, grades, rulebook)

import pickle
grades_file = os.path.join(test_orch.TESTING_DIR, substrate, '.grades.pkl')
with open(grades_file, 'wb') as f:
    pickle.dump(grades, f)

score_file = os.path.join(test_orch.TESTING_DIR, substrate, '.score')
with open(score_file, 'w') as f:
    f.write(str(grades.get('score', -1)))
"
        printf '\n%.0s' {1..10}
    else
        echo -e "  ${YELLOW}○${NC} ${substrate}: ${DIM}SKIPPED (no inject or test script)${NC}"
        INJECT_RESULTS="$INJECT_RESULTS$substrate:SKIPPED\n"
    fi
done

# -----------------------------------------------------------------------------
# Step 3: Generate summary report
# -----------------------------------------------------------------------------
# Breathing room before summary
printf '\n%.0s' {1..5}
echo -e "${BOLD}${BLUE}┌──────────────────────────────────────────────────────────────┐${NC}"
echo -e "${BOLD}${BLUE}│${NC} ${BOLD}${WHITE}STEP 3:${NC} ${YELLOW}Generating summary report...${NC}                         ${BOLD}${BLUE}│${NC}"
echo -e "${BOLD}${BLUE}└──────────────────────────────────────────────────────────────┘${NC}"
python3 -c "
import sys
import json
import os
import pickle
sys.path.insert(0, '$SCRIPT_DIR')
from importlib.util import spec_from_loader, module_from_spec
from importlib.machinery import SourceFileLoader

spec = spec_from_loader('test_orchestrator', SourceFileLoader('test_orchestrator', '$SCRIPT_DIR/test-orchestrator.py'))
test_orch = module_from_spec(spec)
spec.loader.exec_module(test_orch)

# Load rulebook for reporting
rulebook = test_orch.load_rulebook()

# Collect grades from temp files
run_single = '$RUN_SINGLE'
if run_single:
    substrates = [run_single]
else:
    substrates = test_orch.get_substrates()

all_grades = {}
for substrate in substrates:
    grades_file = os.path.join(test_orch.TESTING_DIR, substrate, '.grades.pkl')
    if os.path.exists(grades_file):
        with open(grades_file, 'rb') as f:
            all_grades[substrate] = pickle.load(f)
        os.remove(grades_file)  # Clean up

# Generate summary report and print final table
if run_single:
    # For single substrate, just print the summary table (no full report)
    test_orch.print_final_summary_table(all_grades, rulebook)
else:
    test_orch.prune_stale_central_results(substrates)
    test_orch.generate_summary_report(all_grades, rulebook)
    test_orch.print_final_summary_table(all_grades, rulebook)
"
echo ""

# -----------------------------------------------------------------------------
# Step 4: Cleanup timing-only changes before generating report
# -----------------------------------------------------------------------------
# Revert files where ONLY duration_seconds changed (no real test result changes)
# This prevents noise in git history from timing variations
python3 -c "
import sys
sys.path.insert(0, '$SCRIPT_DIR')
from importlib.util import spec_from_loader, module_from_spec
from importlib.machinery import SourceFileLoader

spec = spec_from_loader('test_orchestrator', SourceFileLoader('test_orchestrator', '$SCRIPT_DIR/test-orchestrator.py'))
test_orch = module_from_spec(spec)
spec.loader.exec_module(test_orch)

test_orch.cleanup_unchanged_files()
"

# -----------------------------------------------------------------------------
# Step 5: Generate HTML Report
# -----------------------------------------------------------------------------
echo -e "${BOLD}${BLUE}┌──────────────────────────────────────────────────────────────┐${NC}"
echo -e "${BOLD}${BLUE}│${NC} ${BOLD}${WHITE}STEP 5:${NC} ${YELLOW}Generating HTML report...${NC}                            ${BOLD}${BLUE}│${NC}"
echo -e "${BOLD}${BLUE}└──────────────────────────────────────────────────────────────┘${NC}"
_active_domain=$(get_active_domain)
python3 "$SCRIPT_DIR/generate-report.py" \
    --rulebook "$(get_domain_rulebook_path "$_active_domain")"
echo ""

# -----------------------------------------------------------------------------
# Step 6: Show Failed Substrates Summary (if any)
# -----------------------------------------------------------------------------
# Trim leading space from FAILED_SUBSTRATES
FAILED_SUBSTRATES=$(echo "$FAILED_SUBSTRATES" | xargs)
FAILED_COUNT=$(echo "$FAILED_SUBSTRATES" | wc -w | tr -d ' ')

if [ -n "$FAILED_SUBSTRATES" ]; then
    printf '\n%.0s' {1..3}
    echo -e "${BOLD}${RED}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BOLD}${RED}║${NC}           ${BOLD}${WHITE}⚠️  FAILED TO EXECUTE ($FAILED_COUNT substrates)${NC}              ${BOLD}${RED}║${NC}"
    echo -e "${BOLD}${RED}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    for failed_substrate in $FAILED_SUBSTRATES; do
        failed_upper=$(echo "$failed_substrate" | tr '[:lower:]' '[:upper:]')
        echo -e "${RED}┌──────────────────────────────────────────────────────────────┐${NC}"
        echo -e "${RED}│${NC} ${BOLD}${RED}✗ ${failed_upper}${NC} ${DIM}(FAILED TO EXECUTE)${NC}"
        echo -e "${RED}├──────────────────────────────────────────────────────────────┤${NC}"
        
        # Show the captured output (last 20 lines to keep it manageable)
        echo -e "${DIM}Output (last 20 lines):${NC}"
        if [ -f "$FAILED_OUTPUTS_DIR/$failed_substrate.txt" ]; then
            tail -20 "$FAILED_OUTPUTS_DIR/$failed_substrate.txt" | while IFS= read -r line; do
                echo -e "  ${DIM}│${NC} $line"
            done
        fi
        
        echo -e "${RED}└──────────────────────────────────────────────────────────────┘${NC}"
        echo ""
    done
    
    # List all failed substrates on one line for easy copy/paste
    echo -e "${RED}${BOLD}Failed substrates:${NC} $FAILED_SUBSTRATES"
    echo ""
fi

# -----------------------------------------------------------------------------
# Summary
# -----------------------------------------------------------------------------
if [ -n "$FAILED_SUBSTRATES" ]; then
    echo -e "${BOLD}${YELLOW}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BOLD}${YELLOW}║${NC}         ${BOLD}${WHITE}ORCHESTRATION COMPLETE (WITH FAILURES)${NC}            ${BOLD}${YELLOW}║${NC}"
    echo -e "${BOLD}${YELLOW}╚════════════════════════════════════════════════════════════╝${NC}"
else
    echo -e "${BOLD}${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BOLD}${GREEN}║${NC}              ${BOLD}${WHITE}ORCHESTRATION COMPLETE${NC}                       ${BOLD}${GREEN}║${NC}"
    echo -e "${BOLD}${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
fi
echo ""
echo -e "${CYAN}Results written to:${NC}"
if [ -n "$RUN_SINGLE" ]; then
    echo -e "  ${DIM}•${NC} Test results:  ${WHITE}$ERB_DOMAIN_DIR/testing/$RUN_SINGLE/test-results.md${NC}"
else
    echo -e "  ${DIM}•${NC} Test results:  ${WHITE}$ERB_DOMAIN_DIR/testing/*/test-results.md${NC}"
    echo -e "  ${DIM}•${NC} Summary:       ${WHITE}orchestration/all-tests-results.md${NC}"
fi
echo -e "  ${DIM}•${NC} HTML Report:   ${WHITE}$ERB_DOMAIN_DIR/orchestration-report.html${NC}"
echo ""

# Open browser (skip in CI mode)
if ! $CI_MODE; then
    echo -e "${CYAN}Opening HTML report in browser...${NC}"
    open "$ERB_DOMAIN_DIR/orchestration-report.html"
    echo ""
fi

# Return failure status (don't exit, let caller handle)
if [ -n "$FAILED_SUBSTRATES" ]; then
    echo -e "${RED}${BOLD}⚠️  $FAILED_COUNT substrate(s) failed to execute: $FAILED_SUBSTRATES${NC}"
    return 1
fi
return 0
}

# =============================================================================
# MAIN LOOP
# =============================================================================

# DOCKER/CI MODE: Run all substrates non-interactively and exit
if $CI_MODE; then
    echo ""
    echo -e "${BOLD}${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BOLD}${CYAN}║${NC}          ${BOLD}${WHITE}EXECUTION SUBSTRATE ORCHESTRATOR${NC}                  ${BOLD}${CYAN}║${NC}"
    echo -e "${BOLD}${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    if $DOCKER_MODE; then
        echo -e "${BOLD}Running in Docker mode - executing all substrates...${NC}"
        echo ""
        # The rulebook JSON on disk IS the source of truth. There is no cache
        # to "set up from" — substrates regenerate deterministically from it.
    else
        echo -e "${BOLD}Running in CI mode - executing all substrates...${NC}"
    fi

    run_substrates ""
    EXIT_CODE=$?

    # In Docker mode, print a summary of where to find results
    if $DOCKER_MODE; then
        echo ""
        echo -e "${BOLD}${GREEN}════════════════════════════════════════════════════════════════${NC}"
        echo -e "${BOLD}${GREEN}  Docker execution complete!${NC}"
        echo -e "${BOLD}${GREEN}════════════════════════════════════════════════════════════════${NC}"
        echo ""
        echo -e "  ${BOLD}Reports generated:${NC}"
        echo -e "    • rulebook-examples/$(get_active_domain)/orchestration-report.html"
        echo -e "    • orchestration/all-tests-results.md"
        echo -e "    • execution-substrates/*/substrate-report.html"
        echo ""
        echo -e "  ${DIM}(Reports are in your mounted volume - accessible from host)${NC}"
        echo ""
    fi

    exit $EXIT_CODE
fi

# Start ssotme-proxy before entering the interactive menu if it's not running
PROJECT_TRANSPILERS=$(get_project_transpilers)
if [ -n "$PROJECT_TRANSPILERS" ]; then
    if ! proxy_is_running; then
        echo -e "${CYAN}Starting ssotme-proxy on localhost:4242...${NC}"
        bash "$PROJECT_ROOT/ssotme-proxy/start.sh" > /dev/null 2>&1 &
        sleep 2
        if proxy_is_running; then
            echo -e "${GREEN}✓ ssotme-proxy started${NC}"
        else
            echo -e "${YELLOW}⚠ ssotme-proxy failed to start. You can start it manually with:${NC}"
            echo -e "  ${DIM}bash $PROJECT_ROOT/ssotme-proxy/start.sh &${NC}"
        fi
        sleep 1
    fi
fi

# Interactive menu loop
while true; do
    show_menu

    # Determine default action
    PROJECT_TRANSPILERS=$(get_project_transpilers)
    if [ -n "$PROJECT_TRANSPILERS" ]; then
        DEFAULT_CHOICE="B"
    else
        DEFAULT_CHOICE="V"
    fi

    if [ -n "$PROJECT_TRANSPILERS" ]; then
        read -p "Enter choice [1-$(echo "$PROJECT_TRANSPILERS" | wc -l | tr -d ' '), B, V, W, P, N, I, C, D, A, Q] (default: $DEFAULT_CHOICE): " USER_CHOICE
    else
        read -p "Enter choice [V, W, P, N, I, C, D, A, Q] (default: $DEFAULT_CHOICE): " USER_CHOICE
    fi

    if [ -z "$USER_CHOICE" ]; then
        USER_CHOICE="$DEFAULT_CHOICE"
    fi

    case $USER_CHOICE in
        [Bb])
            echo ""
            if [ -n "$PROJECT_TRANSPILERS" ]; then
                if proxy_is_running; then
                    run_project_transpilers
                    # Building without testing is meaningless — every rebuild
                    # MUST re-run conformance tests, regenerate the report, and
                    # open it. run_substrates "" handles all three.
                    echo ""
                    echo -e "${BOLD}${CYAN}═══ Running conformance tests on rebuilt substrates ═══${NC}"
                    echo ""
                    run_substrates ""
                else
                    echo -e "${RED}ssotme-proxy is offline.${NC} Start it with:"
                    echo -e "  ${WHITE}python3 $PROJECT_ROOT/ssotme-proxy/server.py &${NC}"
                    echo ""
                    read -p "Press Enter to continue..."
                fi
            else
                echo -e "${YELLOW}No proxy transpilers configured for this project.${NC}"
                sleep 1
            fi
            ;;
        [0-9]|[0-9][0-9])
            if [ -n "$PROJECT_TRANSPILERS" ]; then
                TRANSPILER_INDEX=0
                SELECTED_NAME=""
                SELECTED_DISPLAY=""
                SELECTED_DISABLED=""
                while IFS=$'\t' read -r internal display is_disabled; do
                    TRANSPILER_INDEX=$((TRANSPILER_INDEX + 1))
                    if [ "$TRANSPILER_INDEX" = "$USER_CHOICE" ]; then
                        SELECTED_NAME="$internal"
                        SELECTED_DISPLAY="$display"
                        SELECTED_DISABLED="$is_disabled"
                    fi
                done <<< "$PROJECT_TRANSPILERS"
                TRANSPILER_COUNT=$(echo "$PROJECT_TRANSPILERS" | wc -l | tr -d ' ')
                if [ -z "$SELECTED_NAME" ]; then
                    echo ""
                    echo -e "${RED}Option ${USER_CHOICE} is out of range — there are only ${TRANSPILER_COUNT} transpilers (1-${TRANSPILER_COUNT}).${NC}"
                    echo -e "${DIM}Pick a number from the menu above, or one of the letter options.${NC}"
                    sleep 2
                    continue
                fi
                # If the picked transpiler is disabled in effortless.json, ask
                # for explicit confirmation before running it. The flag is
                # there for a reason (CLAUDE.md: airtabletorulebook is disabled
                # by default so a routine build can't overwrite the rulebook
                # JSON). One-shot manual run is fine — but only on purpose.
                if [ "$SELECTED_DISABLED" = "true" ]; then
                    echo ""
                    echo -e "${YELLOW}⚠  ${SELECTED_DISPLAY} is marked IsDisabled=true in effortless.json.${NC}"
                    echo -e "${DIM}It is skipped by [B] BUILD on purpose. Running it once now will not change the flag.${NC}"
                    read -p "Run it anyway? [y/N]: " CONFIRM_DISABLED
                    if [ "$CONFIRM_DISABLED" != "y" ] && [ "$CONFIRM_DISABLED" != "Y" ]; then
                        echo -e "${DIM}Skipped.${NC}"
                        sleep 1
                        continue
                    fi
                fi
                if [ -n "$SELECTED_NAME" ]; then
                    echo ""
                    if proxy_is_running; then
                        echo -e "${CYAN}▶ ${BOLD}${SELECTED_DISPLAY}${NC} ${DIM}(#${USER_CHOICE})${NC}"
                        if run_proxy_transpiler "$SELECTED_NAME"; then
                            echo -e "  ${GREEN}✓ ${SELECTED_DISPLAY} OK${NC}"
                            # BUILD = generate + test + regen report + open.
                            # No exceptions, no conditional skips. If the
                            # transpiler doesn't map to a substrate with a
                            # take-test.sh, that's a bug to fix — fail loudly.
                            CANDIDATE_SUB=$(transpiler_to_substrate "$SELECTED_NAME")
                            if [ -z "$CANDIDATE_SUB" ]; then
                                echo -e "${RED}FAIL: transpiler '${SELECTED_NAME}' does not map to a substrate folder.${NC}"
                                echo -e "${RED}Every project transpiler must write into a substrate under execution-substrates/.${NC}"
                                exit 1
                            fi
                            if [ ! -f "$SUBSTRATES_DIR/$CANDIDATE_SUB/take-test.sh" ]; then
                                echo -e "${RED}FAIL: substrate '${CANDIDATE_SUB}' has no take-test.sh.${NC}"
                                echo -e "${RED}Every substrate MUST have a take-test.sh. Add one — do not skip the test.${NC}"
                                echo -e "${RED}Expected: ${SUBSTRATES_DIR}/${CANDIDATE_SUB}/take-test.sh${NC}"
                                exit 1
                            fi
                            echo ""
                            echo -e "${BOLD}${CYAN}═══ Running conformance test on ${CANDIDATE_SUB} ═══${NC}"
                            echo ""
                            run_substrates "$CANDIDATE_SUB"
                        else
                            echo -e "  ${RED}✗ ${SELECTED_DISPLAY} FAILED${NC}"
                            exit 1
                        fi
                    else
                        echo -e "${RED}ssotme-proxy is offline.${NC} Start it with:"
                        echo -e "  ${WHITE}python3 $PROJECT_ROOT/ssotme-proxy/server.py &${NC}"
                    fi
                    echo ""
                    read -p "Press Enter to continue..."
                else
                    echo ""
                    echo -e "${RED}Number ${USER_CHOICE} matched no transpiler (unreachable — bug).${NC}"
                    sleep 2
                fi
            else
                echo ""
                echo -e "${RED}You typed a number (${USER_CHOICE}), but this project has no transpilers configured.${NC}"
                echo -e "${DIM}Use [N] to create a new project, or [P] to switch to one with transpilers.${NC}"
                sleep 2
            fi
            ;;
        [Vv])
            action_view_results
            ;;
        [Ww])
            action_run_web_portal
            ;;
        [Pp])
            action_select_domain
            ;;
        [Nn])
            action_new_rulebook
            ;;
        [Ii])
            action_import_from_airtable
            ;;
        [Cc])
            action_clean
            ;;
        [Dd])
            action_devops_menu
            ;;
        [Aa])
            action_all_domains_menu
            ;;
        [Qq])
            echo ""
            exit 0
            ;;
        *)
            echo ""
            echo -e "${RED}'${USER_CHOICE}' is not a valid menu choice.${NC}"
            if [ -n "$PROJECT_TRANSPILERS" ]; then
                TRANSPILER_COUNT=$(echo "$PROJECT_TRANSPILERS" | wc -l | tr -d ' ')
                echo -e "${DIM}Valid choices: 1-${TRANSPILER_COUNT} (transpilers), B (build all), V, W, P, N, I, C, D, A, Q.${NC}"
            else
                echo -e "${DIM}Valid choices: V, W, P, N, I, C, D, A, Q.${NC}"
            fi
            sleep 2
            ;;
    esac
done
