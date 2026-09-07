#!/usr/bin/env python3
"""
postgres-calculated-to-rulebook

Merges current Postgres data back into the rulebook's seed data arrays.

TWO MODES, selected by the ERB_WRITE_COMPUTED env var:

  • DEFAULT (ERB_WRITE_COMPUTED unset/false) — raws-only sync.
    Only raw and relationship fields are updated; computed/lookup/aggregation
    fields are left alone. This is the safe reverse-spoke: it pulls hand-edited
    raw values back from the DB without bloating the rulebook with derived data.

  • ERB_WRITE_COMPUTED=true — full view-row adoption.
    EVERY field present in the exchange JSON is written back, including
    calculated/lookup/aggregation values. This is the mechanism behind
    `regenerate-answer-keys.sh`: load rulebook raws → Postgres → vw_* compute
    the correct values → write the whole view row back into the rulebook → the
    answer-key generator then reads those fresh computed values. For this to
    refresh computed fields, the exchange JSON must come from the VIEWS
    (pull-from-postgres.sh exports vw_*, not base tables).

Input:  .pg-raw-data.json  — written by pull-from-postgres.sh (vw_* rows)
        rulebook JSON       — the SSoT being updated

Usage (direct):
  python3 inject-into-postgres-calculated-to-rulebook.py <rulebook_path> [<json_path>]

Usage (via server.js / ssotme-proxy — set ERB_RULEBOOK_PATH, cwd = postgres-bootstrap/):
  python3 inject-into-postgres-calculated-to-rulebook.py
"""

import json
import os
import re
import sys
from pathlib import Path
from typing import Any, Dict, List, Tuple

COMPUTED_TYPES = {"calculated", "lookup", "aggregation"}
RAW_TYPES = {"raw", "relationship"}

# When true, write ALL field types back (computed values included), not just
# raws. The whole-view-row adoption that regenerate-answer-keys.sh relies on.
WRITE_COMPUTED = os.environ.get("ERB_WRITE_COMPUTED", "").lower() in ("1", "true", "yes")
# The field types this run will merge. Default = raws only; opt-in = everything.
WRITABLE_TYPES = (RAW_TYPES | COMPUTED_TYPES) if WRITE_COMPUTED else RAW_TYPES


def die(msg: str) -> None:
    sys.stderr.write(f"[postgres-calculated-to-rulebook] FAIL: {msg}\n")
    sys.exit(1)


def warn(msg: str) -> None:
    sys.stderr.write(f"[postgres-calculated-to-rulebook] WARN: {msg}\n")


def log(msg: str) -> None:
    sys.stdout.write(f"[postgres-calculated-to-rulebook] {msg}\n")


def snake(name: str) -> str:
    s1 = re.sub(r"(.)([A-Z][a-z]+)", r"\1_\2", name)
    s2 = re.sub(r"([a-z0-9])([A-Z])", r"\1_\2", s1)
    return s2.lower()


def norm(v: Any) -> Any:
    if v is None:
        return None
    if isinstance(v, bool):
        return v
    if isinstance(v, (int, float)):
        return float(v)
    return str(v)


def load_raw_data(json_path: Path) -> Dict[str, List[Dict[str, Any]]]:
    """Load .pg-raw-data.json written by pull-from-postgres.sh."""
    if not json_path.is_file():
        pull_script = json_path.parent / "pull-from-postgres.sh"
        if not pull_script.exists():
            die(
                f"raw-data JSON not found: {json_path}\n"
                f"  pull-from-postgres.sh is also missing from {json_path.parent}\n"
                f"  Copy it from rulebook-examples/acme-llc/postgres-bootstrap/pull-from-postgres.sh\n"
                f"  then run: bash {pull_script}"
            )
        die(f"raw-data JSON not found: {json_path}\n"
            f"  Run pull-from-postgres.sh first: bash {pull_script}")
    return json.loads(json_path.read_text())


def is_table(key: str, value: Any) -> bool:
    if key.startswith("_"):
        return False
    return isinstance(value, dict) and "schema" in value and "data" in value


