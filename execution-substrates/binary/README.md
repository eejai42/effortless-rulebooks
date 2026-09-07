# Binary Substrate: Formula-to-Native Evaluator Pipeline

## Overview

**Python does all orchestration + compilation + plumbing.**
**The ONLY runtime computation is:**

```
test_answer bytes → asm evaluator(test_answer_struct_ptr, candidate_id) → scalar result
```

This is a domain-agnostic "formula → tiny native evaluator" pipeline where field names, domain concepts, and business logic exist only at compile time. At runtime, it's pure byte offsets and generic operations.

## Current Status

**Implemented and functional.** The compiler generates ARM64 assembly (Apple Silicon) that is assembled and linked into a shared library. The test runner loads this library via ctypes and executes the generated evaluators.

Current test score: **~70%** - Some calculated fields (particularly those with formula dependencies like `family_feud_mismatch`) have known issues with DAG ordering.

## Known Limitations

1. **DAG ordering for dependent formulas**: The assembly functions are self-contained and don't call each other. Calculated fields that depend on other calculated fields (like `family_feud_mismatch` depending on `top_family_feud_answer`) need the dependency computed and written back to the struct before evaluating.

2. **ARM64 only**: Currently generates Apple Silicon ARM64 assembly. x86-64 support is not implemented.

3. **String return ABI**: The approach for returning both pointer and length from string functions has edge cases on ARM64.

---

## Architecture

### Phase 0: Define a Tiny, Domain-Agnostic ABI

**Input Memory Struct: `TestAnswer`**
- Laid out as fixed offsets
- Contains only generic types: `bool`, `i64`, `f64`, `string_ref`, and optionally `null`
- Strings represented as `(ptr, len)` or `string_id` into an intern table

```
┌─────────────────────────────────────────────────┐
│  TestAnswer struct (example layout)             │
├─────────────────────────────────────────────────┤
│  Offset 0:   string_ptr   8 bytes               │
│  Offset 8:   string_len   8 bytes               │
│  Offset 16:  bool field   1 byte                │
│  Offset 17:  bool field   1 byte                │
│  ...                                            │
│  Offset 24:  i64 field    8 bytes               │
│  ...                                            │
└─────────────────────────────────────────────────┘
```

**Evaluator Signature (per computed value):**
```c
TaggedValue eval_X(const TestAnswer* ta, const char* candidate_id_ptr, int candidate_id_len);
```

**TaggedValue:**
```c
typedef struct {
    uint8_t tag;      // 0=null, 1=bool, 2=i64, 3=f64, 4=string
    union {
        bool    as_bool;
        int64_t as_i64;
        double  as_f64;
        struct { char* ptr; size_t len; } as_string;
    } payload;
} TaggedValue;
```

---

### Phase 1: Python — Parse + Lower Formulas into Minimal IR DAG

1. Read `test_answers.json`
2. For each "computed value" to reproduce:
   - Parse its Excel-dialect expression into an expression tree
   - Lower expression tree → **typed IR DAG** using only generic ops:
     - `IF`, `AND/OR/NOT`
     - Comparisons (`=`, `<>`, `<`, `<=`, `>`, `>=`)
     - Arithmetic (optional)
     - String ops (`&` concat, `LEN`, etc. if needed)
   - Resolve cell/field references into **offset reads** from `TestAnswer`
     - No domain words; just `field_17`, `field_42`, etc.
   - Constant-fold anything possible

---

### Phase 2: Python — Generate Assembly for Each DAG

Emit one asm function per computed value:
- Prologue allocates/uses stack scratch only for that DAG
- Loads inputs from `TestAnswer` by offset
- Executes IR ops (branchless where easy, branches for `IF`)
- Returns a `TaggedValue`

Include a tiny shared "runtime" in asm/C for:
- String compare
- String concat (optional)
- Boolean short-circuit
- Null semantics

Keep it minimal; everything else is inlined per-function.

---

### Phase 3: Python — Build Shared Library and Load It

1. Use `clang`/`nasm`/`as` to compile to `.so`/`.dylib`/`.dll`
2. Load via `ctypes` (or `cffi`) with the ABI above
3. Export a simple registry:
   - `get_fn(name) -> function pointer`
   - Or stable symbol naming: `eval_<hash>`

---

### Phase 4: Runtime Script (Domain-Agnostic Injector)

```python
# 1. Read test_answers.json
# 2. For each test_answer:
#    - Pack it into the TestAnswer struct (bytes)
#    - Call the selected asm evaluator(s) with:
#      * pointer to struct
#      * candidate identifier (bytes)
#    - Receive TaggedValue, decode to Python scalar
# 3. Write results back to the XLSX (or any sink)
```

This follows the same injector pattern as other substrates.

---

### Phase 5: "Only 3-4 Syntaxes" Support Strategy

Implement a **small set of IR patterns** that cover the Excel dialect:

| # | Pattern | Covers |
|---|---------|--------|
| 1 | Boolean logic blocks | `AND/OR/NOT` |
| 2 | Ternary blocks | `IF(cond, a, b)` |
| 3 | Comparisons + arithmetic | `=`, `<>`, `<`, `+`, `-`, etc. |
| 4 | String ops | concat `&` + equality |

Everything else either:
- Gets precomputed in Python, or
- Expands into these primitives during lowering

---

### Phase 6: Correctness Harness

For each computed value, run:
1. Python reference evaluator (expression interpreted) vs asm evaluator
2. Diff on a sample of `test_answers`
3. Only ship asm outputs when the harness matches

---

## Generated Files

| File | Description |
|------|-------------|
| `erb_calc.s` | **GENERATED** - ARM64 assembly (never hand-written) |
| `erb_calc.o` | **GENERATED** - Assembled object file |
| `erb_calc.dylib` / `.so` | **GENERATED** - Compiled shared library |
| `test-answers.json` | **GENERATED** - Computed results for grading |
| `test-results.md` | **GENERATED** - Human-readable test report |

## Source Files (Not Cleaned)

| File | Description |
|------|-------------|
| `inject-into-binary.py` | **THE COMPILER**: parses formulas → generates asm → builds .dylib |
| `take-test.py` | Test runner: packs JSON → calls asm → unpacks results |
| `take-test.sh` | Shell wrapper |
| `inject-substrate.sh` | Orchestration wrapper |
| `schema.bin.md` | Schema documentation |
| `README.md` | This documentation |

## Cleaning

To remove all generated files:

```bash
python3 inject-into-binary.py --clean
```

This will remove:
- `erb_calc.s`
- `erb_calc.o`
- `erb_calc.dylib` / `erb_calc.so`
- `test-answers.json`
- `test-results.md`

---

## The Contract

The ERB contract: **the same formula definitions work across all substrates**.

- SQL substrate: formulas → SQL expressions in views
- Python substrate: formulas → Python expressions
- GraphQL substrate: formulas → resolver logic
- **Binary substrate: formulas → x86-64 assembly**

The formula is the single source of truth. The assembly is derived, not authored.

---

## Running

```bash
# Generate assembly and compile to shared library
python3 inject-into-binary.py

# Run tests against the compiled library
./take-test.sh
```
