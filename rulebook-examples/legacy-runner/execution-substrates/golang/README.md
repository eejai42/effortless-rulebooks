# Golang Execution Substrate

Go calculation library generated from the Effortless Rulebook.

## Overview

This substrate compiles rulebook formulas into native Go code, generating structs and calculation functions that mirror the PostgreSQL `calc_*` pattern.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   inject-into-golang.py                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   1. Load rulebook JSON (structured data)                    │
│                          ↓                                   │
│   2. Parse Excel-dialect formulas into expression tree       │
│                          ↓                                   │
│   3. Build dependency DAG for calculation ordering           │
│                          ↓                                   │
│   4. Compile formulas to Go expressions                      │
│                          ↓                                   │
│   5. Generate Calc* methods for each calculated field        │
│                          ↓                                   │
│   6. Output: erb_sdk.go with structs and ComputeAll()        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Key Features

- **Individual Calc* Methods**: Mirrors PostgreSQL `calc_*` function pattern
- **ComputeAll() Method**: Computes all calculated fields in DAG order
- **Domain-Agnostic**: Works with any rulebook schema
- **Null-Safe**: Uses pointer types for nullable fields with helper functions
- **Type Preservation**: Proper Go types for boolean, integer, and string fields

## Generated Files

| File | Description |
|------|-------------|
| `erb_sdk.go` | **GENERATED** - Go structs and calculation functions compiled from rulebook formulas |
| `erb_test` | **BUILD OUTPUT** - Compiled Go binary (built by take-test.sh) |
| `test-answers.json` | **TEST OUTPUT** - Test execution results for grading |
| `test-results.md` | **TEST OUTPUT** - Human-readable test report |

## Source Files (Not Cleaned)

| File | Description |
|------|-------------|
| `inject-into-golang.py` | The compiler: parses formulas and generates Go code |
| `inject-substrate.sh` | Shell wrapper for orchestration |
| `main.go` | Test runner that loads blank-test.json and produces test-answers.json (created once if missing) |
| `take-test.sh` | Shell wrapper for test runner (builds and runs erb_test) |
| `README.md` | This documentation |

## Cleaning

To remove generated files:

```bash
python3 inject-into-golang.py --clean
```

This will remove:
- `erb_sdk.go`

Note: `main.go` is a source file and is NOT removed by clean. Build outputs (`erb_test`, `test-answers.json`, `test-results.md`) are created by the test runner, not the injector.

## Usage

```go
package main

import "fmt"

func main() {
    // Create a record with raw fields
    record := &Workflow{
        WorkflowId:  strPtr("onboarding"),
        DisplayName: strPtr("Employee Onboarding"),
        Title:       strPtr("Onboarding Process"),
        // ... other raw fields
    }

    // Compute all calculated fields
    computed := record.ComputeAll()

    // Access computed values
    fmt.Println(*computed.Name)           // "employee-onboarding"
    fmt.Println(*computed.HasMoreThan1Step) // false
}
```

## Source

Generated from: `effortless-rulebook/effortless-rulebook.json`
