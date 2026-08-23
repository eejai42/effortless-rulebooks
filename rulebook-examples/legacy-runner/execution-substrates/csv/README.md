# CSV - Tabular Data Export Substrate

This substrate generates flat CSV exports from the ERB rulebook, providing a universal interchange format that can be consumed by any tool that reads CSV (pandas, Excel, R, databases, etc.).

## Overview

The CSV substrate produces three artifacts:

1. **rulebook.xlsx** - Full Excel workbook (identical to xlsx substrate)
2. **data.csv** - Flat CSV export with computed values
3. **column_formulas.csv** - Schema/formula definitions for all fields

The key difference from the xlsx substrate: the **test answers are populated from the CSV file**, not from the Excel workbook. This demonstrates that the CSV format contains all information needed for testing.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  inject-into-csv.py                                          │
│  (Rulebook → XLSX + CSV generator)                           │
│                                                              │
│  Reads:  effortless-rulebook/effortless-rulebook.json        │
│  Writes: rulebook.xlsx          (full workbook)              │
│          data.csv (data with computed values) │
│          column_formulas.csv     (field definitions)         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  take-test.py                                                │
│                                                              │
│  Reads:  data.csv (NOT rulebook.xlsx)         │
│  Reads:  test-answers.json (blank template)                  │
│  Writes: test-answers.json (populated with CSV values)       │
└─────────────────────────────────────────────────────────────┘
```

## Role in Three-Phase Contract

### Phase 1: Inject

`inject-into-csv.py` reads the rulebook and generates three files:

| Output File | Description |
|-------------|-------------|
| `rulebook.xlsx` | Full Excel workbook with all tables and computed values |
| `data.csv` | Flat CSV with all Workflows data (computed) |
| `column_formulas.csv` | Schema definitions with field names, types, DAG levels, and formulas |

The injection process:
1. Loads `effortless-rulebook.json`
2. Creates Excel workbook with computed values (same as xlsx substrate)
3. Exports Workflows table as flat CSV
4. Exports all field definitions as formula CSV

### Phase 2: Execute

`take-test.py` populates test answers **from CSV** (not Excel):

```bash
./take-test.sh
```

Which executes:
1. Copy `blank-test.json` → `test-answers.json`
2. Run `take-test.py`:
   - Load `data.csv`
   - Match CSV columns to JSON fields (using snake_case mapping)
   - Fill null fields with CSV values
   - Save updated `test-answers.json`

### Phase 3: Emit

`test-answers.json` contains all computed values, sourced from the CSV export.

### Grade

Compare `test-answers.json` against `answer-key.json` — CSV values must match all other substrates.

## Files

| File | Description |
|------|-------------|
| `inject-into-csv.py` | Generates xlsx + CSV files from rulebook |
| `take-test.py` | Populates answers from CSV (not xlsx) |
| `inject-substrate.sh` | Runs injection + test |
| `take-test.sh` | Copies blank test, runs take-test.py |
| `rulebook.xlsx` | Generated Excel workbook |
| `data.csv` | Generated data CSV |
| `column_formulas.csv` | Generated schema/formula CSV |
| `test-answers.json` | Test results for grading |

## CSV File Formats

### data.csv

Flat export of the Workflows table with computed values:

```csv
workflow_id,name,display_name,title,description,count_of_steps,has_more_than_1_step
onboarding,onboarding,Onboarding,Employee Onboarding,A step-by-step process to onboard new employees,1,false
deployment,deployment,Deployment,Production Deployment,Deploy code to production with approval gates,3,true
```

Key features:
- All field names are snake_case
- Boolean values are lowercase strings (`true`/`false`)
- Computed fields contain final values (not formulas)
- Empty values represent nulls

### column_formulas.csv

Schema definitions for all fields across all tables:

```csv
table_name,field_name,field_type,dag_level,formula
Workflows,workflow_id,raw,0,
Workflows,display_name,raw,0,
Workflows,title,raw,0,
Workflows,name,calculated,1,"=SUBSTITUTE(LOWER({{DisplayName}}), "" "", ""-"")"
Workflows,count_of_steps,aggregation,1,"=COUNTIFS(WorkflowSteps!{{Workflow}}, Workflows!{{WorkflowId}})"
Workflows,has_more_than_1_step,calculated,2,"={{CountOfSteps}} > 1"
```

Key features:
- One row per field across all tables
- `field_type`: `raw` or `calculated`
- `dag_level`: Dependency order (0 = raw, 1+ = calculated)
- `formula`: Original formula from rulebook (empty for raw fields)

## Why CSV?

CSV is the **universal interchange format**:

| Consumer | CSV Support |
|----------|-------------|
| Excel | Native import |
| Google Sheets | Native import |
| pandas | `pd.read_csv()` |
| R | `read.csv()` |
| PostgreSQL | `COPY FROM` |
| SQLite | `.import` |
| Any programming language | Standard libraries |

By reading answers from CSV instead of xlsx, this substrate demonstrates that:
1. CSV contains all computed values
2. No Excel dependency required for test execution
3. Results are portable to any platform

## DAG Execution Order

```
Level 0: Raw fields (from blank-test.json)
Level 1: name (slug), count_of_steps (aggregation)
Level 2: has_more_than_1_step (depends on count_of_steps)
```

The CSV export contains pre-computed values at all levels - the DAG was already evaluated during injection.

## Technology

**CSV (Comma-Separated Values)** is a plain-text tabular format defined by RFC 4180. Each line represents a record, with fields separated by commas.

Key characteristics:
- **Universal compatibility**: Every data tool supports CSV natively
- **Human-readable**: Can be opened in any text editor
- **Flat structure**: Single-table exports; no nested structures
- **No type information**: Values are strings; consumers infer types

This substrate produces RFC 4180 compliant CSV with:
- Header row with field names
- Comma separators
- Double-quote escaping for strings containing commas
- UTF-8 encoding

## Comparison: CSV vs XLSX Substrate

| Aspect | XLSX Substrate | CSV Substrate |
|--------|----------------|---------------|
| Injection output | `rulebook.xlsx` | `rulebook.xlsx` + `*.csv` |
| Test data source | Excel workbook | CSV file |
| Dependencies | openpyxl | openpyxl + csv (stdlib) |
| Portable answers | Requires Excel/openpyxl | Any CSV reader |
| Schema export | Embedded in xlsx | Separate `column_formulas.csv` |

## Generated Files

| File | Description |
|------|-------------|
| `rulebook.xlsx` | **GENERATED** - Excel workbook with all tables |
| `data.csv` | **GENERATED** - Flat CSV export with computed values |
| `column_formulas.csv` | **GENERATED** - Schema/formula definitions for all fields |
| `test-answers.json` | **GENERATED** - Test execution results for grading |
| `test-results.md` | **GENERATED** - Human-readable test report |

## Source Files (Not Cleaned)

| File | Description |
|------|-------------|
| `inject-into-csv.py` | Generates xlsx + CSV files from rulebook |
| `inject-substrate.sh` | Shell wrapper for orchestration |
| `take-test.py` | Populates answers from CSV (not xlsx) |
| `take-test.sh` | Copies blank test, runs take-test.py |
| `README.md` | This documentation |

## Cleaning

To remove all generated files:

```bash
python3 inject-into-csv.py --clean
```

This will remove:
- `rulebook.xlsx`
- `data.csv`
- `column_formulas.csv`
- `test-answers.json`
- `test-results.md`

## Source

Generated from: `effortless-rulebook/effortless-rulebook.json`
