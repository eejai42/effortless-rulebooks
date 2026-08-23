# // Airtable Change Watcher & Rebuild Script
# //
# // Usage: ./rebuild-on-trigger.sh [--once]
# //
# // Listens for changes at the airtable-bridge endpoint (baseId read from ssotme.json)
# // URL: https://airtable-bridge-cmvbd4phczmeg.aws-us-east-2.controlplane.us/check/{baseId}/raw
# //
# // When {"changed":true} is returned, the payload contains:
# //   - .headers.authorization: "Bearer pat..." - the Airtable PAT to use
# //   - .body.commitMessage: the git commit subject
# //   - .body.notes: additional notes for the commit body
# //
# // The script then:
# //   1. Extracts the PAT and exports it as AIRTABLE_API_KEY
# //   2. Runs buildall.sh (effortless transpilers, init-db, etc.)
# //   3. Commits with the message/notes from the payload
# //   4. POSTs the full output back to /result/{baseId} with success/fail status
# //   5. Loops and listens for more changes
#!/bin/bash

# Note: This script is intended to run forever. Do NOT use `set -e` (errexit),
# because any transient failure (curl/network, effortless build, db init, git commit)
# would terminate the watcher loop.
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

log() {
    # ISO-ish timestamp for easier tailing/grepping
    # IMPORTANT: write to stdout so logs can't "disappear" if stderr isn't visible.
    printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

log_err() {
    printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*" >&2
}

banner() {
    # Big, visually obvious marker in logs (stdout).
    local msg="$*"
    echo ""
    echo "================================================================================"
    echo "== ${msg}"
    echo "================================================================================"
}

try() {
    # Usage: try "label" command [args...]
    # Runs the command, streams output, and if it fails prints the captured output
    # again with a clear failure banner. Returns the command's exit code.
    # Also accumulates output in BUILD_OUTPUT for posting back to server.
    local label="$1"
    shift

    local tmp rc
    tmp="$(mktemp -t rebuild-step.XXXXXX)"

    log "RUN: ${label}"
    append_output "=== RUN: ${label} ==="
    "$@" 2>&1 | tee "$tmp"
    rc=${PIPESTATUS[0]}

    # Append captured output to accumulator
    append_output "$(cat "$tmp")"

    if (( rc != 0 )); then
        log_err "ERROR: ${label} failed (exit ${rc}). Output:"
        sed 's/^/  | /' "$tmp" >&2
        log_err "WARN: continuing watcher loop despite failure."
        append_output "ERROR: ${label} failed (exit ${rc})"
    else
        # Make success explicit even when the command produces no output.
        log "OK: ${label}"
        append_output "OK: ${label}"
    fi

    rm -f "$tmp"
    return $rc
}

run_in_repo_root() {
    (cd "$REPO_ROOT" && "$@")
}

# Set the API key in ssotme.json ProjectSettings
# Renames _apikey_ to apikey and sets the value
set_ssotme_apikey() {
    local apikey="$1"
    local ssotme_file="${REPO_ROOT}/ssotme.json"
    
    if [[ ! -f "$ssotme_file" ]]; then
        log_err "ERROR: ssotme.json not found at: $ssotme_file"
        return 1
    fi
    
    if command -v jq >/dev/null 2>&1; then
        local tmp_file="${ssotme_file}.tmp"
        jq --arg key "$apikey" '
            .ProjectSettings = [
                .ProjectSettings[] | 
                if .Name == "_apikey_" then 
                    .Name = "apikey" | .Value = $key 
                else . end
            ]
        ' "$ssotme_file" > "$tmp_file" && mv "$tmp_file" "$ssotme_file"
    else
        python3 -c "
import json
with open('${ssotme_file}', 'r') as f:
    data = json.load(f)
for setting in data.get('ProjectSettings', []):
    if setting.get('Name') == '_apikey_':
        setting['Name'] = 'apikey'
        setting['Value'] = '''${apikey}'''
        break
with open('${ssotme_file}', 'w') as f:
    json.dump(data, f, indent=2)
"
    fi
}

# Redact API key to a fixed placeholder and rename back to _apikey_
redact_ssotme_apikey() {
    local ssotme_file="${REPO_ROOT}/ssotme.json"
    local placeholder="pat123xyz...a0b1c1234"
    
    if [[ ! -f "$ssotme_file" ]]; then
        log_err "ERROR: ssotme.json not found at: $ssotme_file"
        return 1
    fi
    
    if command -v jq >/dev/null 2>&1; then
        local tmp_file="${ssotme_file}.tmp"
        jq --arg ph "$placeholder" '
            .ProjectSettings = [
                .ProjectSettings[] | 
                if .Name == "apikey" then 
                    .Name = "_apikey_" | .Value = $ph
                else . end
            ]
        ' "$ssotme_file" > "$tmp_file" && mv "$tmp_file" "$ssotme_file"
    else
        python3 -c "
import json
with open('${ssotme_file}', 'r') as f:
    data = json.load(f)
for setting in data.get('ProjectSettings', []):
    if setting.get('Name') == 'apikey':
        setting['Name'] = '_apikey_'
        setting['Value'] = 'pat123xyz...a0b1c1234'
        break
with open('${ssotme_file}', 'w') as f:
    json.dump(data, f, indent=2)
"
    fi
}

# Read baseId from ssotme.json
get_base_id() {
    local ssotme_file="${REPO_ROOT}/ssotme.json"
    if [[ ! -f "$ssotme_file" ]]; then
        log_err "ERROR: ssotme.json not found at: $ssotme_file"
        return 1
    fi
    
    if command -v jq >/dev/null 2>&1; then
        jq -er '.ProjectSettings[] | select(.Name == "baseId") | .Value' "$ssotme_file"
    else
        python3 -c "
import json
with open('${ssotme_file}', 'r') as f:
    data = json.load(f)
for setting in data.get('ProjectSettings', []):
    if setting.get('Name') == 'baseId':
        print(setting.get('Value', ''))
        break
"
    fi
}

# URL for checking changes - used by check_for_changes and main loop
BASE_ID="$(get_base_id)" || { log_err "FATAL: Could not read baseId from ssotme.json"; exit 1; }
BRIDGE_BASE_URL="https://airtable-bridge-cmvbd4phczmeg.aws-us-east-2.controlplane.us"
CHECK_URL="${BRIDGE_BASE_URL}/check/${BASE_ID}/raw"
RESULT_URL="${BRIDGE_BASE_URL}/result/${BASE_ID}"
log "Using baseId: ${BASE_ID}"
log "Check URL: ${CHECK_URL}"
log "Result URL: ${RESULT_URL}"

# Global variables to store message/notes from check payload
CHANGE_MESSAGE=""
CHANGE_NOTES=""
VERSION_NAME=""
AIRTABLE_PAT=""
CUSTOMIZATIONS_JSON=""

# Global variable to accumulate output for posting back to server
BUILD_OUTPUT=""

# Append to build output accumulator
append_output() {
    BUILD_OUTPUT+="$1"$'\n'
}

# Write customizations from payload to the appropriate b-files
# Maps customizationType to file names:
#   Schema    -> 01b-customize-schema.sql
#   Functions -> 02b-customize-functions.sql
#   Views     -> 03b-customize-views.sql
#   RLS       -> 04b-customize-policies.sql
#   Data      -> 05b-customize-data.sql
write_customizations() {
    local customizations_json="$1"
    local postgres_dir="${REPO_ROOT}/postgres"

    if [[ -z "$customizations_json" || "$customizations_json" == "null" || "$customizations_json" == "[]" ]]; then
        log "No customizations in payload to write"
        return 0
    fi

    log "Writing customizations to effortless-platform/postgres/*.sql files..."
    append_output "=== Writing customizations ==="

    # Write JSON to a temp file to avoid shell escaping issues
    local json_tmp="${REPO_ROOT}/devops/customizations-tmp.json"
    echo "$customizations_json" > "$json_tmp"

    # Use Python to write customizations (handles JSON properly and avoids subshell issues)
    local write_output
    write_output="$(CUSTOMIZATIONS_FILE="$json_tmp" POSTGRES_DIR="$postgres_dir" python3 << 'PYEOF'
import json
import os
import sys
import base64

customizations_file = os.environ.get('CUSTOMIZATIONS_FILE', '')
postgres_dir = os.environ.get('POSTGRES_DIR', '')

if not customizations_file:
    print("ERROR: CUSTOMIZATIONS_FILE not set", file=sys.stderr)
    sys.exit(1)

with open(customizations_file, 'r') as f:
    customizations_json = f.read()

type_to_file = {
    'Schema': '01b-customize-schema.sql',
    'Functions': '02b-customize-functions.sql',
    'Views': '03b-customize-views.sql',
    'RLS': '04b-customize-policies.sql',
    'Data': '05b-customize-data.sql',
}

try:
    customizations = json.loads(customizations_json)
except json.JSONDecodeError as e:
    print(f"ERROR: Failed to parse customizations JSON: {e}", file=sys.stderr)
    sys.exit(1)

written_count = 0
for cust in customizations:
    cust_type = cust.get('customizationType', '')
    sql_code = cust.get('sqlCode', '')
    encoding = cust.get('sqlCodeEncoding', '')
    target_file = type_to_file.get(cust_type)

    if not target_file:
        print(f"  Unknown customization type: {cust_type} - skipping")
        continue

    if not sql_code:
        print(f"  Empty sqlCode for {cust_type} - skipping")
        continue

    # Decode base64 if encoded (explicit flag or auto-detect)
    is_base64 = encoding == 'base64'

    # Auto-detect base64: if no newlines, long string, and decodes to SQL-like content
    if not is_base64 and sql_code and '\n' not in sql_code and len(sql_code) > 100:
        try:
            test_decode = base64.b64decode(sql_code).decode('utf-8')
            if test_decode.startswith('--') or 'CREATE' in test_decode.upper() or 'ALTER' in test_decode.upper():
                is_base64 = True
                print(f"  Auto-detected base64 encoding for {cust_type}")
        except:
            pass

    if is_base64:
        try:
            original_len = len(sql_code)
            sql_code = base64.b64decode(sql_code).decode('utf-8')
            print(f"  Decoded base64 for {cust_type}: {original_len} -> {len(sql_code)} chars")
        except Exception as e:
            print(f"  ERROR: Failed to decode base64 sqlCode for {cust_type}: {e}")
            continue

    full_path = os.path.join(postgres_dir, target_file)
    with open(full_path, 'w') as f:
        f.write(sql_code)
    print(f"  Wrote {target_file} ({len(sql_code)} chars)")
    written_count += 1

print(f"Total: {written_count} customization file(s) written")
PYEOF
)" 2>&1

    # Clean up temp file
    rm -f "$json_tmp"

    if [[ $? -ne 0 ]]; then
        log_err "ERROR: Failed to write customizations: $write_output"
        append_output "ERROR: Failed to write customizations"
        return 1
    fi

    # Log each line of output
    while IFS= read -r line; do
        log "$line"
        append_output "$line"
    done <<< "$write_output"

    append_output "=== Done writing customizations ==="
}

