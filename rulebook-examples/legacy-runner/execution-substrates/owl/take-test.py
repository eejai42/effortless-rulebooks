#!/usr/bin/env python3
"""
Take Test - OWL Execution Substrate

GUARD: This substrate must compute calculated fields using its own native
engine: SHACL via pyshacl. It must NOT import python_only_erb_simulator or
call compute_lookups / compute_aggregations from any orchestration helper.
Fields it cannot compute natively (SHACL rules that fail to compile, or
formula classes the rulebook-to-owl translator doesn't yet support) must be
left null and counted as failures by the grader. The forthcoming first-party
`rulebook-to-owl` tool will close the gap; until then OWL is honestly partial.

This script uses SHACL-SPARQL reasoning to compute derived values:
1. Loads the generated ontology and SHACL rules
2. Runs pyshacl multiple passes to resolve dependencies between computed fields
3. Extracts results to test-answers/ directory

The computation happens in the SHACL reasoner, not in Python code.
"""

import json
import os
import re
import subprocess
import sys
from pathlib import Path

# Auto-install dependencies if needed
def ensure_dependencies():
    """Install required packages if not present."""
    try:
        import rdflib
        import pyshacl
    except ImportError:
        print("Installing dependencies...")
        subprocess.check_call([
            sys.executable, "-m", "pip", "install",
            "rdflib", "pyshacl", "--quiet"
        ])

ensure_dependencies()

from rdflib import Graph, Namespace, Literal, URIRef
from rdflib.namespace import RDF, RDFS, XSD
import pyshacl

# Add project root to path for shared imports
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from orchestration.shared import load_rulebook

# Script directory
script_dir = Path(__file__).parent.resolve()


# =============================================================================
# NAMESPACES
# =============================================================================

# Ontology namespace — MUST match inject-into-owl.py's ONT_NS exactly. The
# injector mints every individual as effortless-ntwf:<pk-slug>; the extractor
# rebuilds the SAME IRI to read computed values back off it. If these drift, the
# graph lookups silently return None and every computed field reads blank — so
# this is a single, shared contract, not two independent constants.
NTWF = Namespace("https://w3id.org/effortless-ntwf#")
SH = Namespace("http://www.w3.org/ns/shacl#")


def _slugify_iri_local(value) -> str:
    """Mirror inject-into-owl.py:slugify_iri_local — PK value → IRI local name.

    Must stay byte-for-byte identical to the injector: the extractor's lookups
    only hit if it reconstructs the exact IRI the injector wrote.
    """
    import re as _re
    return _re.sub(r'[^A-Za-z0-9_\-.]', '-', str(value).strip())


def _primary_key_field(schema: list):
    """The PK field = the first raw column (mirror inject-into-owl.py:get_pk_field)."""
    for col in schema:
        if col.get('type', 'raw') == 'raw':
            return col.get('name')
    return schema[0].get('name') if schema else None


# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

def field_to_property_uri(field_name: str) -> str:
    """Convert field name to property URI (camelCase) - must match injector."""
    if field_name:
        return field_name[0].lower() + field_name[1:]
    return 'unknown'


def camel_to_snake(name: str) -> str:
    """Convert CamelCase to snake_case for output compatibility."""
    s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
    s2 = re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1).lower()
    # Normalize consecutive underscores to single underscore
    return re.sub('_+', '_', s2)


def _resolve_multipass_value(values, field_info, table_name, field_name, pk_value):
    """Pick the converged value when a property carries several (multi-pass).

    The reasoner adds, never replaces, so an aggregation that depends on a
    derived child field leaves a trail: a premature value (counted before the
    dependency materialized) plus the converged value. We resolve by the field's
    convergence semantics, NOT by an arbitrary pick:

      • aggregation / calculated NUMERIC → the converged value is the MAX. A
        COUNT/SUM is monotonic non-decreasing as its dependency rows fill in
        across passes, so the largest is the fixpoint.
      • everything else → distinct multiplicity is unexpected; raise loudly
        rather than silently choosing one (CLAUDE.md "Avoid Silent Fallbacks").
    """
    distinct = []
    for v in values:
        if v not in distinct:
            distinct.append(v)
    if len(distinct) == 1:
        return distinct[0]

    ftype = field_info.get('type')
    numeric = [v for v in distinct if isinstance(v, (int, float)) and not isinstance(v, bool)]
    if ftype in ('aggregation', 'calculated') and len(numeric) == len(distinct):
        return max(numeric)

    raise ValueError(
        f"{table_name}.{field_name} (id={pk_value!r}) has conflicting multi-pass "
        f"values {distinct!r} that cannot be converged by a known rule. The SHACL "
        f"rule likely fired on a not-yet-stable dependency; fix the rule or the "
        f"dependency ordering rather than picking a value arbitrarily."
    )


