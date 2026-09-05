<!-- DERIVED ARTIFACT — DO NOT EDIT BY HAND -->
<!-- Source: https://raw.githubusercontent.com/EffortlessAPI/effortless-skills/main/skills/effortless-conventions/SKILL.md -->
<!-- Mirrored by: docs/skills/clone-skills.sh -->
<!-- Update: cd effortless-platform && effortless clone-skills -->

---
name: effortless-conventions
description: >
  Use when you need ERB naming conventions, DAG structure rules, PascalCase table
  names, primary key and foreign key patterns, the Name field requirement, or
  understanding why many-to-many relationships are not allowed.

  **Scope (load gate):** Effortless projects only — project root must contain `effortless.json` AND a CLAUDE.md identifying the project as ERB methodology. Do NOT load otherwise.
audience: customer
---

# ERB Naming & Design Conventions

**Format:** Standard JSON + Single Line Leaves.

If a `minimize-rulebook` transpiler is registered, check the derived
`*.derived-read-me-1st.txt` for a quick table/field map first — climb to
`schema.min.json` / `schema.json` before the full rulebook. See
`effortless-query` for the full escalation ladder.

## Table Names
- **PascalCase**, no spaces, no symbols, no underscores
- Plural for collections: `Customers`, `WorkflowSteps`, `TypesOfAgents`
- Example: `ClientProgramSessions`, `DocumentCategories`, `ApprovalGates`

## The `<Entity>Id` Field (STORED IDENTIFIER)

Every table's **first raw field** is `<Entity>Id` — the **singular** entity name + `Id`. E.g. the `Manufacturers` table has `ManufacturerId`; the `WorkflowSteps` table has `WorkflowStepId`. This is the stored identity of each row.

- **Raw field**, not calculated.
- In mock data, use human-friendly slug-style values (`"acme-corp"`, `"step-01"`, `"alice@example.com"`). These make mock data readable and debuggable.
- FK fields in child tables hold the **value** of the parent's `<Entity>Id` field.
- In production, the execution substrate (Postgres, Airtable) may replace these slugs with UUIDs or surrogate keys — the rulebook doesn't care. The `<Entity>Id` field is the rulebook's logical identity; what the substrate uses under the hood is its own concern.

## The `Name` Field (DISPLAY ALIAS)

Every table also has a `Name` **calculated** field — a human-readable display label derived from raw fields.

- `Name` is **not** the stored PK. It is a computed display alias, not used in lookups or matches.
- Simple pattern: `Name = ={{<Entity>Id}}` (just mirrors the stored id).
- Compound pattern: `Name = ={{OrderNumber}} & "-" & {{Status}}` for tables where identity is composite.
- Because `Name` is calculated, it works correctly even if the substrate swaps slug identifiers for UUIDs.
- In Airtable contexts, `Name` maps to the primary field (first column).

> ⚠️ **Compound-`Name` PK collapse (FIXED in published `rulebook-to-postgres`).**
> A table whose logical key is a **calculated `Name` compounding a relationship +
> a raw field** (e.g. `Publications.Name = ={{Video}} & " @ " & {{Channel}}`) used
> to have its synthesized `<Table>Id` PK **collapsed onto just the first component**
> — so distinct rows deduped and vanished (14 videos became 2). Two related
> mis-selections went with it: an incidental `Id`-ending **attribute** field
> (`CategoryId`, `PlaylistId`, `ExternalId`) could get picked as the PK over the
> real calculated `Name`. **Both are fixed:** the PK now synthesizes from the full
> compound value, and an author-intended `<Entity>Id` (`student_id` for `Students`,
> etc.) still correctly wins. **Symptom → cause:** if a table's rows collapse /
> dedupe in Postgres (fewer rows than the rulebook), OR you hit FK violations where
> a compound-`Name` FK won't resolve, it was this bug — **just rebuild with the
> published transpiler.** Do NOT work around it by materializing `Name` as a raw
> field; no rulebook workaround is needed anymore.

## Every Table and Field Must Have a Description
- Descriptions form the semantic backbone of the DAG
- They explain purpose, usage context, and ontology mappings
- Example: `"Human-readable name for the workflow. Maps to dct:title per Dublin Core."`

## Foreign Key Conventions

**The FK field uses the SINGULAR entity name, NO "Id" suffix:**

```
Order.Customer     (FK to Customers table)    -- NOT Order.CustomerId
Employee.Role      (FK to Roles table)        -- NOT Employee.RoleId
Artifact.DerivedFrom (FK to Artifacts table)  -- NOT Artifact.DerivedFromId
```

**FK fields hold the `<Entity>Id` value of the related row** — the stored identifier. In mock data this is the slug string (e.g. `"acme-corp"`). Lookups always MATCH on `<Entity>Id`:

```
=INDEX(Customers!{{Region}}, MATCH({{Customer}}, Customers!{{CustomerId}}, 0))
```

