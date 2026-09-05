<!-- DERIVED ARTIFACT — DO NOT EDIT BY HAND -->
<!-- Source: https://raw.githubusercontent.com/EffortlessAPI/effortless-skills/main/skills/effortless-sql/SKILL.md -->
<!-- Mirrored by: docs/skills/clone-skills.sh -->
<!-- Update: cd effortless-platform && effortless clone-skills -->

---
name: effortless-sql
description: >
  Use when working with ERB-generated SQL — reading from vw_* views vs base tables,
  understanding generated files (00-05), using *b-customize-* files, SQL function
  patterns (calc_*, get_*), view structure, or ERBCustomizations table.

  **Scope (load gate):** Effortless projects only — project root must contain `effortless.json` AND a CLAUDE.md identifying the project as ERB methodology. Do NOT load otherwise.
audience: customer
---

# ERB Generated SQL Patterns

> **The mechanics in one paragraph.** Files `00`–`05` under `postgres/` are
> mechanical output of the rulebook hub — every `effortless build` rewrites
> them. Edits there are not "forbidden"; they just don't survive the next
> build. To make a change stick, edit the hub (`effortless-rulebook.json`,
> via whichever input spoke you prefer). If the hub genuinely can't express
> what you need, use a customization: an `ERBCustomizations` row (preferred —
> the SQL travels with the rulebook) or a hand-edited `*b-customize-*.sql` file.
> Neither is for defining tables or columns. You also rarely need to read the
> generated SQL into context — `psql -c "\d vw_<table>"` gives you the same
> view structure for ~zero tokens.

> **Local-dev DBs are regenerated, not migrated.** `init-db.sh` drops and
> recreates the local DB on every build, so a `migrations/` folder /
> migrations tracking table / incremental delta would just be wiped next
> build. Schema changes belong in the hub → `effortless build`. The lone
> exception is `bases.effortlessapi.com`-hosted DBs (`postgres/apply-migration.sh`,
> see `effortless-bases`) where the DB *can't* be dropped, so deltas are
> the delivery mechanism — but the schema still originates in the hub.
> Canonical statement lives in `effortless-workflow`.

## Reading the generated SQL: usually unnecessary

Generated SQL files (00–05) are a *projection* of the rulebook for Postgres to
consume. You can read them, but it's expensive in context tokens and the
pipeline is deterministic enough that you usually don't need to.

If you need to know what a view contains:
- **Cheapest:** `psql -d <dbname> -c "\d vw_tablename"` (≈ zero context tokens)
- **Also cheap:** Query the rulebook schema with a one-liner (see `effortless-query`)
- **Expensive:** `cat postgres/03-create-views.sql` — works, but burns context

The view `vw_<tablename>` will always contain:
- All raw fields from the table (snake_case)
- All calculated/lookup/aggregation fields as additional columns
- FK lookup fields as `<fk_name>_<field>` (e.g., `customer_name`)

(Canonical Token Discipline section lives in `effortless-orchestrator`.)

---

## CRITICAL: Always Read From Views, Never Base Tables

**NEVER SELECT from base tables. ALWAYS use `vw_*` views for ALL read operations.**

This isn't a stylistic rule — it's how the substrate is shaped: views (`vw_*`) include raw fields *plus* every calculated/lookup/aggregation field, computed by the SQL functions generated from the rulebook. Base tables only have the raw columns, and the views aren't updatable in Postgres (they contain function-call columns), so writes have to go to the base table anyway.

```sql
-- WRONG: Reading from base table
SELECT * FROM customers WHERE hair_color = 'red';

-- RIGHT: Reading from view
SELECT * FROM vw_customers WHERE is_red_headed = true;
```

### Before Writing ANY Query or Filter Logic:

1. **Check the view first** - Run `\d vw_tablename` or read `03-create-views.sql` to see ALL available fields
2. **Look for existing calculated fields** - The view likely already has `is_*`, `*_count`, `*_status` fields that answer your question
3. **Use calculated fields, don't recompute** - If `is_red_headed` exists, use it. Do NOT write `LOWER(hair_color) = 'red'`

### Why This Matters:

