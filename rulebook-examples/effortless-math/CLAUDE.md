# CLAUDE.md — Effortless Math Domain

Read and obey the host repository's root `CLAUDE.md` first. This file adds mathematical-domain constraints.

## Category boundary

`effortless-math` is domain data. Do not put admin-portal, orchestration, user-role, or platform configuration tables in its rulebook. Do not put theorem-domain entities in the platform rulebook.

## SSoT

The canonical semantic asset is:

```text
effortless-rulebook/effortless-math-rulebook.json
```

Do not create a second theorem-status registry in Python, SQL, TypeScript, YAML, or prose. Generate projections from the rulebook.

## Loop identity (non-negotiable)

A loop is exactly one change to a canonical rulebook's parsed semantic object. Read and follow `docs/LOOP_PROTOCOL.md`.

```text
rulebook semantic object changed   => loop
rulebook semantic object unchanged => not a loop
```

UI/UX, generated projections, glue code, provider adapters, workflows, tests, benchmark execution, packaging, build repairs, and documentation are not loops unless the same change also modifies the canonical rulebook. Formatting-only JSON changes are not loops when parsed-object equality holds.

Each domain must keep one authoritative loop ledger inside its canonical rulebook. Do not assign loop numbers in a report, script, branch name, or commit merely because work happened. A loop row and its semantic change are one atomic rulebook edit, and a loop is not closed until the required real build, generated database load, conformance, evidence replay, and provenance gates pass.

## Rulebook JSON formatting (non-negotiable)

The rulebook JSON is **always standard JSON with single-line leaves**:

- Standard JSON — no comments, no trailing commas, valid `json.load`-able.
- **Single-line leaves:** every leaf record is emitted on exactly ONE line. A leaf record is an individual `data[]` row object and an individual `schema[]` field object. Container keys (`Domains`, `Theorems`, the `schema`/`data` arrays, top-level metadata) stay pretty-printed and indented; only the innermost objects collapse to one line each.
- The reason: leaf-per-line keeps `git diff` legible (one changed row = one changed line) and keeps the file greppable (`grep '"TheoremId": "2-plus-2..."'` finds the whole row).

Do NOT hand-produce fully-expanded (every-field-on-its-own-line) rulebook JSON. After any edit, normalize with the project formatter so schema field objects and data row objects are each one line. The canonical normalizer is `scripts/format-rulebook.py` (single-line-leaves pretty-printer); run it after every rulebook edit and never commit a rulebook that has not been through it.

**`effortless build` re-expands the rulebook.** The `rulebook-to-postgres` transpiler rewrites `effortless-math-rulebook.json` in place during a build (FK normalization etc.) and emits it fully expanded. So the formatter must run **after every build**, not just after hand edits — the last thing you do before committing is `python3 scripts/format-rulebook.py`. The formatter is idempotent and asserts the reformatted file parses to an identical object, so it is always safe to run.

## Fail loudly

- Missing v21 files or hash mismatch: raise with the exact path.
- Unknown theorem/provider ID: raise.
- Unsupported rulebook field shape: stop and migrate the rulebook; do not silently ignore it.
- Conformance disagreement: fail the build.
- Do not look for a legacy path if the declared path is missing.

## Proof-status doctrine

Never conflate:

```text
parent removed
parent derived
theorem fully internalized for scope
zero imports above a declared trust boundary
```

They are different data fields and different claims.

A finite calibration, replayable computation, or green invariant does not establish a universal theorem unless the universal inference is represented and its child frontier is closed.

## Migration doctrine

The v21 archive is immutable evidence. Preserve IDs, hashes, and bitemporal history. The new rulebook becomes authoritative only after the host conformance harness reproduces the frozen answer key from a blank build.

## Provider theorem doctrine

Provider theorem folders export contracts and eventually provider certificates. FLT consumes only versioned contracts/certificates, never provider-private tables or code.

A provider certificate must state:

- theorem ID and version;
- bound hypotheses;
- conclusions supplied;
- proof status;
- remaining imports;
- artifact hashes;
- generated timestamp.

## First integration objective

Do not start by building a custom UI. First make the global rulebook build and reproduce the frozen **v21 witness** (these numbers come from the immutable v21 SQLite and never change):

```text
8 migrated v21 theorems (FLT + 7 foundation providers)
7 load-bearing provider dependencies
571 v21 loops
113 v21 proof facts
305 v21 invariant rows
1 contradiction
0 provider theorems fully internalized
```

### natural-number-arithmetic addendum (loops 572–576)

