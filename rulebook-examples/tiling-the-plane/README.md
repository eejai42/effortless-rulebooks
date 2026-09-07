# Tiling the Plane

**A library for tiling the Euclidean plane — a catalog of which tilings exist and *why* each one is valid, plus a generative engine that places tiles into a region and measures coverage.**

This is a self-contained **Effortless Rulebook (ERB)** project. The rulebook
(`effortless-rulebook/tiling-the-plane-rulebook.json`) is the single source of
truth; the Postgres database, views, and control-panel app are all derived from it.

---

## Two halves, one DAG

### Catalog — *which tilings exist and why they're valid*
A tiling is valid when the interior angles meeting at each vertex sum to a full
360° turn. That validity is **derived**, not asserted:

```
VertexFigures.AngleGapDeg = ABS(AngleSumDeg - 360)
VertexFigures.IsValid     = AngleGapDeg <= 0.0001
Tilings.AllVerticesValid  = ValidVertexFigureCount = VertexFigureCount
```

### Generative — *lay tiles into a region and measure the result*
```
Regions.CoveredArea   = SUMIFS(Placements.TileArea  WHERE Region = this)
Regions.CoveragePct   = 100 * CoveredArea / Area
Regions.OverlapCount  = COUNTIFS(Placements WHERE Region = this AND IsOverlapping)
Regions.IsCleanTiling = IsFullyCovered AND OverlapCount = 0
```

---

## Entity model

```
SymmetryGroups
    └── Tilings (many)            VertexConfig, Kind, IsEdgeToEdge
            ├── SymmetryGroup → SymmetryGroups
            ├── TilingPrototiles (many)   ← first-class junction (Tiling × Prototile)
            │       └── Prototile → Prototiles
            └── VertexFigures (many)      ← first-class: angle sum → IsValid

Prototiles                        Sides, EdgeLength, Area(trig), InteriorAngleDeg

Regions
    ├── TargetTiling → Tilings
    └── Placements (many)         X, Y, RotationDeg, IsOverlapping
            └── Prototile → Prototiles
```

It's a DAG: 1-to-many only, no cycles, no many-to-many. The Tiling×Prototile
relationship is the first-class entity **TilingPrototiles** rather than a hidden
junction.

---

## Tables

| Table | Rows | Purpose |
|---|---|---|
| **SymmetryGroups** | 4 | Wallpaper symmetry groups (p4m, p6m, …). |
| **Prototiles** | 5 | The shapes — regular polygons (triangle … dodecagon). |
| **Tilings** | 6 | Catalogued tilings (3 regular + 3 Archimedean). |
| **TilingPrototiles** | 10 | First-class junction: prototiles each tiling uses. |
| **VertexFigures** | 6 | Vertex types; `IsValid` derived from angle sum = 360°. |
| **Regions** | 3 | Bounded patches of plane to tile. |
| **Placements** | 20 | Individual tiles placed in regions (4×4 square fully tiled). |

---

## Higher-end math lives in a customization seam

`Prototiles.Area` for a regular *n*-gon is `¼·n·s²·cot(π/n)`. Trigonometry is
outside the transpiler's portable formula vocabulary, so the generated
`calc_prototiles_area()` is **overridden in
[`postgres-bootstrap/02b-customize-functions.sql`](postgres-bootstrap/02b-customize-functions.sql)**
using Postgres `tan()`/`pi()`. The formula text in the rulebook documents the
intent; the `02b` seam is the real implementation. This is the sanctioned way to
express math the formula DSL can't — not a fallback.

---

## Build & run

```bash
# 1. (Re)generate Postgres from the rulebook + create the DB
effortless build          # or: ./start.sh build

# 2. Boot the control-panel app (API :3032 + web :5175; kills those ports first)
./start.sh                # = ./start.sh all
```