- The MATCH column is always `<Entity>Id` — never `Name` (that's a calculated alias, not the stored identity).
- The INDEX column is whatever field you actually want to retrieve (`Region`, `Status`, `CompanyName`, etc.).

**The reverse relationship uses the PLURAL name:**

```
Customer.Orders    (relationship, RelatedTo: "Orders")
Role.Employees     (relationship, RelatedTo: "Employees")
Workflow.WorkflowSteps (relationship, RelatedTo: "WorkflowSteps")
```

**Always 1-to-many. The singular side is the parent (1), the plural side is the children (many).**

## NO MANY-TO-MANY RELATIONSHIPS. EVER.

The rulebook is a **Directed Acyclic Graph (DAG)**. Many-to-many breaks the acyclic requirement.

If you think you need many-to-many, introduce a **junction table**:
```
# WRONG: Students <-> Courses (many-to-many)

# RIGHT: Students -> Enrollments <- Courses (two 1-to-many via junction)
Students.Enrollments   (1-to-many)
Courses.Enrollments    (1-to-many)
Enrollment.Student     (FK to Students)
Enrollment.Course      (FK to Courses)
```

## Calculated Field Naming Patterns

| Pattern | Meaning | Example |
|---------|---------|---------|
| `Is{Something}` | Boolean flag | `IsRedHeaded`, `IsWinningBid`, `IsHighQualityFit` |
| `CountOf{Related}` | Aggregation count | `CountOfWorkflowSteps`, `CountOfOrders` |
| `{FK}{FieldName}` | Lookup field | `AssignedRoleLabel`, `IsStepOfTitle`, `CustomerName` |
| `{Noun}Amount` | Monetary/numeric total | `BidAmount`, `TotalSales` |
| `{Noun}Status` | Status lookup | `RfpStatus`, `VendorStatus` |

---

## The DAG: Directed Acyclic Graph

The rulebook IS a DAG. Understanding this is essential.

### Table-Level DAG
- **Tables are nodes**, FK relationships are directed edges
- Edges point from child to parent: `Order -> Customer`, `WorkflowStep -> Workflow`
- No cycles allowed. If A references B, B cannot reference A (directly or transitively)
- Lookup/aggregation fields traverse these edges to pull or roll up data

### Field-Level DAG (within a table)
- **Level 0**: Raw fields (no dependencies)
- **Level 1**: Calculated fields that depend only on Level 0 raw fields
- **Level 2+**: Calculated fields that depend on other calculated fields
- Formula parsing must respect this ordering — compute Level 0 first, then Level 1, etc.

### Cross-table reads are 1 hop only

Same acyclicity discipline, applied to *reads* not just structure: a `lookup`
or `aggregation` field crosses exactly **one** FK edge — current table to one
directly-related table. No formula chains two relationships (`A -> B -> C`)
or filters `A` by a condition that lives on `C`. If a value needs to cross
two hops, flatten it: add a same-row field on `B` that captures the fact one
hop from `C`, then read *that* field from `A` one hop from `B`. See
`effortless-schema`'s "Hard limit: 1 hop only" for the formula-syntax detail
and `effortless-cmcc`'s anti-pattern checklist for why this is load-bearing,
not a current-tooling gap.

### Visualizing the DAG
```
Departments
    |
    v
Roles ---------> Agents
    |
    v
WorkflowSteps --> Workflows
    |
    v
Artifacts ------> Datasets
```

Arrows point from child (many-side) to parent (one-side). Data flows UPWARD through lookups and aggregations.

---

## See also

- `effortless-schema` — for the JSON shape these conventions produce in `effortless-rulebook.json`.
- `effortless-orchestrator` — for the bigger mental model these conventions live inside.
- `effortless-airtable-omni` — for OMNI prompts that respect the `Name` formula and singular-FK rules.
- `effortless-sql` — for how PascalCase / `Name` / FK conventions translate to snake_case columns and `vw_*` views.

---

## Magic-links refactor (v0.2)

> See [../../MAGIC_LINKS_REFACTOR.md](../../MAGIC_LINKS_REFACTOR.md) §6 for the canonical v0.2 magic-links contract.

Anti-patterns to flag during a project audit:

1. **`MagicLinkIntegration` / `ERBmagiclinks` rulebook tables** — auth state does not belong in the rulebook. The only source of truth is `auth.trusted_tenants` from `install-magic-links.sql`. Offer migration when seen.

2. **v1 GUC-cache pattern** — raw `set_config('app.jwt_email', …)` from Node middleware + RLS reading `current_setting('app.jwt_email', true)` directly, with no `auth.set_jwt(token)` in transaction. The v2 shape is `BEGIN; SELECT auth.set_jwt($1); … COMMIT;` and policies use `app.jwt_email()`. Offer migration when seen.
