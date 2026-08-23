#!/usr/bin/env bash
# =============================================================================
# clone-skills.sh — DERIVED ARTIFACT — DO NOT EDIT BY HAND
# =============================================================================
# Source of truth: ClaudeSkills table in
#   effortless-platform/effortless-rulebook/effortless-rulebook.json
# Registered as: "clone-skills" transpiler in effortless-platform/effortless.json
#
# What this does:
#   Reads the ClaudeSkills table from the platform rulebook and pulls a copy
#   of each skill's SKILL.md into docs/skills/<name>/SKILL.md.
#   Primary source: remote GitHub raw URL (CloneUrl field).
#   Fallback: local ~/.claude/skills/<name>/SKILL.md (already installed).
#   Each mirrored file carries a DO-NOT-EDIT header.
#
# Usage:
#   ./docs/skills/clone-skills.sh                      # from repo root
#   cd effortless-platform && effortless clone-skills  # via build pipeline
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
RULEBOOK="$REPO_ROOT/effortless-rulebook/effortless-rulebook.json"
SKILLS_DIR="$REPO_ROOT/docs/skills"
LOCAL_SKILLS_DIR="$HOME/.claude/skills"

if [[ ! -f "$RULEBOOK" ]]; then
  echo "ERROR: Rulebook not found at expected path: $RULEBOOK" >&2
  exit 1
fi

echo "==> Cloning skills into docs/skills/ ..."

python3 - "$RULEBOOK" "$SKILLS_DIR" "$LOCAL_SKILLS_DIR" << 'PYEOF'
import json, os, sys, ssl, urllib.request, urllib.error

rulebook_path, skills_dir, local_skills_dir = sys.argv[1], sys.argv[2], sys.argv[3]

rb = json.load(open(rulebook_path))
skills_data = rb.get('ClaudeSkills', {}).get('data', [])

if not skills_data:
    print("ERROR: ClaudeSkills table is empty or missing in rulebook.", file=sys.stderr)
    sys.exit(1)

# Unverified SSL context for macOS cert issues
ssl_ctx = ssl.create_default_context()
ssl_ctx.check_hostname = False
ssl_ctx.verify_mode = ssl.CERT_NONE

ok = remote = local = fail = 0
for skill in skills_data:
    name = skill['Name']
    clone_url = skill['CloneUrl']
    local_path = os.path.join(skills_dir, name, 'SKILL.md')
    local_source = os.path.join(local_skills_dir, name, 'SKILL.md')

    os.makedirs(os.path.dirname(local_path), exist_ok=True)

    raw = None
    source_label = None

    # Try remote first
    try:
        with urllib.request.urlopen(clone_url, timeout=15, context=ssl_ctx) as resp:
            raw = resp.read().decode('utf-8')
            source_label = clone_url
            remote += 1
    except Exception:
        pass

    # Fall back to local ~/.claude/skills/
    if raw is None and os.path.exists(local_source):
        raw = open(local_source).read()
        source_label = local_source
        local += 1

    if raw is None:
        print(f"  FAIL {name}: not available remotely or locally")
        fail += 1
        continue

    header = (
        "<!-- DERIVED ARTIFACT — DO NOT EDIT BY HAND -->\n"
        f"<!-- Source: {source_label} -->\n"
        "<!-- Mirrored by: docs/skills/clone-skills.sh -->\n"
        "<!-- Update: cd effortless-platform && effortless clone-skills -->\n\n"
    )

    with open(local_path, 'w') as f:
        f.write(header + raw)

    src = "remote" if source_label == clone_url else "local"
    print(f"  OK  {name}  ({src})")
    ok += 1

print(f"\n==> {ok} skills mirrored ({remote} remote, {local} from local ~/.claude/skills), {fail} failed.")
if fail > 0:
    sys.exit(1)
PYEOF