# Post results back to the bridge server
post_result() {
    local success="$1"
    local output="$2"
    local commit_message="${CHANGE_MESSAGE:-}"
    local notes="${CHANGE_NOTES:-}"

    # Escape the output for JSON (handle newlines, quotes, backslashes).
    # Prefer jq for JSON escaping; if jq is not installed, use python
    # (always present on this host).
    local escaped_output
    if command -v jq >/dev/null 2>&1; then
        escaped_output="$(printf '%s' "$output" | jq -Rs '.')"
    else
        escaped_output="$(python3 -c "import json,sys; print(json.dumps(sys.stdin.read()))" <<< "$output")"
    fi

    # Build JSON payload
    local payload
    payload=$(cat <<EOF
{
  "success": $success,
  "baseId": "${BASE_ID}",
  "commitMessage": $(printf '%s' "$commit_message" | jq -Rs '.' 2>/dev/null || echo '""'),
  "notes": $(printf '%s' "$notes" | jq -Rs '.' 2>/dev/null || echo '""'),
  "output": $escaped_output
}
EOF
)

    log "Posting result to ${RESULT_URL} (success=${success})"

    # POST the result
    local http_code
    http_code=$(curl -sS -w "%{http_code}" -o /dev/null \
        -X POST \
        -H "Content-Type: application/json" \
        -d "$payload" \
        "$RESULT_URL" 2>&1) || {
        log_err "WARN: Failed to POST result to bridge server"
        return 1
    }

    if [[ "$http_code" == "200" ]]; then
        log "Result posted successfully (HTTP ${http_code})"
    else
        log_err "WARN: Result POST returned HTTP ${http_code}"
    fi
}