Then open **http://localhost:5175**. `effortless build` runs `rulebook-to-postgres`
→ drops & recreates `erb_tiling_the_plane` via `postgres-bootstrap/reset-rulebook-db.sh`.
The control panel reads every value from the `vw_*` views and writes raw edits to
the base tables.

`start.sh` subcommands: `all` (default) · `server` · `web` · `db` (re-init the DB)
· `build` (regenerate SQL + re-init).

### The control panel

- **Dashboard** — live catalog: which tilings are valid, prototile areas, region coverage.
- **Region Visualizer** — drop tiles into a region by clicking cells; coverage, overlap count, and the “clean tiling” flag recompute from the database on every edit.
- **Catalog / Generative tables** — a CRUD grid per entity. Editable raw columns are highlighted; derived columns are read-only and recompute on save.

---

## What to add next

Each item is one edit to the rulebook (`_build_rulebook.py` → `effortless build`),
sometimes plus a small UI touch.

1. **Round areas to 3 decimals for display** — areas read as tidy numbers everywhere. *[no UI change needed]*
2. **Add an `IsArchimedean` flag on Tilings** — `= Kind = "semiregular"`, shown as a badge. *[no UI change needed]*
3. **Per-tiling angle-sum check** — surface each vertex figure’s gap-from-360° on the Tilings table. *[no UI change needed]*
4. **Gap area on Regions** — `UncoveredArea = Area − CoveredArea`, shown beside coverage. *[no UI change needed]*
5. **Density score** — `Regions.TilesPerUnitArea = PlacementCount / Area`. *[no UI change needed]*
6. **Color field on Prototiles** — store a fill color in the rulebook so the visualizer reads it instead of a hardcoded map. *[adds a field + editor]*
7. **Rotation editor in the visualizer** — click a tile to rotate it; persist `RotationDeg`. *[adds an editor]*
8. **A `Vertices` table** — model each tiling vertex’s (x,y) so the visualizer can draw true edge-to-edge tilings. *[adds a page]*
9. **Dual tiling links** — a self-FK `Tilings.DualOf` (square↔square, triangular↔hexagonal). *[adds a field]*
10. **A second region preset gallery** — seed more `Regions` (brick, herringbone attempts) to compare clean vs. dirty tilings. *[adds rows]*

---

## How this was built (developer reference)

This is an **Effortless Rulebook (ERB)** project. The rulebook JSON is the single
source of truth; `effortless build` transpiles it to the Postgres substrate
(`postgres-bootstrap/0*.sql`): one `calc_*`/`get_*` SQL function per
calculated/lookup/aggregation field, composed into one `vw_<entity>` view per
table. The app never re-derives a computed value — it `SELECT`s the view. The one
hand-written piece of SQL is the trig area override in
`02b-customize-functions.sql`, a sanctioned customization seam for math the
portable formula language can’t express. Lookups use the `INDEX/MATCH` idiom
(`=INDEX(Target!{{Field}}, MATCH(This!{{FK}}, Target!{{PK}}, 0))`), the form the
transpiler compiles.

---

## Authoritative source

`effortless-rulebook/tiling-the-plane-rulebook.json` is HEAD. Airtable pull is
disabled. To change schema, formulas, or seed data: edit the rulebook (or
regenerate it with `_build_rulebook.py`), then `effortless build`. Never edit the
generated `0*.sql` files — only the `*b-customize-*` seams.

---

## Local transpiler bus (`localhost:4242`)

> **All 13 local transpilers live on `localhost:4242`.** Start the bus with
> `./start.sh` from `ssotme-proxy/` at the repo root (it is root
> infrastructure again — see the root rulebook's `LegacyRunnerCapabilities`).
> The ssotme-proxy then exposes every repo-local transpiler —
> `postgres-calculated-to-rulebook`, `rulebook-to-python`, `rulebook-to-golang`,
> `rulebook-to-cobol`, `rulebook-to-owl`, and more — as first-class `ssotme://`
> routes any `effortless build` can call.
