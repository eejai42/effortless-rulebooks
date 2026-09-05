# CLI Update Plan: Postgres-Authoritative Testing Architecture

## Executive Summary

This document outlines a restructuring of the ERB testing system where **PostgreSQL becomes the authoritative source** for all test data and answer keys. This creates a principled, transparent evaluation pipeline where the origin of "correct" answers is explicit and any computational engine can be fairly evaluated.

---

## Current Architecture (Problems)

```
┌─────────────────────────────────────────────────────────────┐
│                  Current: SSoT-Based Testing                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   SSoT JSON ──► generate-test-data.py ──► test-input.json   │
│                          │                                   │
│                          └──► answer-key.json (derived)     │
│                                                             │
│   Problems:                                                 │
│   • Answer key computed in Python script, not real engine   │
│   • No single authoritative computational source            │
│   • Formula changes require regenerating test data          │
│   • "Truth" is computed, not ground-established             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Proposed Architecture (Postgres-Authoritative)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                  NEW: Postgres-Authoritative Testing                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  PHASE 1: ESTABLISH GROUND TRUTH (Postgres)                                 │
│  ═════════════════════════════════════════                                  │
│                                                                              │
│      Human/Script                                                           │
│           │                                                                  │
│           ▼                                                                  │
│   ┌───────────────────────┐                                                 │
│   │   PostgreSQL Database  │  ◄── THE AUTHORITY                             │
│   │   • Systems table      │                                                 │
│   │   • Scales table       │  Ground facts + computed views                 │
│   │   • Computed views     │                                                 │
│   └───────────────────────┘                                                 │
│           │                                                                  │
│           ▼                                                                  │
│   ┌───────────────────────────────────────────────────────┐                 │
│   │              Export from Postgres                      │                 │
│   │   • answer-key.json  (all values from vw_scales)       │                 │
│   │   • test-input.json  (raw facts only, no computed)     │                 │
│   └───────────────────────────────────────────────────────┘                 │
│                                                                              │
│  PHASE 2: EVALUATE ANY ENGINE                                               │
│  ═══════════════════════════                                                │
│                                                                              │
│   test-input.json ──► [Python | Go | Postgres*] ──► {platform}-results.json │
│                                                              │               │
│                       * Postgres deletes & re-inserts from   │               │
│                         test-input.json to evaluate itself   │               │
│                                                              ▼               │
│                              ┌──────────────────────────────────────┐       │
│                              │    Compare against answer-key.json   │       │
│                              │    Generate test-results.html        │       │
│                              └──────────────────────────────────────┘       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## New CLI Structure

### Overview

```bash
./erb-cli <category> <command> [options]

Categories:
  test-manage    # Manage test data lifecycle (postgres-authoritative)
  run            # Run computational engines
  test           # Run and evaluate engines against answer key
  utils          # Utilities (code generation, visualization)
```

---

## Category 1: `test-manage` — Test Data Management

These commands manage the test data lifecycle with Postgres as the authority.

### Commands

#### `test-manage init`
Initialize Postgres with base schema and seed data.

```bash
./erb-cli test-manage init [--connection <conn-string>]
```

**Actions:**
1. Drop and recreate tables (`01-drop-and-create-tables.sql`)
2. Create functions (`02-create-functions.sql`)
3. Create views (`03-create-views.sql`)
4. Optionally seed with data from SSoT JSON (for initial population only)

**Files affected:**
- `postgres/` SQL files executed
- Database tables created fresh

---

#### `test-manage populate`
Populate Postgres with ground-truth test data.

```bash
./erb-cli test-manage populate [--from-ssot | --interactive | --sql <file>]
```

**Options:**
- `--from-ssot`: Load initial data from SSoT JSON (bootstrap only)
- `--interactive`: Enter test data manually via CLI prompts
- `--sql <file>`: Execute custom SQL insert script

**Actions:**
1. Insert systems into `systems` table
2. Insert scales with raw Measure values into `scales` table
3. Postgres computes all derived values via views/functions

---

#### `test-manage export`
Export the authoritative test data from Postgres.

```bash
./erb-cli test-manage export [--output-dir <path>]
```

**Actions:**
1. Query `vw_scales` view for ALL scales with computed values
2. Generate `answer-key.json` (all iterations, all computed values)
3. Generate `test-input.json` (raw facts only: ScaleID, System, Iteration, Measure, IsProjected)
4. Generate `base-data.json` (base iterations with all values, for platform init)

**Output files (default `test-data/`):**
```
test-data/
  ├── answer-key.json     # AUTHORITATIVE (exported from Postgres)
  ├── test-input.json     # Raw facts only (for engine testing)
  └── base-data.json      # Base data for platform initialization