# Parse command line arguments for PAT
parse_args() {
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --pat)
                AIRTABLE_PAT="$2"
                shift 2
                ;;
            --pat=*)
                AIRTABLE_PAT="${1#*=}"
                shift
                ;;
            --once)
                # Handled later in RUN_ONCE
                shift
                ;;
            *)
                shift
                ;;
        esac
    done
}

check_for_changes() {
    # Returns 0 if the remote indicates {"changed":true}, else returns 1.
    # Any network/HTTP issue is treated as "no change" (but logged).
    #
    # The check endpoint returns a JSON payload like:
    # {
    #   "changed": true,
    #   "headers": { "authorization": "Bearer pat..." },
    #   "body": { "commitMessage": "...", "notes": "..." }
    # }
    #
    # We extract the PAT from .headers.authorization and commit info from .body
    local response

    # Simple GET request to the check endpoint
    response="$(curl -fsS "$CHECK_URL" 2>&1)" || {
        log_err "WARN: change check failed (curl error); continuing."
        return 1
    }

    # Check if changed is true
    if ! grep -Eq '"changed"[[:space:]]*:[[:space:]]*true' <<<"$response"; then
        return 1
    fi

    # Save payload to file for debugging (useful if parsing fails)
    local debug_payload_file="${REPO_ROOT}/devops/last-payload.json"
    echo "$response" > "$debug_payload_file"

    # Use Python to parse the response
    # NOTE: The bridge returns JSON with unescaped newlines in string values,
    # which is technically invalid JSON. We fix this before parsing.
    local parse_result
    parse_result="$(RESPONSE_FILE="$debug_payload_file" python3 << 'PYEOF'
import json
import sys
import os
import re

response_file = os.environ.get('RESPONSE_FILE', '')
if not response_file:
    print("ERROR: RESPONSE_FILE environment variable not set", file=sys.stderr)
    sys.exit(1)
with open(response_file, 'r') as f:
    raw = f.read()

# The JSON has literal newlines inside string values which is invalid.
# We need to escape them. Strategy: find all strings and escape newlines within them.
# This is a bit hacky but necessary because the bridge sends malformed JSON.

def fix_json_newlines(s):
    """Escape literal newlines inside JSON string values."""
    result = []
    in_string = False
    escape_next = False
    i = 0
    while i < len(s):
        char = s[i]
        if escape_next:
            result.append(char)
            escape_next = False
        elif char == '\\':
            result.append(char)
            escape_next = True
        elif char == '"':
            result.append(char)
            in_string = not in_string
        elif char == '\n' and in_string:
            result.append('\\n')
        elif char == '\r' and in_string:
            result.append('\\r')
        elif char == '\t' and in_string:
            result.append('\\t')
        else:
            result.append(char)
        i += 1
    return ''.join(result)

fixed_json = fix_json_newlines(raw)

try:
    data = json.loads(fixed_json)
except json.JSONDecodeError as e:
    print(f"JSON_ERROR after fix attempt: {e}", file=sys.stderr)
    print(f"First 500 chars: {fixed_json[:500]}", file=sys.stderr)
    sys.exit(1)

# Extract values
headers = data.get('headers', {})
body = data.get('body', {})

auth = headers.get('authorization', '') or headers.get('Authorization', '')
if auth.startswith('Bearer '):
    auth = auth[7:]

commit_msg = body.get('commitMessage', '') or body.get('message', '') or body.get('Message', '') or ''
notes = body.get('notes', '') or body.get('Notes', '') or body.get('releaseNotes', '') or ''
version_name = body.get('versionName', '') or body.get('VersionName', '') or ''
customizations = body.get('customizations', [])

# Handle null values
if commit_msg is None:
    commit_msg = ''
if notes is None:
    notes = ''
if version_name is None:
    version_name = ''

# Output as JSON for safe parsing
output = {
    'pat': auth,
    'commitMessage': commit_msg,
    'notes': notes,
    'versionName': version_name,
    'customizations': customizations
}
print(json.dumps(output))
PYEOF
)" 2>&1

    if [[ $? -ne 0 ]]; then
        log_err "ERROR: Failed to parse JSON payload: $parse_result"
        return 1
    fi

    # Now extract from the clean JSON output using jq (which can parse it now)
    AIRTABLE_PAT="$(echo "$parse_result" | jq -r '.pat // empty')"
    CHANGE_MESSAGE="$(echo "$parse_result" | jq -r '.commitMessage // empty')"
    CHANGE_NOTES="$(echo "$parse_result" | jq -r '.notes // empty')"
    VERSION_NAME="$(echo "$parse_result" | jq -r '.versionName // empty')"
    CUSTOMIZATIONS_JSON="$(echo "$parse_result" | jq -c '.customizations // []')"

    # Handle null/empty
    [[ "$CHANGE_MESSAGE" == "null" ]] && CHANGE_MESSAGE=""
    [[ "$CHANGE_NOTES" == "null" ]] && CHANGE_NOTES=""
    [[ "$VERSION_NAME" == "null" ]] && VERSION_NAME=""
    [[ "$CUSTOMIZATIONS_JSON" == "null" ]] && CUSTOMIZATIONS_JSON="[]"

    # Validate critical fields - FAIL if missing
    if [[ -z "$AIRTABLE_PAT" ]]; then
        log_err "ERROR: No PAT found in payload - cannot proceed"
        return 1
    fi
    log "PAT extracted from check payload headers"

    if [[ -z "$CHANGE_MESSAGE" ]]; then
        log_err "ERROR: No commitMessage found in payload - cannot proceed"
        log_err "  Check the Airtable script and bridge to ensure commitMessage is being sent"
        return 1
    fi

    log "Change detected!"
    log "  Commit message: ${CHANGE_MESSAGE}"
    log "  Version name: ${VERSION_NAME:-<none>}"
    log "  Notes: ${CHANGE_NOTES:-<none>}"
    log "  PAT: (present)"
    if [[ -n "$CUSTOMIZATIONS_JSON" && "$CUSTOMIZATIONS_JSON" != "[]" ]]; then
        local cust_count
        cust_count="$(echo "$CUSTOMIZATIONS_JSON" | jq 'length' 2>/dev/null || echo "?")"
        log "  Customizations: ${cust_count} item(s)"
    fi

    return 0
}