- Business logic belongs in the rulebook (rulebook-direct edits, or Airtable formulas if connected), not in ad-hoc queries
- Views contain pre-calculated fields that encapsulate business rules
- Computing things yourself (e.g., `LOWER(field) = 'value'`) duplicates logic and risks inconsistency
- The whole point of ERB is that the view already did the work for you

### The Rule:

| Operation | Use |
|-----------|-----|
| SELECT / READ | `vw_*` views ONLY |
| INSERT | Base table |
| UPDATE | Base table |
| DELETE | Base table |

### CRITICAL: Never JOIN one view onto another — add a lookup field

The subtle violation of "read from views" is not a base-table read — it's **JOINing two `vw_*` views** to pull a related entity's field. This is a JOIN anti-pattern: the relationship belongs in the rulebook as a **lookup field**, not in app SQL.

```sql
-- WRONG: joining vw_wards onto vw_mail_items to get the ward's name
SELECT m.mail_item_id, w.last_name AS ward_last_name
  FROM vw_mail_items m
  JOIN vw_wards w ON w.ward_id = m.ward
 WHERE m.mail_item_id = $1;

-- RIGHT: add a lookup field to the rulebook, then read one view
--   MailItems.WardLastName  (type: lookup)
--   formula: =INDEX(Wards!{{LastName}}, MATCH(MailItems!{{Ward}}, Wards!{{WardId}}, 0))
SELECT mail_item_id, ward_last_name
  FROM vw_mail_items
 WHERE mail_item_id = $1;
```

Why this is the rule, not a style preference:
- The view's whole job is to already contain every field a row needs, including cross-FK lookups. A JOIN means the rulebook was missing a lookup — fix the rulebook, don't join in the app.
- Lookups compose: a lookup may target another table's **calculated** field (the generated `calc_*` function just calls the related `calc_*`), so even "display label" coalescing belongs on the source entity, not in app SQL.
- Once the lookup exists, every consumer (board, API, export) gets the column for free with no repeated JOIN.

If a JOIN is fetching N fields from a related table, add N lookup fields (or one calculated field on the *source* entity that the lookup targets), rebuild, then collapse the query to a single-view read. See `effortless-diagnostics` for the find-and-migrate workflow.

---

## CRITICAL: Never Modify Generated Files

**NEVER directly edit generated SQL files.** The postgres/ folder contains:

### Generated Files (NEVER EDIT):
- `00-bootstrap.sql` - Database initialization
- `01-drop-and-create-tables.sql` - DDL for all tables (raw fields only)
- `02-create-functions.sql` - `calc_*()` and `get_*()` PL/pgSQL functions (1:1 with calculated/lookup/aggregation fields)
- `03-create-views.sql` - `vw_*` views combining raw tables + calculated fields via function calls
- `04-create-policies.sql` - Row-level security (RLS) policies
- `05-insert-data.sql` - INSERT statements from rulebook data

These files are regenerated by `effortless build` and ANY manual changes will be lost. You can edit them to test a hypothesis, but the next build rewrites them — for a change that persists, edit the hub.

### The two layers: migrated vs derived

Every object the pipeline emits falls into exactly one of two categories, and
they have **opposite** change semantics. Getting this wrong is the single most
expensive mistake in an ERB project.

| | **Migrated layer** | **Derived layer** |
|---|---|---|
| Objects | tables, columns | `vw_*` views, `calc_*`/`get_*` functions, RLS policies, role schemas |
| Holds data? | **yes** | **no** |
| How it changes | additive migrations, forever | **dropped and recreated from the rulebook** |
| In production? | `ALTER`, never `DROP` | full drop + recreate, every deploy |
| Can it drift? | yes — that's why there's a ledger | **no — impossible by construction** |

The derived layer holds no state. It is a pure function of the rulebook. The
rulebook ships **in the same git commit** as the code that reads it, so
recreating the derived layer from that commit's rulebook is correct by
definition — there is no "state" to migrate toward and nothing to get wrong.