```

---

#### `test-manage validate`
Validate that Postgres matches the exported answer key (sanity check).

```bash
./erb-cli test-manage validate
```

**Actions:**
1. Re-query Postgres
2. Compare against `answer-key.json`
3. Report any drift

---

### Test Management Workflow

```bash
# Initial setup
./erb-cli test-manage init
./erb-cli test-manage populate --from-ssot
./erb-cli test-manage export

# Later: Add new test cases
psql demo -c "INSERT INTO scales (scale_id, system, iteration, measure, is_projected) ..."
./erb-cli test-manage export  # Re-export updated answer key
```

---

## Category 2: `run` — Execute Computational Engines

These commands run the engines without validation.

### Commands

#### `run postgres`
```bash
./erb-cli run postgres [--clean] [--output <path>]
```

**Actions:**
1. If `--clean`: Truncate scales, re-insert from `test-input.json`
2. Query `vw_scales` for computed results
3. Output to `test-results/postgres-results.json`

---

#### `run python`
```bash
./erb-cli run python [--input <path>] [--output <path>]
```

**Actions:**
1. Load `base-data.json` (initialize)
2. Load `test-input.json` (test cases)
3. Compute derived values using Python rulebook
4. Output to `test-results/python-results.json`

---

#### `run go` / `run golang`
```bash
./erb-cli run go [--input <path>] [--output <path>]
```

**Actions:**
1. Load `base-data.json` and `test-input.json`
2. Compute using Go rulebook
3. Output to `test-results/golang-results.json`

---

#### `run all`
```bash
./erb-cli run all [--parallel]
```

Run all available engines.

---

## Category 3: `test` — Run and Evaluate

These commands combine running with validation against the answer key.

### Commands

#### `test <platform>`
```bash
./erb-cli test postgres
./erb-cli test python
./erb-cli test go
./erb-cli test all
```

**Actions:**
1. Run the specified engine (via `run <platform>`)
2. Compare results against `answer-key.json`
3. Report pass/fail counts and mismatches

---

#### `test evaluate`
Evaluate already-generated results files without re-running engines.

```bash
./erb-cli test evaluate [--platform <name> | --all]
```

**Actions:**
1. Load `{platform}-results.json`
2. Compare against `answer-key.json`
3. Generate console report and optional HTML

---

#### `test report`
Generate consolidated HTML report from all test results.

```bash
./erb-cli test report [--output <path>]
```

**Actions:**
1. Load all `test-results/{platform}-results.json`
2. Compare each against `answer-key.json`
3. Generate `visualizer/report.html`

---

## Category 4: `utils` — Utilities

General utilities that support development but aren't part of the test pipeline.

### Commands

#### `utils codegen`
Generate platform-specific code from SSoT.

```bash
./erb-cli utils codegen python
./erb-cli utils codegen go
./erb-cli utils codegen postgres
./erb-cli utils codegen all
```

---

#### `utils visualize`
Launch the visualization tools.

```bash
./erb-cli utils visualize --console   # Console ASCII plots
./erb-cli utils visualize --html      # Generate HTML report
./erb-cli utils visualize --serve     # Start local server for index.html
```

---

#### `utils migrate-ssot`
Migrate data from SSoT JSON to Postgres (one-time).

```bash
./erb-cli utils migrate-ssot [--ssot-path <path>]
```

---

## File Structure Changes

### Before (Current)

```
ERB_veritasium-power-laws-and-fractals/
├── orchestrator.py           # Monolithic orchestrator
├── generate-test-data.py     # Generates answer key from Python calculations
├── test-data/
│   ├── answer-key.json       # Derived from Python (NOT authoritative)
│   ├── test-input.json
│   └── base-data.json
├── postgres/
│   ├── run-tests.py          # Mixed init + test
│   └── *.sql
├── python/
│   └── run-tests.py
└── golang/
    └── run-tests.go
```

### After (Proposed)

```
ERB_veritasium-power-laws-and-fractals/
├── erb-cli                   # Main entry point (Python or shell wrapper)
├── cli/
│   ├── __init__.py
│   ├── main.py               # CLI entrypoint with argparse/click
│   ├── test_manage.py        # test-manage commands
│   ├── run.py                # run commands  
│   ├── test.py               # test commands
│   └── utils.py              # utils commands
│
├── test-data/                # EXPORTED from Postgres (authoritative)
│   ├── answer-key.json       # ← Generated by: ./erb-cli test-manage export
│   ├── test-input.json       # ← Generated by: ./erb-cli test-manage export
│   └── base-data.json        # ← Generated by: ./erb-cli test-manage export
│
├── test-results/             # Output from engines
│   ├── postgres-results.json
│   ├── python-results.json
│   └── golang-results.json
│
├── postgres/
│   ├── sql/
│   │   ├── 01-schema.sql
│   │   ├── 02-functions.sql
│   │   ├── 03-views.sql
│   │   └── 04-seed.sql       # Optional initial seed
│   ├── runner.py             # Engine runner (no init mixed in)
│   └── exporter.py           # Export answer-key from Postgres
│
├── python/
│   ├── rulebook/
│   └── runner.py             # Pure compute, no init
│
├── golang/
│   ├── pkg/rulebook/
│   └── runner.go             # Pure compute, no init
│
├── visualizer/
│   ├── console.py
│   ├── html_report.py
│   └── templates/
│
├── effortless-rulebook/                     # Legacy/reference only
│   └── effortless-rulebook.json
│
└── generators/               # Code generators (utils codegen)
    ├── parser.py
    └── translator.py
