# Traffic-Ticket Contest — Effortless Project

This folder is a **self-contained Effortless Rulebook (ERB) project**. The rulebook is the single source of truth. All other artifacts (Postgres, Python, Go, substrates) are mechanically derived from it.

## Rulebook

**Location:** `effortless-rulebook/traffic-ticket-contest-rulebook.json`

The rulebook file is always named after its containing folder — e.g. `acme-llc/effortless-rulebook/acme-llc-rulebook.json`. The generic name `effortless-rulebook.json` is **not** used for per-project rulebooks; that name is used by the root governing rulebook at `../../effortless-rulebook/effortless-rulebook.json` (the protocol allows either name; this project uses the slug form).

This is the canonical specification for the domain. It defines:
- Entity schemas (tables with fields)
- Field types (text, number, select, date, FK/reverse-FK, etc.)
- Calculated fields (formulas, lookups, aggregations)
- Seed data (test data for conformance)

## Editing

### Option 1: Direct (no Airtable)

Edit `effortless-rulebook/traffic-ticket-contest-rulebook.json` directly. Then rebuild:

```bash
effortless build
```

### Option 2: Airtable-first (if connected)

Edit schema/data in Airtable UI (base ID is hardcoded in `effortless.json`). Then pull the rulebook:

```bash
effortless airtabletorulebook
```

And rebuild:

```bash
effortless build
```

### Option 3: Reverse-sync (rulebook → Airtable)

If you've edited the rulebook directly and want to push back to Airtable:

```bash
effortless rulebooktoairtable
```

## Building

```bash
effortless build
```

This runs all enabled transpilers and generates:
- `execution-substrates/postgres/`: SQL (views + base tables)
- `execution-substrates/python/`: Python dataclasses + computed fields
- `execution-substrates/golang/`: Go structs + business logic
- And 10+ other substrates (Excel, OWL, UML, etc.)

## Testing

From the project root:

```bash
./start.sh
# or
bash orchestration/orchestrate.sh
```

This:
1. Generates answer keys from the rulebook seed data
2. Injects the rulebook into all substrates
3. Grades each substrate against the answer key
4. Produces a conformance report

All substrates should produce identical results.

## Key Files

| File | Purpose |
|------|---------|
| `effortless.json` | Project config + transpiler settings |
| `CLAUDE.md` | This file |
| `effortless-rulebook/traffic-ticket-contest-rulebook.json` | The rulebook (SSoT) |
| `README.md` | Narrative: what this domain models |
| `execution-substrates/*/` | Generated: do not edit |

## Philosophy

The rulebook is a **declarative specification** of business logic. It is:

- **Implementation-agnostic**: express once, run everywhere (Postgres, Python, Go, etc.)
- **Temporally trackable**: the rulebook file is version-controlled; every schema change is a commit
- **Conformance-testable**: all substrates compute identically (verified by test suite)
- **Hub-and-spokes**: the rulebook is the hub; Airtable (optional), Postgres, Python, etc. are spokes

**Do not hardcode logic in substrates.** If you're tempted to write imperative code in the generated files, the rule likely belongs in the rulebook as a Formula, Lookup, or Aggregation.

## Common Tasks

### Add a new entity (table)

Edit `traffic-ticket-contest-rulebook.json`: add a new top-level object with `schema` and `data` properties. Then `effortless build`.

### Add a calculated field

Edit the table's field list in `traffic-ticket-contest-rulebook.json`: add a field with `type: "formula"` or `"lookup"` or `"aggregation"`. Then `effortless build`.

### Change seed data

Edit the `data` section of a table in `traffic-ticket-contest-rulebook.json`. Then rebuild to regenerate answer keys and test files.

### Debug a formula

The rulebook uses **Excel-compatible formulas**: `IF()`, `AND()`, `CONCAT()`, `SUM()`, etc. Check the formula syntax against the Excel spec. Conformance tests will catch mismatches across substrates.

---

**The rulebook is the specification. Everything else is derived.**
