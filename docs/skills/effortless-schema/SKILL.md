<!-- DERIVED ARTIFACT — DO NOT EDIT BY HAND -->
<!-- Source: https://raw.githubusercontent.com/effortlessapi/effortless-claude/main/skills/effortless-schema/SKILL.md -->
<!-- Mirrored by: docs/skills/clone-skills.sh -->
<!-- Update: cd effortless-platform && effortless clone-skills -->

---
name: effortless-schema
description: >
  Use to understand the **structure** of effortless-rulebook.json — top-level
  keys, table objects, the field schema definition, field types (raw,
  calculated, lookup, relationship, aggregation), datatypes, formula syntax,
  and the `_meta` section. This skill is JSON-structure only; for naming /
  DAG / FK *rules*, use effortless-conventions.

  **Scope (load gate):** Effortless projects only — project root must contain `effortless.json` AND a CLAUDE.md identifying the project as ERB methodology. Do NOT load otherwise.
audience: customer
---

# Rulebook JSON Structure

This skill describes the **shape** of `effortless-rulebook.json`. It does NOT cover naming/DAG/FK rules — those are in **effortless-conventions**.

**Format:** Standard JSON + Single Line Leaves — every leaf value (a string,
number, or boolean) stays on one line even though the file is pretty-printed
and nested. This is what makes the file greppable/diffable line-by-line
despite being structured JSON, and it's what `minimize-rulebook` depends on
to strip data down to schema-only without reformatting the file.

If `minimize-rulebook` is registered as a transpiler, climb the derived files
in order — `read-me-1st.txt` → `schema.min.json` → `schema.json` — before
reading this structure from the full file. See `effortless-query` for the
full escalation ladder.

## Top-level

```json
{
  "$schema": "https://example.com/cmcc-schema/v1",
  "Name": "Project Display Name",
  "Description": "Rulebook for 'Project Display Name'.",
  "TableName": { "Description": "...", "schema": [...], "data": [...] },
  "AnotherTable": { ... },
  "_meta": { /* conversion metadata */ }
}
```

| Key | Purpose |
|---|---|
| `$schema` | Always `https://example.com/cmcc-schema/v1` |
| `Name` / `Description` | Project metadata |
| `{TableName}` | One key per entity table |
| `_meta` | Conversion metadata, type mappings, tool version |

## Table object

```json
{
  "Description": "Table: TableName",
  "schema": [ /* field definitions */ ],
  "data": [ /* row records */ ]
}
```

## Field schema object

```json
{
  "name": "FieldName",
  "datatype": "string",
  "type": "raw",
  "nullable": true,
  "Description": "What this field represents.",
  "formula": "=CONCAT({{FirstName}}, \" \", {{LastName}})",
  "RelatedTo": "OtherTable"
}
```

| Property | Required | Values |
|---|---|---|
| `name` | yes | field identifier (PascalCase per conventions) |
| `datatype` | yes | `string`, `integer`, `number`, `boolean`, `datetime` |
| `type` | yes | `raw`, `calculated`, `lookup`, `relationship`, `aggregation` |
| `nullable` | yes | `true` / `false` |
| `Description` | should | free text |
| `formula` | if calculated/lookup/aggregation | Excel-dialect (see below) |
| `RelatedTo` | if relationship | target table name |

## Field types

| Type | Stored In | Meaning |
|---|---|---|
| `raw` | Base table | Direct user input |
| `calculated` | View (via function) | Derived from formula on same-row fields |
| `lookup` | View (via function) | Pulled from a related table via FK |
| `relationship` | Base table (as ID) | Foreign key to another table |
| `aggregation` | View (via function) | Rollup/count/sum over related rows |

## Datatype mapping

| Datatype | Postgres | Go | Python | Airtable source |
|---|---|---|---|---|
| `string` | `TEXT` | `string` | `str` | singleLineText, multilineText, email, url, phoneNumber, singleSelect |
| `integer` | `INTEGER` | `int` | `int` | number (whole) |
| `number` | `NUMERIC` | `float64` | `float` | number (decimal) |
| `boolean` | `BOOLEAN` | `bool` | `bool` | checkbox |
| `datetime` | `TIMESTAMPTZ` | `time.Time` | `datetime` | date, dateTime |

## Formula syntax (Excel dialect)

`={{FieldName}}` references same-row fields. Cross-table uses `Table!{{Field}}`.

```
={{LastName}} & ", " & {{FirstName}}
=IF({{Status}} = "Active", TRUE(), FALSE())
=AND({{HasSyntax}}, {{IsParsed}}, NOT({{CanBeHeld}}))
=INDEX(Roles!{{Label}}, MATCH({{AssignedRole}}, Roles!{{RoleId}}, 0))
=COUNTIFS(WorkflowSteps!{{IsStepOf}}, Workflows!{{WorkflowId}})
=SUMIFS(Orders!{{Amount}}, Orders!{{Customer}}, Customers!{{CustomerId}})
=SUBSTITUTE(LOWER({{CompanyName}}), " ", "-")
```