**Therefore: never hand-write a migration that drops and recreates a view or a
`calc_*` function.** That is the most common and most wasteful anti-pattern in
ERB projects. Migrations that carry hundreds of lines of view DDL are doing, by
hand and fallibly, work that one generated script does correctly every time.
A migration should contain **only** additive table/column changes.

### Two customization mechanisms

There are two, and they are not the same thing. Both work; one is the direction
the format is going.

#### `*b-customize-*.sql` files — hand-edited, on-disk

Emitted **once**, as an empty header stub, and only when asked. After that the
build never touches them: they carry `overwrite: "Never"`, so a rebuild skips a
file that already exists. **You edit them by hand and your edits persist.**

`reset-rulebook-db.sh` runs the numbered scripts in order, picking up each `NNb-`
file after its `NN-` counterpart:

```
00-bootstrap → 01-drop-and-create → 01b-customize-schema
             → 02-create-functions → 02b-customize-functions
             → 03-create-views     → 03b-customize-views
             → 04-create-policies  → 04b-customize-policies
             → 05-insert-data      → 05b-customize-data
```

| File | Runs after | Holds |
|---|---|---|
| `01b-customize-schema.sql` | `01` | indexes, FK constraints |
| `02b-customize-functions.sql` | `02` | hand-written functions |
| `03b-customize-views.sql` | `03` | hand-written views |
| `04b-customize-policies.sql` | `04` | RLS beyond the generated set |
| `05b-customize-data.sql` | `05` | idempotent seed data |

#### `ERBCustomizations` rows — in the rulebook (the new way)

The same SQL, stored as rows in the rulebook's `ERBCustomizations` table and
emitted into their own folder, each running as a separate script ordered by its
sort position. Prefer this: the SQL travels **with** the rulebook, so it is
carried by `ERBVersions`, survives relocation, and keeps the rulebook a complete
description of the system.

#### What belongs in either — and what never does

Both mechanisms are for SQL the rulebook's **field model** cannot express:
indexes, FK constraints, hand-tuned functions, materialized views, RLS policies,
role GRANTs, idempotent seed data.

> **Neither is a place to define tables or add columns.** A table created in
> `01b`, or in a Schema customization, gets **no view, no calculated fields, no
> RuleSpeak and no Explainer DAG** — it opts out of everything ERB does, on
> exactly the data that most needs it. Tables and columns are rulebook tables
> and fields, always. `01b` in particular should hold little more than indexes.

### ERBCustomizations — the rulebook holds the whole model

`ERBCustomizations` is a rulebook table whose rows carry **real SQL**. This is
how substrate-specific work stays *inside* the rulebook instead of leaking into
loose `.sql` files beside it. The rulebook then holds 100% of the model: the
declarative part (tables, formulas) **and** the Postgres-specific part
(hand-tuned functions, materialized views, RLS, grants).

```json
"ERBCustomizations": {
  "schema": [
    { "name": "ERBCustomizationId", "datatype": "string", "type": "raw" },
    { "name": "Name", "datatype": "string", "type": "raw" },
    { "name": "CustomizationType", "datatype": "string", "type": "raw" },
    { "name": "SQLCode", "datatype": "string", "type": "raw" },
    { "name": "SQLTarget", "datatype": "string", "type": "raw" }
  ]
}
```

`CustomizationType`: `Schema` · `Functions` · `Views` · `RLS` · `Data`, plus the
per-object overrides `FunctionOverride` and `SchemaOverride` — which replace a
**single** generated function or table definition rather than appending a whole
file. Prefer an override to a wholesale custom file: it keeps the rest of the
object following the rulebook automatically.

**A row whose `SQLCode` is only a boilerplate header comment is dead weight** —
it causes an empty `*b-` file to be emitted and implies a customization that
doesn't exist. Delete those rows.

#### Hand-maintained objects (the exception, not the default)

By default **everything follows the rulebook**: every view and `calc_*` function
is dropped and recreated on each derived-layer rebuild. An object that must be
maintained by hand can be marked to survive the drop — but this is an
exceptional situation. Opting *out* of automation is a deliberate, documented
act; there is no way to opt in, because following the rulebook is the default.

---

## The two scripts

`effortless build` emits two entry points. They share the derived-layer logic
and differ only in whether tables are dropped.

