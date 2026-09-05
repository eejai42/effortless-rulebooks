# ERB Testing Protocol: Power Laws & Fractals

## Overview

This document describes the unified testing protocol for validating that all platform implementations (Python, PostgreSQL, Golang) correctly compute derived values from the Entity Rule Book (ERB).

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SSoT (Source of Truth)                       │
│              effortless-rulebook/effortless-rulebook.json       │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Test Data Generation                            │
│                       test-data/ directory                           │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────────┐ │
│  │   base-data.json │ │  test-input.json │ │   answer-key.json    │ │
│  │  (iterations 0-3)│ │  (raw facts only)│ │  (expected results)  │ │
│  └──────────────────┘ └──────────────────┘ └──────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       Platform Runners                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │    Python    │  │   Postgres   │  │    Golang    │               │
│  │ run-tests.py │  │ run-tests.py │  │ run-tests.go │               │
│  └──────────────┘  └──────────────┘  └──────────────┘               │
│         │                  │                  │                      │
│         ▼                  ▼                  ▼                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │              test-results/{platform}-results.json             │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       Unified Visualizer                             │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                   visualizer/compare.py                       │   │
│  │  • Compare all platform results against answer-key.json       │   │
│  │  • Generate console output                                    │   │
│  │  • Generate HTML report                                       │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Base Data (Iterations 0-3)
- Source: SSoT scales where `IsProjected = false`
- Contains: All raw facts AND computed values
- Purpose: Initialize each platform with known-good starting state

### 2. Test Input (Iterations 4-7)
- Source: SSoT scales where `IsProjected = true`
- Contains: **ONLY raw facts** (ScaleID, System, Iteration, Measure, IsProjected)
- Purpose: Test each platform's ability to compute derived values

### 3. Answer Key (Iterations 4-7)
- Source: SSoT scales where `IsProjected = true`
- Contains: All values including computed fields
- Purpose: Verify platform outputs match expected values

## Test Protocol

### Step 1: Initialize Platform
Each platform loads `base-data.json` which contains:
- All 7 systems with their configuration
- 4 scale measurements per system (iterations 0-3)
- All computed values already calculated

### Step 2: Load Test Input
Each platform loads `test-input.json` which contains:
- 4 additional scale measurements per system (iterations 4-7)
- **Only raw facts**: ScaleID, System, Iteration, Measure, IsProjected
- No computed values (BaseScale, ScaleFactor, Scale, LogScale, LogMeasure, etc.)

### Step 3: Compute Derived Values
Each platform must:
1. Look up parent system values (BaseScale, ScaleFactor)
2. Calculate: ScaleFactorPower = ScaleFactor ^ Iteration
3. Calculate: Scale = BaseScale × ScaleFactorPower
4. Calculate: LogScale = log10(Scale)
5. Calculate: LogMeasure = log10(Measure)

### Step 4: Export Results
Each platform exports to `test-results/{platform}-results.json`:
```json
{
  "platform": "python",
  "timestamp": "2025-12-11T12:00:00Z",
  "scales": [
    {
      "ScaleID": "Sierpinski_4",
      "System": "Sierpinski",
      "Iteration": 4,
      "Measure": 82.5,
      "BaseScale": 1.0,
      "ScaleFactor": 0.5,
      "ScaleFactorPower": 0.0625,
      "Scale": 0.0625,
      "LogScale": -1.20412,
      "LogMeasure": 1.91645,
      "IsProjected": true
    }
  ]
}
```

### Step 5: Validate Results
The visualizer compares each platform's results against `answer-key.json`:
- **PASS**: All computed values match within tolerance (0.00001)
- **FAIL**: Any value differs beyond tolerance

## Directory Structure

```
ERB_veritasium-power-laws-and-fractals/
├── effortless-rulebook/
│   └── effortless-rulebook.json   # Source of Truth
├── test-data/
│   ├── base-data.json          # Iterations 0-3 (all values)
│   ├── test-input.json         # Iterations 4-7 (raw facts only)
│   └── answer-key.json         # Iterations 4-7 (expected results)
├── test-results/
│   ├── python-results.json     # Python computed values
│   ├── postgres-results.json   # Postgres computed values
│   └── golang-results.json     # Golang computed values
├── visualizer/
│   ├── compare.py              # Cross-platform comparison
│   ├── report.html             # Generated HTML report
│   └── index.html              # Interactive dashboard
├── python/
│   └── run-tests.py            # Python test runner
├── postgres/
│   └── run-tests.py            # Postgres test runner
├── golang/
│   └── run-tests.go            # Golang test runner
├── orchestrator.py             # Master test orchestrator
└── start.sh                    # Entry point
```

## Field Classification

| Field | Type | In Test Input | Platform Must Compute |
|-------|------|---------------|----------------------|
| ScaleID | raw | ✓ | No |
| System | relationship | ✓ | No |
| Iteration | raw | ✓ | No |
| Measure | raw | ✓ | No |
| IsProjected | raw | ✓ | No |
| BaseScale | lookup | ✗ | ✓ |
| ScaleFactor | lookup | ✗ | ✓ |
| ScaleFactorPower | calculated | ✗ | ✓ |
| Scale | calculated | ✗ | ✓ |
| LogScale | calculated | ✗ | ✓ |
| LogMeasure | calculated | ✗ | ✓ |

## Tolerance Values

For numerical comparisons:
- **Decimal precision**: 5 decimal places (0.00001)
- **Slope error tolerance**: 0.001 (for system stats validation)

## Orchestrator Commands

```bash
# Run full test suite
./orchestrator.py --all

# Run specific platform
./orchestrator.py --platform python

# Generate HTML report only
./orchestrator.py --report

# Verbose output
./orchestrator.py --all --verbose
```



