#!/usr/bin/env python3
"""
Shared functions for ERB execution substrate generators.
All inject-into-*.py scripts use these common utilities.
"""

import json
import os
from pathlib import Path
from datetime import datetime


def get_active_domain():
    """Return the active domain name from the ERB_DOMAIN env var.

    Fails loudly if unset or empty. Every caller that needs a domain must
    receive one explicitly from its parent process — there is no project-wide
    "current domain" state.
    """
    domain = os.environ.get("ERB_DOMAIN", "").strip()
    if not domain:
        raise RuntimeError(
            "ERB_DOMAIN is not set. Every script that needs a domain must be "
            "invoked with ERB_DOMAIN=<slug> in its environment (e.g. "
            "`ERB_DOMAIN=acme-llc python3 take-test.py`)."
        )
    return domain


def get_default_database_url():
    """Default DATABASE_URL derived from the active domain.

    erb_<domain> on localhost (hyphens → underscores per PG identifier rules).
    Mirrors the formula in orchestrate.sh. DATABASE_URL overrides.
    """
    domain = get_active_domain()
    db_name = "erb_" + domain.replace("-", "_")
    return f"postgresql://postgres@localhost:5432/{db_name}"


def find_domain_root(domain, project_root=None):
    """Return the directory containing a domain, searching rulebook-examples/ then toy-rulebooks/.

    Fails loudly if the domain is not found in either location.
    """
    if project_root is None:
        project_root = Path(__file__).parent.parent.parent.parent  # repo root: orchestration/ lives in rulebook-examples/legacy-runner/
    for parent in ("rulebook-examples", "toy-rulebooks"):
        candidate = project_root / parent / domain
        if candidate.is_dir():
            return candidate
    raise FileNotFoundError(
        f"Domain '{domain}' not found under rulebook-examples/ or toy-rulebooks/. "
        f"(ERB_DOMAIN={domain!r})"
    )


def get_rulebook_path():
    """Get the path to the rulebook JSON for the active domain.

    Priority:
      1. ERB_RULEBOOK_PATH env var (set by ssotme-proxy for project-scoped runs)
      2. ERB_DOMAIN → (rulebook-examples or toy-rulebooks)/<domain>/effortless-rulebook/<domain>-rulebook.json

    Fails loudly if ERB_RULEBOOK_PATH points at a directory or doesn't end in
    -rulebook.json — callers MUST pass an exact file path.
    """
    env_path = os.environ.get("ERB_RULEBOOK_PATH")
    if env_path:
        p = Path(env_path)
        if p.is_dir():
            raise IsADirectoryError(
                f"ERB_RULEBOOK_PATH points at a directory: {p}. "
                f"Pass an exact file path to a <domain>-rulebook.json."
            )
        return p
    domain = get_active_domain()
    domain_root = find_domain_root(domain)
    return domain_root / "effortless-rulebook" / f"{domain}-rulebook.json"


def load_rulebook():
    """Load and parse the rulebook JSON. Fails loudly if missing or not a file."""
    rulebook_path = get_rulebook_path()
    if not rulebook_path.exists():
        raise FileNotFoundError(
            f"Rulebook not found at {rulebook_path}. "
            f"(ERB_RULEBOOK_PATH={os.environ.get('ERB_RULEBOOK_PATH')!r})"
        )
    if rulebook_path.is_dir():
        raise IsADirectoryError(
            f"Rulebook path is a directory, not a file: {rulebook_path}. "
            f"Pass an exact <domain>-rulebook.json path."
        )
    with open(rulebook_path, 'r', encoding='utf-8') as f:
        return json.load(f)


