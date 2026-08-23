# YAML Execution Substrate

YAML schema representation with shared Python calculation engine.

## Overview

This substrate demonstrates that YAML can serve as a data representation format alongside the shared Python calculation library. Unlike other substrates that compile formulas to their target language, YAML relies on the Python substrate's `erb_calc.py` for actual computation.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 YAML Substrate Architecture                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   schema.yaml                                                │
│   (Static YAML schema - describes structure)                 │
│                          ↓                                   │
│   take-test.py                                               │
│   (Loads YAML data, uses shared erb_calc.py for calculations)│
│                          ↓                                   │
│   test-answers.json                                          │
│   (Computed results for grading)                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Key Features

- **YAML Schema**: Human-readable schema definition
- **Shared Calculation Engine**: Uses Python substrate's `erb_calc.py`
- **No Formula Compilation**: YAML itself doesn't execute formulas
- **Data Interchange**: YAML serves as a portable data format

## Generated Files

| File | Description |
|------|-------------|
| `test-answers.json` | **GENERATED** - Test execution results for grading |
| `test-results.md` | **GENERATED** - Human-readable test report |

Note: Unlike other substrates, YAML does not generate code artifacts. The shared `python/erb_calc.py` is used for calculations.

## Source Files (Not Cleaned)

| File | Description |
|------|-------------|
| `schema.yaml` | Static YAML schema definition |
| `inject-substrate.sh` | Shell wrapper that calls Python injector for shared erb_calc.py |
| `take-test.py` | Test runner using shared Python calculation library |
| `take-test.sh` | Shell wrapper for test runner |
| `clean.py` | Clean script for removing generated files |
| `README.md` | This documentation |

## Cleaning

To remove all generated files:

```bash
python3 clean.py --clean
```

This will remove:
- `test-answers.json`
- `test-results.md`

## Technology

**YAML (YAML Ain't Markup Language)** is a human-readable data serialization format. It's commonly used for configuration files and data exchange.

Key characteristics:
- **Human-readable**: Indentation-based syntax is easy to read and write
- **Superset of JSON**: Any valid JSON is also valid YAML
- **Rich data types**: Supports scalars, lists, maps, and complex nested structures
- **Widely supported**: Available in nearly all programming languages

This substrate demonstrates that YAML can define data structures that are then computed by other substrates (in this case, Python).

## Source

Schema from: `execution-substrates/yaml/schema.yaml`
Calculations from: `execution-substrates/python/erb_calc.py`
