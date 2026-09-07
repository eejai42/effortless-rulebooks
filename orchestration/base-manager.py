#!/usr/bin/env python3
"""
Base Manager - Manages Airtable bases list for ERB projects.
Handles fetching base names from Airtable API and updating ssotme.json.
"""

import json
import os
import ssl
import subprocess
import sys
import urllib.request
import urllib.error

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
BASES_FILE = os.path.join(SCRIPT_DIR, "bases.json")  # Separate file that ssotme won't touch


def _find_config_path() -> str:
    """Return the project config path: effortless.json (new) or ssotme.json (legacy).

    Falls back to effortless.json even if neither exists, so writers that
    create the file land on the canonical name.
    """
    eff = os.path.join(PROJECT_ROOT, "effortless.json")
    legacy = os.path.join(PROJECT_ROOT, "ssotme.json")
    if os.path.exists(eff):
        return eff
    if os.path.exists(legacy):
        return legacy
    return eff


SSOTME_JSON = _find_config_path()


def get_airtable_api_key():
    """Get Airtable API key from effortless config."""
    try:
        result = subprocess.run(
            ["effortless", "-info"],
            capture_output=True,
            text=True,
            timeout=10
        )
        for line in result.stdout.split("\n"):
            if "airtable:" in line.lower():
                parts = line.split(":", 1)
                if len(parts) > 1:
                    return parts[1].strip()
    except Exception as e:
        print(f"Warning: Could not get API key from effortless: {e}", file=sys.stderr)
    return None


def fetch_base_name(base_id: str, api_key: str) -> str:
    """Fetch the base name from Airtable API."""
    url = f"https://api.airtable.com/v0/meta/bases/{base_id}"

    req = urllib.request.Request(url)
    req.add_header("Authorization", f"Bearer {api_key}")

    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE

    try:
        with urllib.request.urlopen(req, timeout=10, context=ssl_context) as response:
            data = json.loads(response.read().decode())
            return data.get("name", base_id)
    except urllib.error.HTTPError as e:
        if e.code == 404:
            raise ValueError(f"Base '{base_id}' not found. Check the base ID.")
        elif e.code == 401:
            raise ValueError("Invalid API key or insufficient permissions.")
        else:
            raise ValueError(f"Airtable API error: {e.code} - {e.reason}")
    except Exception as e:
        raise ValueError(f"Failed to fetch base info: {e}")


def load_ssotme_config():
    """Load the ssotme.json config."""
    with open(SSOTME_JSON, "r") as f:
        return json.load(f)


def save_ssotme_config(config):
    """Save the ssotme.json config."""
    with open(SSOTME_JSON, "w") as f:
        json.dump(config, f, indent=2)


def get_setting(config, name):
    """Get a project setting value."""
    for setting in config.get("ProjectSettings", []):
        if setting.get("Name") == name:
            return setting.get("Value")
    return None


def set_setting(config, name, value):
    """Set a project setting value."""
    for setting in config.get("ProjectSettings", []):
        if setting.get("Name") == name:
            setting["Value"] = value
            return
    config.setdefault("ProjectSettings", []).append({
        "Name": name,
        "Value": value
    })


def remove_setting(config, name):
    """Remove a project setting if it exists."""
    settings = config.get("ProjectSettings", [])
    config["ProjectSettings"] = [s for s in settings if s.get("Name") != name]


def get_bases_list(config=None):
    """Get the list of bases from bases.json. Missing file means no bases yet.

    A corrupt bases.json is a bug — let the JSONDecodeError propagate so the
    user sees the file path and can fix it, instead of silently returning [].
    """
    if not os.path.exists(BASES_FILE):
        return []
    with open(BASES_FILE, "r") as f:
        bases = json.load(f)
    if not isinstance(bases, list):
        raise ValueError(
            f"bases.json at {BASES_FILE} is not a JSON array (got {type(bases).__name__}). "
            "Fix the file or delete it."
        )
    return bases


def set_bases_list(config, bases):
    """Save bases to separate bases.json file ONLY. ssotme.json should NOT contain bases list."""
    with open(BASES_FILE, "w") as f:
        json.dump(bases, f, indent=2)
    # Remove any legacy 'bases' entry from ssotme.json if present
    if config is not None:
        remove_setting(config, "bases")


def ensure_current_base_in_list(config=None):
    """Ensure the current active base is in the bases list.

    IMPORTANT: Names in bases.json ONLY come from Airtable API.
    This function NEVER updates names - it only adds missing bases by fetching from Airtable.
    """
    if config is None:
        config = load_ssotme_config()

    current_base_id = get_setting(config, "baseId")
    if not current_base_id:
        return config

    bases = get_bases_list(config)

    # Check if current base exists in list
    for base in bases:
        if base["id"] == current_base_id:
            return config  # Already exists, don't touch the name

    # Base not in list — Airtable is the only authority for the name; raise
    # if it can't be fetched rather than guessing one from the base ID.
    base_name = fetch_base_name_or_fail(current_base_id)
    bases.append({"id": current_base_id, "name": base_name})
    set_bases_list(config, bases)

    return config


