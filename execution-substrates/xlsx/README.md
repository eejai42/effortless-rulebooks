# XLSX Execution Substrate

Excel workbook generated from the Effortless Rulebook.

## Overview

This substrate generates a fully functional Excel workbook where calculated fields are implemented as native Excel formulas. The workbook can be opened in Excel, LibreOffice Calc, or any compatible spreadsheet application.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   inject-into-xlsx.py                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   1. Load rulebook JSON (structured data)                    │
│                          ↓                                   │
│   2. Create worksheets for each table                        │
│                          ↓                                   │
│   3. Convert {{FieldRef}} to Excel cell references           │
│                          ↓                                   │
│   4. Write formulas for calculated fields                    │
│                          ↓                                   │
│   5. Apply styling (headers, borders, calculated highlights) │
│                          ↓                                   │
│   6. Output: rulebook.xlsx                                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Key Features

- **Native Excel Formulas**: Calculated fields use real Excel formulas (IF, AND, NOT, etc.)
- **Multi-Worksheet**: One worksheet per table in the rulebook
- **Computed Values**: Formulas evaluate automatically in any spreadsheet app
- **Smart Update**: Only regenerates if content actually changed (avoids volatile function timestamp changes)
- **Professional Styling**: Header highlighting, calculated field backgrounds, frozen header rows

## Generated Files

| File | Description |
|------|-------------|
| `rulebook.xlsx` | **GENERATED** - Excel workbook with all tables and native formulas |
| `test-answers.json` | **GENERATED** - Test execution results for grading |
| `test-results.md` | **GENERATED** - Human-readable test report |

## Source Files (Not Cleaned)

| File | Description |
|------|-------------|
| `inject-into-xlsx.py` | The generator: converts rulebook to Excel workbook |
| `inject-substrate.sh` | Shell wrapper for orchestration |
| `take-test.py` | Test runner that reads computed values from xlsx |
| `take-test.sh` | Shell wrapper for test runner |
| `template.xml` | Template for Excel structure |
| `README.md` | This documentation |

## Cleaning

To remove all generated files:

```bash
python3 inject-into-xlsx.py --clean
```

This will remove:
- `rulebook.xlsx`
- `test-answers.json`
- `test-results.md`

## Technology

**Excel/XLSX** is a spreadsheet format developed by Microsoft. The `.xlsx` format (Office Open XML) is an open standard that stores worksheets, formulas, and formatting in a ZIP archive of XML files.

Key characteristics:
- **Native formulas**: Calculations are performed by the spreadsheet engine
- **Cell references**: Formulas use relative/absolute cell addressing
- **Cross-platform**: Works in Excel, LibreOffice, Google Sheets, etc.
- **Rich formatting**: Supports styles, colors, borders, and conditional formatting

This substrate uses `openpyxl` to generate XLSX files programmatically.

## Source

Generated from: `effortless-rulebook/effortless-rulebook.json`
