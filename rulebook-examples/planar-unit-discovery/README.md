# planar-unit-discovery

A CMCC semantic mirror of the planar unit-distance theorem neighborhood. Every mathematical object that participates in the chain from Q to U(n) is promoted to its OWN first-class table, and every intermediate quantity (distance squared, edge count, density exponent, witness-consistency check, bound exponent, anchor match) is a first-class calculated/lookup/aggregation field on the entity to which it belongs. Nothing is hidden in a property bag, an expression tree, or a generic relation row. The Pythagorean test: if a mathematician would name it, it has its own column.

**Rulebook:** [`effortless-rulebook/planar-unit-discovery-rulebook.json`](effortless-rulebook/planar-unit-discovery-rulebook.json) — 36 tables: `Domains`, `Contexts`, `Points`, `PointSets`, `PointSetMembers`, `PointPairs`, `UnitDistanceGraphs`, `NumberFields`, `PrimeIdeals`, `MinkowskiLattices`, `ShortVectors`, `ConstructionFamilies`, `ConstructionInstances`, `GrowthSequences`, `AsymptoticFunctions`, `AsymptoticLowerBounds`, `Theorems`, `Metrics`, `FieldEmbeddings`, `MinkowskiEmbeddings`, `GramMatrices`, `PlanarProjections`, `ProjectedShortVectors`, `GolodShafarevichCriteria`, `SemanticBridges`, `SemanticRoutes`, `SemanticRouteSteps`, `SourceReferences`, `Lemmas`, `MirrorContract`, `Conjectures`, `ProofObligations`, `CitationLinks`, `AnswerKey`, `TemporalSnapshots`, `LowerBoundValidityAtSnapshot`.

## App

`app/` is the project's local experience: an Express API (`:43303`) plus a Vite/React ledger (`:43103`) that read **only** the `vw_*` views of `erb_planar_unit_discovery`. The screen has five domain tabs — the Theorems / Lemmas / Conjectures ledger with their derived status columns; the bounds timeline (TemporalSnapshots × AsymptoticLowerBounds, each cell `is_valid_at_this_snapshot` from `vw_lower_bound_validity_at_snapshot`); ConstructionFamilies with their instances and the NumberFields → MinkowskiLattices → ShortVectors → PlanarProjections chain; ProofObligations and AnswerKey as checklists; SourceReferences with their citation links — and an "All views" browser. Nothing is recomputed in the app; if a view cannot be read the API answers 500 and the screen shows that error.

```bash
cd rulebook-examples/planar-unit-discovery
./start.sh          # http://localhost:43103 (UI) · http://localhost:43303/api/views (API health)
```

---

## Local transpiler bus (`localhost:4242`)

> **All 13 local transpilers live on `localhost:4242`.** Start the bus with
> `./start.sh` from `ssotme-proxy/` at the repo root (it is root
> infrastructure again — see the root rulebook's `LegacyRunnerCapabilities`).
> The ssotme-proxy then exposes every repo-local transpiler —
> `postgres-calculated-to-rulebook`, `rulebook-to-python`, `rulebook-to-golang`,
> `rulebook-to-cobol`, `rulebook-to-owl`, and more — as first-class `ssotme://`
> routes any `effortless build` can call.