def add_or_update_base(base_id: str, base_name: str) -> dict:
    """Add a new base or update existing one. Returns the base info."""
    config = load_ssotme_config()

    # Ensure current base is in list first
    ensure_current_base_in_list(config)

    bases = get_bases_list(config)

    # Check if base already exists - update if so
    for base in bases:
        if base["id"] == base_id:
            if base["name"] != base_name:
                base["name"] = base_name
                set_bases_list(config, bases)
                save_ssotme_config(config)
                print(f"Updated base: {base_name} ({base_id})")
            else:
                print(f"Base already exists: {base_name} ({base_id})")
            return base

    # Add new base
    new_base = {"id": base_id, "name": base_name}
    bases.append(new_base)
    set_bases_list(config, bases)
    save_ssotme_config(config)

    print(f"Added base: {base_name} ({base_id})")
    return new_base


def fetch_base_name_or_fail(base_id: str) -> str:
    """Fetch base name from Airtable. RAISES if it can't get the name —
    Airtable is the only authority for the human-readable base name; do not
    invent one from the base ID or anything else."""
    api_key = get_airtable_api_key()
    if not api_key:
        raise ValueError("No Airtable API key configured. Run 'effortless -setAccount airtable <your-pat>'")
    return fetch_base_name(base_id, api_key)  # Let exceptions propagate


def select_base(base_id: str) -> dict:
    """Select a base as the active base. Returns the base info."""
    config = load_ssotme_config()

    # Ensure current base is preserved in list before switching
    ensure_current_base_in_list(config)

    bases = get_bases_list(config)

    # Find the base
    base = None
    for b in bases:
        if b["id"] == base_id:
            base = b
            break

    if not base:
        raise ValueError(f"Base {base_id} not found in bases list. Add it first.")

    # Update active base settings
    set_setting(config, "baseId", base["id"])
    set_setting(config, "project-name", base["name"])
    config["Name"] = base["name"]

    save_ssotme_config(config)
    print(f"Selected base: {base['name']} ({base['id']})")
    return base


def list_bases():
    """List all known bases."""
    config = load_ssotme_config()

    # Ensure current base is in list
    ensure_current_base_in_list(config)

    bases = get_bases_list(config)
    current_base_id = get_setting(config, "baseId")

    print("\nKnown bases:")
    for i, base in enumerate(bases, 1):
        marker = " (active)" if base["id"] == current_base_id else ""
        print(f"  [{i}] {base['name']}{marker}")
        print(f"      ID: {base['id']}")

    if not bases:
        print("  (no bases configured)")

    return bases


def remove_base(base_id: str):
    """Remove a base from the list (but not if it's active)."""
    config = load_ssotme_config()
    bases = get_bases_list(config)
    current_base_id = get_setting(config, "baseId")

    if base_id == current_base_id:
        raise ValueError("Cannot remove the active base. Switch to another base first.")

    original_count = len(bases)
    bases = [b for b in bases if b["id"] != base_id]

    if len(bases) == original_count:
        print(f"Base not found: {base_id}")
        return

    set_bases_list(config, bases)
    save_ssotme_config(config)
    print(f"Removed base: {base_id}")


def sync_bases():
    """Ensure the current base ID is in bases.json (fetches name from Airtable if missing)."""
    config = load_ssotme_config()
    ensure_current_base_in_list(config)
    print("Bases list synced.")


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Manage Airtable bases for ERB project")
    subparsers = parser.add_subparsers(dest="command", help="Commands")

    # List command
    subparsers.add_parser("list", help="List all known bases")

    # Add command - fetches name from Airtable (no manual override)
    add_parser = subparsers.add_parser("add", help="Add a base (fetches name from Airtable)")
    add_parser.add_argument("base_id", help="Airtable base ID (e.g., appXXXXXX)")

    # Select command
    select_parser = subparsers.add_parser("select", help="Select a base as active")
    select_parser.add_argument("base_id", help="Base ID or list number")

    # Remove command
    remove_parser = subparsers.add_parser("remove", help="Remove a base from list")
    remove_parser.add_argument("base_id", help="Airtable base ID to remove")

    # Fetch name command
    fetch_parser = subparsers.add_parser("fetch-name", help="Fetch base name from Airtable")
    fetch_parser.add_argument("base_id", help="Airtable base ID")

    # get-name command: prints only the name (for use by shell scripts)
    get_name_parser = subparsers.add_parser("get-name", help="Print bare base name (for shell capture)")
    get_name_parser.add_argument("base_id", help="Airtable base ID")

    # Sync command
    subparsers.add_parser("sync", help="Sync bases list with current active base")

    args = parser.parse_args()

    try:
        if args.command == "list":
            list_bases()
        elif args.command == "add":
            base_name = fetch_base_name_or_fail(args.base_id)
            add_or_update_base(args.base_id, base_name)
        elif args.command == "select":
            if args.base_id.isdigit():
                config = load_ssotme_config()
                ensure_current_base_in_list(config)
                bases = get_bases_list(config)
                idx = int(args.base_id) - 1
                if 0 <= idx < len(bases):
                    select_base(bases[idx]["id"])
                else:
                    print(f"Invalid selection: {args.base_id}")
                    sys.exit(1)
            else:
                select_base(args.base_id)
        elif args.command == "remove":
            remove_base(args.base_id)
        elif args.command == "fetch-name":
            name = fetch_base_name_or_fail(args.base_id)
            if name:
                print(f"Base name: {name}")
            else:
                print("Could not fetch base name")
                sys.exit(1)
        elif args.command == "get-name":
            name = fetch_base_name_or_fail(args.base_id)
            if name:
                print(name)
            else:
                sys.exit(1)
        elif args.command == "sync":
            sync_bases()
        else:
            parser.print_help()
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
