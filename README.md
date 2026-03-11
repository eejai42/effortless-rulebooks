# Effortless Rulebook (ERB) - Seed Ontology Demo

**One declarative rulebook. Many execution substrates. Watch them drift.**

> This repo demonstrates what happens when you evolve an ontology and different substrates update at different speeds.

> **[View Full Orchestration Report](orchestration/orchestration-report.html)** - See how execution substrates compute equivalent answers from the same rulebook.

---

## TL;DR

Write your business rules once in a simple JSON format. ERB automatically generates working code in Python, Go, SQL, Excel, and more. All versions compute identical results — proven by automated conformance tests. When you change a rule, every language updates together.

---

## Key Terms

| Term | Meaning |
|------|---------|
| **Substrate** | A runtime environment that executes rules (Python, Go, SQL, Excel, etc.) |
| **Ontology** | The structure of your data — what entities exist and how they relate |
| **Rulebook** | The JSON file defining your schema, formulas, and data |
| **IR** | Intermediate Representation — the canonical JSON format between UI and code |
| **DAG** | Directed Acyclic Graph — how calculated fields depend on each other |
| **Conformance** | Whether a substrate produces the same outputs as the reference |

---

## Prerequisites

Before running, ensure you have:

- **Bash shell** (macOS/Linux terminal or WSL on Windows)
- **Python 3.8+** with pip
- **Go 1.19+** (for Go substrate)
- **Docker** (optional, for Postgres substrate)
- **Node.js 16+** (for report generation)

---

## 1. Quick Start (60 seconds)

```bash
./start.sh
```

You'll see the orchestration menu:

![Terminal showing 8 menu options: run individual substrates (Python, Go, Postgres, etc.), run all substrates, or generate reports](orchestration/orchestration-menu.png)

Pick option **A** to run all substrates. Watch them derive consistent answers from the same rulebook.

### Orchestration Menu Reference

| Key | Action | Description |
|-----|--------|-------------|
| **A** | Run ALL substrates | Regenerates and tests every substrate against the rulebook (default) |
| **V** | View Results | Generates and opens the HTML conformance report |
| **01-12** | Run single substrate | Run just one substrate (e.g., `01` for binary, `05` for golang) |
| **C** | Clean | Remove all generated files from every substrate |
| **D** | Dev-Ops menu | PostgreSQL initialization, SSoTME setup, diagnostics |
| **P** | Pull & Inject | Pull latest from Airtable and inject into all substrates |
| **B** | Change Base ID | **Switch to a different Airtable base** (see below) |
| **Q** | Quit | Exit the orchestrator |

### Swappable Bases: One Repo, Many Ontologies

**This is one of the most powerful features of the ERB platform.**

The `orchestration/bases.json` file contains a list of Airtable bases that can be instantly swapped:

```json
[
  {"id": "applThn0rikpCR9C3", "name": "BASIC: Jessic Talisman's Ontology"},
  {"id": "appwN9EAp8IeIxM23", "name": "ADVANCED: Jessic Talisman's Ontology"},
  {"id": "appC8XTj95lubn6hz", "name": "is-everything-a-language"},
  {"id": "appWrXPvXbkgQGOxt", "name": "CustomerDemo"}
]
```

Press **B** in the orchestrator to switch bases. When you select a new base:

1. The orchestrator pulls the new rulebook from Airtable
2. All substrates regenerate from the new schema
3. Conformance tests run against the new ontology

**Why this matters:**
- **Same infrastructure, different domains** — The execution substrates, conformance testing, and DAG tracing work identically regardless of what ontology you load
- **A/B testing ontologies** — Compare BASIC vs ADVANCED versions of the same conceptual model
- **Demo flexibility** — Show the platform with customer-specific data without modifying code
- **Prove domain-agnosticism** — The same repo runs `is-everything-a-language` (philosophical), `CustomerDemo` (business), and `Workflows` (operational) ontologies

The bases list is **not** legacy cruft — it's a feature catalog of available ontologies.

---

## 2. The Architecture (Polymorphism)

![Diagram showing Airtable UI exporting to effortless-rulebook.json, which generates code for multiple substrates (Python, Go, SQL, Excel, OWL) that all produce identical outputs verified by conformance tests](./effortless_rulebook_architecture.png)

### The Canonical Trio (The Interface)

```
Airtable (UI) -> effortless-rulebook.json (IR) -> Postgres (Reference Implementation)
```

These three define **the interface**:
- **Schema**: what fields exist, their types, which are raw vs. calculated
- **Formulas**: how calculated fields are derived
- **Data**: the ground facts

### Substrates as Polymorphic Implementations

Each substrate **implements the same interface** in its native syntax:

| Substrate | Implementation |
|-----------|----------------|
| Python | `calc_*()` methods on dataclasses |
| Go | `Calc*()` methods on structs |
| SQL | `calc_*()` functions + views |
| Excel | Cell formulas |
| OWL | SWRL rules |
| English | Prose specification |

