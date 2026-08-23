# Python Execution Substrate

Python calculation library generated from the Effortless Rulebook.

## Overview

This substrate compiles rulebook formulas into native Python functions, enabling formula evaluation without any external dependencies beyond Python's standard library.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   inject-into-python.py                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   1. Load rulebook JSON (structured data)                    │
│                          ↓                                   │
│   2. Parse Excel-dialect formulas into expression tree       │
│                          ↓                                   │
│   3. Build dependency DAG for calculation ordering           │
│                          ↓                                   │
│   4. Compile formulas to Python expressions                  │
│                          ↓                                   │
│   5. Generate calc_* functions with proper signatures        │
│                          ↓                                   │
│   6. Output: erb_calc.py with compute_all_calculated_fields  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Key Features

- **DAG-Ordered Evaluation**: Calculated fields are computed in dependency order
- **Individual calc_* Functions**: Mirrors the PostgreSQL calc_* pattern
- **compute_all_calculated_fields()**: Convenience function to compute all fields at once
- **Domain-Agnostic**: Works with any rulebook schema
- **Shared Code**: erb_calc.py is also used by GraphQL and YAML substrates

## Generated Files

| File | Description |
|------|-------------|
| `erb_calc.py` | **GENERATED** - Python calculation functions compiled from rulebook formulas |
| `test-answers.json` | **GENERATED** - Test execution results for grading |
| `test-results.md` | **GENERATED** - Human-readable test report |

## Source Files (Not Cleaned)

| File | Description |
|------|-------------|
| `inject-into-python.py` | The compiler: parses formulas and generates Python code |
| `inject-substrate.sh` | Shell wrapper for orchestration |
| `erb_sdk.py` | SDK utilities for loading data and running computations |
| `take-test.py` | Test runner that produces test-answers.json |
| `take-test.sh` | Shell wrapper for test runner |
| `README.md` | This documentation |

## Cleaning

To remove all generated files:

```bash
python3 inject-into-python.py --clean
```

This will remove:
- `erb_calc.py`
- `test-answers.json`
- `test-results.md`

## Usage

```python
from erb_calc import compute_all_calculated_fields

# Given a record with raw fields
record = {
    'chosen_language_candidate': 'Music',
    'has_syntax': True,
    'requires_parsing': False,
    # ... other raw fields
}

# Compute all calculated fields
result = compute_all_calculated_fields(record)

# Access computed values
print(result['family_fued_question'])
print(result['is_open_closed_world_conflicted'])
```

## Source

Generated from: `effortless-rulebook/effortless-rulebook.json`