def get_active_project_substrates(domain=None):
    """Return the ordered list of execution substrate names declared by the
    active project's effortless.json.

    The mapping is: take the last path segment of each transpiler's
    RelativePath. The Airtable in/out transpilers both map to the airtable
    substrate; transpilers under /effortless-* RelativePaths map to their
    effortless-prefixed substrate folders. Disabled transpilers are skipped.

    Fails loudly if the project has no effortless.json or it can't be parsed —
    every active domain MUST be a valid Effortless project.
    """
    if domain is None:
        domain = get_active_domain()
    project_root = Path(__file__).parent.parent.parent.parent  # repo root: orchestration/ lives in rulebook-examples/legacy-runner/
    domain_root = find_domain_root(domain, project_root)
    ej = domain_root / "effortless.json"
    if not ej.exists():
        raise FileNotFoundError(
            f"effortless.json not found at {ej}. "
            f"Domain '{domain}' is not a valid Effortless project."
        )
    with open(ej, 'r', encoding='utf-8') as f:
        cfg = json.load(f)

    substrates = []
    seen = set()
    for t in cfg.get("ProjectTranspilers", []):
        if t.get("IsDisabled"):
            continue
        rp = (t.get("RelativePath") or "").strip("/")
        # Airtable in/out spokes both live under /effortless-rulebook[/...].
        # They aren't computation substrates by themselves — they map to the
        # airtable oracle substrate.
        if rp.startswith("effortless-rulebook"):
            substrate = "airtable"
        else:
            # Last segment of the relative path is the substrate folder name
            # (e.g. /python -> python, /effortless-xlsx -> effortless-xlsx,
            #  /entity-framework -> effortless-entity-framework via the table
            #  below).
            substrate = rp.rsplit("/", 1)[-1] if rp else ""

        # The Effortless-licensed transpilers write to per-domain folders like
        # /postgres-bootstrap, /effortless-xlsx, /entity-framework, but the
        # conformance test runners live under the effortless-prefixed folders
        # in execution-substrates/. Apply the small alias table.
        EFFORTLESS_ALIASES = {
            "postgres":           "effortless-postgres",   # legacy folder name
            "postgres-bootstrap": "effortless-postgres",   # current folder name post rulebook-as-HEAD refactor
            "entity-framework":   "effortless-entity-framework",
        }
        substrate = EFFORTLESS_ALIASES.get(substrate, substrate)

        if substrate and substrate not in seen:
            seen.add(substrate)
            substrates.append(substrate)

    return substrates


def ensure_output_folder():
    """Ensure the current working directory exists (it should, since we run from there)."""
    cwd = Path.cwd()
    cwd.mkdir(parents=True, exist_ok=True)
    return cwd


def write_readme(candidate_name, description=None, technology=None):
    """Write a placeholder README.md for the execution substrate.

    Args:
        candidate_name: Name of the target format/substrate (e.g., 'python', 'owl')
        description: Optional description, defaults to a placeholder message
        technology: Optional technology section explaining the format/substrate
    """
    output_folder = ensure_output_folder()
    readme_path = output_folder / "README.md"

    if description is None:
        description = f"Placeholder for {candidate_name} generation from the Effortless Rulebook."

    # Build technology section if provided
    technology_section = ""
    if technology:
        technology_section = f"\n## Technology\n\n{technology}\n"

    rulebook_rel = get_rulebook_path().name

    content = f"""# {candidate_name.title()} Execution Substrate

{description}
{technology_section}
## Status

This is a placeholder generated by the ERB orchestration system.

## Source

Generated from: `effortless-rulebook/{rulebook_rel}`

"""

    with open(readme_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"Created {readme_path}")
    return readme_path


def get_candidate_name_from_cwd():
    """Extract the candidate name from the current working directory.

    Assumes we're running from /execution-substrates/{candidate}/
    """
    return Path.cwd().name


def clean_generated_files(generated_files: list, substrate_name: str = None):
    """Remove generated files from a substrate directory.

    Args:
        generated_files: List of filenames (relative to cwd) to remove
        substrate_name: Optional name for logging (defaults to cwd name)

    Returns:
        List of files that were successfully removed
    """
    if substrate_name is None:
        substrate_name = get_candidate_name_from_cwd()

    cwd = Path.cwd()
    removed = []

    print(f"Cleaning generated files for {substrate_name}...")

    for filename in generated_files:
        file_path = cwd / filename
        if file_path.exists():
            try:
                file_path.unlink()
                print(f"  Removed: {filename}")
                removed.append(filename)
            except Exception as e:
                print(f"  Failed to remove {filename}: {e}")
        else:
            print(f"  Skipped (not found): {filename}")

    if removed:
        print(f"Cleaned {len(removed)} file(s)")
    else:
        print("No files to clean")

    return removed