**They are polymorphic because:**
- Same inputs -> same outputs (conformance testing proves this)
- Same interface -> different representations
- Change the interface (rename a field) -> all implementations update

```
                    effortless-rulebook.json (Interface)
                              |
              +---------------+---------------+
              |               |               |
              v               v               v
         Python           Go            Postgres       ...
         calc_*()       Calc*()         calc_*()
         classes        structs         + views

              |               |               |
              +-------+-------+-------+-------+
                      |
                      v
              CONFORMANCE TESTS
              (verify polymorphic equivalence)
```

---

## 3. The Demo Scenario: Watching Substrates Drift

The repo demonstrates **operational drift** through a 3-commit narrative:

| Commit | What Happens | Key Lesson |
|--------|--------------|------------|
| **BASIC** | All substrates pass (100%). OWL takes 10s (100x longer than 0.1s). English takes ~5min and gets ~85% correct. | Substrates have wildly different regeneration costs. |
| **ADVANCED** | Rename/modify elements within the ontology. Everything "follows along" - same results as BASIC. | Interface changes propagate automatically. This is the polymorphism payoff. |
| **NEW ONTOLOGY** | New baseId, entirely new domain. Everything keeps following along - EXCEPT English, which is now 100% wrong until regenerated. | The static English content is 100% stale. Regenerating it costs time and money. |

### Current State (BASIC)

| Substrate | Score | Duration |
|-----------|-------|----------|
| Python | 100% | < 1s |
| Go | 100% | < 1s |
| Postgres | 100% | < 1s |
| OWL | 100% | 10s |
| English | ~85% | ~5 min |

**The key insight:** All substrates implement the same interface, but regeneration costs vary by 3+ orders of magnitude.

---

## 4. Execution Substrates

Each substrate independently derives answers from the same rulebook. Conformance is measured against a reference execution:

| Substrate | Type | Status | Conformance | Description |
|-----------|------|:------:|:-----------:|-------------|
| **PostgreSQL** | Database | Pass | 100% | Tables, `calc_*()` functions, views |
| **Python** | SDK | Pass | 100% | Dataclasses with `calc_*()` methods |
| **Go** | SDK | Pass | 100% | Structs with `Calc*()` methods |
| **XLSX** | Spreadsheet | Pass | 100% | Excel workbook with native formulas |
| **OWL** | Semantic | Pass | 100%* | Semantic web ontology with SWRL rules |
| **YAML** | Schema | Pass | 100% | LLM-friendly schema |
| **CSV** | Tabular | Pass | 100% | Field definitions with computed values |
| **UML** | Diagram | Pass | 100% | PlantUML class diagrams with OCL constraints |
| **ExplainDAG** | Audit | Pass | 100% | Derivation DAGs with witnessed values |
| **Binary** | Native | Pass | 100% | C structs + x86 assembly |
| **English** | Prose | LLM | ~85% | Human-readable specification (LLM graded) |

**Note on conformance scores**: "100%" means typed-identical output on the tested fragment. Substrates like OWL (*) have richer native semantics - the score reflects agreement on the shared subset, not full semantic equivalence across paradigms.

-> **For substrate implementation details and testing architecture, see [README.TECHNICAL.md](README.TECHNICAL.md)**

---

## 5. The Problem This Solves (Why Polymorphism Matters)

When business logic lives in multiple places - SQL, Python, Go, application code - three questions become urgent:

### 1. Where is the interface?

When you have SQL, Python, Go, Excel all computing the same thing, which one is authoritative?

**Answer**: The rulebook. Everything else is a polymorphic implementation.

