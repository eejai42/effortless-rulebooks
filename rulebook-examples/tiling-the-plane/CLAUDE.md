# Tiling the Plane — Effortless Project

<!-- rulebook-authoritative-banner -->
## Authoritative Source: `effortless-rulebook/tiling-the-plane-rulebook.json` is HEAD

For this project, **`effortless-rulebook/tiling-the-plane-rulebook.json` is the single, authoritative source of truth.** Edit it directly (or regenerate it with `_build_rulebook.py`). All other artifacts (Postgres SQL, the control-panel app, etc.) are mechanically derived from it via `effortless build`.

### Airtable pull is disabled by default

The `airtabletorulebook` transpiler in `effortless.json` is set to `IsDisabled: true` / `Enabled: false` so that **a routine `effortless build` will never silently overwrite your JSON edits with whatever is in Airtable**. (This project was authored rulebook-first and is not bound to a specific Airtable base.) Re-enable only with explicit user consent on that specific turn.

### Never silently revert `tiling-the-plane-rulebook.json`

**Treat the rulebook JSON as sacred.** Before running any command that could touch it — `effortless build`, any transpiler that writes to it, any `git checkout`/`git restore` — first run `git status` / `git diff` on it.

- If the file has uncommitted changes you (the agent) did NOT just make this turn, **stop** and ask the user before proceeding.
- It is only acceptable to let a regeneration touch this file when the *only* uncommitted edits are ones you just made this turn.

There is no upstream to "restore from." The JSON is the upstream.
<!-- /rulebook-authoritative-banner -->

This folder is a **self-contained Effortless Rulebook (ERB) project**. The rulebook is the single source of truth; Postgres and the app are derived from it.

## What This Demonstrates

- **Derived validity**: a tiling's vertex figures are valid iff their interior angles sum to 360° — computed, not asserted (`VertexFigures.IsValid`).
- **First-class junctions**: `TilingPrototiles` is a real entity (Tiling × Prototile), keeping the model a clean DAG with no many-to-many.
- **Aggregation rollups**: `Regions.CoveragePct`, `OverlapCount`, `IsCleanTiling` roll up over `Placements` via SUMIFS/COUNTIFS.
- **A sanctioned `02b` math seam**: `calc_prototiles_area()` (regular-polygon area, needs trig) is hand-implemented in `postgres-bootstrap/02b-customize-functions.sql` because trig is outside the portable formula DSL.

## The view IS the contract

The control-panel app reads every displayed value from `vw_<entity>` and writes raw
edits to the base tables. It never re-derives a calc/lookup/aggregation field in JS.
If a computed value looks wrong, the bug is in the rulebook formula (or the `02b`
override) — not in the app. See the parent `../../CLAUDE.md` for the full doctrine.

## NO MIGRATIONS

The local DB (`erb_tiling_the_plane`) is dropped and recreated from scratch on every
`effortless build` via `postgres-bootstrap/reset-rulebook-db.sh`. To change schema/formulas/seed
data: edit the rulebook → `effortless build`. Never `ALTER TABLE`, never edit generated
`0*.sql`; use the `*b-customize-*` seams only.

## Build discipline

Before every `effortless build` on a dirty tree, run `git status --porcelain` (read-only)
and pause for permission. Effortless work is read-only with respect to git — never
auto-commit on the user's behalf.