def handle_clean_arg(generated_files: list, description: str = None):
    """Check for --clean argument and perform cleanup if requested.

    Args:
        generated_files: List of filenames to remove when cleaning
        description: Optional description to display

    Returns:
        True if --clean was handled (script should exit), False otherwise
    """
    import sys

    if '--clean' in sys.argv:
        substrate_name = get_candidate_name_from_cwd()
        if description:
            print(f"\n{description}\n")
        print(f"=" * 60)
        print(f"CLEAN MODE: {substrate_name.upper()}")
        print(f"=" * 60)
        clean_generated_files(generated_files, substrate_name)
        return True

    return False


# =============================================================================
# ENTITY DISCOVERY FUNCTIONS
# =============================================================================
# These functions discover entities, schemas, and computed columns from the
# rulebook. They enable multi-entity processing across all substrates.
# =============================================================================

import re


def to_snake_case(name: str) -> str:
    """Convert PascalCase to snake_case: UserAccounts -> user_accounts

    Also handles fields with existing underscores: Bio_HockettScore -> bio_hockett_score
    """
    # Use [^_] to avoid doubling underscores when input already has them
    s1 = re.sub('([^_])([A-Z][a-z]+)', r'\1_\2', name)
    return re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1).lower()


def to_pascal_case(name: str) -> str:
    """Convert snake_case to PascalCase: user_accounts -> UserAccounts"""
    return ''.join(word.capitalize() for word in name.split('_'))


def discover_entities(rulebook: dict) -> list:
    """
    Discover all entities from the rulebook.
    Entities are top-level keys that have a 'schema' array. Includes the
    project-level `__meta__` table — it's now a first-class table with the
    same `schema`/`data` shape as every other entity, so injectors materialize
    it the same way (CSV sheet, Postgres table, etc.).
    Returns list of entity names in PascalCase (as they appear in rulebook).
    """
    entities = []
    skip_keys = {'$schema', 'model_name', 'Description', 'Name'}

    for key, value in rulebook.items():
        if key in skip_keys:
            continue
        if isinstance(value, dict) and 'schema' in value:
            entities.append(key)

    return entities


def get_entity_schema(rulebook: dict, entity_name: str) -> list:
    """
    Get the schema array for an entity.
    Handles both PascalCase and snake_case entity names.
    """
    # Try direct lookup first
    if entity_name in rulebook:
        return rulebook[entity_name].get('schema', [])

    # Try converting from snake_case to PascalCase
    pascal_name = to_pascal_case(entity_name)
    if pascal_name in rulebook:
        return rulebook[pascal_name].get('schema', [])

    # Try converting from PascalCase to snake_case and look up
    snake_name = to_snake_case(entity_name)
    for key in rulebook:
        if to_snake_case(key) == snake_name:
            return rulebook[key].get('schema', [])

    return []


def get_entity_data(rulebook: dict, entity_name: str) -> list:
    """
    Get the data array for an entity.
    Handles both PascalCase and snake_case entity names.
    """
    # Try direct lookup first
    if entity_name in rulebook:
        return rulebook[entity_name].get('data', [])

    # Try converting from snake_case to PascalCase
    pascal_name = to_pascal_case(entity_name)
    if pascal_name in rulebook:
        return rulebook[pascal_name].get('data', [])

    # Try converting from PascalCase to snake_case and look up
    snake_name = to_snake_case(entity_name)
    for key in rulebook:
        if to_snake_case(key) == snake_name:
            return rulebook[key].get('data', [])

    return []


def discover_primary_key(rulebook: dict, entity_name: str) -> str:
    """
    Discover the primary key for an entity by trying the legitimate ERB PK
    shapes in order. Each strategy is a SUPPORTED convention, not a guess
    around a missing one.

    Strategies (in order):
      1. First non-nullable field — the canonical ERB convention.
      2. First field ending in 'Id' — accepted when nullable flags are missing.
      3. First field in the schema — accepted for tiny entities that have a
         single natural-key column.

    If the schema is empty there is no PK to discover and downstream code
    cannot build a valid JOIN — RAISE rather than returning None and letting
    the caller silently produce wrong output.
    """
    schema = get_entity_schema(rulebook, entity_name)

    if not schema:
        raise ValueError(
            f"Cannot discover primary key for {entity_name!r}: schema is empty. "
            f"Check the rulebook entity definition."
        )

    # Strategy 1: first non-nullable field (canonical ERB)
    for field in schema:
        if field.get('nullable') == False:
            return to_snake_case(field['name'])

    # Strategy 2: first field ending in 'Id'
    for field in schema:
        if field['name'].endswith('Id'):
            return to_snake_case(field['name'])

    # Strategy 3: first field in the schema
    return to_snake_case(schema[0]['name'])


