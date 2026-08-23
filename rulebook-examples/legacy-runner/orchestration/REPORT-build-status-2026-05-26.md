# [B]uild Status Across All Demo Domains — 2026-05-26

This report captures the result of running `[B]uild` on every demo in
`rulebook-examples/` via the orchestrator menu (`orchestration/orchestrate.sh`).
The orchestrator was driven non-interactively by piping `B\n Q\n` to it for
each domain.

The runner script and per-domain logs (not committed) live in:

- `/tmp/test_all_domains.sh` — runner
- `/tmp/erb-build-logs/*.log` — one file per domain
- `/tmp/erb-build-summary.txt` — aggregate pass/fail summary

"PASS" here means: the build script completed end-to-end with no Python
traceback, no `FATAL`, no `RuntimeError`, no `✗ FAILED`, no `Error:`, and no
explicit `raise`. It does **not** mean every substrate scored 100% conformance
— that's a separate concern tracked in the per-domain `orchestration-report.html`.

## Headline

- **28 total demos** in `rulebook-examples/` at time of run.
- **11 PASS** (build runs clean).
- **17 FAIL** at time of run.
- After this session's fix: gym-trainer-invoicing moves to PASS (build clean;
  conformance 79.9% on `effortless-postgres` — substrate-side gap, not a build
  error). Net status: **12 PASS / 16 FAIL.**

## Per-domain triage

| Status | Domain                              | Root cause                                                                |
| ------ | ----------------------------------- | ------------------------------------------------------------------------- |
| PASS   | acme-corporation                    | —                                                                         |
| FAIL   | acme-llc                            | CONFIG: `rulebooktoentityframework` not in `ProjectTranspilers`           |
| FAIL   | community-event-planner             | PARSER: ops `*` `-` `.`  fns `NOW`                                        |
| FAIL   | customer-crm                        | PARSER: ops `*` `-`     fns `DATEDIFF`                                    |
| PASS   | customer-fullname                   | —                                                                         |
| FAIL   | effortless-banking                  | PARSER: ops `+` `-` `.`  fns `COALESCE` `IFERROR` `TEXT`                  |
| PASS   | effortless-rulesbooks               | —                                                                         |
| PASS   | expense-approval                    | —                                                                         |
| FAIL   | fantasy-football                    | PARSER: ops `!` `+` `-` `/`                                               |
| PASS   | guessing-game                       | —                                                                         |
| **FIX**| **gym-trainer-invoicing**           | **PARSER fixed this session — see gym-fix-notes below**                   |
| FAIL   | intelligence-taxonomy               | PARSER: ops `*`                                                           |
| PASS   | is-everything-a-language            | —                                                                         |
| PASS   | talisman-advanced                    | —                                                                         |
| PASS   | talisman-basic                       | —                                                                         |
| PASS   | job-search-rag                      | —                                                                         |
| FAIL   | mechanical-kitchen-timer            | PARSER: ops `*` `+` `.` `/`                                               |
| PASS   | naked-claude-vs-effortless-claude   | —                                                                         |
| FAIL†  | nakedclaude-v1                      | OTHER: stray `effortless.json missing at repo root` Traceback during run  |
| FAIL†  | nakedclaude-v2                      | OTHER: same as nakedclaude-v1                                             |
| FAIL   | nakedclaude-v3                      | PARSER: ops `*` `+` `-`                                                   |
| FAIL   | nakedclaude-v4                      | PARSER: ops `*` `+` `-` `.`                                               |
| FAIL   | product-inventory                   | PARSER: ops `*`                                                           |
| FAIL   | star-trek                           | PARSER: ops `.` (now: single-quoted strings, exposed after decimal fix)   |
| FAIL   | therapist-helper-portal             | PARSER: ops `-` `/`                                                       |
| FAIL   | volunteer-shift-scheduler           | PARSER: ops `*` `.` `/`                                                   |
| PASS   | volunteer-shift-scheduler-demo      | —                                                                         |
| FAIL   | wedding-seating-optimizer           | PARSER: ops `+` `-`                                                       |

† nakedclaude-v1/v2 actually reach 90%+ conformance but the run interleaves a
`FileNotFoundError: effortless.json missing at <repo root>` from a startup
check. That's a noise bug worth a separate fix.

## Root cause distribution (FAILs only)

- **PARSER — missing arithmetic operators (+, -, *, /):** 13 of 17 failing
  demos. These all hit `SyntaxError: Unexpected character '*'` (or `+`, `-`,
  `/`) in the canonical answer-key evaluator (`orchestration/formula_parser.py`)
  during `STEP 1: Generating answer key`.
- **PARSER — missing decimal literals (`.`):** ~6 of those same demos use
  decimals (e.g. `0.0875` for tax rates).
