#!/usr/bin/env python3
"""
PostgreSQL Substrate Test Runner
================================
Queries all vw_* views from PostgreSQL and writes results to test-answers/.

This substrate is tested EQUALLY with all other substrates (Python, Go, etc.)
against the canonical answer keys generated directly from the rulebook.

The PostgreSQL views implement the calculated fields using SQL functions
generated from the rulebook formulas. This test verifies that the SQL
implementation matches the canonical specification.
"""

import json
import os
import sys
from pathlib import Path

import psycopg2
from psycopg2.extras import RealDictCursor

# Setup paths
SCRIPT_DIR = Path(__file__).parent.resolve()
PROJECT_ROOT = SCRIPT_DIR.parent.parent

# This substrate is repo-level but operates on the active domain's testing
# dir. The domain is named in the ERB_DOMAIN env var; every caller (the
# orchestrator, build-all-domains.sh, ad-hoc invocations) sets it explicitly.
ACTIVE_DOMAIN = os.environ.get("ERB_DOMAIN", "").strip()
if not ACTIVE_DOMAIN:
    raise RuntimeError(
        "ERB_DOMAIN is not set. effortless-postgres/take-test.py must be "
        "invoked with ERB_DOMAIN=<slug> in its environment."
    )
DOMAIN_DIR = PROJECT_ROOT / "rulebook-examples" / ACTIVE_DOMAIN
TESTING_DIR = DOMAIN_DIR / "testing"
BLANK_TESTS_DIR = TESTING_DIR / "blank-tests"
TEST_ANSWERS_DIR = TESTING_DIR / SCRIPT_DIR.name / "test-answers"

# Add orchestration to path for shared utilities
sys.path.insert(0, str(PROJECT_ROOT / "orchestration"))
from shared import load_rulebook, to_snake_case, discover_primary_key, get_default_database_url


def get_db_connection_string():
    """Return DATABASE_URL from env, or `erb_<active-domain>` on localhost."""
    return os.environ.get("DATABASE_URL") or get_default_database_url()


def discover_views(conn) -> list:
    """Query postgres for all vw_* views"""
    cur = conn.cursor()
    cur.execute("""
        SELECT table_name
        FROM information_schema.views
        WHERE table_name LIKE 'vw_%'
        ORDER BY table_name
    """)
    views = [row[0] for row in cur.fetchall()]
    cur.close()
    return views


def view_to_entity_name(view_name: str) -> str:
    """Convert view name to entity name: vw_products -> products"""
    return view_name.replace('vw_', '')


def query_view(conn, view_name: str, pk: str = None) -> list:
    """Query a view and return all records as dicts"""
    cur = conn.cursor(cursor_factory=RealDictCursor)

    if pk:
        cur.execute(f"SELECT * FROM {view_name} ORDER BY {pk}")
    else:
        cur.execute(f"SELECT * FROM {view_name}")

    rows = cur.fetchall()
    records = [dict(row) for row in rows]
    cur.close()
    return records


# Primary-key discovery lives in orchestration/shared.discover_primary_key —
# imported above. Do NOT duplicate it here; if you change PK semantics in one
# place and forget the other, substrates score against wrong keys.


def main():
    print("PostgreSQL Substrate: Starting test...")

    # Load rulebook — required for primary-key discovery. Without it we cannot
    # score the views against the right keys, so we fail loudly.
    rulebook = load_rulebook()

    # Connect to database
    conn_str = get_db_connection_string()
    conn = psycopg2.connect(conn_str)
    print(f"PostgreSQL Substrate: Connected to database")

    # Ensure output directory exists
    TEST_ANSWERS_DIR.mkdir(parents=True, exist_ok=True)

    # Discover and query all views
    views = discover_views(conn)
    print(f"PostgreSQL Substrate: Found {len(views)} views")
    if not views:
        raise RuntimeError(
            f"No vw_* views found in postgres at {conn_str}. "
            f"The rulebook-to-postgres build has not run, or it produced no "
            f"views. Run 'effortless build' in the postgres dir first."
        )

    total_records = 0
    for view in views:
        entity = view_to_entity_name(view)
        pk = discover_primary_key(rulebook, entity)

        records = query_view(conn, view, pk)

        # Save to test-answers
        output_path = TEST_ANSWERS_DIR / f"{entity}.json"
        with open(output_path, 'w') as f:
            json.dump(records, f, indent=2, default=str)

        total_records += len(records)
        print(f"  -> {entity}: {len(records)} records")

    conn.close()

    print(f"PostgreSQL Substrate: Processed {len(views)} views, {total_records} total records")


if __name__ == "__main__":
    main()