### `reset-rulebook-db.sh` — LOCALHOST ONLY

Drops and recreates **everything**, then reseeds from the rulebook. This is "the
loop": the dev database becomes a byte-for-byte mirror of the rulebook. Refuses
to run against a non-localhost connection.

*(Formerly `init-db.sh`. The rename exists because "init" understated what it
does — it is a destructive reset, and it was being run against databases that
held real data.)*

### `update-effortless-schema.sql` — SAFE IN PRODUCTION

One generated file that brings any database in line with the current rulebook
**without touching row data**, in this order:

1. Add missing tables and columns (additive only — never drops a table or column)
2. Drop all `vw_*` views
3. Drop all `calc_*`/`get_*` functions, **leaf-up through the DAG** (a calc
   function may call another; alphabetical order hits dependency errors)
4. Upsert data from tables marked static (reference data that is part of the model)
5. Recreate all `calc_*` functions
6. Re-run `Functions` customizations from ERBCustomizations
7. Recreate all `vw_*` views
8. Re-run `Views` customizations
9. Re-run `RLS` customizations — **and the RBAC policy layer** (see below)
10. Re-run `Data` customizations

Steps 5–10 alternate generated/custom on purpose: each custom layer builds on the
generated layer beneath it.

**This is what a routine promotion runs.** Version to version, most migrations
are nothing more than re-running the current `update-effortless-schema.sql`.
Always right, never wrong, by construction. A hand-authored migration is needed
only for genuine table/column changes that step 1 cannot infer — and it should
contain *nothing else*.

### Pairing with the RBAC policy layer

`effortless-rbac-to-postgres-policies` emits
`drop-update-effortless-postgres-policies.sql`, which follows the identical
model: RLS policies and role schemas are derived objects, so they are dropped
and recreated from the rulebook rather than migrated.

**Ordering matters:** policies reference columns and views, so the RBAC script
runs *after* the derived layer is rebuilt — step 9 above. Role-schema copies of
`vw_*` views are rebuilt in the same pass, which removes an entire class of
failure (a migration that recreates a public view and forgets its role-schema
mirrors). Never hand-migrate a policy or a role schema.

See `effortless-rbac` for the RBAC model itself.

## Converting a legacy project to the derived-layer format

Older projects keep domain tables in `01b-customize-schema.sql` and loose
`*b-customize-*.sql` files beside the rulebook. Converting is mechanical and
worth doing: promoted tables gain views, calculated fields, RuleSpeak and the
Explainer DAG they were silently missing.

**1. Inventory the customize file.** Sort every statement into three piles:

| Pile | Examples | Destination |
|---|---|---|
| Domain entities | anything with a lifecycle, a money amount, or an FK into a rulebook table | **the rulebook** |
| Columns `ALTER`ed onto rulebook tables | `created_at`, `notes`, a bolted-on FK | **the rulebook**, on that table |
| Deployment plumbing + indexes | sessions, API tokens, sync logs, `CREATE INDEX` | **ERBCustomizations** |

The giveaway for pile 1 is the table's own comment. If it describes what the
business does ("what we owe each consignor, per sale"), it is domain data.

**2. Promote pile 1 into the rulebook.** Define each table with its raw fields,
`relationship` fields for FKs (plus the matching inverse on the target table),
and `lookup` fields for anything the app currently JOINs to get. This is the
moment to reclaim hand-maintained columns as calculated fields — a `status` the
app keeps in step by hand is usually derivable:

```jsonc
{ "name": "IsPaid", "datatype": "boolean", "type": "calculated",
  "formula": "=IF({{PaidAt}}=\"\", FALSE, TRUE)" }
```

**3. Move pile 3 into `ERBCustomizations`.** One row, `CustomizationType:
"Schema"`, with the SQL in `SQLCode`. The rulebook now holds the whole model.

**4. Delete empty stub rows.** A row whose `SQLCode` is only a boilerplate
header emits an empty file and implies a customization that doesn't exist.
Delete duplicates too — two rows naming the same file under different names
(`01b-…` and `03a-…`) is the mismatch that hides real content from the build
report.