- [`effortless-rulebook.json`](effortless-rulebook/effortless-rulebook.json) is the canonical artifact
- NOT the SQL (that's generated)
- NOT the Python (that's generated)
- Change it here, regenerate everything else

### 2. How do you verify polymorphism?

How do you know all implementations produce the same outputs?

**Answer**: Conformance testing against a reference implementation.

1. Generate `answer-key.json` from one substrate (Postgres by default)
2. Run every other substrate against `blank-test.json` (inputs with computed fields nulled)
3. Compare outputs field-by-field, row-by-row
4. Drift is detected automatically, not discovered in production

### 3. Can you trace a computation?

For any derived value, can you show which inputs produced it?

**Answer**: The **ExplainDAG substrate** emits the derivation graph.

```json
{
  "explanations": {
    "Name": {
      "nodes": {
        "i_result": {"kind": "result", "value": "employee-onboarding"},
        "i_op_1": {"kind": "op", "name": "SUBSTITUTE", "value": "employee-onboarding"},
        "i_ref_1": {"kind": "field_ref", "field": "DisplayName", "value": "Employee Onboarding"}
      },
      "edges": [["i_ref_1", "i_op_1"], ["i_op_1", "i_result"]]
    }
  }
}
```

You can trace any derived value back to its inputs mechanically.

---

## 6. The Seed Ontology

This repo includes a **Workflows** ontology as a concrete example:

| Entity | Raw Fields | Calculated Fields |
|--------|------------|-------------------|
| **Workflows** | DisplayName, Title, Description, Identifier | Name (slug), Modified |
| **Roles** | DisplayName, Description, Identifier | Name (slug), Modified |

### Example Formula

```json
{
  "name": "Name",
  "type": "calculated",
  "formula": "=SUBSTITUTE(LOWER({{DisplayName}}), \" \", \"-\")"
}
```

This formula is compiled to Postgres, Python, Go, and any other substrate - not written by hand in each.

### Using Your Own Data

To use your own model:
1. Export your Airtable base to `effortless-rulebook.json`
2. Run the generators to create substrate code
3. Run the orchestration to verify conformance

The pattern works for **any domain** - the orchestration, conformance testing, and derivation DAG patterns are domain-agnostic.

---

## 7. How the Formula Compiler Works

The formula compilation pipeline transforms Airtable formulas into native expressions:

```
Airtable formula -> AST -> Python/Go/SQL/Excel expression
```

### Supported Formula Types

| Formula | Example | Substrates |
|---------|---------|------------|
| LOWER | `LOWER({{Field}})` | All |
| SUBSTITUTE | `SUBSTITUTE({{Field}}, " ", "-")` | All |
| IF | `IF({{A}} > {{B}}, "yes", "no")` | All |
| Concatenation | `{{First}} & " " & {{Last}}` | All |
| Arithmetic | `{{Quantity}} * {{UnitPrice}}` | All |
| Comparisons | `{{Total}} > 1000` | All |

---

## 8. Project Structure

```
+-- effortless-rulebook/
|   +-- effortless-rulebook.json    # <- THE SOURCE OF TRUTH
+-- postgres/
|   +-- 01-drop-and-create-tables.sql   # generated base tables
|   +-- 02-create-functions.sql         # generated calc_* functions (the DAG)
|   +-- 03-create-views.sql             # generated views calling calc_*
+-- execution-substrates/
|   +-- python/                     # Python substrate
|   +-- golang/                     # Go substrate
|   +-- xlsx/                       # Excel substrate
|   +-- owl/                        # OWL substrate
|   +-- explain-dag/                # Derivation DAGs with witnessed values
|   +-- ...
+-- orchestration/
|   +-- orchestrate.sh              # run all substrates
|   +-- test-orchestrator.py        # conformance testing harness
+-- testing/
|   +-- answer-keys/                # expected outputs
|   +-- blank-tests/                # inputs with calculated fields nulled
+-- docs/                           # deep-dive articles
+-- start.sh                        # <- START HERE
```

---

## 9. Limitations / What This Doesn't Do

This is a **minimal open-source demonstration**. It does not support:

- Complex aggregations (window functions, GROUP BY)
- Recursive formulas
- Bi-temporal support (valid-time + transaction-time)
- Multi-table JOINs in formulas

The commercial ERB tool handles these cases. This repo shows the core pattern.

---

## 10. FAQ

**"Isn't Airtable the source of truth?"**
No, Airtable is the UI. The exported `effortless-rulebook.json` is the canonical artifact. You could use any UI that produces the same JSON format.

**"What about non-deterministic substrates?"**
The orchestration includes a "fuzzy evaluation" mode where an LLM grades whether English outputs imply the correct computed values. This is explicitly non-deterministic and marked as such.

**"How is this different from dbt/MetricFlow/DMN/Substrait?"**
Those tools solve subsets of the problem:
- dbt/MetricFlow: Metrics -> SQL (no multi-language conformance)
- DMN: Decisions -> engine execution (no SQL/Python/Go parity)
- Substrait: Relational IR (no business rule semantics)

ERB integrates these pieces: one IR -> multiple substrates -> conformance testing -> derivation traceability.

**"What about versioning?"**
The rulebook is a JSON file - version it with git. Derivation functions are deterministic, so you can replay any version.

---

## 11. Further Reading

### Technical Documentation

| Document | Description |
|----------|-------------|
| **[README.TECHNICAL.md](README.TECHNICAL.md)** | Implementation deep dive: testing architecture, substrate details, fuzzy evaluation |
| **[README.SCHEMA.md](README.SCHEMA.md)** | Schema reference for the rulebook format |

### Downloadable Artifacts

| Artifact | Description |
|----------|-------------|
| [`effortless-rulebook.json`](effortless-rulebook/effortless-rulebook.json) | The canonical rulebook (JSON) |
| [`rulebook.xlsx`](execution-substrates/xlsx/rulebook.xlsx) | Excel workbook with live formulas |
| [`specification.md`](execution-substrates/english/specification.md) | Human-readable English specification |

---

## 12. Contributing / License

Contributions welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

License: [MIT](LICENSE)

---

*Generated from [effortless-rulebook.json](effortless-rulebook/effortless-rulebook.json)*
