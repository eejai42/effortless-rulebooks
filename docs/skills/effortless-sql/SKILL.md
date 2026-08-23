<!-- DERIVED ARTIFACT — DO NOT EDIT BY HAND -->
<!-- Source: https://raw.githubusercontent.com/effortlessapi/effortless-claude/main/skills/effortless-sql/SKILL.md -->
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
> what you need, the `*b-customize-*.sql` files run after the generated ones
> on every build and *are* preserved. You also rarely need to read the
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

### Customization Files (Edit WITH PERMISSION — preserved across builds):
- `01b-customize-schema.sql` - runs after 01 (extra tables, ALTER TABLE, indexes)
- `02b-customize-functions.sql` - runs after 02 (custom functions)
- `03b-customize-views.sql` - runs after 03 (custom views)
- `04b-customize-policies.sql` - runs after 04 (custom RLS rules)
- `05b-customize-data.sql` - runs after 05 (custom seed data; runs every build, so make inserts idempotent)

These `*b-customize-*` files are preserved across builds. They re-run on every
`init-db.sh` against a freshly created DB, so they're for *idempotent*
customization — not for one-shot deltas. They're the right home for
infrastructure the hub doesn't model (auth tenants, JWT helpers, role GRANTs).
For business entities, the hub is usually a better fit; if you reach for a
customization file to add a `Foo` table, ask whether `Foo` belongs in the
rulebook instead.

### ERBCustomizations Table Pattern

Some rulebooks store customization SQL directly in an `ERBCustomizations` table within the rulebook itself:

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

`CustomizationType` values: `Schema`, `Functions`, `Views`, `RLS`, `Data` — corresponding to each `*b-customize-*` file.

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
