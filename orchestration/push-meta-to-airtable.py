#!/usr/bin/env python3
"""
Push the new `__meta__` table to every Airtable-backed project's base.

For each Airtable-backed project under `rulebook-examples/`:
  1. Look at the project's effortless.json to find its baseId.
  2. List existing tables in the base.
  3. If `__meta__` does not exist, create it via the Airtable schema API
     with this schema (matches the rulebook JSON):
        - MetaKey     singleLineText  (primary)
        - Name        formula         (= {MetaKey})
        - ValueType   singleSelect    {string, object, array}
        - StringValue multilineText
        - JsonValue   multilineText
  4. Pull the rulebook's __meta__ rows and POST them as records.
     If rows already exist with matching MetaKey, PATCH them instead.

The Airtable side of the SSoT now carries the same metadata as the JSON.
Since `airtabletorulebook` transpilers are all disabled (per CLAUDE.md), this
push will NOT silently overwrite JSON on next build — Airtable + JSON stay in
agreement only because this script kept them in agreement at push time.

USAGE:
    python orchestration/push-meta-to-airtable.py             # dry run
    python orchestration/push-meta-to-airtable.py --execute   # do it

Requires AIRTABLE_API_KEY in the environment (loaded from .env).
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
from typing import Any

try:
    import requests
except ImportError:
    print("Error: `requests` is required. pip install requests", file=sys.stderr)
    sys.exit(1)

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
RULEBOOK_EXAMPLES = os.path.join(REPO_ROOT, "rulebook-examples")
META_TABLE_NAME = "__meta__"

API_KEY = os.getenv("AIRTABLE_API_KEY")
if not API_KEY:
    print("ERROR: AIRTABLE_API_KEY not set in environment.", file=sys.stderr)
    sys.exit(1)

HEADERS = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}

PLACEHOLDER_BASE_IDS = {"appXXXXXXXXXXXXXX"}


def airtable_get(url: str) -> dict:
    r = requests.get(url, headers=HEADERS, timeout=30)
    r.raise_for_status()
    return r.json()


def airtable_post(url: str, body: dict) -> dict:
    r = requests.post(url, headers=HEADERS, json=body, timeout=30)
    if not r.ok:
        raise RuntimeError(f"POST {url} -> {r.status_code}: {r.text}")
    return r.json()


def airtable_patch(url: str, body: dict) -> dict:
    r = requests.patch(url, headers=HEADERS, json=body, timeout=30)
    if not r.ok:
        raise RuntimeError(f"PATCH {url} -> {r.status_code}: {r.text}")
    return r.json()


def rate_limit() -> None:
    time.sleep(0.22)  # ≤5 req/sec


def discover_airtable_projects() -> list[dict]:
    """Walk rulebook-examples and return [{name, base_id, rulebook_path, effortless_path}, ...]"""
    found: list[dict] = []
    for entry in sorted(os.listdir(RULEBOOK_EXAMPLES)):
        proj_dir = os.path.join(RULEBOOK_EXAMPLES, entry)
        eff_json = os.path.join(proj_dir, "effortless.json")
        if not os.path.exists(eff_json):
            continue
        with open(eff_json, "r", encoding="utf-8") as fp:
            cfg = json.load(fp)
        transpilers = cfg.get("ProjectTranspilers", [])
        has_at = any("airtable" in (t.get("Name", "") or "").lower() for t in transpilers)
        if not has_at:
            continue
        settings = {s.get("Name"): s.get("Value") for s in cfg.get("ProjectSettings", [])}
        base_id = settings.get("baseId") or settings.get("BaseId") or settings.get("base_id")
        if not base_id or base_id in PLACEHOLDER_BASE_IDS:
            continue
        # Find the rulebook path
        eff_rb_dir = os.path.join(proj_dir, "effortless-rulebook")
        if not os.path.isdir(eff_rb_dir):
            continue
        rb_path = None
        for f in os.listdir(eff_rb_dir):
            if f.endswith("-rulebook.json"):
                rb_path = os.path.join(eff_rb_dir, f)
                break
        if not rb_path:
            continue
        found.append({
            "name": entry,
            "base_id": base_id,
            "rulebook_path": rb_path,
            "effortless_path": eff_json,
        })
    return found


def list_base_tables(base_id: str) -> list[dict]:
    url = f"https://api.airtable.com/v0/meta/bases/{base_id}/tables"
    return airtable_get(url).get("tables", [])


def create_meta_table(base_id: str) -> dict:
    """Create the __meta__ table. Airtable rejects formula fields at create-time,
    so we create the table with the raw columns first, then add the Name
    formula field in a follow-up request."""
    create_url = f"https://api.airtable.com/v0/meta/bases/{base_id}/tables"
    body = {
        "name": META_TABLE_NAME,
        "description": (
            "Project-level metadata that travels with the rulebook: tagline, motif, "
            "narrative descriptions, substrate list, signature rows, etc. One row per "
            "metadata key. Use ValueType to interpret StringValue vs JsonValue."
        ),
        "fields": [
            {"name": "MetaKey",     "type": "singleLineText",
             "description": "The metadata key (e.g. 'tagline', 'motif_palette', 'substrates'). Primary; unique within the table."},
            {"name": "ValueType",   "type": "singleSelect",
             "options": {"choices": [{"name": "string"}, {"name": "object"}, {"name": "array"}]},
             "description": "How to interpret the value columns: 'string' (use StringValue), 'object' or 'array' (parse JsonValue)."},
            {"name": "StringValue", "type": "multilineText",
             "description": "Plain string value. Populated when ValueType == 'string'; empty otherwise."},
            {"name": "JsonValue",   "type": "multilineText",
             "description": "JSON-encoded value. Populated when ValueType == 'object' or 'array'; empty when 'string'."},
        ],
    }
    created = airtable_post(create_url, body)
    table_id = created.get("id")
    if not table_id:
        raise RuntimeError(f"create_meta_table: no table id in response: {created}")
    rate_limit()
    # Add the Name formula field.
    field_url = f"https://api.airtable.com/v0/meta/bases/{base_id}/tables/{table_id}/fields"
    airtable_post(field_url, {
        "name": "Name",
        "type": "formula",
        "options": {"formula": "{MetaKey}"},
        "description": "Identifier for this metadata entry; mirrors MetaKey.",
    })
    return created


def fetch_existing_rows(base_id: str, table_name: str) -> dict[str, dict]:
    """Return {MetaKey: record} for everything currently in the table."""
    url = f"https://api.airtable.com/v0/{base_id}/{table_name}"
    out: dict[str, dict] = {}
    offset = None
    while True:
        params = {"pageSize": 100}
        if offset:
            params["offset"] = offset
        r = requests.get(url, headers=HEADERS, params=params, timeout=30)
        r.raise_for_status()
        data = r.json()
        for rec in data.get("records", []):
            key = rec.get("fields", {}).get("MetaKey")
            if key:
                out[key] = rec
        offset = data.get("offset")
        if not offset:
            break
        rate_limit()
    return out


def rulebook_meta_rows(rb_path: str) -> list[dict]:
    with open(rb_path, "r", encoding="utf-8") as fp:
        rb = json.load(fp)
    tbl = rb.get(META_TABLE_NAME)
    if not tbl or not isinstance(tbl.get("data"), list):
        return []
    rows: list[dict] = []
    for r in tbl["data"]:
        if not isinstance(r, dict):
            continue
        key = r.get("MetaKey")
        if not key:
            continue
        rows.append({
            "MetaKey": key,
            "ValueType": r.get("ValueType") or "string",
            "StringValue": r.get("StringValue") or "",
            "JsonValue": r.get("JsonValue") or "",
        })
    return rows


def push_rows(base_id: str, rows: list[dict], existing: dict[str, dict], dry_run: bool) -> tuple[int, int]:
    """Returns (created, updated)."""
    url = f"https://api.airtable.com/v0/{base_id}/{META_TABLE_NAME}"
    created = 0
    updated = 0
    to_create = []
    to_update = []
    for row in rows:
        existing_rec = existing.get(row["MetaKey"])
        # Build the field payload — strip Name (Airtable computes it).
        fields = {
            "MetaKey": row["MetaKey"],
            "ValueType": row["ValueType"],
            "StringValue": row["StringValue"],
            "JsonValue": row["JsonValue"],
        }
        if existing_rec:
            to_update.append({"id": existing_rec["id"], "fields": fields})
        else:
            to_create.append({"fields": fields})

    # Airtable allows up to 10 records per write request.
    def chunks(xs, n):
        for i in range(0, len(xs), n):
            yield xs[i:i+n]

    if dry_run:
        return (len(to_create), len(to_update))

    for batch in chunks(to_create, 10):
        airtable_post(url, {"records": batch, "typecast": True})
        created += len(batch)
        rate_limit()
    for batch in chunks(to_update, 10):
        airtable_patch(url, {"records": batch, "typecast": True})
        updated += len(batch)
        rate_limit()
    return (created, updated)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--execute", action="store_true", help="Actually push to Airtable (default is dry run).")
    ap.add_argument("--only", help="Comma-separated slugs to limit to (e.g. 'acme-llc,talisman-basic').")
    args = ap.parse_args()
    dry_run = not args.execute

    projects = discover_airtable_projects()
    if args.only:
        keep = {s.strip() for s in args.only.split(",") if s.strip()}
        projects = [p for p in projects if p["name"] in keep]

    print(f"Found {len(projects)} Airtable-backed project(s):")
    for p in projects:
        print(f"  - {p['name']:35} base={p['base_id']}")
    print()
    print(f"Mode: {'DRY RUN' if dry_run else 'EXECUTE'}")
    print()

    total_created_tables = 0
    total_created_rows = 0
    total_updated_rows = 0

    for p in projects:
        name = p["name"]
        base_id = p["base_id"]
        rb_path = p["rulebook_path"]
        rel_rb = os.path.relpath(rb_path, REPO_ROOT)
        print(f"=== {name} ===")
        print(f"  base   : {base_id}")
        print(f"  source : {rel_rb}")

        try:
            tables = list_base_tables(base_id)
        except Exception as exc:  # noqa: BLE001
            print(f"  ERROR  could not list tables: {exc}")
            continue

        has_meta = any(t.get("name") == META_TABLE_NAME for t in tables)
        if not has_meta:
            print(f"  + table  __meta__ not present, will CREATE")
            if not dry_run:
                try:
                    create_meta_table(base_id)
                    total_created_tables += 1
                except Exception as exc:  # noqa: BLE001
                    print(f"  ERROR  create table failed: {exc}")
                    continue
                rate_limit()
        else:
            print(f"  = table  __meta__ already exists")

        rows = rulebook_meta_rows(rb_path)
        if not rows:
            print(f"  (no __meta__ rows in {rel_rb}; nothing to push)\n")
            continue

        if has_meta or not dry_run:
            try:
                existing = fetch_existing_rows(base_id, META_TABLE_NAME)
            except Exception as exc:  # noqa: BLE001
                print(f"  ERROR  could not fetch existing rows: {exc}")
                continue
        else:
            existing = {}

        c, u = push_rows(base_id, rows, existing, dry_run)
        total_created_rows += c
        total_updated_rows += u
        if dry_run:
            print(f"  rows   : would create={c}, would update={u}")
        else:
            print(f"  rows   : created={c}, updated={u}")
        print()

    print("=" * 60)
    print(f"Tables {'would be created' if dry_run else 'created'}: {total_created_tables}")
    print(f"Rows   {'would be created' if dry_run else 'created'}: {total_created_rows}")
    print(f"Rows   {'would be updated' if dry_run else 'updated'}: {total_updated_rows}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