get_repo_root() {
    echo "$REPO_ROOT"
}

get_latest_demo_version_json() {
    local repo_root
    repo_root="$(get_repo_root)"
    if [[ -z "${ERB_DOMAIN:-}" ]]; then
        echo "ERROR: ERB_DOMAIN is not set; rebuild-on-trigger requires the trigger payload to identify the domain." >&2
        return 1
    fi
    echo "${repo_root}/../../rulebook-examples/${ERB_DOMAIN}/effortless-rulebook/${ERB_DOMAIN}-rulebook.json"
}

extract_latest_release_notes() {
    local json_file
    json_file="$(get_latest_demo_version_json)"

    if [[ ! -f "$json_file" ]]; then
        echo "ERROR: expected SSoT JSON not found at: $json_file" >&2
        return 1
    fi

    if command -v jq >/dev/null 2>&1; then
        jq -er '
          # Check table names in priority order
          (.ERBVersions.data // .ERBVersion.data // .RulebookVersions.data // .RulebookVersion.data // .EffortlessVersions.data // .EffortlessVersion.data // .DemoVersions.data // null)
          | if . == null then error("No version table found (checked ERBVersions, ERBVersion, RulebookVersions, RulebookVersion, EffortlessVersions, EffortlessVersion, DemoVersions)") else . end
          | sort_by((.Name // .DemoVersionId // .ERBVersionId // .RulebookVersionId // .EffortlessVersionId // "") | tostring)
          | reverse
          | .[0] as $latest
          | ([
              $latest.ReleaseNotes,
              $latest.releaseNotes,
              $latest.releasenotes,
              $latest.RELEASENOTES,
              $latest.release_notes,
              $latest.RELEASE_NOTES,
              $latest.Notes,
              $latest.notes,
              $latest.NOTES,
              $latest.Description,
              $latest.description,
              $latest.DESCRIPTION
            ]
            | map(select(type == "string") | gsub("^\\s+|\\s+$"; ""))
            | map(select(length > 0))
            | .[0]
          )
        ' "$json_file"
        return 0
    fi

    python3 - <<'PY'
import json, sys, os
path = os.environ["JSON_FILE"]
with open(path, "r", encoding="utf-8") as f:
    doc = json.load(f)

# Check table names in priority order
table_names = [
    "ERBVersions",
    "ERBVersion",
    "RulebookVersions",
    "RulebookVersion",
    "EffortlessVersions",
    "EffortlessVersion",
    "DemoVersions",
]

data = None
found_table = None
for tbl in table_names:
    tbl_obj = doc.get(tbl)
    if tbl_obj and isinstance(tbl_obj.get("data"), list) and len(tbl_obj["data"]) > 0:
        data = tbl_obj["data"]
        found_table = tbl
        break

if not data:
    raise SystemExit(f"ERROR: No version table found (checked {', '.join(table_names)})")

# Sort by Name Z-A (descending). Use Created only as a tiebreaker.
latest = sorted(
    data,
    key=lambda r: ((r.get("Name") or "").strip(), (r.get("Created") or "")),
    reverse=True,
)[0]

candidates = [
    "ReleaseNotes",
    "releaseNotes",
    "releasenotes",
    "RELEASENOTES",
    "release_notes",
    "RELEASE_NOTES",
    "Notes",
    "notes",
    "NOTES",
    "Description",
    "description",
    "DESCRIPTION",
]

for key in candidates:
    val = latest.get(key)
    if isinstance(val, str):
        s = val.strip()
        if s:
            print(s)
            raise SystemExit(0)

raise SystemExit(f"ERROR: latest {found_table} record has empty notes/description/release notes fields")
PY
}

extract_latest_demo_version_name() {
    local json_file
    json_file="$(get_latest_demo_version_json)"

    if command -v jq >/dev/null 2>&1; then
        jq -er '
          # Check table names in priority order
          (.ERBVersions.data // .ERBVersion.data // .RulebookVersions.data // .RulebookVersion.data // .EffortlessVersions.data // .EffortlessVersion.data // .DemoVersions.data // null)
          | if . == null then error("No version table found") else . end
          | sort_by((.Name // .DemoVersionId // .ERBVersionId // .RulebookVersionId // .EffortlessVersionId // "") | tostring)
          | reverse
          | .[0]
          | (.Name // .DemoVersionId // .ERBVersionId // .RulebookVersionId // .EffortlessVersionId // empty)
        ' "$json_file"
        return 0
    fi

    python3 - <<'PY'
import json, os
path = os.environ["JSON_FILE"]
with open(path, "r", encoding="utf-8") as f:
    doc = json.load(f)

# Check table names in priority order
table_names = [
    "ERBVersions",
    "ERBVersion",
    "RulebookVersions",
    "RulebookVersion",
    "EffortlessVersions",
    "EffortlessVersion",
    "DemoVersions",
]

data = None
found_table = None
for tbl in table_names:
    tbl_obj = doc.get(tbl)
    if tbl_obj and isinstance(tbl_obj.get("data"), list) and len(tbl_obj["data"]) > 0:
        data = tbl_obj["data"]
        found_table = tbl
        break

if not data:
    raise SystemExit(f"ERROR: No version table found (checked {', '.join(table_names)})")

# Sort by Name Z-A (descending). Use Created only as a tiebreaker.
latest = sorted(
    data,
    key=lambda r: ((r.get("Name") or "").strip(), (r.get("Created") or "")),
    reverse=True,
)[0]

# Try multiple ID field names
name = (
    latest.get("Name") or 
    latest.get("DemoVersionId") or 
    latest.get("ERBVersionId") or 
    latest.get("ERBVersionsId") or
    latest.get("RulebookVersionId") or 
    latest.get("RulebookVersionsId") or
    latest.get("EffortlessVersionId") or
    latest.get("EffortlessVersionsId") or
    ""
).strip()

if not name:
    raise SystemExit(f"ERROR: latest {found_table} record has no Name or ID field")
print(name)
PY
}

commit_snapshot_with_payload_notes() {
    # Use message and notes from the check payload instead of ERBVersions table
    local repo_root subject notes_body

    repo_root="$(get_repo_root)"

    # Use message from check payload as commit subject
    subject="${CHANGE_MESSAGE:-}"
    notes_body="${CHANGE_NOTES:-}"

    # Second attempt: if the check payload did not carry message/notes,
    # extract them from the JSON.
    if [[ -z "$subject" ]]; then
        log "No message in check payload; trying JSON extraction..."
        export JSON_FILE
        JSON_FILE="$(get_latest_demo_version_json)"

        local demo_version
        demo_version="$(extract_latest_demo_version_name 2>/dev/null)" || demo_version="unknown"

        local release_notes
        release_notes="$(extract_latest_release_notes 2>/dev/null)" || release_notes=""

        subject="$(printf '%s' "$release_notes" | head -n 1 | sed -E 's/[[:space:]]+/ /g' | sed -E 's/^ +| +$//g')"
        if [[ -z "$subject" ]]; then
            subject="Sync from Airtable (${demo_version})"
        else
            subject="${subject} (${demo_version})"
        fi
        notes_body="$release_notes"
    else
        # Append version name if available (format: "message (versionName)")
        if [[ -n "$VERSION_NAME" ]]; then
            subject="${subject} (${VERSION_NAME})"
        fi
    fi

    # Trim subject to reasonable length
    subject="$(printf '%s' "$subject" | head -n 1 | sed -E 's/[[:space:]]+/ /g' | sed -E 's/^ +| +$//g')"
    if [[ -z "${subject}" ]]; then
        subject="Sync from Airtable"
    fi

    # Stage changes (including new files)
    git -C "$repo_root" add -A || {
        log_err "ERROR: git add failed"
        return 1
    }

    # If nothing to commit, don't create an empty snapshot.
    if git -C "$repo_root" diff --cached --quiet; then
        echo "No git changes to commit."
        return 0
    fi

    echo "Committing snapshot..."
    log "Commit subject: ${subject}"
    if [[ -n "$notes_body" ]]; then
        git -C "$repo_root" commit -m "${subject}" -m "${notes_body}" || {
            log_err "ERROR: git commit failed"
            return 1
        }
    else
        git -C "$repo_root" commit -m "${subject}" || {
            log_err "ERROR: git commit failed"
            return 1
        }
    fi
}

# Parse command line arguments
parse_args "$@"

# Check for --once flag
RUN_ONCE=""
for arg in "$@"; do
    if [[ "$arg" == "--once" ]]; then
        RUN_ONCE="--once"
        break
    fi
done

# Log startup info
log "Watching for changes... (PAT will be extracted from check payload when change detected)"

dots=""
while true; do
    # Check if ssotme.json baseId has changed - if so, update URLs
    new_base_id="$(get_base_id 2>/dev/null)" || new_base_id=""
    if [[ -n "$new_base_id" && "$new_base_id" != "$BASE_ID" ]]; then
        log "NOTICE: baseId changed from ${BASE_ID} to ${new_base_id}"
        BASE_ID="$new_base_id"
        CHECK_URL="${BRIDGE_BASE_URL}/check/${BASE_ID}/raw"
        RESULT_URL="${BRIDGE_BASE_URL}/result/${BASE_ID}"
        log "Updated Check URL: ${CHECK_URL}"
        log "Updated Result URL: ${RESULT_URL}"
        # Clear dots to show fresh output with new URL
        if [[ -n "$dots" ]]; then
            echo ""
        fi
        dots=""
    fi

    # Check for changes (extracts PAT/message from payload when changed=true)
    change_detected=false
    if check_for_changes; then
        change_detected=true
    fi
    
    # For --once mode, run regardless of change status
    if [[ "$RUN_ONCE" == "--once" ]]; then
        log "Running one rebuild cycle (--once)."
        change_detected=true
    fi
    
    if [[ "$change_detected" == "true" ]]; then
        # Clear the dot line and start fresh
        if [[ -n "$dots" ]]; then
            echo ""  # newline after dots
        fi
        dots=""

        # Reset build output accumulator for this cycle
        BUILD_OUTPUT=""
        append_output "=========================================="
        append_output "Rebuild started at $(date '+%Y-%m-%d %H:%M:%S')"
        append_output "=========================================="

        # Set API key in ssotme.json before running build
        if [[ -n "$AIRTABLE_PAT" ]]; then
            log "Setting API key in ssotme.json (${#AIRTABLE_PAT} chars)"
            set_ssotme_apikey "$AIRTABLE_PAT"
            append_output "API key set in ssotme.json"
        else
            log "WARNING: No PAT extracted from payload - API key not set"
            append_output "WARNING: No PAT extracted from payload - API key not set"
        fi

        log "Starting rebuild steps..."
        echo "Rebuilding..."
        append_output "Starting rebuild steps..."

        # Write customizations from payload to b-files BEFORE build
        if [[ -n "$CUSTOMIZATIONS_JSON" && "$CUSTOMIZATIONS_JSON" != "[]" ]]; then
            write_customizations "$CUSTOMIZATIONS_JSON"
        else
            log "No customizations in payload to write"
        fi

        # Run build in a subshell so we can always redact the API key afterward
        build_result=0
        try "buildall.sh" "$SCRIPT_DIR/buildall.sh" || build_result=$?

        # Always redact the API key after build (success or failure)
        if [[ -n "$AIRTABLE_PAT" ]]; then
            log "Redacting API key in ssotme.json..."
            redact_ssotme_apikey
            log "API key redacted"
        fi

        # Log build result
        if [[ $build_result -ne 0 ]]; then
            log_err "Build failed with exit code $build_result, but continuing..."
            append_output "Build failed with exit code $build_result"
        fi
        banner "GIT COMMIT PHASE"
        append_output "=== GIT COMMIT PHASE ==="
        log "buildall.sh finished. Proceeding to git commit step..."

        try "commit snapshot with payload notes" commit_snapshot_with_payload_notes
        banner "END GIT COMMIT PHASE"
        append_output "=== END GIT COMMIT PHASE ==="

        append_output "=========================================="
        append_output "Rebuild completed at $(date '+%Y-%m-%d %H:%M:%S')"
        append_output "=========================================="

        # Determine success/failure by checking for ERROR in output
        is_success="true"
        if echo "$BUILD_OUTPUT" | grep -qi "ERROR"; then
            is_success="false"
            log "Build output contains ERROR - marking as failed"
        else
            log "Build output clean - marking as success"
        fi

        # Post results back to the bridge server
        post_result "$is_success" "$BUILD_OUTPUT"

        log "Rebuild cycle complete."
        if [[ "$RUN_ONCE" == "--once" ]]; then
            log "Exiting after single cycle."
            exit 0
        fi
    else
        # Accumulate dots to show we're still checking
        if [[ -z "$dots" ]]; then
            printf "%s\n\nChecking for changes: " "$CHECK_URL"
            dots="."
        else
            printf "."
            dots="${dots}."
        fi
        # Reset dots after 60 dots (5 minutes) to keep line manageable
        if [[ ${#dots} -ge 60 ]]; then
            echo ""  # newline
            dots=""
        fi
    fi
    sleep 3
done