**5. Rebuild and verify.** Check that each promoted table now has a `vw_*` view
and that its calculated fields compute. Then run `update-effortless-schema.sql`
against a scratch copy and confirm view/function counts return to the same
numbers and row counts are unchanged.

> **Watch the column names.** Rulebook FK fields generate as the field name
> (`product`, `sales_order`), not the old hand-written `product_id`. Any index
> you carry over must be updated to match, or it will fail with
> `column "…_id" does not exist`.

**6. Migrate the data.** Steps 1-5 change the schema. Existing rows in the old
tables still need moving, and app code still reads the old column names. On a
dev database a reset handles it; anywhere else this is a real data migration.

---

## Generated SQL Details

### Table Creation (01)
- Tables contain ONLY raw fields (no calculated/lookup/aggregation columns)
- Primary key is always `{table_name}_id TEXT PRIMARY KEY`
- Column names are snake_case versions of PascalCase field names
- Each column has a `COMMENT` with the field's Description

```sql
CREATE TABLE workflow_steps (
  workflow_step_id TEXT PRIMARY KEY,
  label TEXT,
  sequence_position INTEGER,
  requires_human_approval BOOLEAN,
  is_step_of TEXT,              -- FK to workflows (no _id suffix in schema)
  assigned_role TEXT             -- FK to roles
);
COMMENT ON COLUMN workflow_steps.label IS 'Human-readable name...';
```

### Functions (02)
- One `get_{table}_{field}(p_{pk} TEXT)` function per raw field (single-row retrieval)
- One `calc_{table}_{field}(p_{pk} TEXT)` function per calculated/lookup/aggregation field
- All functions are `LANGUAGE plpgsql STABLE SECURITY DEFINER`

```sql
-- Lookup: resolves FK to get a field from related table
CREATE OR REPLACE FUNCTION calc_workflow_steps_assigned_role_label(p_workflow_step_id TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT label FROM roles
          WHERE role_id = (SELECT assigned_role FROM workflow_steps
                           WHERE workflow_step_id = p_workflow_step_id));
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Aggregation: counts related rows
CREATE OR REPLACE FUNCTION calc_workflows_count_of_workflow_steps(p_workflow_id TEXT)
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM workflow_steps WHERE is_step_of = p_workflow_id)::integer;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
```

### Views (03)
- One `vw_{table_name}` view per table
- SELECTs all raw fields from base table + all calculated fields via function calls
- All views use `WITH (security_invoker = ON)`

```sql
CREATE OR REPLACE VIEW vw_workflow_steps WITH (security_invoker = ON) AS
SELECT
  t.workflow_step_id,
  t.label,
  t.sequence_position,
  t.requires_human_approval,
  t.is_step_of,
  calc_workflow_steps_is_step_of_title(t.workflow_step_id) AS is_step_of_title,
  t.assigned_role,
  calc_workflow_steps_assigned_role_label(t.workflow_step_id) AS assigned_role_label,
  calc_workflow_steps_assigned_role_filled_by(t.workflow_step_id) AS assigned_role_filled_by
FROM workflow_steps t;
```

---

## View Field Naming Conventions

### FK Lookup Fields
For any foreign key `foo`, the view includes:
- `foo` - the raw FK value (the ID)
- `foo_name` - display name of related entity
- `foo_label` - alternative display (if the related entity uses Label instead of Name)
- `foo_{field}` - any field from the related entity

### Calculated Field Patterns
- `*_count` / `count_of_*` - count of related items
- `*_amount` - monetary totals
- `is_*` - boolean flags
- `*_status` - status lookups
- `*_at` - timestamps

---

## See also

- `effortless-orchestrator` — canonical Token Discipline section; this skill restates the same rule from the SQL angle.
- `effortless-query` — for the rulebook one-liners that replace `cat`-ing the generated SQL.
- `effortless-conventions` — for the naming patterns that explain why view columns look the way they do.
- `effortless-workflow` — for the rule about `*b-customize-*.sql` being for infra only, never business entities.
- `effortless-diagnostics` — for finding JOIN anti-patterns and broken FK targets.
