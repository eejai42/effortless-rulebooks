# ExplainDAG Execution Substrate

Machine-readable derivation explanations for every calculated field.

## Purpose

ExplainDAG produces **falsifiable explanation artifacts** that answer:

> For each derived field value, what exact expression structure produced it,
> and what were the exact input values at each leaf and intermediate node?

Unlike other substrates that only produce computed values, ExplainDAG shows
*how* each value was derived - making calculations auditable and debuggable.

**Note on architecture:** This is not a formula evaluation trace—it's a materialized inference DAG. Relationships and derived values are first-class nodes, not query operators. Each inference depends only on immediate neighbors (node+1), so what would be a JOIN in SQL is instead explicit nodes and edges in the graph. Global semantics emerge from composing these local inference nodes.

## Key Concepts

### Two-Layer Design

**Template Graph (static):**
- Encodes formula structure once per calculated field
- Independent of record values
- Generated at inject time

**Instance Graph (runtime):**
- Binds template to a specific record
- Contains witnessed values for each node
- Generated at test time

### Node Kinds

| Kind | Description |
|------|-------------|
| `field_ref` | Reference to a field in the same record |
| `const` | Literal constant (boolean, integer, string) |
| `fn` | Function call (AND, OR, NOT, IF, LOWER, etc.) |
| `op` | Operator (=, <>, <, >, CONCAT) |
| `result` | Root node representing the calculated field output |

## Files

### Generated at Inject Time

- `generated/explain_spec.json` - Static expression templates and dependency DAG

### Generated at Test Time

- `test-answers/<Entity>.json` - Computed values (for grading)
- `test-explanations/<Entity>.jsonl` - Derivation DAGs with witnessed values

## Usage

### Run via Orchestrator

```bash
cd orchestration
./orchestrate.sh
# Select explain-dag from the menu
```

### Run Standalone

```bash
cd execution-substrates/explain-dag

# Generate templates from rulebook
python3 inject-into-explain-dag.py

# Evaluate and produce explanations
python3 take-test.py
```

### Clean Generated Files

```bash
python3 inject-into-explain-dag.py --clean
```

## Output Schemas

### explain_spec.json (Template)

```json
{
  "schema_version": "erb.explain_spec.v1",
  "rulebook": {
    "name": "...",
    "rulebook_hash": "sha256:...",
    "generated_at": "2026-02-22T..."
  },
  "semantics": {
    "profile": "excel",
    "version": "v1"
  },
  "entities": {
    "Workflows": {
      "id_field": "WorkflowId",
      "calc_order": ["Name", "HasMoreThan1Step"],
      "dep_edges": [["DisplayName", "Name"], ["CountOfSteps", "HasMoreThan1Step"]],
      "expr_templates": {
        "Name": {
          "formula_source": "=SUBSTITUTE(LOWER({{DisplayName}}), \" \", \"-\")",
          "template_hash": "sha256:...",
          "root_node": "n_result_HasGrammar",
          "nodes": {...},
          "edges": [...]
        }
      }
    }
  }
}
```

### Explanation Bundle (JSONL line)

```json
{
  "schema_version": "erb.explain_instance.v1",
  "entity": "Workflows",
  "record_id": "onboarding",
  "values": {
    "name": "onboarding",
    "has_more_than_1_step": false
  },
  "explanations": {
    "Name": {
      "template_hash": "sha256:...",
      "root": "i_result_Name",
      "nodes": {
        "i_result_Name": {"kind": "result", "value": "onboarding", "type": "string"},
        "i_fn_1": {"kind": "fn", "name": "SUBSTITUTE", "value": "onboarding", "type": "string"},
        "i_fn_2": {"kind": "fn", "name": "LOWER", "value": "onboarding", "type": "string"},
        "i_ref_1": {"kind": "field_ref", "field": "DisplayName", "value": "Onboarding", "type": "string"}
      },
      "edges": [["i_ref_1", "i_fn_2"], ["i_fn_2", "i_fn_1"], ["i_fn_1", "i_result_Name"]],
      "evidence": {"short_circuit": [], "branches": []}
    }
  }
}
```

## Semantics Profile

The substrate uses **Excel-style semantics** with three-valued logic:

| Aspect | Behavior |
|--------|----------|
| Null handling | Three-valued logic (AND/OR propagate nulls) |
| Boolean coercion | Strict (only true/false, not truthy/falsy) |
| String concat | Null treated as empty string |
| Comparison with null | Returns null |

## Self-Validation

Each explanation DAG is self-validated:

1. Re-evaluates the instance graph bottom-up
2. Asserts root value equals computed field value
3. Reports any mismatches in `validation_error`

This makes explanations **falsifiable artifacts**, not just documentation.

## Deterministic Hashing

- `rulebook_hash`: SHA256 of canonical rulebook JSON
- `template_hash`: SHA256 of normalized expression graph
- Node IDs: Deterministic path-based IDs

Same rulebook + same inputs = identical outputs.

## Integration

ExplainDAG integrates with the orchestration system:
- Automatically discovered by `orchestrate.sh`
- Results graded against canonical answer keys
- Explanations available for inspection in `test-explanations/`