def discover_computed_columns(
    rulebook: dict,
    entity_name: str,
    include: tuple = ('calculated', 'aggregation', 'lookup'),
) -> list:
    """
    Discover computed columns for an entity.
    Returns list of snake_case column names where field type is in `include`.
    Default includes all three computed kinds: calculated, aggregation, lookup.
    Pass `include=('calculated',)` for scalar-only.
    """
    schema = get_entity_schema(rulebook, entity_name)

    computed = []
    for field in schema:
        if field.get('type') in include:
            computed.append(to_snake_case(field['name']))

    return computed


def get_calculated_fields(schema: list) -> list:
    """
    Extract all calculated fields from a schema.
    Returns list of field dicts where type is "calculated" and formula exists.

    Note: "lookup" type fields are NOT included here - they use INDEX/MATCH formulas
    that require cross-table access. Each substrate must compute them in its own
    engine. (The Python simulator's compute_lookups() now lives at
    execution-substrates/python/python_only_erb_simulator.py.)
    """
    return [
        field for field in schema
        if field.get('type') == 'calculated' and field.get('formula')
    ]


def get_raw_fields(schema: list) -> list:
    """Extract all raw fields from a schema."""
    return [field for field in schema if field.get('type') == 'raw']


def get_aggregation_fields(schema: list) -> list:
    """Extract all aggregation fields from a schema."""
    return [field for field in schema if field.get('type') == 'aggregation']


def get_lookup_fields(schema: list) -> list:
    """Extract all lookup fields from a schema (INDEX/MATCH formulas)."""
    return [field for field in schema if field.get('type') == 'lookup' and field.get('formula')]
# =============================================================================
# INDEX/MATCH and COUNTIFS/SUMIFS interpreters MOVED OUT
# =============================================================================
# The cross-table interpreters (compute_lookups, compute_aggregations,
# parse_index_match_formula, parse_countifs_formula, parse_sumifs_formula,
# load_related_data) used to live here. They were the load-bearing cheat:
# any substrate could import them and report 100% without executing anything
# native.
#
# They now live inside the Python substrate's fence at:
#   execution-substrates/python/python_only_erb_simulator.py
#
# Any non-Python substrate that needs cross-table lookups or aggregations
# must implement them in its own engine. See CONFORMANCE_CLEANUP_PLAN.md.
# =============================================================================


def estimate_llm_time(rulebook: dict, seconds_per_unit: float = 2.0) -> str:
    """
    Estimate how long LLM-based testing will take based on rulebook size.

    Calculation: sum of (fields * rows) for each entity
    Assumes each unit takes ~seconds_per_unit seconds.
    Returns time rounded UP to nearest 15 seconds in "m:ss" format.

    Args:
        rulebook: The loaded rulebook dictionary
        seconds_per_unit: Estimated seconds per field*row unit (default 2.0)

    Returns:
        Formatted string like "2:30" (2 minutes, 30 seconds)
    """
    import math
    entities = discover_entities(rulebook)
    total_units = 0

    for entity in entities:
        schema = get_entity_schema(rulebook, entity)
        data = get_entity_data(rulebook, entity)
        num_fields = len(schema)
        num_rows = len(data)
        total_units += num_fields * num_rows

    # Calculate seconds and round UP to nearest 15
    total_seconds = int(total_units * seconds_per_unit)
    rounded_seconds = math.ceil(total_seconds / 15) * 15

    # Ensure at least 15 seconds
    rounded_seconds = max(15, rounded_seconds)

    # Format as m:ss
    minutes = rounded_seconds // 60
    seconds = rounded_seconds % 60
    return f"{minutes}:{seconds:02d}"