- **PARSER — missing functions:** `NOW`, `DATETIME_DIFF`, `DATEDIFF`,
  `ISBLANK`, `COALESCE`, `IFERROR`, `TEXT`.
- **PARSER — single-quoted strings:** revealed in star-trek after the decimal
  fix. The tokenizer only accepts `"..."` strings.
- **PARSER — `!` operator:** fantasy-football uses `!` (negation or
  factorial?). Needs investigation.
- **CONFIG — substrate missing from `ProjectTranspilers`:** 1 demo (acme-llc
  references `rulebooktoentityframework` but the substrate is not registered).
- **OTHER — stray startup error:** 2 demos (nakedclaude-v1/v2) emit a
  traceback for a missing `effortless.json` at the repo root mid-run, but
  conformance still scores high. Noise, not a blocker.

## This session's fix — gym-trainer-invoicing

### Symptom

`STEP 1: Generating answer keys` raised
`RuntimeError: Formula recomputation FAILED for 51 field(s)` covering 5
calculated fields on `Invoices` and 2 on `Sessions`, citing:

- `SyntaxError: Unexpected character '*'` / `'+'` / `'-'`
- `ValueError: Unknown function: DATETIME_DIFF` / `ISBLANK`

### What gym actually needs

| Formula                                                          | Need                          |
| ---------------------------------------------------------------- | ----------------------------- |
| `={{Subtotal}} * {{TaxRate}}`                                    | `*` operator + decimal `0.0875` literal |
| `={{Subtotal}} + {{TaxAmount}} + {{LateFee}} - {{DiscountAmount}}` | `+`, `-` operators           |
| `={{Total}} - {{PaidAmount}}`                                    | `-` operator                  |
| `={{EffectiveRate}} * {{DurationHours}}`                         | `*` operator                  |
| `=MAX(0, {{DaysSinceDueDate}} - {{GraceDays}})`                  | `-` operator (MAX existed)    |
| `=DATETIME_DIFF(NOW(), {{DueDate}}, "day")`                      | `DATETIME_DIFF` + `NOW`       |
| `=NOT(ISBLANK({{Invoice}}))`                                     | `ISBLANK`                     |

### What changed

All in `orchestration/formula_parser.py` (single file):

1. **New AST node:** `LiteralFloat` (decimal literals).
2. **Tokenizer:**
   - Decimal numbers (`123.45`, `.5`).
   - `+`, `-`, `*`, `/` are now their own tokens (`PLUS`, `MINUS`, `STAR`,
     `SLASH`). The old "swallow leading `-` into a negative number" hack is
     gone — unary minus is now handled by the parser.
3. **Parser:**
   - Added precedence levels above the existing comparison level:
     `comparison → addition → multiplication → unary → primary`.
   - Unary `-` and `+` parsed as `UnaryOp` on the operand.
4. **Canonical evaluator (`_eval_expr`):**
   - `BinaryOp('+'|'-'|'*'|'/')` — Excel-style: `None` is coerced to `0` in
     arithmetic context; `/0` returns `None` (Excel `#DIV/0!`).
   - `UnaryOp('-')` — `None` coerced to `0`.
5. **Canonical evaluator (`_eval_func`):**
   - `ISBLANK(x)` → `x is None or x == ''`.
   - `NOW()` / `TODAY()` → `datetime.utcnow()` by default; overridable via
     `FORMULA_NOW` env (ISO-8601). The env override exists so answer-key
     regeneration can be made deterministic in tests if needed.
   - `DATETIME_DIFF(end, start, unit)` / `DATEDIFF(...)` → integer difference
     in `day`/`hour`/`minute`/`second`/`week`. Accepts `date`, `datetime`, or
     ISO-8601 strings; strips tzinfo to allow naive/aware mixing.

### What is NOT fixed (still on the table)

- **`compile_to_python` / `compile_to_javascript` / `compile_to_go` /
  `compile_to_cobol` / `compile_to_ocl` / `compile_to_sparql`** still don't
  emit code for the new arithmetic `BinaryOp` ops, `UnaryOp('-')`,
  `LiteralFloat`, or the new functions. The 7 substrate inject scripts that
  use these compilers will raise on arithmetic when invoked on a domain that
  has it — but gym doesn't use any of these substrates, so gym is unaffected.
- **The forked parsers** inside
  `execution-substrates/binary/inject-into-binary.py`,
  `.../owl/inject-into-owl.py`, and `.../uml/inject-into-uml.py` are stale
  copies of the old parser. Same story — none are invoked by gym.