The `natural-number-arithmetic` (Peano) domain adds the network's first fully internalized, zero-import theorems on top of the frozen v21 witness. It does NOT alter any v21 count above. After it is present the rulebook totals are:

```text
12 theorems          (8 v21 + 4 natural-number-arithmetic: + − × ÷)
7 provider dependencies   (unchanged; the new theorems are zero-import)
575 loops            (571 v21 + loops 572–575; loop 576 is the cleanup loop)
135 proof facts      (113 v21 + 22 Peano reduction steps)
313 invariant rows   (305 v21 + 8 peano-reduction-certificate checks)
4 conclusions        (2 v21 + 2 natural-number-arithmetic)
9 domains, 9 trust boundaries, 8 foundation kernels
1 kernel with theorem_content_internalized = 1  (kernel-peano-naturals-v1; the 7 v21 kernels remain 0)
4 theorems FULLY_INTERNALIZED_FOR_SCOPE with ActiveImportCount = 0
```

### bit-calculator addendum (gate-level second witness)

The `bit-calculator` federated provider (`domains/natural-number-arithmetic/bit-calculator/`) computes the four flagship facts a **second, disjoint way**: not through Peano `Zero`/`Successor` chains, but through a Rosetta-style **logic-gate netlist** (AND/OR/XOR/NOT → half/full adder → 4-bit adder/subtractor/multiplier/divider). Nothing arithmetic is stored — only input bits are data; every result bit is a fixed-point settle over gate truth tables and connections, in Postgres and (independently) in Python. It is its **own** effortless project with its own rulebook, `effortless-postgres/`, and test DB; the main rulebook imports only its versioned `provider-certificate.json`. This does NOT alter any v21 or Peano count above. After it is present the main-rulebook totals are:

```text
13 theorems          (8 v21 + 4 natural-number-arithmetic + 1 bit-calculator provider)
11 dependencies      (7 load-bearing FLT + 4 corroborating-witness bit-calculator; the 4 witness rows are NOT load-bearing, NOT imported, and change no consumer's zero-import status)
10 domains, 10 trust boundaries, 9 foundation kernels
8 conclusions        (4 prior + 4 bit-calculator gate-witness conclusions)
2 kernels with theorem_content_internalized = 1  (kernel-peano-naturals-v1, kernel-logic-gates-v1; the 7 v21 kernels remain 0)
5 theorems FULLY_INTERNALIZED_FOR_SCOPE with ActiveImportCount = 0  (4 Peano + 1 bit-calculator)
```

The bit-calculator's own model (a separate rulebook) holds: 4 GateTypes, 14 GateTruthRows, 10 Components, 118 ComponentPins, 79 ComponentInstances, 295 ComponentConnections, 24 Computations. Its Postgres engine (`03b-customize-views.sql`) and Python simulator (`scripts/netlist_sim.py`) agree on all 24 computations; the four netlists are validated exhaustively (256 pairs each for add/sub/mul, 240 for div) against reference arithmetic in the validator harness only.

`scripts/validate_starter.py` asserts the **13-theorem** shape, **7 load-bearing + 4 corroborating-witness** dependency split, and the frozen v21 SHA-256 + SQLite counts; keep all of these in sync with this block.

### traveling-salesman addendum

The `traveling-salesman` optimization domain (`domains/traveling-salesman/`) remains a standalone research domain rather than a theorem/provider row in the global theorem catalog, so frozen FLT and theorem-network counts remain unchanged.

Its complete semantic history belongs only in the TSP rulebook's `TSPLoops` table. Counts and frontier descriptions in prose are summaries and must be reconciled after the canonical ledger and consolidated replay are complete.

Never conflate an imported provider dependency with an internal frontier obligation. A finite optimality result is scoped to its declared instance and warrant; it is not a general TSP or complexity claim.

## Host conventions

- Include `rulebooktorulespeak` in `effortless.json`.
- Set `ERB_DOMAIN=effortless-math` explicitly.
- Read generated values from `vw_*` views.
- Do not add defensive locks around `effortless build`.
- Do not add bespoke caches. Any materialization must be first-class rulebook data with a refresh contract.

### traveling-salesman loops 587–596

The TSP domain now records planned and completed loop states through 596. Gridville's route is reconstructed from local-bound edge geometry with zero branch decisions. A twin-triangles counterexample keeps lower-bound soundness distinct from tightness and supplies the first finite neighborhood contraction witness. Live Postgres remains a typed substrate obligation when the build environment cannot execute it.
