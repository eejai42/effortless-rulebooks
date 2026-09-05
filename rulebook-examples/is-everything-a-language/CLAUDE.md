# Is Everything a Language? — Effortless Project

<!-- rulebook-authoritative-banner -->
## Authoritative Source: `effortless-rulebook/is-everything-a-language-rulebook.json` is HEAD

For this project, **`effortless-rulebook/is-everything-a-language-rulebook.json` is the single, authoritative source of truth.** Edit it directly. All other artifacts (Postgres SQL, Python, Go, Excel, OWL, etc.) are mechanically derived from it via `effortless build`.

### Airtable pull is disabled by default

The `airtabletorulebook` transpiler in `effortless.json` is set to `IsDisabled: true` / `Enabled: false` so that **a routine `effortless build` will never silently overwrite your JSON edits with whatever is in Airtable**.

If you want to re-enable Airtable pull as the source of truth for a single build, you must do it explicitly and with intent:

1. Confirm with the user that the rulebook JSON should be overwritten from Airtable.
2. Either:
   - Run the transpiler one-off:
     ```bash
     effortless airtabletorulebook -o effortless-rulebook/is-everything-a-language-rulebook.json -account airtable -p "view=Grid view"
     ```
   - Or flip `IsDisabled` back to `false` in `effortless.json`, run `effortless build`, then flip it back to `true`.

**Default rule for Claude / any agent operating in this project:** treat the JSON as authoritative; do not enable or invoke `airtabletorulebook` without explicit user consent on that specific turn. Memory or "we usually pull from Airtable" is not consent — every pull must be a fresh, in-context decision.
### Never silently revert `is-everything-a-language-rulebook.json`

**Treat `effortless-rulebook/is-everything-a-language-rulebook.json` as sacred.** It contains human-authored business rules and CANNOT be casually overwritten. Before running any command that could touch this file — `effortless build`, `effortless airtabletorulebook`, any transpiler that writes to it, any sync script, any `git checkout`/`git restore` against it — first run `git status` / `git diff` on it.

- If the file has uncommitted changes that you (the agent) did NOT just make this turn, **stop**. Ask the user before proceeding.
- It is only acceptable to let a regeneration touch this file when you are certain the *only* uncommitted edits in it are ones you just made in the current turn.
- This applies to every `**/effortless-rulebook/is-everything-a-language-rulebook.json` in this repo, not just the project-local one.

There is no upstream to "restore from." The JSON is the upstream.

<!-- /rulebook-authoritative-banner -->

This folder is a **self-contained Effortless Rulebook (ERB) project**. The rulebook is the single source of truth. All other artifacts (Postgres, Python, Go, substrates) are mechanically derived from it.

## What This Demonstrates

- **Philosophical ontologies**: Modeling abstract concepts and formal arguments
- **Complex predicates**: 8+ boolean conditions combined with AND logic
- **Meta-ontology**: Self-referential tables (e.g., languages about languages)
- **Domain-agnostic schema**: Proof that ERB works for domains beyond business processes

## Rulebook

**Location:** `effortless-rulebook/is-everything-a-language-rulebook.json`

This is the canonical specification for the domain. It defines:
- Entity schemas (tables with fields)
- Field types (text, number, select, date, FK/reverse-FK, etc.)
- Calculated fields (formulas, lookups, aggregations)
- Seed data (test data for conformance)

## Editing

### Option 1: Direct (no Airtable)

Edit `effortless-rulebook/is-everything-a-language-rulebook.json` directly. Then rebuild:

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
| `effortless-rulebook/is-everything-a-language-rulebook.json` | The rulebook (SSoT) |
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

Edit `is-everything-a-language-rulebook.json`: add a new top-level object with `schema` and `data` properties. Then `effortless build`.

### Add a calculated field

Edit the table's field list in `is-everything-a-language-rulebook.json`: add a field with `type: "formula"` or `"lookup"` or `"aggregation"`. Then `effortless build`.

### Change seed data

Edit the `data` section of a table in `is-everything-a-language-rulebook.json`. Then rebuild to regenerate answer keys and test files.

### Debug a formula

The rulebook uses **Excel-compatible formulas**: `IF()`, `AND()`, `CONCAT()`, `SUM()`, etc. Check the formula syntax against the Excel spec. Conformance tests will catch mismatches across substrates.

## App (`app/`)

`app/` is the view-backed app for this project: `app/server.js` (Express + pg) on port **43301** and a Vite + React classification board on port **43101**, launched together by `./start.sh`. It connects to Postgres database `erb_is_everything_a_language` (override with `PGHOST/PGUSER/PGPASSWORD/PGPORT/PGDATABASE`) and **reads views only** — `vw_language_candidates` and `vw_is_everything_a_language` via `GET /api/views`, `GET /api/views/:name`, and `GET /api/candidates/:id`. Verdicts (`predicted_answer`, `prediction_fail`, `prediction_predicates`, `is_open_closed_world_conflicted`, …) are displayed straight from view columns; never recompute them in JS. If the DB or a view is missing the API returns 500 naming what was expected and the UI shows that error.

---

**The rulebook is the specification. Everything else is derived.**
