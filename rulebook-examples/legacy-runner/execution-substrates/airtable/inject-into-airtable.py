#!/usr/bin/env python3
"""
airtable substrate — the rulebook source-of-truth sync step.

Behaves differently from every other substrate: instead of generating code
and taking the conformance test, it refreshes the rulebook that all other
substrates consume. Concretely:

  1. Shows the current base (name + ID)
  2. Lists known bases (from orchestration/bases.json)
  3. Prompts for a selection — Enter keeps the current base, a number switches
  4. Runs `effortless -buildLocal` in effortless-rulebook/ to pull the latest
     schema/data from Airtable (this invokes the airtable-to-rulebook transpiler
     and nothing else; substrate rebuilds are a separate concern)

In CI / non-interactive mode it keeps the current base and syncs.
If Airtable is unreachable the sync fails LOUDLY — there is no cached copy
to substitute. The rulebook JSON on disk IS the only source of truth.

Environment:
  ERB_DOCKER_MODE=true  — treated as CI (non-interactive)
  --ci                  — CLI flag, same effect as ERB_DOCKER_MODE
  --non-interactive     — keep current base, no prompt
"""

import os
import subprocess
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent.resolve()
PROJECT_ROOT = SCRIPT_DIR.parent.parent
ORCHESTRATION_DIR = PROJECT_ROOT / "orchestration"
BASE_MANAGER = ORCHESTRATION_DIR / "base-manager.py"
RULEBOOK_DIR = PROJECT_ROOT / "effortless-rulebook"

sys.path.insert(0, str(ORCHESTRATION_DIR))
import importlib.util

spec = importlib.util.spec_from_file_location("base_manager", BASE_MANAGER)
bm = importlib.util.module_from_spec(spec)
spec.loader.exec_module(bm)


CYAN = "\033[0;36m"
GREEN = "\033[0;32m"
YELLOW = "\033[1;33m"
RED = "\033[0;31m"
DIM = "\033[2m"
BOLD = "\033[1m"
WHITE = "\033[1;37m"
NC = "\033[0m"


def is_non_interactive() -> bool:
    if "--non-interactive" in sys.argv or "--ci" in sys.argv:
        return True
    if os.environ.get("ERB_DOCKER_MODE") == "true":
        return True
    if not sys.stdin.isatty():
        return True
    return False


def print_header():
    print()
    print(f"{BOLD}{CYAN}╔════════════════════════════════════════════════════════════╗{NC}")
    print(f"{BOLD}{CYAN}║{NC}            {BOLD}{WHITE}AIRTABLE — RULEBOOK SYNC{NC}                        {BOLD}{CYAN}║{NC}")
    print(f"{BOLD}{CYAN}╚════════════════════════════════════════════════════════════╝{NC}")
    print()


def show_bases(current_base_id: str, bases: list) -> None:
    print(f"  {DIM}Known bases:{NC}")
    print()
    for i, base in enumerate(bases, 1):
        marker = f" {GREEN}(active){NC}" if base["id"] == current_base_id else ""
        color = GREEN if base["id"] == current_base_id else CYAN
        print(f"  {color}[{i}]{NC} {base['name']}{marker}")
        print(f"      {DIM}{base['id']}{NC}")
    print()


SKIP_SYNC = object()  # sentinel returned when the user opts out of the pull


def prompt_for_base(current_base_id: str, bases: list):
    """Return base ID to sync, or SKIP_SYNC to bypass the pull entirely.

    - A number selects that base and pulls from it
    - Enter pulls from the current base
    - S skips the pull entirely (no switch, no sync)
    - N adds a new base by ID and pulls from it
    """
    count = len(bases)
    prompt = (
        f"  Select base [1-{count}] to pull, "
        f"{DIM}Enter=pull current, S=skip pull, N=add new{NC}: "
    )
    try:
        choice = input(prompt).strip()
    except EOFError:
        return SKIP_SYNC

    if choice == "":
        return current_base_id

    if choice.lower() in ("s", "q"):
        return SKIP_SYNC

    if choice.lower() == "n":
        try:
            new_id = input("  Enter new Airtable base ID (e.g., appXXXXX): ").strip()
        except EOFError:
            return SKIP_SYNC
        if not new_id:
            return SKIP_SYNC
        if not new_id.startswith("app"):
            print(f"{RED}  Invalid Base ID format (must start with 'app').{NC}")
            return SKIP_SYNC
        try:
            name = bm.fetch_base_name_or_fail(new_id)
            bm.add_or_update_base(new_id, name)
            return new_id
        except Exception as e:
            print(f"{RED}  Failed to add base: {e}{NC}")
            return SKIP_SYNC

    if choice.isdigit():
        idx = int(choice) - 1
        if 0 <= idx < count:
            return bases[idx]["id"]
        print(f"{RED}  Invalid selection: {choice}{NC}")
        return SKIP_SYNC

    print(f"{RED}  Invalid input: {choice}{NC}")
    return SKIP_SYNC


def select_and_sync(target_base_id: str, current_base_id: str) -> int:
    """Switch base (if changed) and pull the rulebook from Airtable.

    The pull invokes `effortless -buildLocal` in effortless-rulebook/, which runs
    only the airtable-to-rulebook transpiler. If Airtable is unreachable the
    transpiler exits non-zero and we propagate that — there is no cache to
    substitute. The rulebook JSON on disk IS the source of truth.
    """
    if target_base_id != current_base_id:
        print()
        print(f"{YELLOW}  Switching base...{NC}")
        bm.select_base(target_base_id)  # raises on failure — let it propagate

    print()
    print(f"{YELLOW}  Syncing rulebook from Airtable...{NC}")
    print()

    result = subprocess.run(
        ["effortless", "-buildLocal"],
        cwd=str(RULEBOOK_DIR),
        timeout=120,
    )
    if result.returncode != 0:
        print(
            f"{RED}  Airtable sync failed (effortless -buildLocal returned "
            f"{result.returncode}). The rulebook on disk was NOT modified.{NC}",
            file=sys.stderr,
        )
    return result.returncode


def main() -> int:
    if "--clean" in sys.argv:
        # Nothing to clean for the airtable substrate — the rulebook JSON
        # IS the source of truth and lives in effortless-rulebook/. We don't
        # produce derived artifacts.
        return 0

    print_header()

    # Make sure bases.json is populated with the current base. If Airtable is
    # unreachable, surface the error and exit — there is no offline mode.
    bm.sync_bases()

    config = bm.load_ssotme_config()
    current_base_id = bm.get_setting(config, "baseId") or ""
    project_name = config.get("Name", "Unknown")
    bases = bm.get_bases_list(config)

    print(f"  Project: {WHITE}{project_name}{NC}")
    print(f"  Base ID: {WHITE}{current_base_id}{NC}")
    print()

    if is_non_interactive():
        print(f"  {DIM}Non-interactive mode — keeping current base and syncing.{NC}")
        return select_and_sync(current_base_id, current_base_id)

    if not bases:
        print(f"  {DIM}No known bases — syncing current base only.{NC}")
        return select_and_sync(current_base_id, current_base_id)

    show_bases(current_base_id, bases)
    target = prompt_for_base(current_base_id, bases)
    if target is SKIP_SYNC:
        print()
        print(f"  {DIM}Skipped — rulebook left unchanged.{NC}")
        return 0
    return select_and_sync(target, current_base_id)


if __name__ == "__main__":
    sys.exit(main())