def rdf_value_to_python(value):
    """Convert an RDF value to Python native type."""
    if value is None:
        return None

    if isinstance(value, Literal):
        py_val = value.toPython()
        if isinstance(py_val, bool):
            return py_val
        if isinstance(py_val, (int, float)):
            return py_val
        return str(py_val)

    if isinstance(value, URIRef):
        # An FK / lookup that resolved to an individual comes back as that
        # individual's IRI (effortless-ntwf:<pk> = https://w3id.org/effortless-ntwf#<pk>).
        # The conformance answer is the bare PK — what Postgres stores in the
        # FK text column — so strip the namespace to the local name. This is the
        # OWL analogue of selecting the id column, not the row's IRI. (Robust to
        # any namespace: splits on the last '#' or '/'.)
        iri = str(value)
        local = re.split(r'[#/]', iri)[-1]
        return local

    return str(value)


# =============================================================================
# SHACL REASONING
# =============================================================================

def run_shacl_reasoning(data_graph: Graph, shacl_graph: Graph, max_passes: int = 5) -> int:
    """
    Run SHACL reasoning with multiple passes to resolve dependencies.

    Some computed fields depend on other computed fields. SHACL-SPARQL rules
    don't automatically handle this in a single pass, so we run multiple passes
    until no new triples are added.

    Returns the number of passes executed.
    """
    passes = 0
    for i in range(max_passes):
        before = len(data_graph)
        pyshacl.validate(
            data_graph,
            shacl_graph=shacl_graph,
            inference='none',  # Don't use rdfs inference - it can cause incorrect property bindings
            inplace=True,
            advanced=True,
            debug=False
        )
        after = len(data_graph)
        passes += 1
        added = after - before
        print(f"   Pass {i+1}: {before} -> {after} triples ({added} added)")

        if added == 0:
            break

    return passes


def extract_entity_results(
    data_graph: Graph,
    table_name: str,
    schema: list,
    data: list
) -> list:
    """
    Extract computed results from RDF graph for a single entity type.

    Returns list of records with all fields (raw + computed) in snake_case.
    """
    records = []

    # Build field info map and partition into raw vs computed.
    # Conformance-cleanup fix 2026-05-12: only RAW field values are carried
    # forward from the rulebook's data array. Computed/lookup/aggregation
    # fields must come from the RDF graph (i.e. from SHACL inference) or
    # remain absent — otherwise we were silently passing the answer key
    # through the supposed reasoner.
    all_fields = []
    raw_snake_keys = set()
    for col in schema:
        col_type = col.get('type', 'raw')
        snake_name = camel_to_snake(col.get('name', ''))
        all_fields.append({
            'name': col.get('name', ''),
            'datatype': col.get('datatype', 'string'),
            'type': col_type,
        })
        if col_type == 'raw':
            raw_snake_keys.add(snake_name)

    # The individual's IRI is keyed by PRIMARY KEY (first raw column), matching
    # the injector. We rebuild effortless-ntwf:<pk-slug> per row to read its
    # computed values back. A row with no PK value would yield a fabricated IRI
    # that matches nothing — surface it loudly rather than silently reading None.
    pk_field = _primary_key_field(schema)

    # Extract each individual
    for i, original_row in enumerate(data):
        pk_value = original_row.get(pk_field) if pk_field else None
        if pk_value is None or str(pk_value).strip() == '':
            raise ValueError(
                f"{table_name}[{i}] has no primary-key value in field "
                f"'{pk_field}'; cannot locate its individual in the graph. The "
                f"OWL injector keys every individual by PK — fix the rulebook row."
            )
        ind_uri = NTWF[_slugify_iri_local(pk_value)]

        # Start with RAW data only; never carry pre-computed values through.
        record = {}
        for key, value in original_row.items():
            snake_key = camel_to_snake(key)
            if snake_key in raw_snake_keys:
                record[snake_key] = value

        # Query each field from the graph (includes computed values)
        for field_info in all_fields:
            field_name = field_info['name']
            prop_name = field_to_property_uri(field_name)
            prop_uri = NTWF[prop_name]

            # A computed field can carry MULTIPLE values when its SHACL rule
            # fired across several reasoning passes: an aggregation that depends
            # on a derived CHILD field counts 0 in the pass before the child's
            # value materialized, then the true count in a later pass. SHACL
            # CONSTRUCT only ADDS triples, so both the stale 0 and the converged
            # value coexist. data_graph.value() would pick one arbitrarily — and
            # picking the stale 0 is exactly the bug. Resolve multiplicity by the
            # field's convergence semantics instead of guessing.
            objs = list(data_graph.objects(ind_uri, prop_uri))
            if not objs:
                continue
            py_values = [rdf_value_to_python(o) for o in objs]
            snake_key = camel_to_snake(field_name)

            if len(py_values) == 1:
                py_value = py_values[0]
            else:
                py_value = _resolve_multipass_value(
                    py_values, field_info, table_name, field_name, pk_value)

            if py_value is not None:
                record[snake_key] = py_value

        # Normalize empty strings to None for all string fields
        # (matches semantic intent - empty string means "no value")
        for key, value in record.items():
            if value == "":
                record[key] = None

        records.append(record)

    return records


