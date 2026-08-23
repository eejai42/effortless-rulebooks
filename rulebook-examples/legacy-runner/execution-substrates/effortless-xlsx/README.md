# Effortless-XLSX Execution Substrate

This is a **licensed Effortless** substrate. The work of compiling the rulebook into a spreadsheet with real Excel formulas is done by the `rulebook-to-xlsx` transpiler (configured in `effortless.json` at `RelativePath: /licensed-effortless-tools/xlsx`). This substrate simply reads the resulting workbook and emits test-answers.

## How it works

1. `inject-substrate.sh` runs `effortless -buildLocal` in `licensed-effortless-tools/xlsx/`. That invokes the `rulebook-to-xlsx` transpiler, which writes an `.xlsx` workbook into that folder. Every calculated field in the rulebook becomes a real Excel formula referencing other cells in the same row.
2. `take-test.py` opens the workbook with `openpyxl(data_only=True)`. If LibreOffice (`soffice`) is installed, it first opens-and-saves the workbook headlessly to force formula recalc so cached values are present.
3. For each entity in `testing/blank-tests/`, it locates the matching worksheet and writes the rows out to `test-answers/{entity}.json`, ordered to match the blank-test order so the grader can diff cleanly.

## Why this is expected to always score 100%

The `rulebook-to-xlsx` transpiler is a production Effortless tool. It compiles every rulebook formula into a corresponding Excel formula — and Excel's formula engine has been tested by hundreds of millions of users for decades. Provided the workbook is recalculated (Excel, LibreOffice, or Google Sheets all do this automatically when the file is opened), the cached values mirror the rulebook's intent exactly.

Contrast with the open-source [`xlsx`](../xlsx/) substrate, which reimplements an Excel formula evaluator in Python. That open injector is a *reference implementation* — it covers the common formulas and is intentionally not extended to every Excel intrinsic, so the long tail of functions may not be wired up yet. That is a property of that one open injector (recorded in its `Expressive` value), not a limitation of the rulebook, the formula dialect, or the `rulebook-to-xlsx` Effortless tool above, which compiles every formula.

## See also

- [`licensed-effortless-tools/xlsx/`](../../licensed-effortless-tools/xlsx/) — the transpiler output (the workbook itself)
- [`execution-substrates/xlsx/`](../xlsx/) — the open-source counterpart with its own formula evaluator
