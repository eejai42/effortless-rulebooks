#!/usr/bin/env python3
"""
Migrate the legacy `_meta` object at the rulebook root into a proper `__meta__`
table with schema + data (typed-row hybrid layout).

Schema (typed-row hybrid):
    Name        - calculated, = MetaKey
    MetaKey     - raw string, primary identifier
    ValueType   - raw string, one of: 'string' | 'object' | 'array'
    StringValue - raw string, nullable (populated when ValueType == 'string')
    JsonValue   - raw string, nullable (JSON-encoded; populated when ValueType != 'string')

This script:
  * Walks `rulebook-examples/` and finds every `*-rulebook.json` (the
    canonical filename per project, per CLAUDE.md).
  * Skips the archived `naked-claude-vs-effortless-claude/` experiment tree
    and any `xlsx/exported-rulebook.json` exports.
  * Skips the project-level platform rulebook
    (`effortless-platform/effortless-rulebook/effortless-rulebook.json`) — that
    one gets a different treatment (each `_meta` key becomes a first-class
    table) via `migrate-platform-meta.py`.
  * For each rulebook: if `_meta` is present, builds an `__meta__` table whose
    `data` rows mirror the `_meta` keys, then deletes the `_meta` object.
  * Strips a leading underscore from `MetaKey` values (so `_CMCC_Summary`
    becomes `CMCC_Summary` in the row) — keeps the table itself the only
    underscore-prefixed identifier in the rulebook.
  * Idempotent: if a rulebook already has an `__meta__` table, the existing
    table is preserved and the `_meta` object (if any) is merged in without
    overwriting prior rows.
"""

from __future__ import annotations

import json
import os
import sys
from typing import Any

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
RULEBOOK_EXAMPLES = os.path.join(REPO_ROOT, "rulebook-examples")
SKIP_PATH_FRAGMENTS = (
    "naked-claude-vs-effortless-claude",
    os.path.join("customer-crm", "xlsx"),
)

META_TABLE_NAME = "__meta__"
META_TABLE_DESCRIPTION = (
    "Project-level metadata that travels with the rulebook: tagline, motif, "
    "narrative descriptions, substrate list, signature rows, etc. One row per "
    "metadata key. Use ValueType to interpret StringValue vs JsonValue."
)

SCHEMA = [
    {
        "name": "MetaKey",
        "datatype": "string",
        "type": "raw",
        "nullable": False,
        "Description": "The metadata key (e.g. 'tagline', 'motif_palette', 'substrates'). Unique within the table."
    },
    {
        "name": "Name",
        "datatype": "string",
        "type": "calculated",
        "nullable": False,
        "formula": "={{MetaKey}}",
        "Description": "Identifier for this metadata entry. Mirrors MetaKey so the row is addressable by Name like every other table."
    },
    {
        "name": "ValueType",
        "datatype": "string",
        "type": "raw",
        "nullable": False,
        "Description": "How to interpret the value columns: 'string' (use StringValue), 'object' (parse JsonValue as JSON object), 'array' (parse JsonValue as JSON array)."
    },
    {
        "name": "StringValue",
        "datatype": "string",
        "type": "raw",
        "nullable": True,
        "Description": "Plain string value. Populated when ValueType == 'string'; null otherwise."
    },
    {
        "name": "JsonValue",
        "datatype": "string",
        "type": "raw",
        "nullable": True,
        "Description": "JSON-encoded value. Populated when ValueType == 'object' or 'array'; null when ValueType == 'string'."
    },
]


def normalize_key(key: str) -> str:
    """Drop a single leading underscore so `_CMCC_Summary` -> `CMCC_Summary`."""
    return key[1:] if key.startswith("_") and not key.startswith("__") else key


def meta_value_to_row(meta_key: str, value: Any) -> dict:
    normalized = normalize_key(meta_key)
    if isinstance(value, str):
        return {
            "MetaKey": normalized,
            "Name": normalized,
            "ValueType": "string",
            "StringValue": value,
            "JsonValue": None,
        }
    if isinstance(value, list):
        return {
            "MetaKey": normalized,
            "Name": normalized,
            "ValueType": "array",
            "StringValue": None,
            "JsonValue": json.dumps(value, ensure_ascii=False),
        }
    if isinstance(value, dict):
        return {
            "MetaKey": normalized,
            "Name": normalized,
            "ValueType": "object",
            "StringValue": None,
            "JsonValue": json.dumps(value, ensure_ascii=False),
        }
    if isinstance(value, (int, float, bool)) or value is None:
        return {
            "MetaKey": normalized,
            "Name": normalized,
            "ValueType": "string",
            "StringValue": "" if value is None else json.dumps(value),
            "JsonValue": None,
        }
    raise TypeError(f"Unsupported meta value type for key {meta_key!r}: {type(value).__name__}")


def build_meta_table(meta_obj: dict, existing_table: dict | None) -> dict:
    rows: list[dict] = []
    seen_keys: set[str] = set()
    if existing_table and isinstance(existing_table.get("data"), list):
        for row in existing_table["data"]:
            if isinstance(row, dict) and "MetaKey" in row:
                rows.append(row)
                seen_keys.add(row["MetaKey"])

    for k, v in meta_obj.items():
        normalized = normalize_key(k)
        if normalized in seen_keys:
            continue
        rows.append(meta_value_to_row(k, v))
        seen_keys.add(normalized)

    return {
        "Description": META_TABLE_DESCRIPTION,
        "important": False,
        "schema": SCHEMA,
        "data": rows,
    }


def discover_rulebooks() -> list[str]:
    found: list[str] = []
    for dirpath, _, filenames in os.walk(RULEBOOK_EXAMPLES):
        if any(frag in dirpath for frag in SKIP_PATH_FRAGMENTS):
            continue
        for fn in filenames:
            if fn.endswith("-rulebook.json"):
                found.append(os.path.join(dirpath, fn))
    return sorted(found)


def migrate_file(path: str) -> tuple[str, str]:
    with open(path, "r", encoding="utf-8") as fp:
        data = json.load(fp)

    meta_obj = data.pop("_meta", None)
    existing_meta_table = data.get(META_TABLE_NAME)

    if meta_obj is None and existing_meta_table is None:
        return path, "no-op (no _meta and no __meta__)"

    if meta_obj is None:
        return path, f"already migrated ({len(existing_meta_table.get('data', []))} rows)"

    meta_table = build_meta_table(meta_obj, existing_meta_table)
    data[META_TABLE_NAME] = meta_table

    with open(path, "w", encoding="utf-8") as fp:
        json.dump(data, fp, indent=2, ensure_ascii=False)
        fp.write("\n")

    return path, f"migrated ({len(meta_table['data'])} rows)"


def main() -> int:
    files = discover_rulebooks()
    if not files:
        print("No rulebooks found.", file=sys.stderr)
        return 1
    print(f"Found {len(files)} rulebook(s) under {RULEBOOK_EXAMPLES}\n")
    for path in files:
        rel = os.path.relpath(path, REPO_ROOT)
        try:
            _, status = migrate_file(path)
        except Exception as exc:  # noqa: BLE001
            print(f"  FAIL  {rel}: {exc}", file=sys.stderr)
            return 2
        print(f"  ok    {rel}: {status}")
    print("\nDone.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