# =============================================================================
# MAIN
# =============================================================================

def _get_testing_paths():
    """Resolve blank-tests and test-answers dirs. ERB_TESTING_DIR is required.

    There is no implicit per-substrate testing dir — running with no env var
    silently mixed results across domains. The orchestrator MUST set
    ERB_TESTING_DIR before invoking this substrate.
    """
    erb_testing = os.environ.get("ERB_TESTING_DIR")
    if not erb_testing:
        raise RuntimeError(
            "ERB_TESTING_DIR is not set. take-test.py must be invoked by the "
            "orchestrator with ERB_TESTING_DIR pointing at the active domain's "
            "testing/ directory."
        )
    substrate_name = Path(script_dir).name
    return Path(erb_testing) / "blank-tests", Path(erb_testing) / substrate_name / "test-answers"


def main():
    print("=" * 70)
    print("OWL Execution Substrate - SHACL Reasoning Test")
    print("=" * 70)
    print()

    # Check required files exist
    ontology_path = script_dir / "ontology.owl"
    individuals_path = script_dir / "individuals.ttl"
    rules_path = script_dir / "rules.shacl.ttl"

    for path in [ontology_path, individuals_path, rules_path]:
        if not path.exists():
            print(f"ERROR: Required file not found: {path}")
            print("Run: python inject-into-owl.py first")
            sys.exit(1)

    # Load rulebook to get schema info
    print("Loading rulebook...")
    try:
        rulebook = load_rulebook()
    except FileNotFoundError as e:
        print(f"ERROR: {e}")
        sys.exit(1)

    # Filter to just table definitions
    tables = {k: v for k, v in rulebook.items()
              if isinstance(v, dict) and 'schema' in v}

    # Identify which tables have computed columns
    tables_with_computed = {}
    for table_name, table_def in tables.items():
        if table_name.startswith('_') or table_name.startswith('$'):
            continue
        schema = table_def.get('schema', [])
        computed_cols = [c['name'] for c in schema if c.get('formula')]
        if computed_cols:
            tables_with_computed[table_name] = computed_cols

    print(f"Tables with computed columns: {', '.join(tables_with_computed.keys())}")

    # Load ontology + individuals into a single graph
    print("\nLoading ontology and data...")
    data_graph = Graph()
    data_graph.bind('effortless-ntwf', NTWF)
    data_graph.bind('xsd', XSD)

    data_graph.parse(ontology_path, format='turtle')
    print(f"   Loaded: {ontology_path}")

    data_graph.parse(individuals_path, format='turtle')
    print(f"   Loaded: {individuals_path}")
    print(f"   Total triples: {len(data_graph)}")

    # Load SHACL rules
    print("\nLoading SHACL rules...")
    shacl_graph = Graph()
    shacl_graph.bind('effortless-ntwf', NTWF)
    shacl_graph.bind('sh', SH)
    shacl_graph.parse(rules_path, format='turtle')
    print(f"   Loaded: {rules_path}")
    print(f"   Rule triples: {len(shacl_graph)}")

    # Run SHACL reasoning with multiple passes
    print("\nRunning SHACL-SPARQL reasoning...")
    print("   (Multiple passes to resolve dependencies between computed fields)")

    try:
        passes = run_shacl_reasoning(data_graph, shacl_graph)
        print(f"   Completed in {passes} passes")
        print(f"   Final triple count: {len(data_graph)}")
    except Exception as e:
        print(f"   ERROR: SHACL reasoning failed: {e}")
        sys.exit(1)

    # Extract results and save to test-answers/
    print("\nExtracting computed values...")

    _, test_answers_dir = _get_testing_paths()
    test_answers_dir.mkdir(parents=True, exist_ok=True)

    total_records = 0

    for table_name in tables_with_computed:
        table_def = tables[table_name]
        schema = table_def.get('schema', [])
        data = table_def.get('data', [])

        if not schema or not data:
            continue

        records = extract_entity_results(data_graph, table_name, schema, data)
        total_records += len(records)

        # Convert table name to snake_case for filename
        filename = camel_to_snake(table_name) + ".json"
        output_path = test_answers_dir / filename

        with open(output_path, "w", encoding='utf-8') as f:
            json.dump(records, f, indent=2)

        computed_cols = tables_with_computed[table_name]
        print(f"   {table_name}: {len(records)} records ({len(computed_cols)} computed fields)")

    print(f"\nTotal: {total_records} records extracted")
    print(f"Output: {test_answers_dir}/")

    print("\n" + "=" * 70)
    print("SHACL reasoning complete!")
    print("=" * 70)


if __name__ == "__main__":
    main()