- **`rulebooktopostgres`** (the external ssotme transpiler, not in this repo)
  generates SQL views for gym, but those views currently return `None` for
  fields whose formulas use `DATETIME_DIFF`, `NOW`, `ISBLANK`, or literal
  scalar defaults (`={{GraceDays}}` is `=45`). Result: gym builds clean but
  conformance is 79.9% on `effortless-postgres` — 41 mismatches in
  `is_paid` / `is_overdue` / `status` / `days_since_due_date` /
  `is_billed` / `grace_days`. Fix lives outside this repo.

### Verification

```
$ echo "gym-trainer-invoicing" > orchestration/active-domain.txt
$ printf "B\nQ\n" | bash orchestration/orchestrate.sh > /tmp/gym.log 2>&1; echo "rc=$?"
rc=0
$ grep -cE "Traceback|FATAL|RuntimeError|✗.*FAILED|Error:|raise " /tmp/gym.log
0
```

End-to-end build runs the full pipeline:
`rulebooktopostgres → execute → rulebooktoreactexplainerdag → STEP 1 answer
keys → STEP 2 substrate tests → STEP 3 grading → STEP 4 summary → STEP 5 HTML
report → open`. No regressions on previously-passing demo `customer-fullname`.

## Per-substrate status

The repo declares these substrates under `execution-substrates/`. Status
notes are based on what runs on the currently-failing demos:

| Substrate                       | Uses canonical parser? | Status today                                                                                           |
| ------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------ |
| `airtable`                      | No (test-only)         | Works.                                                                                                 |
| `csv`                           | No                     | Works (dumps data).                                                                                    |
| `english`                       | No                     | Works (narrative).                                                                                     |
| `xlsx`                          | No (uses Excel formulas directly) | Works.                                                                                      |
| `yaml`                          | No                     | Works.                                                                                                 |
| `python`                        | Yes (`compile_to_python`) | Will raise on any domain with arithmetic. Needs `compile_to_python` extension for `+ - * /`, unary `-`, `LiteralFloat`, `ISBLANK`, `NOW`, `DATETIME_DIFF`. |
| `golang`                        | Yes (`compile_to_go`)  | Same as python.                                                                                        |
| `cobol`                         | Yes (`compile_to_cobol`) | Same as python.                                                                                      |
| `binary`                        | Yes (FORKED `parse_formula`) | Forked copy of parser is stale. Both fork and `compile_to_*` need updating.                      |
| `owl`                           | Yes (FORKED `parse_formula` + `compile_to_sparql`) | Same as binary; SPARQL emitter needs arithmetic too.                                |
| `uml`                           | Yes (FORKED `parse_formula` + `compile_to_ocl`) | Same as binary; OCL emitter needs arithmetic too.                                         |
| `explain-dag`                   | Yes (`parse_formula` + `get_field_dependencies`) | Likely fine — only walks deps; doesn't emit ops. Worth a quick recheck after fix.       |
| `effortless-postgres`           | No (external transpiler) | Postgres SQL is generated by external `rulebooktopostgres`. It emits SQL that handles `+ - * /` natively but currently does NOT emit functions for `DATETIME_DIFF` / `NOW` / `ISBLANK` / scalar-literal defaults. Lives outside this repo. |
| `effortless-xlsx`               | No (external transpiler) | Excel handles arithmetic natively, but answer-key generation upstream of it still needs canonical parser support (fixed for arithmetic in this session). |
| `effortless-entity-framework`   | n/a                    | acme-llc references this but it's not registered in `ProjectTranspilers`. CONFIG bug. |

## Recommended next session(s)

Suggested order of attack (rough effort estimate in parens):

1. **Extend `compile_to_python` for `+ - * /`, unary `-`, `LiteralFloat`,
   `ISBLANK`, `NOW`, `DATETIME_DIFF`** (~20 min). Unblocks the `python`
   substrate on every arithmetic domain in one go.
2. **Same for `compile_to_go` / `compile_to_javascript` / `compile_to_cobol`**
   (~30 min each — mostly mechanical).
3. **Reconcile the forked parsers in `binary`, `owl`, `uml`** — either kill
   the forks and import from `formula_parser`, or replay the parser changes
   in each (~1h). Killing the forks is the cleaner answer.
4. **Add single-quoted-string support to the tokenizer** (~5 min). Unblocks
   star-trek and any other domain using `'...'`.
5. **Investigate fantasy-football's `!`** — probably needs `!=` (treated as
   `<>`?) or unary `!` for NOT (~15 min after looking at the formulas).
6. **Add `COALESCE`, `IFERROR`, `TEXT` functions** for effortless-banking
   (~20 min).
7. **acme-llc CONFIG fix** — either register `rulebooktoentityframework` in
   that demo's `effortless.json` ProjectTranspilers, or remove the
   transpiler-to-substrate mapping that expects it (~10 min).
8. **nakedclaude-v1/v2 startup noise** — track down the `effortless.json
   missing at repo root` Traceback during a run (~15 min).
