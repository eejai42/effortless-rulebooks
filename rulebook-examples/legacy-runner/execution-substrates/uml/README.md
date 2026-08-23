# UML Execution Substrate

PlantUML diagrams and OCL constraints generated from the Effortless Rulebook.

## Overview

This substrate compiles rulebook formulas into UML artifacts including PlantUML class diagrams, object diagrams, and OCL constraint expressions. These can be rendered by any PlantUML-compatible tool.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   inject-into-uml.py                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   1. Load rulebook JSON (structured data)                    │
│                          ↓                                   │
│   2. Parse Excel-dialect formulas into expression tree       │
│                          ↓                                   │
│   3. Generate class-diagram.puml (schema as UML classes)     │
│                          ↓                                   │
│   4. Generate objects.puml (data as UML objects)             │
│                          ↓                                   │
│   5. Generate model.json (structured model for OCL)          │
│                          ↓                                   │
│   6. Generate constraints.ocl (derive expressions)           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Key Features

- **PlantUML Class Diagrams**: Schema represented as UML classes with attributes
- **PlantUML Object Diagrams**: Data instances as UML objects
- **OCL Constraints**: Calculated fields as OCL derive expressions
- **Model JSON**: Structured model for programmatic evaluation
- **Domain-Agnostic**: Works with any rulebook schema

## Generated Files

| File | Description |
|------|-------------|
| `class-diagram.puml` | **GENERATED** - PlantUML class diagram showing schema structure |
| `objects.puml` | **GENERATED** - PlantUML object diagram showing data instances |
| `model.json` | **GENERATED** - JSON model for programmatic OCL evaluation |
| `constraints.ocl` | **GENERATED** - OCL derive expressions for calculated fields |
| `test-answers.json` | **GENERATED** - Test execution results for grading |
| `test-results.md` | **GENERATED** - Human-readable test report |

## Source Files (Not Cleaned)

| File | Description |
|------|-------------|
| `inject-into-uml.py` | The compiler: parses formulas and generates UML artifacts |
| `inject-substrate.sh` | Shell wrapper for orchestration |
| `take-test.py` | Test runner that evaluates OCL constraints |
| `take-test.sh` | Shell wrapper for test runner |
| `README.md` | This documentation |

## Cleaning

To remove all generated files:

```bash
python3 inject-into-uml.py --clean
```

This will remove:
- `class-diagram.puml`
- `objects.puml`
- `model.json`
- `constraints.ocl`
- `test-answers.json`
- `test-results.md`

## Technology

**UML (Unified Modeling Language)** is the ISO/IEC 19501 standard for software modeling diagrams. For code generation, text-based UML tools like PlantUML allow diagrams to be version-controlled, diffed, and generated programmatically.

Key characteristics:
- **Text-to-diagram**: PlantUML converts plain text to rendered diagrams
- **Multiple diagram types**: Class, object, entity-relationship, sequence diagrams
- **Embeddable**: Markdown, wikis, and documentation systems render these inline
- **Diff-friendly**: Text representations enable meaningful version control

**OCL (Object Constraint Language)** is a formal specification language for adding constraints to UML models. OCL expressions define invariants, preconditions, postconditions, and derived values.

## Source

Generated from: `effortless-rulebook/effortless-rulebook.json`