```

---

## Implementation Phases

### Phase 1: Core CLI Framework
**Estimated effort: 2-3 hours**

1. Create `cli/` directory structure
2. Implement `erb-cli` entrypoint with basic subcommand routing
3. Migrate existing orchestrator.py logic into `cli/test.py`

### Phase 2: Test Management Commands  
**Estimated effort: 3-4 hours**

1. Implement `test-manage init` (refactor from postgres/run-tests.py)
2. Implement `test-manage populate` (new)
3. Implement `test-manage export` (NEW - critical path)
   - Export from `vw_scales` to answer-key.json
   - Strip computed fields for test-input.json
4. Implement `test-manage validate` (sanity check)

### Phase 3: Clean Runner Separation
**Estimated effort: 2-3 hours**

1. Refactor `postgres/run-tests.py` into pure `runner.py`
   - Remove database init (moved to test-manage init)
   - Keep only: insert from test-input, query results
2. Refactor `python/run-tests.py` → `runner.py`
3. Verify `golang/run-tests.go` is already clean

### Phase 4: Test Evaluation Pipeline
**Estimated effort: 2-3 hours**

1. Implement `test <platform>` commands
2. Implement `test evaluate` for post-hoc validation
3. Implement `test report` for HTML generation

### Phase 5: Utilities & Polish
**Estimated effort: 1-2 hours**

1. Implement `utils codegen` (migrate from existing scripts)
2. Implement `utils visualize`
3. Add `utils migrate-ssot` for initial data migration

---

## Key Benefits

### 1. Single Source of Truth for Answers
- Postgres views/functions are THE computational authority
- No ambiguity about what the "correct" answer is
- Formula bugs fixed in Postgres propagate automatically

### 2. Transparent Test Provenance
- Every test can trace its answer back to Postgres
- Export timestamp in answer-key.json shows when truth was established
- Clear audit trail

### 3. Self-Testing Postgres
- Postgres can test itself by:
  1. Truncating scales table
  2. Re-inserting from test-input.json
  3. Comparing against its own exported answer-key.json
- This validates database consistency

### 4. Engine-Agnostic Evaluation
- Any new engine (Rust, JavaScript, etc.) can be added
- Just needs to: read test-input.json → compute → output results.json
- Same evaluation pipeline applies

### 5. Clean Separation of Concerns
- **test-manage**: Data lifecycle (Postgres-focused)
- **run**: Pure computation (engine-focused)
- **test**: Evaluation (comparison-focused)
- **utils**: Support tools (developer-focused)

---

## Migration Path

### Step 1: Export Current State
```bash
# Current system still works
python orchestrator.py --all  # Verify baseline passes

# Export from Postgres (new script, prototype first)
python postgres/export-answer-key.py  # Creates new answer-key.json
```

### Step 2: Validate Equivalence
```bash
# Compare new Postgres-derived answer-key with old Python-derived
diff test-data/answer-key.json test-data/answer-key-postgres.json
```

### Step 3: Switch Authority
```bash
# Once validated, replace old answer-key
mv test-data/answer-key-postgres.json test-data/answer-key.json

# All platforms now validated against Postgres truth
```

### Step 4: Deploy New CLI
```bash
# Phase in new CLI commands
./erb-cli test all  # Should produce same results as old orchestrator
```

---

## Open Questions

1. **Database Connection**: Should we standardize on a config file for connection strings?
   - Option A: Environment variable `ERB_DB_CONN`
   - Option B: Config file `erb-config.json`
   - Option C: Both, with env taking precedence

2. **SSoT JSON Future**: After migration, should SSoT JSON be:
   - Option A: Deprecated entirely (Postgres is truth)
   - Option B: Generated FROM Postgres (reverse direction)
   - Option C: Kept as legacy reference only

3. **Test Data Versioning**: Should answer-key.json be versioned?
   - Include `"version": "1.0.0"` and `"exported_at": "..."` metadata

---

## Conclusion

This restructuring makes the testing architecture **principled and transparent**:

- **Postgres is the authority** for what answers are correct
- **Test data is exported, not computed** by a separate Python script
- **Any engine can be evaluated fairly** against the same authoritative answer key
- **The CLI provides clear commands** for each phase of the lifecycle

The result is a system where the origin of truth is explicit, the evaluation is fair, and adding new computational engines is straightforward.