def main() -> None:
    rulebook_path = None
    json_path = None

    if len(sys.argv) >= 2:
        rulebook_path = Path(sys.argv[1]).resolve()
        json_path = Path(sys.argv[2]).resolve() if len(sys.argv) >= 3 else None
    elif "ERB_RULEBOOK_PATH" in os.environ:
        rulebook_path = Path(os.environ["ERB_RULEBOOK_PATH"]).resolve()

    if not rulebook_path:
        die("rulebook not found (provide as arg or set ERB_RULEBOOK_PATH)")

    if not rulebook_path.is_file():
        die(f"rulebook not found: {rulebook_path}")

    # Locate the JSON data file: explicit arg > cwd > postgres-bootstrap/ sibling
    if json_path is None:
        candidates = [
            Path.cwd() / ".pg-raw-data.json",
            rulebook_path.parent.parent / "postgres-bootstrap" / ".pg-raw-data.json",
        ]
        for c in candidates:
            if c.is_file():
                json_path = c
                break
        if json_path is None:
            pg_bootstrap = rulebook_path.parent.parent / "postgres-bootstrap"
            pull_script = pg_bootstrap / "pull-from-postgres.sh"
            if not pull_script.exists():
                die(
                    f".pg-raw-data.json not found (tried: {', '.join(str(c) for c in candidates)})\n"
                    f"\n"
                    f"  pull-from-postgres.sh is also MISSING from {pg_bootstrap}\n"
                    f"\n"
                    f"  This script is not yet generated by the rulebook-to-postgres transpiler.\n"
                    f"  To fix this permanently: add pull-from-postgres.sh generation to the\n"
                    f"  cloud transpiler so every new postgres-bootstrap/ gets it automatically.\n"
                    f"\n"
                    f"  Workaround for now:\n"
                    f"    1. Copy pull-from-postgres.sh from any project that has one:\n"
                    f"       e.g. rulebook-examples/acme-llc/postgres-bootstrap/pull-from-postgres.sh\n"
                    f"    2. Place it at: {pull_script}\n"
                    f"    3. Ensure DATABASE_URL is set (or sourced from effortless.env)\n"
                    f"    4. Run: bash {pull_script}\n"
                    f"    5. Re-run this transpiler.\n"
                )
            die(
                f".pg-raw-data.json not found (tried: {', '.join(str(c) for c in candidates)})\n"
                f"\n"
                f"  The pull-from-postgres.sh script exists at {pull_script}\n"
                f"  but has not been run yet (or the DB is empty).\n"
                f"\n"
                f"  Steps:\n"
                f"    1. Make sure the database is running and initialized:\n"
                f"         bash {pg_bootstrap / 'init-db.sh'}\n"
                f"    2. Pull raw data from Postgres:\n"
                f"         bash {pull_script}\n"
                f"    3. Re-run this transpiler.\n"
            )

    log(f"rulebook={rulebook_path}")
    log(f"raw-data={json_path}")
    log(f"mode={'write-computed (full view row)' if WRITE_COMPUTED else 'raws-only (default)'}")

    rulebook = json.loads(rulebook_path.read_text())
    raw_data = load_raw_data(json_path)

    pending_updates: List[Tuple[Dict, str, Any, Any, str, Any]] = []
    tables_touched = 0

    for table_name, table in rulebook.items():
        if not is_table(table_name, table):
            continue

        schema = table["schema"]
        # In default mode: raw + relationship fields. In ERB_WRITE_COMPUTED
        # mode: every field type, so the rulebook adopts the full computed
        # view row (the answer-key refresh path).
        writable = [f for f in schema if f.get("type", "raw") in WRITABLE_TYPES]

        if not writable:
            continue

        table_snake = snake(table_name)
        if table_snake not in raw_data:
            warn(f"table '{table_name}' ({table_snake}) not found in raw-data JSON")
            continue

        pg_rows = raw_data[table_snake]
        if not pg_rows:
            warn(f"table '{table_name}' has no rows in raw-data JSON")
            continue

        pk_field = schema[0]["name"] if schema else None
        if not pk_field:
            die(f"table '{table_name}' has no fields")

        pk_col = snake(pk_field)
        pg_by_pk = {}
        for pg_row in pg_rows:
            if pk_col not in pg_row:
                warn(f"{table_snake}: row missing expected PK column '{pk_col}'")
                continue
            pg_by_pk[pg_row[pk_col]] = pg_row

        for row in table.get("data", []):
            if pk_field not in row:
                warn(f"{table_name} rulebook row missing PK field '{pk_field}'")
                continue
            pk_val = row[pk_field]
            pg_row = pg_by_pk.get(pk_val)
            if pg_row is None:
                warn(f"{table_name}[{pk_val}] not in Postgres (deleted?)")
                continue

            for f in writable:
                col = snake(f["name"])
                if col not in pg_row:
                    continue
                new_val = pg_row[col]
                old_val = row.get(f["name"])
                if norm(old_val) != norm(new_val):
                    pending_updates.append((row, f["name"], new_val, old_val, table_name, pk_val))

        tables_touched += 1

    if not pending_updates:
        log(f"up to date — {tables_touched} table(s) checked, nothing changed")
        return

    for (row, field_name, new_val, _old, _t, _pk) in pending_updates:
        row[field_name] = new_val

    tmp = rulebook_path.with_suffix(".json.tmp")
    tmp.write_text(json.dumps(rulebook, indent=2, ensure_ascii=False) + "\n")
    os.replace(tmp, rulebook_path)

    log(f"updated {len(pending_updates)} field value(s) across {tables_touched} table(s)")
    for (_row, field_name, new_val, old_val, t, pk) in pending_updates:
        log(f"  {t}[{pk}].{field_name}: {old_val!r} -> {new_val!r}")


if __name__ == "__main__":
    main()