**Functions:** IF, AND, OR, NOT, TRUE, FALSE, CONCAT, SUBSTITUTE, LOWER, UPPER, LEFT, RIGHT, MID, LEN, TRIM, FIND, SEARCH, TEXT, VALUE, SUM, COUNT, COUNTIFS, SUMIFS, AVERAGEIFS, MIN, MAX, INDEX, MATCH, POWER, LOG, LOG10, ABS, ROUND, COALESCE/IFERROR.

## Hard limit: 1 hop only. No 2-hop / chained joins — ever.

**This is a cardinal rule, not a current-tooling gap.** Every cross-table
reference in a rulebook formula — `INDEX/MATCH` lookups, `COUNTIFS`/`SUMIFS`/
`MAXIFS`/etc. aggregations — resolves in exactly **one hop**: the current
table to **one** directly-related table, via **one** FK. There is no
mechanism, present or planned, for a formula to traverse two relationships
(`A -> B -> C`) or filter one table's rows by a condition living on a
*different* related table two hops away.

This is SDLAF's Lookup and Aggregation primitives holding a hard line, not an
implementation shortfall to patch around. A rulebook is not a relational
query engine — it is a DAG of **flattened, single-hop, first-class** facts.
If a domain concept genuinely needs 2 hops, that is the model telling you a
primitive is missing at the right layer — **flatten it into its own SDLAF
field(s)** one hop at a time, don't reach for a formula that spans two joins.

**`INDEX/MATCH` specifically only supports the same-row-FK shape:**
```
=INDEX(Table!{{Field}}, MATCH({{LocalFKField}}, Table!{{IdField}}, 0))
```
`MATCH`'s lookup value must be a **local FK field on the current row**. A
formula like `MATCH(TRUE(), Table!{{SomeFlag}}, 0)` — "find the row over
there where a condition holds" — is not a supported shape. It will either be
silently rejected at transpile time (the generated SQL function is never
emitted) or fail later when a downstream build step tries to call a function
that was never created. Either way, the fix is never "make INDEX/MATCH do
more" — it's to re-express the intent as a **1-hop conditional aggregation**
(`COUNTIFS`/`SUMIFS`/`MAXIFS`/`MINIFS`/`AVERAGEIFS`), which natively supports
"filter a related table's rows and reduce to one value," entirely within one
hop:
```
=MAXIFS(Lines!{{WinningStateName}}, Lines!{{IsWon}}, TRUE())
```

**How to flatten a 2-hop need.** Say `A` needs a value that only exists on
`C`, reachable via `A -> B -> C`. Don't chain a lookup through `B`. Instead:
add the fact **redundantly, one hop closer**, so every read stays 1-hop:
- Add a same-row lookup/calculated field on `B` that pulls the `C` value
  through the existing `B -> C` FK (1 hop).
- Add a lookup/aggregation field on `A` that reads that new field on `B`
  through the existing `A -> B` FK (1 hop).
Now `A` has the value it needed, and no formula anywhere spans more than one
relationship. This is exactly the SDLAF discipline: each derived fact is a
first-class field at the hop where it's produced, not a query threaded
through the graph.

See `effortless-cmcc`'s anti-pattern checklist for this as a CMCC violation,
and `effortless-conventions`'s DAG section for the structural (table-level)
version of the same 1-hop discipline.

## `_meta`

```json
"_meta": {
  "_CMCC_Summary": "Airtable export with schema-first type mapping...",
  "_conversion_metadata": {
    "source_base_id": "appXXXXXXXXXXXX",
    "table_count": 5,
    "tool_version": "2.0.0",
    "field_type_mapping": "checkbox->boolean, number->number/integer, multipleRecordLinks->relationship...",
    "export_mode": "schema_first_type_mapping",
    "type_inference": {
      "priority": "airtable_metadata (NO COERCION) -> formula_analysis -> data_analysis (fallback only)",
      "error_value_handling": "#NUM!, #ERROR!, #N/A, #REF!, #DIV/0!, #VALUE!, #NAME? are treated as NULL"
    }
  }
}
```

## See also

- `effortless-conventions` — naming, DAG, FK rules. THIS skill is structure-only.
- `effortless-query` — one-liners that extract this structure without reading the full file.
- `effortless-sql` — how each field type / datatype maps to generated Postgres tables, functions, views.
- `effortless-orchestrator` — Token Discipline rule: query this JSON, never read it whole.
- `effortless-cmcc` — the 1-hop rule as a CMCC anti-pattern (see its violations checklist).
- `effortless-xlsx-to-rulebook` — where the Excel-dialect formula syntax above diverges from real Excel/Sheets (2-hop chained lookups being the main one).
