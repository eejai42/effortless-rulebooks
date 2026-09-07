#!/usr/bin/env python3
"""
Migrate the platform rulebook's `_meta` keys into the right home.

The platform rulebook
(`effortless-platform/effortless-rulebook/effortless-rulebook.json`)
carries project-level metadata in two complementary places:

  1. **First-class narrative tables** — for the narrative essays that
     deserve their own table because they describe load-bearing
     concepts of the platform itself (`ProjectGoal`,
     `ArchitecturalHighlight`, `BootstrapStory`, etc.). Mapping below.

  2. **The `__meta__` table** — the same typed-row hybrid table every
     demo rulebook uses (see `migrate-meta-to-table.py`). This is the
     overflow bucket for project-level metadata that does NOT deserve
     its own table: presentation hints (`tagline`, `motif`,
     `motif_palette`), reception-desk content (`description_rich`,
     `use_cases`, `signature_rows`, `journal_seed`),
     substrate-witness chips, etc.

Doctrine (see CLAUDE.md `__meta__` table doctrine section): any stray
meta-data found outside the table protocol is promoted INTO the
protocol. Known narrative keys go to their first-class table; every
other key lands as a `__meta__` row. Nothing is left orphaned outside
the table protocol.

Mapping (known narrative keys become single-row tables with
`{Name, Description}` schema):

    _CMCC_Summary           -> CMCCSummary
    _ProjectGoal            -> ProjectGoal
    _ArchitecturalHighlight -> ArchitecturalHighlight
    _WriteThroughInvariant  -> WriteThroughInvariant
    _PortalCliParity        -> PortalCliParity
    _BootstrapStory         -> BootstrapStory
    _DeveloperJourney       -> DeveloperJourney
    _ResilienceClaim        -> ResilienceClaim

Idempotent: a narrative table that already exists is left untouched;
an existing `__meta__` table is merged into (existing rows win).
The `_meta` object is removed when migration succeeds.
"""

from __future__ import annotations

import json
import os
import sys

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
PLATFORM_RULEBOOK = os.path.join(
    REPO_ROOT,
    "effortless-rulebook",
    "effortless-rulebook.json",
)

TABLE_FOR_META_KEY: dict[str, dict[str, str]] = {
    "_CMCC_Summary": {
        "table": "CMCCSummary",
        "description": "One-line CMCC framing for the platform rulebook itself: what it is, what it generates, and what conformance it claims.",
    },
    "_ProjectGoal": {
        "table": "ProjectGoal",
        "description": "The primary goal of the platform: the load-bearing claim the project is built to demonstrate.",
    },
    "_ArchitecturalHighlight": {
        "table": "ArchitecturalHighlight",
        "description": "The architectural pattern that makes the platform work: input spokes write to the rulebook, output spokes read from it, conformance binds them.",
    },
    "_WriteThroughInvariant": {
        "table": "WriteThroughInvariant",
        "description": "The portal-vs-rulebook write-through invariant: Postgres is the live editor, JSON is the durable SSoT, every save writes to both.",
    },
    "_PortalCliParity": {
        "table": "PortalCliParity",
        "description": "The portal and the `./start.sh --cli` interface are peer interfaces to the same effortless.json pipeline; portal behaviour cannot drift from CLI behaviour.",
    },
    "_BootstrapStory": {
        "table": "BootstrapStory",
        "description": "The cold-start story: from `git clone` to a running portal with a default user landing on Home.",
    },
    "_DeveloperJourney": {
        "table": "DeveloperJourney",
        "description": "The intended developer path through the portal: Home → project → Rulebook → Substrates → Builds → Tests → Input Spokes → Users.",
    },
    "_ResilienceClaim": {
        "table": "ResilienceClaim",
        "description": "The resilience claim: dropping the Postgres editor at any time is safe, because `./start.sh` rebuilds it from JSON.",
    },
}

NARRATIVE_SCHEMA = [
    {
        "name": "Name",
        "datatype": "string",
        "type": "raw",
        "nullable": False,
        "Description": "Identifier for this narrative entry (single-row tables use 'primary').",
    },
    {
        "name": "Description",
        "datatype": "string",
        "type": "raw",
        "nullable": False,
        "Description": "The full narrative content for this concept.",
    },
]


def main() -> int:
    if not os.path.exists(PLATFORM_RULEBOOK):
        print(f"Platform rulebook not found at {PLATFORM_RULEBOOK}", file=sys.stderr)
        return 1

    # Import the demo-rulebook __meta__ table machinery so the overflow
    # bucket on the platform uses exactly the same schema and helpers as
    # every demo rulebook.
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from importlib import import_module
    meta_module = import_module("migrate-meta-to-table")

    with open(PLATFORM_RULEBOOK, "r", encoding="utf-8") as fp:
        data = json.load(fp)

    meta = data.pop("_meta", None)
    if not meta:
        print("No _meta object on platform rulebook; nothing to migrate.")
        return 0

    created: list[str] = []
    skipped_existing: list[str] = []
    overflow: dict = {}

    for meta_key, value in meta.items():
        mapping = TABLE_FOR_META_KEY.get(meta_key)
        if mapping is None:
            # Unmapped keys are NOT errors — they go to the __meta__
            # overflow bucket, which is the same first-class table demo
            # rulebooks use. Nothing is left outside the table protocol.
            overflow[meta_key] = value
            continue
        table_name = mapping["table"]
        if table_name in data:
            skipped_existing.append(table_name)
            continue
        if not isinstance(value, str):
            print(
                f"  WARN  {meta_key}: expected string, got {type(value).__name__}; serializing as JSON.",
                file=sys.stderr,
            )
            value = json.dumps(value, ensure_ascii=False)
        data[table_name] = {
            "Description": mapping["description"],
            "important": False,
            "schema": NARRATIVE_SCHEMA,
            "data": [{"Name": "primary", "Description": value}],
        }
        created.append(table_name)

    overflow_count = 0
    if overflow:
        existing = data.get(meta_module.META_TABLE_NAME)
        data[meta_module.META_TABLE_NAME] = meta_module.build_meta_table(overflow, existing)
        overflow_count = len(overflow)

    with open(PLATFORM_RULEBOOK, "w", encoding="utf-8") as fp:
        json.dump(data, fp, indent=2, ensure_ascii=False)
        fp.write("\n")

    print(f"Migrated platform rulebook _meta.")
    print(f"  Created narrative tables ({len(created)}): {created}")
    if skipped_existing:
        print(f"  Skipped narrative tables (already existed): {skipped_existing}")
    if overflow_count:
        print(f"  Promoted to __meta__ overflow ({overflow_count} keys): {list(overflow.keys())}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
