# Simpson's Paradox — Effortless Project

Standalone **Effortless Rulebook (ERB)** project. The SSoT is
`effortless-rulebook/simpsons-paradox-rulebook.json`. Rulebook-First — no Airtable.
Build with `effortless build` (hosted transpilers in `effortless.json`); run the explorer with `./start.sh`.

## What this models

A **digital mirror** of the Simpson's Paradox domain — **299 studies** (290 real, 9
synthetic): the original **238-study** Simpson's-paradox corpus plus a control-corpus
wave of non-paradox studies across 25 additional domains, spanning medicine,
epidemiology, law, sports, education, economics, public health, and social science.
Built through **loop-93** (loops 94–96 in progress: docs/prune/bootstrap polish;
97–99 unplanned). The entities are domain objects: Studies, Treatments, Strata,
CaseCells. The paradox emerges as a derived fact from the DAG — it is NOT modeled
directly. No `ReversalDetection` entity. No `PooledRate` entity. The paradox falls out
when you ask the right questions of the domain.

Derived geometry on `TreatmentRankings` includes `IsSignFlip`, `IsStratumUnanimous`,
`IsSweepFragile`, `AllocationDistortion`, `DistortionType` (A / B / C+ / C− / D),
`SignalPurity`, and allocation-corrected winners. `ConfounderIdentities`,
`StratumVariableIdentityMaps`, and `IdentityDomainCells` hold cross-study
stratum-variable identity maps — 19 canonical confounding archetypes now cover the
corpus. `DiscoveryHypotheses` / `DiscoveryFindings` hold pre-registered corpus
experiments; six superseded predicates were retired in loop-79. `InvariantChecks`
rows are build-breaking: any critical `FailCount > 0` is a bug (26 critical, all
passing).

The model is built iteratively via Effortless loops. The `Loops` table IS the plan — each
row documents what domain concept is introduced and what natural-language question it
answers. Read it before making structural changes.

## Relevant skills

- `effortless-schema`, `effortless-conventions`, `effortless-setup-postgres`
- `effortless-loop`, `effortless-sql`, `effortless-query`, `effortless-rulespeak`

## NO MIGRATIONS

Local Postgres regenerated from scratch on every `effortless build` via
`effortless-postgres/reset-rulebook-db.sh`. Never write migrations. Edit rulebook → build.

## Build discipline

Before every `effortless build`, run `git status`. If dirty, pause and ask.
Never auto-commit generated files.

## Rulebook JSON format: compact data rows

Every `data` array in the rulebook JSON must have **one object per line** — all
fields of a single row on a single line, no internal newlines. The `schema` arrays
and top-level structure stay pretty-printed; only the leaf data rows are compacted.

**Correct:**
```json
"data": [
  {"LoopId": "loop-01", "Title": "...", "Status": "complete", ...},
  {"LoopId": "loop-02", "Title": "...", "Status": "planned", ...}
]
```

**Wrong (multi-line row):**
```json
"data": [
  {
    "LoopId": "loop-01",
    "Title": "...",
    "Status": "complete"
  }
]
```

If Claude opens the rulebook and any data row is multi-line, compact it before
making any other edits and before any commit. The `python3` one-liner to fix it:

```python
import json, re
path = 'effortless-rulebook/simpsons-paradox-rulebook.json'
rb = json.loads(open(path).read())
# write pretty, then compact data rows
pretty = json.dumps(rb, indent=2, ensure_ascii=False)
# (use the compact_data_arrays helper pattern from the build scripts)
```

The easiest safe approach: load with `json.load`, mutate in memory, then write
using the splice/compact pattern that keeps schema arrays pretty and data rows
single-line. Never write multi-line data rows to this file.
